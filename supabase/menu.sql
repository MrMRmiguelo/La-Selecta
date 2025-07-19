-- Create enum for kitchen types matching existing data
CREATE TYPE app_rola_menu AS ENUM ('Buffet', 'Cocina_1', 'Cocina_2');

-- Script para crear la tabla de platos (menu)
create table if not exists menu (
  id serial primary key,
  name varchar(100) not null,
  price numeric(10,2) not null,
  tipo_cocina app_rola_menu not null default 'Buffet'
);

-- Insertar algunos platos de ejemplo
insert into menu (name, price, tipo_cocina) values ('Pollo a la plancha', 120.00, 'Buffet');
insert into menu (name, price, tipo_cocina) values ('Carne asada', 150.00, 'Cocina_1');
insert into menu (name, price, tipo_cocina) values ('Ensalada César', 90.00, 'Buffet');