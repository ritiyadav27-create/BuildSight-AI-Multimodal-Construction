"""All tests use demo mode and never make external AI calls."""
import io
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.services import storage

client = TestClient(app, headers={'X-Workspace-Key':'2bc4a3f7-c45e-4e33-85e4-ae9dcb61c091'})


def sample_png():
    out = io.BytesIO()
    Image.new('RGB', (15, 15), 'gray').save(out, format='PNG')
    return out.getvalue()


def test_health():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_plan(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, 'DB_PATH', tmp_path / 'data.sqlite3')
    response = client.post('/api/planning/estimate', json={
        'building_type':'Residential', 'city_tier':'Tier 2', 'built_up_sqft':1000,
        'completion_percent':25, 'construction_rate_per_sqft':2000,
        'market_rate_per_sqft':3500,
    })
    assert response.status_code == 200
    data = response.json()
    assert data['total_budget_inr'] == 2_000_000
    assert data['estimated_spent_inr'] == 500_000
    assert data['approximate_market_value_inr'] == 3_500_000
    assert len(client.get('/api/history').json()['items']) == 1


def test_advisory(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, 'DB_PATH', tmp_path / 'data.sqlite3')
    response = client.post('/api/advisory/weather', json={'condition':'Heavy Rain'})
    assert response.status_code == 200
    assert len(response.json()['alerts']) > 0


def test_reject_text_as_image():
    response = client.post('/api/safety/analyze', files={'file':('fake.png', b'not an image','image/png')})
    assert response.status_code == 400


def test_reject_disguised_format():
    response = client.post('/api/safety/analyze', files={'file':('bad.txt', b'abc','text/plain')})
    assert response.status_code == 415


def test_labeled_demo(monkeypatch, tmp_path):
    monkeypatch.setattr(storage, 'DB_PATH', tmp_path / 'data.sqlite3')
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    response = client.post('/api/cracks/analyze', files={'file':('sample.png',sample_png(),'image/png')})
    assert response.status_code == 200
    assert response.json()['mode'] == 'demo'
    assert response.json()['estimated_width_mm'] is None
    assert len(client.get('/api/history').json()['items']) == 1


def test_safety_labeled_demo(monkeypatch, tmp_path):
    monkeypatch.setattr(storage, 'DB_PATH', tmp_path / 'data.sqlite3')
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    response = client.post('/api/safety/analyze', files={'file':('sample.png',sample_png(),'image/png')})
    assert response.status_code == 200
    assert response.json()['mode'] == 'demo'
    assert response.json()['safety_score'] == 70


def test_assistant_demo(monkeypatch):
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    response = client.post('/api/assistant/chat', json={'question':'What is PPE?','history':[]})
    assert response.status_code == 200
    assert response.json()['mode'] == 'demo'


def test_invalid_plan():
    response = client.post('/api/planning/estimate', json={
        'building_type':'Residential','city_tier':'Tier 1','built_up_sqft':-10,
        'completion_percent':120,'construction_rate_per_sqft':2000,'market_rate_per_sqft':3000})
    assert response.status_code == 422


def test_invalid_weather():
    response = client.post('/api/advisory/weather', json={'condition':'Unknown'})
    assert response.status_code == 422


def test_chat_limits():
    assert client.post('/api/assistant/chat', json={'question':'x','history':[]}).status_code == 422


def test_workspace_separation(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, 'DB_PATH', tmp_path / 'separate.sqlite3')
    body = {
        'building_type':'Residential', 'city_tier':'Tier 2', 'built_up_sqft':500,
        'completion_percent':50, 'construction_rate_per_sqft':2000,
        'market_rate_per_sqft':3000
    }
    assert client.post('/api/planning/estimate',json=body).status_code == 200
    other = {'X-Workspace-Key':'6e4d405d-11ee-4593-bcaf-e1e1b116d055'}
    assert client.get('/api/history',headers=other).json()['items'] == []
    assert len(client.get('/api/history').json()['items']) == 1
    assert client.get('/api/history',headers={'X-Workspace-Key':'not-a-uuid'}).json()['items'] == []

def test_text_notes_are_accepted(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, 'DB_PATH', tmp_path / 'notes.sqlite3')
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    result = client.post('/api/safety/analyze',
        files={'file':('test.png',sample_png(),'image/png')},
        data={'notes':'Crew on scaffold, north side'})
    assert result.status_code == 200
    assert result.json()['mode'] == 'demo'

def test_text_notes_length_enforced():
    response = client.post('/api/safety/analyze',
        files={'file':('sample.png',sample_png(),'image/png')},
        data={'notes':'a'*1201})
    assert response.status_code == 422
