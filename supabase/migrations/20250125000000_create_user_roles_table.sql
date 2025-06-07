-- Create user_roles table to manage user permissions
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'normal' check (role in ('admin', 'kitchen', 'normal')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.user_roles enable row level security;

-- Allow users to view their own role
create policy "Users can view their own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Allow admins to view all roles
create policy "Admins can view all roles"
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- Allow admins to insert/update roles
create policy "Admins can manage roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- Create index for faster lookups
create index if not exists user_roles_user_id_idx on public.user_roles(user_id);
create index if not exists user_roles_role_idx on public.user_roles(role);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_user_roles_updated_at
  before update on public.user_roles
  for each row
  execute function update_updated_at_column();