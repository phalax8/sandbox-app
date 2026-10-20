---
status: approved
owners: [Jose Manuel Aceituno]
---

# Requisitos: cupones

## R1. Aplicar un cupón de descuento por porcentaje

**Historia:** Como cliente que hace un pedido, quiero aplicar un cupón de descuento por porcentaje que siga vigente para pagar menos por mi pedido.

- **R1.1** CUANDO un pedido incluye un cupón conocido cuya fecha de caducidad no ha pasado, EL SISTEMA DEBE calcular el total restando a la suma de los artículos, en céntimos, el porcentaje de descuento definido para ese cupón.
- **R1.2** EL SISTEMA DEBE redondear el importe del descuento al céntimo entero más cercano con Math.round.
- **R1.3** EL SISTEMA DEBE devolver el total del pedido como un número entero de céntimos.
- **R1.4** CUANDO un pedido no incluye ningún cupón, EL SISTEMA DEBE calcular el total como la suma de los artículos en céntimos, sin aplicar ningún descuento.
- **R1.5** EL SISTEMA NO DEBE devolver totales con fracciones de céntimo.

## R2. Rechazar cupones desconocidos o caducados

**Historia:** Como responsable del negocio, quiero que se rechacen los cupones que no existen o que han caducado para que no se apliquen descuentos no autorizados.

- **R2.1** SI un pedido incluye un cupón que no existe, ENTONCES EL SISTEMA DEBE responder con el código HTTP 400 y un cuerpo JSON con el campo error.
- **R2.2** SI un pedido incluye un cupón cuya fecha de caducidad ya ha pasado, ENTONCES EL SISTEMA DEBE responder con el código HTTP 400 y un cuerpo JSON con el campo error.
- **R2.3** SI se rechaza un cupón, ENTONCES EL SISTEMA NO DEBE devolver un total del pedido.
- **R2.4** EL SISTEMA NO DEBE aplicar el descuento de un cupón desconocido o caducado.
