---
id: L-e68d
status: proposed
scope:
  paths:
    - src/server.ts
  categories:
    - security
  languages:
    - typescript
origin:
  finding: F-df4794b8915d
  run: 2026-10-21T15-55-29_e196e8
  by: Jose Manuel Aceituno
  date: 2026-10-21
---

# No señalar la falta de autenticación propia en las rutas /internal/* del servidor Express

No reportes como problema de seguridad que las rutas `/internal/*` definidas en `src/server.ts` carezcan de autenticación o de restricción de IP dentro de la propia app Express. Según el equipo, esas rutas solo son accesibles desde la red interna y la autenticación la aplica el gateway que hay delante del servicio. Esta excepción no cubre las rutas públicas como `/orders/total`. Tampoco cubre que un endpoint interno exponga secretos o datos sensibles más allá de métricas operativas.
