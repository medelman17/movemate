-- Create items table for moving inventory
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  location text not null,
  quantity integer not null default 1,
  weight numeric(10, 2),
  length numeric(10, 2),
  width numeric(10, 2),
  height numeric(10, 2),
  photo_url text,
  notes text,
  is_packed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.items enable row level security;

-- RLS Policies for items table
create policy "items_select_own"
  on public.items for select
  using (auth.uid() = user_id);

create policy "items_insert_own"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "items_update_own"
  on public.items for update
  using (auth.uid() = user_id);

create policy "items_delete_own"
  on public.items for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists items_user_id_idx on public.items(user_id);
create index if not exists items_category_idx on public.items(category);
create index if not exists items_location_idx on public.items(location);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_updated_at
  before update on public.items
  for each row
  execute function public.handle_updated_at();
