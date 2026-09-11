from app.models import ContactMessage

PROJECT = {
    "slug": "mi-proyecto",
    "title": "Mi proyecto",
    "summary": "Un resumen",
    "tech_stack": ["Python", "React"],
}


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_projects_empty_by_default(client):
    assert client.get("/api/projects").json() == []


def test_create_project_requires_auth(client):
    assert client.post("/api/projects", json=PROJECT).status_code == 401


def test_login_with_wrong_password_fails(client, admin_headers):
    response = client.post(
        "/api/auth/login", data={"username": "admin@test.local", "password": "nope"}
    )
    assert response.status_code == 401


def test_admin_can_create_and_fetch_project(client, admin_headers):
    created = client.post("/api/projects", json=PROJECT, headers=admin_headers)
    assert created.status_code == 201
    assert created.json()["tech_stack"] == ["Python", "React"]

    fetched = client.get("/api/projects/mi-proyecto")
    assert fetched.status_code == 200
    assert fetched.json()["title"] == "Mi proyecto"


def test_duplicate_slug_is_rejected(client, admin_headers):
    client.post("/api/projects", json=PROJECT, headers=admin_headers)
    second = client.post("/api/projects", json=PROJECT, headers=admin_headers)
    assert second.status_code == 409


def test_invalid_slug_is_rejected(client, admin_headers):
    bad = {**PROJECT, "slug": "Con Mayusculas Y Espacios"}
    assert client.post("/api/projects", json=bad, headers=admin_headers).status_code == 422


def test_contact_message_is_stored(client, db_session):
    response = client.post(
        "/api/contact",
        json={
            "name": "Reclutadora",
            "email": "rrhh@empresa.com",
            "subject": "Entrevista",
            "message": "Hola, queremos hablar con vos sobre una posicion.",
        },
    )
    assert response.status_code == 202
    assert db_session.query(ContactMessage).count() == 1


def test_honeypot_silently_discards_bots(client, db_session):
    response = client.post(
        "/api/contact",
        json={
            "name": "Bot",
            "email": "bot@spam.com",
            "message": "Comprá seguidores baratos ahora mismo!!",
            "website": "http://spam.example",
        },
    )
    # Se responde 202 como a un humano, pero no se guarda nada.
    assert response.status_code == 202
    assert db_session.query(ContactMessage).count() == 0


def test_contact_messages_are_private(client):
    assert client.get("/api/contact/messages").status_code == 401


def test_certifications_crud(client, admin_headers):
    assert client.get("/api/certifications").json() == []

    payload = {
        "name": "Cybersecurity Foundations Bootcamp",
        "issuer": "Cybersecurity Institute",
        "issued_date": "2026-09-07",
        "credential_id": "B4-2026-ELYDF5",
    }
    created = client.post("/api/certifications", json=payload, headers=admin_headers)
    assert created.status_code == 201
    cert_id = created.json()["id"]

    assert client.get("/api/certifications").json()[0]["name"] == payload["name"]
    assert client.post("/api/certifications", json=payload).status_code == 401

    deleted = client.delete(f"/api/certifications/{cert_id}", headers=admin_headers)
    assert deleted.status_code == 204
    assert client.get("/api/certifications").json() == []
