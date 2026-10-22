# AGENTS.md — sandbox-app

sandbox-app es una aplicación de ejemplo con dos servicios HTTP pequeños y su infraestructura. En `src/` hay un servidor Express en TypeScript que valida pedidos con zod y calcula su total en céntimos, con un 10% de descuento si se usa el cupón WELCOME. En `api/` hay una API FastAPI en Python que reserva stock por SKU, e `infra/` define en Terraform un bucket S3 privado en AWS.

## Stack

- TypeScript (módulos ES, imports relativos con extensión `.js`)
- Node.js con Express
- zod para validar y tipar datos
- Vitest para los tests de TypeScript
- Python con FastAPI y Pydantic
- fastapi.testclient (TestClient) para los tests de Python
- Terraform con el provider hashicorp/aws ~> 5.0
- npm como gestor de paquetes
- GitHub Actions como CI (.github/)
- CI: GitHub Actions

## Estructura

- src/: servicio Express en TypeScript; `orders.ts` contiene el esquema zod `orderSchema`, el tipo `Order` y la lógica `orderTotal`, y `server.ts` define y exporta `app` con las rutas HTTP; los tests están junto al código (`*.test.ts`)
- api/: servicio FastAPI en Python; el código está en `api/app/` (`main.py` expone `app` y el endpoint `POST /reservations`) y los tests en `api/tests/`
- infra/: configuración Terraform para AWS; `main.tf` contiene el provider y los recursos, y `variables.tf` las variables `region` (por defecto eu-west-1) y `prefix`
- .github/: configuración de CI de GitHub

## Comandos

```bash
npm test
npm run lint
npm run typecheck
terraform validate
```

## Convenciones

- Antes de dar un cambio por terminado, ejecuta `npm test`, `npm run lint` y `npm run typecheck`; para la infraestructura, `terraform validate`.
- En TypeScript, la lógica de dominio va en módulos puros (`orders.ts`), separada de la capa HTTP (`server.ts`). Las rutas solo validan la entrada y delegan en esas funciones.
- La validación de entrada en TypeScript usa esquemas zod (`orderSchema`) y los tipos se derivan con `z.infer<typeof ...>`, en lugar de declarar interfaces a mano.
- En Express se valida el body con `schema.safeParse(req.body)`; si falla, se responde `res.status(400).json({ error: parsed.error.issues })` seguido de `return`. No se lanzan excepciones.
- Los importes de dinero se manejan como enteros en céntimos y se redondean con `Math.round` cuando se aplican descuentos.
- Se usan exports con nombre (`export const app`, `export function orderTotal`), no exports por defecto. El servidor solo llama a `listen` si `NODE_ENV !== 'test'`, para poder importar `app` en los tests; el puerto se lee de `process.env.PORT` (por defecto 3000).
- Las funciones públicas llevan un comentario JSDoc breve que explica su semántica (unidades, reglas de negocio).
- En Python, los cuerpos de petición se modelan con clases `BaseModel` de Pydantic y se usan type hints modernos (`dict[str, int]`). Los errores se señalan con `raise HTTPException(status_code=..., detail="...")`: 404 para un recurso desconocido y 409 para un conflicto de stock, con mensajes `detail` cortos en minúsculas.
- Los nombres de los tests describen el comportamiento en inglés: `it('adds the items')` en Vitest y `test_refuses_more_than_available` en pytest.
- En Terraform, los nombres de recursos se construyen con `var.prefix` (por ejemplo `"${var.prefix}-assets"`) y la región se toma de `var.region`.

## Registrar en los logs un pedido completo es siempre una fuga de datos

Escribir en los logs (`console.log`, `console.info`…) un pedido completo es una fuga de datos personales: los pedidos llevan datos de clientes y los logs se envían a un servicio externo. Un hallazgo así es real aunque el log parezca de depuración o temporal; no lo refutes ni rebajes su severidad.

_Promocionado desde el aprendizaje L-c405 de newcoder_
