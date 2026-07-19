import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Separate in-memory-style test database so tests never touch real data
engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

client = TestClient(app)

def signup_and_token(email="a@test.com", password="pass123"):
    client.post("/auth/signup", json={"email": email, "password": password})
    r = client.post("/auth/login", data={"username": email, "password": password})
    return r.json()["access_token"]

def test_signup_returns_token():
    r = client.post("/auth/signup", json={"email": "new@test.com", "password": "pass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_login_works():
    client.post("/auth/signup", json={"email": "b@test.com", "password": "pass123"})
    r = client.post("/auth/login", data={"username": "b@test.com", "password": "pass123"})
    assert r.status_code == 200

def test_tasks_require_auth():
    r = client.get("/tasks")
    assert r.status_code == 401

def test_create_and_list_task():
    token = signup_and_token()
    h = {"Authorization": f"Bearer {token}"}
    r = client.post("/tasks", json={"title": "task one"}, headers=h)
    assert r.status_code == 200
    assert r.json()["title"] == "task one"
    r2 = client.get("/tasks", headers=h)
    assert len(r2.json()) == 1

def test_user_cannot_see_others_tasks():
    token_a = signup_and_token(email="usera@test.com")
    client.post("/tasks", json={"title": "a's task"}, headers={"Authorization": f"Bearer {token_a}"})
    token_b = signup_and_token(email="userb@test.com")
    r = client.get("/tasks", headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code == 200
    assert r.json() == []
