---
status: approved
spec: cupones
owners: [Jose Manuel Aceituno]
---

# Tareas: cupones

- [ ] **T1** Crear el catálogo de cupones y resolveCoupon en src/coupons.ts · _R1.1, R2.1, R2.2, R2.4_
    - [ ] **T1.1** Crear `src/coupons.ts` con `couponSchema` (`percent` entero entre 1 y 100, `expiresAt` como `z.string().datetime()`) y derivar el tipo `Coupon` con `z.infer`
    - [ ] **T1.2** Definir el tipo `CouponResult` como unión discriminada `{ ok: true; coupon }` | `{ ok: false; error: 'unknown coupon' | 'expired coupon' }`
    - [ ] **T1.3** Exportar `coupons` validado al cargar el módulo con `z.record(couponSchema).parse(...)`, con `WELCOME` (10%, `2027-12-31T23:59:59Z`)
    - [ ] **T1.4** Implementar `resolveCoupon(code, now)` como función pura con JSDoc: comparación exacta del código (distingue mayúsculas y minúsculas), `unknown coupon` si no existe y `expired coupon` si `now.getTime() > Date.parse(expiresAt)`
    - [ ] **T1.5** Crear `src/coupons.test.ts` con un `now` fijo: cupón vigente, código desconocido, código en minúsculas (`welcome`) rechazado, cupón caducado, instante exacto de caducidad (vigente) y un milisegundo después (caducado)
    - [ ] **T1.6** Añadir un test de que `couponSchema` rechaza `percent` 0, 101 o decimal y un `expiresAt` inválido
    - [ ] **T1.7** Ejecutar `npm test`, `npm run lint` y `npm run typecheck`
- [ ] **T2** Adaptar orderSchema y orderTotal para usar un Coupon ya validado · _R1.1, R1.2, R1.3, R1.4, R1.5, R2.4_ · depende de: T1
    - [ ] **T2.1** En `src/orders.ts`, endurecer `price` en `orderSchema` a `z.number().int().nonnegative()`
    - [ ] **T2.2** Cambiar la firma a `orderTotal(order: Order, coupon?: Coupon): number`, importando `Coupon` desde `./coupons.js`
    - [ ] **T2.3** Eliminar el código fijo de `WELCOME` y calcular `subtotal - Math.round(subtotal * percent / 100)` cuando haya cupón; sin cupón, devolver el subtotal
    - [ ] **T2.4** Actualizar el JSDoc de `orderTotal` (céntimos enteros, descuento redondeado con Math.round)
    - [ ] **T2.5** Actualizar `src/orders.test.ts`: suma sin cupón, `applies the WELCOME coupon` pasando el cupón del catálogo, redondeo de un descuento con media unidad (p. ej. subtotal 1005 con 10%) y total siempre entero (`Number.isInteger`)
    - [ ] **T2.6** Añadir un test de que `orderSchema` rechaza un `price` con decimales o negativo
    - [ ] **T2.7** Ejecutar `npm test`, `npm run lint` y `npm run typecheck`
- [ ] **T3** Resolver el cupón en la ruta POST /orders/total y añadir tests HTTP · _R1.1, R1.3, R1.4, R2.1, R2.2, R2.3_ · depende de: T1, T2
    - [ ] **T3.1** En `src/server.ts`, tras `orderSchema.safeParse`, resolver `coupon` con `resolveCoupon(parsed.data.coupon, new Date())` solo si viene en el body
    - [ ] **T3.2** Si el resultado es `ok: false`, responder `res.status(400).json({ error: result.error })` seguido de `return`, sin calcular el total
    - [ ] **T3.3** Delegar en `orderTotal(parsed.data, coupon)` y responder `{ total }`
    - [ ] **T3.4** Crear `src/server.test.ts` importando `app` (con `NODE_ENV=test`) y fijando la fecha con `vi.setSystemTime` para no depender del reloj real
    - [ ] **T3.5** Cubrir: 200 con `total` 900 para `WELCOME`, 200 con el subtotal sin cupón, 400 `{ error: 'unknown coupon' }` sin `total`, 400 `{ error: 'expired coupon' }` sin `total` con la fecha posterior a la caducidad y 400 con issues de zod para un precio decimal
    - [ ] **T3.6** Ejecutar `npm test`, `npm run lint` y `npm run typecheck`
- [ ] **T4** Cerrar la funcionalidad: confirmar la caducidad de WELCOME y documentar los cambios de contrato · _transversal_ · depende de: T3
    - [ ] **T4.1** Confirmar con el responsable del negocio (Jose Manuel Aceituno) la fecha de caducidad de `WELCOME` y ajustarla en el catálogo si hace falta
    - [ ] **T4.2** Documentar como cambios visibles para los clientes el 400 por precio con decimales y el 400 por cupón inexistente o caducado
    - [ ] **T4.3** Actualizar la descripción de `src/` en `AGENTS.md` para mencionar el catálogo de cupones de `src/coupons.ts`
    - [ ] **T4.4** Ejecutar la verificación final con `npm test`, `npm run lint` y `npm run typecheck`, y comprobar que `api/`, `infra/` y `.github/` no han cambiado
