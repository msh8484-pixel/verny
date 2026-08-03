# 베르니 대시보드 주문 관리 — 설계서

- 날짜: 2026-08-03
- 상태: 설계 승인됨 (A안·상태 관리 포함·새 주문부터)
- 전제: 방문자 통계 대시보드(2026-08-03) 가동 중. `/dash` 쿠키 인증·Supabase `events`·이중 배포 폴백 구조 재사용.

## 1. 목표

사이트 주문폼(`/order`) 주문을 Supabase에 기록하고, `/dash`에 **주문 탭**을 추가해 내역 확인과 처리 상태 관리(신규→입금확인→발송완료)를 제공한다. 구글시트 기록·메일 알림은 지금 그대로 유지한다(대시보드는 추가 창구). 네이버 스마트스토어 주문은 범위 밖.

## 2. 데이터 — `orders` 테이블

`supabase/migrations/0002_orders.sql`:

```sql
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  ord_no text not null,
  orderer_name text not null,
  orderer_phone text not null,
  recipient text,
  recipient_phone text,
  address text,
  memo text,
  items text,
  qty int,
  total int,
  receipt text,
  tier text,
  status text not null default 'new' check (status in ('new', 'paid', 'shipped')),
  status_ts timestamptz
);
create index if not exists orders_ts_idx on public.orders (ts desc);
alter table public.orders enable row level security;  -- 정책 없음: service_role만 접근
```

상태 라벨: `new`=신규, `paid`=입금확인, `shipped`=발송완료. 마이그레이션은 컨트롤러가 pooler(`aws-0-ap-southeast-2.pooler.supabase.com`)로 직접 실행.

## 3. 주문 기록 흐름

- `app/api/order/route.ts`: 시트 웹훅 성공 후(메일 발송과 같은 지점) **비차단**으로 주문을 DB에 기록. 기록 실패해도 주문 접수·메일은 영향 없음 (`console.error`만).
- `lib/orders.ts` (서버 전용): `parseOrder(raw): OrderRow | null` (필드 화이트리스트·타입·길이 검증), `insertOrder(row)`, `fetchOrders(sinceIso, limit)`, `updateOrderStatus(id, status)` — 전부 PostgREST fetch 직접 호출(supabase-js 없음).
- **이중 배포 폴백**: env 없는 배포(verny.co.kr)에서는 `https://verny-beta.vercel.app/api/order-log`로 파싱 전 원본을 전달. `app/api/order-log/route.ts`(신규)는 `parseOrder` 검증 후 insert, 항상 204. track 폴백과 동일 패턴 — 공개 저장소에는 공개 URL만 노출.
  - 참고: `/api/order-log`는 공개 엔드포인트지만 `/api/order` 자체가 이미 공개이므로 위험 동급. 검증으로 쓰레기 행 최소화.

## 4. 상태 변경 API

`app/api/dash/orders/route.ts` — `PATCH`, body `{ id: number, status: "new"|"paid"|"shipped" }`.
`verifyToken(쿠키 vny_dash)` 실패 시 401. 성공 시 `status`·`status_ts` 갱신 후 `{ ok: true }`.
(상태 변경은 /dash가 열리는 verny-beta에서만 일어나므로 env 부재 문제 없음.)

## 5. 대시보드 UI

- `/dash` 헤더에 탭 내비 추가: **[통계] [주문]** — 통계는 기존 그대로, 주문은 새 라우트 `/dash/orders`.
- `app/dash/orders/page.tsx` (서버): 기존과 동일한 쿠키 검증 → 미인증 시 `LoginForm` 재사용. 인증 시 `fetchOrders`(최근 30일 + 최근 200건) → `aggregateOrders`(순수 함수) → `OrdersView`(클라이언트) 렌더. `robots noindex`는 `/dash` 레이아웃이 이미 커버.
- `lib/dash/aggregate-orders.ts` (순수, vitest): `aggregateOrders(orders, now): OrdersData`
  - `today`: 오늘(KST) 주문 수·매출 합계
  - `period`: 30일 주문 수·매출 합계, `pendingCount`(status=new)
  - `dailySales`: 최근 30일 일별 매출 (바 차트용, KST)
- `app/dash/orders/OrdersView.tsx` (클라이언트, 기존 다크 팔레트·카드 스타일 재사용):
  - 요약 카드 4: 오늘 주문 / 오늘 매출 / 30일 매출 / **미처리 N건**(>0이면 경고색 배지)
  - 매출 추이: 30일 일별 매출 BarChart (recharts, 기존 스타일)
  - 주문 목록 테이블: 시각(KST MM.DD HH:mm)·주문번호·주문자(연락처)·품목·수량·금액·상태
  - 상태 필터 탭: 전체/신규/입금확인/발송완료 (클라이언트 필터)
  - 상태 전환: 행마다 현재 상태 배지 + 다음 단계 버튼(신규→입금확인→발송완료), 이전 단계로 되돌리기 버튼. PATCH 성공 시 로컬 상태 갱신, 실패 시 에러 표시
  - 빈 데이터: "아직 주문이 없습니다"

## 6. 에러 처리·보안

- DB 기록·폴백 전달 실패는 주문 접수에 절대 영향 없음 (항상 비차단 + 로그).
- `orders` 조회·상태 변경은 쿠키 토큰 검증 필수. RLS로 익명 차단.
- PII(이름·연락처·주소)는 DB와 구글시트에만 존재 — 공개 저장소 코드에는 안 들어감.

## 7. 테스트·검증

- vitest: `parseOrder` 검증(필수 필드·상태 화이트리스트·길이), `aggregateOrders`(KST 합계·pendingCount·dailySales — 고정 fixture 수기 검산).
- curl: `/api/order-log` 204+적재, PATCH 인증 유무(401/200), `/dash/orders` 로그인 게이트.
- 프로덕션: 실제 주문폼 테스트 제출 1건 → 대시보드 표시·상태 전환 확인 → 테스트 행 삭제.

## 8. 범위 밖 (YAGNI)

과거 구글시트 주문 임포트, 스마트스토어 주문 연동, 주문 수정/삭제 UI, 페이지네이션(200건 초과), 알림.
