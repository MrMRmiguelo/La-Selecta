-- Create user_sessions table
create table if not exists public.user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null unique,
  created_at timestamp with time zone default now(),
  last_active timestamp with time zone default now(),
  user_agent text,
  ip_address inet,
  is_active boolean default true
);

-- Add RLS policies
alter table public.user_sessions enable row level security;

-- Allow users to see only their own sessions
create policy "Users can view their own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id);

-- Allow users to insert their own sessions
create policy "Users can insert their own sessions"
  on public.user_sessions for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own sessions
create policy "Users can update their own sessions"
  on public.user_sessions for update
  using (auth.uid() = user_id);

-- Allow users to delete their own sessions
create policy "Users can delete their own sessions"
  on public.user_sessions for delete
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_token_idx on public.user_sessions(session_token);