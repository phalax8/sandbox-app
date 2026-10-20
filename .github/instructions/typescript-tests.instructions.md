---
applyTo: "src/**/*.test.ts"
---

- Usa Vitest e importa explícitamente `describe`, `expect` e `it` desde 'vitest'.
- Coloca el test junto al módulo que prueba e impórtalo con la extensión `.js` (`./orders.js`).
- Agrupa los casos con `describe('<función>')` y escribe descripciones `it(...)` en inglés que expliquen el comportamiento esperado.
- Construye los objetos de entrada en línea y comprueba los resultados exactos en céntimos con `toBe`.
