# 베르니 방문자 통계 대시보드 — 설계서

- 날짜: 2026-08-03
- 상태: 설계 승인됨 (구현 전)
- 대상: verny 사이트 (Next.js 16 App Router, Vercel 배포)

## 1. 목표

관리자만 볼 수 있는 숨겨진 방문자 통계 대시보드를 만든다.

- 오늘 방문자 수를 포함한 각종 통계를 한눈에 본다.
- 방문자가 **어디까지 방문했는지**를 두 축으로 추적한다:
  - 페이지 여정 (어떤 페이지들을 어떤 순서로 거쳤는지)
  - 스크롤 깊이 (각 페이지에서 어디까지 내려봤는지)
- 디자인은 사이트와 통일할 필요 없음. 전문적이고 깔끔한 애널리틱스 스타일 + 그래프 중심.
- 진입: 푸터의 특정 요소를 5번 연속 클릭 → 비밀번호 입력(기본 1234) → 대시보드.

## 2. 인프라 현황 (2026-08-03 확인)

| 항목 | 상태 |
|---|---|
| GitHub | `heegeun84-ai/verny-1` (고객사) |
| Vercel | `msh8484-pixels-projects/verny`, 프로덕션 env는 `ORDER_WEBHOOK_URL` 하나 |
| Supabase | `.env.local`의 기존 키(`iircjsmkvnrwfpwfqget`)는 **삭제된 프로젝트** — NXDOMAIN 확인. 코드에서 사용처 없음(잔재). |

**결정: 고객사 Supabase 계정에 새 무료 프로젝트를 만들어 사용한다.**
프로젝트 생성 후 `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`를 `.env.local`과 Vercel 프로덕션 env에 등록해야 한다. `.env.local`의 죽은 키들은 교체한다.

## 3. 아키텍처 개요

```
방문자 브라우저
  └─ <Tracker/> (루트 레이아웃, 클라이언트 컴포넌트)
       └─ POST /api/track  (sendBeacon / fetch keepalive)
            └─ Supabase `events` 테이블 INSERT (service role, 서버 전용)

관리자
  └─ 푸터 © 문구 5클릭 → /dash (로그인 화면)
       └─ POST /api/dash/login (비밀번호 → httpOnly 쿠키)
       └─ /dash (서버 컴포넌트가 Supabase 집계 쿼리 → Recharts 렌더)
```

- 선택한 접근: **자체 경량 추적 + 원본 이벤트 저장, 조회 시 SQL 집계** (A안).
- 기각: 서버 미들웨어 추적만(스크롤 측정 불가), Umami 셀프호스팅(관리 부담·커스텀 제약), Vercel Analytics(유료 API·커스텀 지표 제약).

## 4. 데이터 수집 — `components/Tracker.tsx`

루트 `app/layout.tsx`에 삽입되는 클라이언트 컴포넌트. UI 없음.

- **방문자 ID(vid)**: localStorage의 익명 UUID. 최초 방문 시 생성, 재방문 구분용.
- **세션 ID(sid)**: sessionStorage UUID + 마지막 활동 30분 초과 시 재발급.
- **이벤트 종류**
  - `pageview`: 라우트 변경마다 (`usePathname` 감지). path, referrer(최초 진입 시 document.referrer) 포함.
  - `scroll`: 페이지별 최대 스크롤 도달률을 25/50/75/100% 버킷으로 기록. `pagehide`/라우트 이탈 시 `navigator.sendBeacon`으로 전송 (페이지당 최종 1건).
  - `click`: 전환 이벤트. 스마트스토어 링크 클릭(`store` 표시), 주문폼 제출 성공(`order_submit`).
- **함께 수집**: 디바이스 구분(UA 기반 mobile/desktop, 클라이언트에서 판정), 화면 경로, 시각.
- **수집 제외**: `/dash` 경로 자체, `localhost` 개발 환경(NODE_ENV로 판정).

주문폼 제출 이벤트는 `OrderForm` 제출 성공 지점에서 전역 헬퍼(`track("click", { target: "order_submit" })`)를 한 줄 호출하는 방식으로 연결한다. 스마트스토어 클릭은 Tracker가 문서 레벨 클릭 리스너로 `SHOP.store` 링크를 감지한다(기존 컴포넌트 수정 최소화).

## 5. API — `app/api/track/route.ts`

- POST 전용. body: `{ type, path, vid, sid, value?, referrer?, device? }`
- 서버 검증: type 화이트리스트, path 길이 제한, 봇 UA 필터(Googlebot/bingbot/봇 패턴), 값 정규화.
- Supabase REST API로 `events` INSERT (`SUPABASE_SERVICE_ROLE_KEY` 서버 전용 — supabase-js 미설치, `fetch`로 직접 호출해 의존성 0 유지).
- 실패해도 사이트 동작에 영향 없도록 항상 204 응답 (fire-and-forget).

## 6. DB 스키마 (Supabase)

```sql
create table events (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  type text not null,          -- pageview | scroll | click
  path text not null,
  vid uuid not null,           -- 방문자 (localStorage)
  sid uuid not null,           -- 세션 (30분)
  value text,                  -- scroll: "25|50|75|100", click: "store|order_submit"
  referrer text,
  device text                  -- mobile | desktop
);
create index events_ts_idx on events (ts desc);
create index events_type_ts_idx on events (type, ts desc);
```

- RLS 활성화 + 정책 없음(익명 접근 전면 차단). 서버의 service role만 읽고 쓴다.
- 무료 500MB로 이 규모 트래픽 수년치 충분. 별도 집계 테이블 없이 조회 시 SQL 집계.

## 7. 대시보드 — `/dash`

사이트 디자인과 독립된 다크 톤 애널리틱스 UI. 차트는 **Recharts** 설치 사용.
서버 컴포넌트가 Supabase에서 집계(RPC 또는 REST 쿼리) 후 차트용 데이터를 클라이언트 차트 컴포넌트에 전달.

| 섹션 | 내용 | 형태 |
|---|---|---|
| 오늘 요약 | 오늘 방문자(고유 vid)·페이지뷰·세션 수, 최근 5분 실시간 접속자 | 스탯 카드 4개 |
| 방문 추이 | 최근 30일 일별 방문자·페이지뷰 | 라인 차트 |
| 시간대 분포 | 오늘 0~23시 방문 분포 | 바 차트 |
| 페이지 분석 | 페이지별 조회수 + 평균/최빈 스크롤 깊이 | 가로 바 + 깊이 게이지 |
| 전환 퍼널 | 메인 진입 → 제품 열람(socks/details/lookbook) → 전환 행동(주문폼 열람·스토어 클릭) → 주문 제출 | 퍼널 차트(단계별 전환율) |
| 방문자 여정 | 최근 세션별 실제 이동 경로 타임라인 (예: `메인(100%) → 양말(75%) → 주문폼 제출`) | 리스트 |
| 유입·디바이스 | referrer 순위, mobile/desktop 비율 | 순위 리스트 + 도넛 |

- 상단에서 기간 전환(오늘 / 7일 / 30일).
- `robots.txt`와 `noindex` 메타로 색인 차단.

## 8. 숨김 진입 + 인증

- **진입**: `SiteFooter`의 `© {연도} BETTERUS · VERNY` 문구를 **3초 내 5번 연속 클릭** → `/dash`로 이동. 시각적 힌트·커서 변화 없음.
- **인증**: `/dash` 최초 접근 시 비밀번호 입력 화면 → `POST /api/dash/login` → 일치 시 httpOnly·Secure·SameSite=Lax 쿠키(서명된 토큰, 7일) 발급.
- 비밀번호는 `DASH_PASSWORD` 환경변수(기본값 `1234`), 쿠키 서명 키는 `DASH_SECRET` 환경변수. 나중에 코드 수정 없이 변경 가능.
- `/dash` 하위 및 통계 조회 API는 쿠키 검증 실패 시 로그인 화면/401.

## 9. 에러 처리·성능

- 추적 실패는 사이트에 절대 영향 없음: try/catch + sendBeacon, 응답 대기 없음.
- Tracker는 lazy 실행(hydration 후), 번들 영향 ~2KB 수준.
- Recharts는 `/dash` 라우트에서만 로드 — 방문자 번들에 포함되지 않음.
- Supabase 장애 시 대시보드는 에러 메시지 표시, 사이트는 무관하게 동작.

## 10. 테스트·검증

- 로컬: dev 서버에서 페이지 이동·스크롤·주문 클릭 → Supabase 테이블에 이벤트 적재 확인 (단, dev 제외 로직은 임시 해제 플래그로 검증).
- 푸터 5클릭 진입, 비밀번호 오답/정답, 쿠키 만료 동작 확인.
- 배포 후: 실기기(모바일)에서 스크롤 이벤트 도달 확인, 대시보드 수치와 대조.

## 11. 선행 조건 (사용자 액션 필요)

1. 고객사 Supabase 계정 로그인 → **New Project** (리전: Seoul `ap-northeast-2`, 무료 플랜)
2. Project Settings → API에서 **Project URL**과 **service_role key** 전달
3. 전달받으면: `.env.local` 교체 + Vercel 프로덕션 env 등록 + 스키마 SQL 적용은 구현 단계에서 처리
