-- Tabla para el control de mesas en el restaurante
create table if not exists tables (
  id serial primary key,
  number integer not null unique,
  capacity integer not null,
  status varchar(20) not null default 'free',
  customer jsonb,
  occupied_at timestamp,
  food jsonb,
  soda_order jsonb
);

-- Tabla para almacenar los pedidos generados en las mesas
create table if not exists orders (
  id serial primary key,
  table_id integer not null references tables(id) on delete cascade,
  customer jsonb,
  created_at timestamp not null default now(),
  food jsonb,
  soda_order jsonb,
  total numeric(10,2) not null,
  status varchar(20) not null default 'pending',
  notes text,
  extras jsonb
);

-- Tabla histórica para registrar el historial de pedidos por mesa
create table if not exists table_orders_history (
  id serial primary key,
  table_id integer not null references tables(id) on delete cascade,
  table_number integer not null,
  food jsonb not null, -- Detalles del plato y su costo
  extras jsonb,        -- Detalles y costo de los extras
  soda_order jsonb,    -- Detalles de la bebida
  total numeric(10,2) not null, -- Costo total del pedido
  created_at timestamp not null default now() -- Fecha de ingreso
);