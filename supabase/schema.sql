-- 나의 업무 보드: Supabase 테이블과 보안 규칙
-- Supabase 화면 > SQL Editor 에 전체를 붙여 넣고 Run 을 누르세요. (한 번만 실행)

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null,
  cat         text not null default 'welfare',   -- welfare 복지 / edu 교육 / doc 정산·청구 / routine 상시업무
  grp         text not null default '',          -- 업무 묶음
  pri         text not null default 'mid',       -- high / mid / low
  status      text not null default 'todo',      -- todo / doing / hold / done
  progress    int  not null default 0,
  due         date,
  rep         text not null default '',          -- '' / weekly / monthly / bimonthly / quarterly / semester / yearly
  memo        text not null default '',
  steps       jsonb not null default '[]'::jsonb, -- [{t, done}]
  logs        jsonb not null default '[]'::jsonb, -- [{d, t}]
  created_at  timestamptz not null default now(),
  done_at     timestamptz
);

-- 로그인한 사용자에게 이 표 사용 권한 부여 (Automatically expose new tables 를 끈 경우 필요)
grant select, insert, update, delete on public.tasks to authenticated;
revoke all on public.tasks from anon;

-- 본인 데이터만 읽고 쓸 수 있게 하는 행 단위 보안(RLS)
alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own" on public.tasks for select to authenticated using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (user_id = auth.uid());
