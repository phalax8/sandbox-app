---
applyTo: "api/**/*.py"
---

- Mantén la aplicación FastAPI en `api/app/main.py`, exportada como `app`, y los tests en `api/tests/` con funciones `test_*`.
- En los tests, usa `TestClient(app)` a nivel de módulo y comprueba `response.status_code`.
- El stock se guarda en un diccionario global (`STOCK`) que los tests modifican; ten en cuenta que el estado se comparte entre tests al añadir o reordenar casos.
- Señala los errores con `HTTPException` y el código HTTP adecuado (404 si el SKU no existe, 409 si no hay stock suficiente).
