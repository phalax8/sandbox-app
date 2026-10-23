---
status: approved
owners: [Jose Manuel Aceituno]
---

# Requisitos: cupones

## R1. Aplicar un cup贸n de descuento por porcentaje

**Historia:** Como cliente que hace un pedido, quiero aplicar un cup贸n de descuento por porcentaje que siga vigente para pagar menos por mi pedido.

- **R1.1** CUANDO un pedido incluye un cup贸n conocido cuya fecha de caducidad no ha pasado, EL SISTEMA DEBE calcular el total restando a la suma de los art铆culos, en c茅ntimos, el porcentaje de descuento definido para ese cup贸n.
- **R1.2** EL SISTEMA DEBE redondear el importe del descuento al c茅ntimo entero m谩s cercano con Math.round.
- **R1.3** EL SISTEMA DEBE devolver el total del pedido como un n煤mero entero de c茅ntimos.
- **R1.4** CUANDO un pedido no incluye ning煤n cup贸n, EL SISTEMA DEBE calcular el total como la suma de los art铆culos en c茅ntimos, sin aplicar ning煤n descuento.
- **R1.5** EL SISTEMA NO DEBE devolver totales con fracciones de c茅ntimo.

## R2. Rechazar cupones desconocidos o caducados

**Historia:** Como responsable del negocio, quiero que se rechacen los cupones que no existen o que han caducado para que no se apliquen descuentos no autorizados.

- **R2.1** SI un pedido incluye un cup贸n que no existe, ENTONCES EL SISTEMA DEBE responder con el c贸digo HTTP 400 y un cuerpo JSON con el campo error.
- **R2.2** SI un pedido incluye un cup贸n cuya fecha de caducidad ya ha pasado, ENTONCES EL SISTEMA DEBE responder con el c贸digo HTTP 400 y un cuerpo JSON con el campo error.
- **R2.3** SI se rechaza un cup贸n, ENTONCES EL SISTEMA NO DEBE devolver un total del pedido.
- **R2.4** EL SISTEMA NO DEBE aplicar el descuento de un cup贸n desconocido o caducado.
- **R2.5** El sistema deber韆 validar los cupones r醦idamente y de forma adecuada.
- **R2.6** CUANDO un cup髇 da un descuento del 33 %, EL SISTEMA DEBE devolver el total con dos decimales de c閚timo.
