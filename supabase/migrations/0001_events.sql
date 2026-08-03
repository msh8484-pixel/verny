-- 베르니 방문자 통계: 이벤트 테이블 (2026-08-03)
-- Supabase SQL Editor에 붙여넣고 Run 하면 됩니다.

create table if not exists public.events (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  type text not null check (type in ('pageview', 'scroll', 'click')),
  path text not null,
  vid uuid not null,
  sid uuid not null,
  value text,
  referrer text,
  device text
);

create index if not exists events_ts_idx on public.events (ts desc);
create index if not exists events_type_ts_idx on public.events (type, ts desc);

-- 익명(anon/publishable) 접근 전면 차단: RLS 켜고 정책은 만들지 않음.
-- 서버의 service_role 키만 읽기/쓰기 가능.
alter table public.events enable row level security;
