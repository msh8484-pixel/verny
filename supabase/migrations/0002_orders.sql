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
alter table public.orders enable row level security;
