from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="sandbox-api")

STOCK: dict[str, int] = {"a": 10, "b": 0}


class Reservation(BaseModel):
    sku: str
    quantity: int


@app.post("/reservations")
def reserve(reservation: Reservation) -> dict[str, int]:
    available = STOCK.get(reservation.sku)
    if available is None:
        raise HTTPException(status_code=404, detail="unknown sku")
    if reservation.quantity > available:
        raise HTTPException(status_code=409, detail="not enough stock")
    STOCK[reservation.sku] = available - reservation.quantity
    return {"remaining": STOCK[reservation.sku]}
