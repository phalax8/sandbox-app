from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_reserves_available_stock():
    response = client.post("/reservations", json={"sku": "a", "quantity": 2})
    assert response.status_code == 200


def test_refuses_more_than_available():
    response = client.post("/reservations", json={"sku": "b", "quantity": 1})
    assert response.status_code == 409
