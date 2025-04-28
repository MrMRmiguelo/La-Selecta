-- Script para crear la tabla de platos (menu)
create table if not exists menu (
  id serial primary key,
  name varchar(100) not null,
  price numeric(10,2) not null
);

-- Insertar algunos platos de ejemplo
insert into menu (name, price) values ('Pollo a la plancha', 120.00);
insert into menu (name, price) values ('Carne asada', 150.00);
insert into menu (name, price) values ('Ensalada César', 90.00);