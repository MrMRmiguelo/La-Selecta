-- Create orders table for kitchen orders
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    table_number integer not null,
    items jsonb not null, -- Array of items with name, quantity, and notes
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint orders_status_check check (status in ('recibido', 'preparacion', 'completado', 'cancelled'))
);

-- Create index for faster queries by status
create index if not exists orders_status_idx on public.orders(status);

-- Create index for faster queries by table number
create index if not exists orders_table_number_idx on public.orders(table_number);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Create policy to allow all authenticated users to view orders
create policy "Allow authenticated users to view orders"
    on public.orders for select
    to authenticated
    using (true);

-- Create policy to allow authenticated users to create orders
create policy "Allow authenticated users to create orders"
    on public.orders for insert
    to authenticated
    with check (true);

-- Create policy to allow authenticated users to update orders
create policy "Allow authenticated users to update orders"
    on public.orders for update
    to authenticated
    using (true);