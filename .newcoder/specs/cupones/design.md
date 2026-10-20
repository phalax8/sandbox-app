---
status: approved
spec: cupones
owners: [Jose Manuel Aceituno]
---

# Diseño: cupones

## Contexto

Hoy, el servicio Express de `src/` calcula el total de un pedido en `orderTotal` (`src/orders.ts`). El único cupón está fijo en el código: `WELCOME` aplica un 10% con `Math.round(subtotal * 0.9)`. Cualquier otro valor de `coupon` se ignora sin avisar y se devuelve el subtotal. Esto contradice R2, porque un cupón inexistente no se rechaza. Además, los cupones no tienen fecha de caducidad.

La funcionalidad añade un catálogo de cupones con dos datos por cupón: el porcentaje de descuento y la fecha de caducidad. Con él, el servicio:

- aplica el descuento solo si el cupón existe y sigue vigente (R1);
- responde con un 400 y el campo `error` si el cupón no existe o ha caducado (R2);
- garantiza que el total siempre sea un entero de céntimos (R1.3, R1.5).

El cambio afecta solo a `src/`. El servicio FastAPI de `api/` y la infraestructura de `infra/` no cambian.

Se respetan las convenciones del proyecto:

- La lógica de dominio va en módulos puros y la capa HTTP solo valida y delega.
- Los esquemas son zod y los tipos se derivan con `z.infer`.
- Se usa `safeParse` y se responde con un 400 seguido de `return`, sin lanzar excepciones.
- Los importes son enteros en céntimos y los descuentos se redondean con `Math.round`.
- Se usan exports con nombre y las funciones públicas llevan un JSDoc breve.

## Arquitectura

La arquitectura sigue teniendo dos capas: la capa HTTP en `server.ts` y el dominio puro en `orders.ts` y en el nuevo `coupons.ts`. La ruta `POST /orders/total` hace tres cosas, en este orden:

1. Valida el body con `orderSchema.safeParse`.
2. Si el pedido trae `coupon`, lo resuelve con `resolveCoupon(code, new Date())`.
3. Si el cupón es válido, delega el cálculo en `orderTotal`.

La fecha actual se inyecta como parámetro. Así el dominio no depende del reloj y es determinista en los tests.

```mermaid
sequenceDiagram
    participant C as Cliente
    participant S as server.ts (POST /orders/total)
    participant O as orders.ts
    participant K as coupons.ts
    C->>S: { id, items, coupon? }
    S->>O: orderSchema.safeParse(body)
    alt body inválido
        S-->>C: 400 { error: issues }
    else body válido
        opt order.coupon presente
            S->>K: resolveCoupon(code, new Date())
            alt desconocido o caducado
                K-->>S: { ok: false, error }
                S-->>C: 400 { error } (sin total)
            else vigente
                K-->>S: { ok: true, coupon }
            end
        end
        S->>O: orderTotal(order, coupon?)
        O-->>S: total (entero, céntimos)
        S-->>C: 200 { total }
    end
```

## Componentes

| Componente | Responsabilidad | Ubicación |
| --- | --- | --- |
| `couponSchema` / `Coupon` | Esquema zod de un cupón: `percent` es un entero entre 1 y 100 y `expiresAt` es un instante ISO 8601. El tipo `Coupon` se deriva con `z.infer`. | `src/coupons.ts` (nuevo) |
| `coupons` | Catálogo estático de cupones conocidos, indexado por código y validado con `couponSchema` al cargar el módulo. Incluye `WELCOME` (10%) para no romper el comportamiento actual. | `src/coupons.ts` (nuevo) |
| `resolveCoupon` | Función pura que, con un código y la fecha actual, devuelve el cupón si existe y está vigente. Si no existe devuelve el error `unknown coupon` y si ha caducado devuelve `expired coupon`. | `src/coupons.ts` (nuevo) |
| `orderSchema` | Endurece `price` a `z.number().int().nonnegative()` para que todos los importes de entrada sean céntimos enteros. | `src/orders.ts` (modificado) |
| `orderTotal` | Calcula el subtotal en céntimos y, si recibe un `Coupon`, resta `Math.round(subtotal * percent / 100)`. Ya no contiene ningún código de cupón fijo. | `src/orders.ts` (modificado) |
| Ruta `POST /orders/total` | Valida el body, resuelve el cupón con `new Date()`, responde con un 400 `{ error }` si el cupón se rechaza y, si no, devuelve `{ total }`. | `src/server.ts` (modificado) |
| Tests de dominio | Cubren el cálculo con y sin cupón, el redondeo, el cupón desconocido, el cupón caducado y el límite exacto de caducidad. | `src/orders.test.ts` (modificado), `src/coupons.test.ts` (nuevo) |
| Tests HTTP | Cubren el 200 con `total`, el 400 con `error` y sin `total` para un cupón desconocido o caducado, y el pedido sin cupón. | `src/server.test.ts` (nuevo) |

## Modelos de datos

**Cupón** (`src/coupons.ts`):

```ts
export const couponSchema = z.object({
  percent: z.number().int().min(1).max(100),
  expiresAt: z.string().datetime(), // instante ISO 8601 en UTC, p. ej. '2027-12-31T23:59:59Z'
});

export type Coupon = z.infer<typeof couponSchema>;

export const coupons: Record<string, Coupon> = z.record(couponSchema).parse({
  WELCOME: { percent: 10, expiresAt: '2027-12-31T23:59:59Z' },
});
```

**Resultado de resolver un cupón.** Es una unión discriminada que permite señalar el error sin lanzar excepciones:

```ts
export type CouponResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; error: 'unknown coupon' | 'expired coupon' };
```

**Pedido** (`src/orders.ts`). La estructura no cambia, salvo que `price` pasa a ser un entero:

```ts
items: z.array(z.object({ sku: z.string(), price: z.number().int().nonnegative(), quantity: z.number().int().positive() }))
coupon: z.string().optional()
```

**Reglas:**

- Los códigos de cupón se comparan de forma exacta, distinguiendo mayúsculas y minúsculas, como ocurre hoy.
- Un cupón está vigente mientras `now.getTime() <= Date.parse(expiresAt)`. Es decir, el instante exacto de caducidad todavía cuenta como vigente.
- Todos los importes son enteros en céntimos. El descuento es `Math.round(subtotal * percent / 100)` y el total es `subtotal - descuento`.

## Interfaces

**Funciones de dominio (exports con nombre y JSDoc):**

```ts
/** Resolves a coupon code against the catalog at instant `now`; unknown or expired codes yield an error instead of a coupon. */
export function resolveCoupon(code: string, now: Date): CouponResult;

/** Total of an order in integer cents; if a valid coupon is given, subtracts its percentage rounded with Math.round. */
export function orderTotal(order: Order, coupon?: Coupon): number;
```

**HTTP: `POST /orders/total`.** El contrato es compatible con el actual.

- Petición: `{ "id": "o1", "items": [{ "sku": "a", "price": 1000, "quantity": 1 }], "coupon": "WELCOME" }`. El campo `coupon` es opcional.
- `200 OK` → `{ "total": 900 }`, con `total` siempre entero en céntimos.
- `400 Bad Request` por body inválido → `{ "error": [ ...issues de zod ] }`. Es el formato actual; ahora también se aplica a precios con decimales.
- `400 Bad Request` por cupón inexistente → `{ "error": "unknown coupon" }`. No incluye `total`.
- `400 Bad Request` por cupón caducado → `{ "error": "expired coupon" }`. No incluye `total`.

Esquema de la ruta:

```ts
const parsed = orderSchema.safeParse(req.body);
if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
let coupon: Coupon | undefined;
if (parsed.data.coupon !== undefined) {
  const result = resolveCoupon(parsed.data.coupon, new Date());
  if (!result.ok) { res.status(400).json({ error: result.error }); return; }
  coupon = result.coupon;
}
res.json({ total: orderTotal(parsed.data, coupon) });
```

## Infraestructura

No aplica. El catálogo de cupones está en el código y no requiere almacenamiento, recursos de AWS ni cambios en `infra/`. Tampoco hay que cambiar el CI (`.github/`): los tests nuevos se ejecutan con `npm test`, igual que los actuales.

## Decisiones

1. **Catálogo estático en un módulo puro (`src/coupons.ts`) validado con zod.**
   - *Alternativa descartada:* guardar los cupones en una base de datos, en un fichero externo o en S3.
   - *Por qué:* el proyecto no tiene persistencia, y los requisitos no piden gestionar cupones en tiempo de ejecución. Añadir almacenamiento metería infraestructura y E/S en la lógica de dominio sin aportar nada a R1 ni a R2. Si en el futuro hace falta un catálogo dinámico, bastará con sustituir `coupons` por otra fuente que respete `couponSchema`.

2. **La fecha actual se inyecta como parámetro `now: Date` en `resolveCoupon`.**
   - *Alternativa descartada:* llamar a `new Date()` dentro del dominio y simular el reloj con `vi.useFakeTimers` en los tests.
   - *Por qué:* así la función sigue siendo pura y determinista. Los tests pueden comprobar con claridad el límite exacto de caducidad (R2.2), y la única dependencia del reloj queda en la capa HTTP.

3. **El error del cupón se devuelve como valor (`CouponResult` con `ok: false`).**
   - *Alternativa descartada:* lanzar excepciones como `InvalidCouponError` y capturarlas en la ruta.
   - *Por qué:* la convención del proyecto dice que no se lanzan excepciones. Además, la unión discriminada obliga al tipado a tratar el caso de error antes de calcular el total, lo que garantiza R2.3 y R2.4.

4. **El cupón se resuelve en la ruta y `orderTotal` recibe un `Coupon` ya validado.**
   - *Alternativa descartada:* que `orderTotal` busque el cupón y devuelva un `number | error`.
   - *Por qué:* así `orderTotal` sigue siendo un cálculo aritmético simple que siempre devuelve un número. Además, la regla de vigencia, que depende del tiempo, queda separada del cálculo del total. La ruta solo valida y delega, como piden las convenciones.

5. **`price` pasa a ser un entero en `orderSchema`.**
   - *Alternativa descartada:* aceptar precios con decimales y aplicar `Math.round` al subtotal.
   - *Por qué:* la convención del proyecto es que los importes son enteros en céntimos. Validar en la entrada asegura R1.3 y R1.5 sin redondeos ocultos que alteren la suma de los artículos (R1.4). Si redondeáramos el subtotal, aceptaríamos datos que no tienen sentido en céntimos.

6. **El cupón rechazado responde con `{ error: string }` y un mensaje corto en minúsculas.**
   - *Alternativa descartada:* construir a mano un issue de zod para mantener el formato de array, o devolver un 404 o un 422.
   - *Por qué:* los requisitos fijan un 400 con el campo `error`. Un texto corto como `unknown coupon` o `expired coupon` sigue el estilo de los mensajes `detail` del proyecto y deja clara la causa. Fabricar issues de zod falsos confundiría un error de negocio con uno de formato.

7. **`WELCOME` se mantiene en el catálogo con un 10%.**
   - *Alternativa descartada:* eliminar el cupón fijo sin sustituirlo.
   - *Por qué:* así no se rompe el comportamiento que ya usan los clientes ni el test existente (`applies the WELCOME coupon`).

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Al exigir `price` entero, algunos clientes que hoy envían decimales empezarían a recibir un 400. | Documentar el cambio de contrato y añadir un test del 400 con precio decimal. Si hubiera clientes afectados, se puede plantear un periodo de transición antes de desplegar. |
| La fecha de caducidad de `WELCOME` (`2027-12-31T23:59:59Z`) es una suposición y podría no coincidir con la política comercial. | Confirmar la fecha con el responsable del negocio (Jose Manuel Aceituno) antes de cerrar las tareas. Está en un único punto del catálogo y es fácil de cambiar. |
| Hay ambigüedad de zona horaria y del límite de caducidad: no está claro si un cupón vale el mismo día en que caduca. | Guardar `expiresAt` como un instante UTC con hora explícita, validado con `z.string().datetime()`. La regla «vigente mientras `now <= expiresAt`» se cubre con tests en el instante exacto y un milisegundo después. |
| Un error en el catálogo, como un porcentaje mayor que 100 o una fecha inválida, podría producir totales negativos o descuentos indebidos. | El catálogo se valida con `couponSchema` al cargar el módulo (`percent` entero entre 1 y 100). Si falla, el servicio no arranca y los tests detectan el error en CI. |
| Los tests podrían ser frágiles si dependen del reloj real, por ejemplo si `WELCOME` caduca y los tests empiezan a fallar. | Los tests de dominio pasan un `now` fijo. Los tests HTTP usan `vi.setSystemTime` para fijar la fecha. |
| Un cliente que hoy envía `coupon` con un código inexistente recibía el subtotal y ahora recibirá un 400. | Es exactamente el comportamiento que piden R2.1 y R2.4. Se documenta como cambio visible para los clientes. |

## Trazabilidad

| Requisito | Componentes |
| --- | --- |
| R1.1 | `resolveCoupon`, `coupons`, `orderTotal` (`src/coupons.ts`, `src/orders.ts`), ruta `POST /orders/total` (`src/server.ts`) |
| R1.2 | `orderTotal` (`src/orders.ts`) |
| R1.3 | `orderTotal`, `orderSchema` (`price` entero) (`src/orders.ts`) |
| R1.4 | `orderTotal` sin cupón (`src/orders.ts`), ruta `POST /orders/total`, que omite `resolveCoupon` (`src/server.ts`) |
| R1.5 | `orderSchema` (`price` entero), `orderTotal` con `Math.round` (`src/orders.ts`) |
| R2.1 | `resolveCoupon` (`unknown coupon`) (`src/coupons.ts`), ruta `POST /orders/total` (400 `{ error }`) (`src/server.ts`) |
| R2.2 | `resolveCoupon` (`expired coupon`, regla `now <= expiresAt`), `couponSchema` (`src/coupons.ts`), ruta `POST /orders/total` (`src/server.ts`) |
| R2.3 | Ruta `POST /orders/total`, que hace `return` antes de calcular `total` (`src/server.ts`) |
| R2.4 | `CouponResult` (unión discriminada), `resolveCoupon` (`src/coupons.ts`), `orderTotal`, que solo recibe un `Coupon` ya validado (`src/orders.ts`) |
