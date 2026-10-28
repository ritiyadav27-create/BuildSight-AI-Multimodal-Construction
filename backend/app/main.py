"""FastAPI service and same-origin delivery of the built React SPA."""
import io
import os
from uuid import UUID
from pathlib import Path
from fastapi import FastAPI, File, Form, Header, UploadFile, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, UnidentifiedImageError
from dotenv import load_dotenv

from app.schemas import (
    PlanRequest, PlanResult, AdvisoryRequest, AdvisoryResponse, ChatRequest,
    ChatResponse, SafetyReport, CrackReport,
)
from app.services.domain import estimate_plan, get_advisory
from app.services.ai import image_report, ask_assistant
from app.services.storage import recent_reports, save_report

load_dotenv(Path(__file__).resolve().parents[1] / '.env')
app = FastAPI(title='BuildSight AI — Multimodal Construction Intelligence API', version='1.0.0')
allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
app.add_middleware(CORSMiddleware, allow_origins=[s.strip() for s in allowed_origins],
                   allow_credentials=False, allow_methods=['GET','POST'], allow_headers=['Content-Type','X-Workspace-Key'])


def workspace_key(value: str | None) -> str:
    if not value:
        return ''
    try:
        return str(UUID(value))
    except (TypeError, ValueError):
        return ''


@app.get('/api/health')
def health():
    return {'status': 'ok', 'ai_enabled': bool(os.getenv('GEMINI_API_KEY', '').strip()),
            'message': 'Without an API key, image and chatbot endpoints return explicitly labeled demo responses.'}


async def validated_image(file: UploadFile) -> bytes:
    if file.content_type not in ('image/png', 'image/jpeg'):
        raise HTTPException(status_code=415, detail='Upload JPG or PNG images only.')
    raw = await file.read(8 * 1024 * 1024 + 1)
    if len(raw) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail='Image must be 8 MB or smaller.')
    try:
        with Image.open(io.BytesIO(raw)) as image:
            if image.format not in ('JPEG', 'PNG'):
                raise ValueError('Unsupported image format')
            image.verify()
    except (UnidentifiedImageError, ValueError, OSError) as exc:
        raise HTTPException(status_code=400, detail='Invalid image file.') from exc
    return raw


async def run_image(file: UploadFile, kind: str, notes: str = "", key: str = ""):
    raw = await validated_image(file)
    try:
        # The model SDK uses a synchronous network call; keep the event loop free.
        result = await run_in_threadpool(image_report, raw, kind, notes)
        try:
            await run_in_threadpool(save_report, kind, 'Site Safety Screening' if kind == 'safety' else 'Crack Diagnostics', result, key)
        except (OSError, ValueError):
            # Read-only ephemeral hosting must not prevent report generation.
            pass
        return result
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post('/api/safety/analyze', response_model=SafetyReport)
async def safety(file: UploadFile = File(...), notes: str = Form(default="", max_length=1200), x_workspace_key: str | None = Header(default=None)):
    return await run_image(file, 'safety', notes, workspace_key(x_workspace_key))


@app.post('/api/cracks/analyze', response_model=CrackReport)
async def cracks(file: UploadFile = File(...), notes: str = Form(default="", max_length=1200), x_workspace_key: str | None = Header(default=None)):
    return await run_image(file, 'cracks', notes, workspace_key(x_workspace_key))


@app.post('/api/planning/estimate', response_model=PlanResult)
def plan(request: PlanRequest, x_workspace_key: str | None = Header(default=None)):
    result = estimate_plan(request)
    try:
        save_report('planning', f'{request.building_type} • {request.built_up_sqft:,.0f} sq. ft', result, workspace_key(x_workspace_key))
    except OSError:
        pass
    return result


@app.post('/api/advisory/weather', response_model=AdvisoryResponse)
def advisory(request: AdvisoryRequest, x_workspace_key: str | None = Header(default=None)):
    result = get_advisory(request)
    try:
        save_report('weather', f'Weather Advisory • {request.condition}', result, workspace_key(x_workspace_key))
    except OSError:
        pass
    return result


@app.post('/api/assistant/chat', response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        return await run_in_threadpool(ask_assistant, request.question, request.history)
    except Exception as exc:
        # Do not return raw provider errors or server secrets to clients.
        raise HTTPException(status_code=502, detail='AI assistant is currently unavailable. Please retry.') from exc


@app.get('/api/history')
def history(x_workspace_key: str | None = Header(default=None)):
    try:
        return {'items': recent_reports(limit=30, workspace_key=workspace_key(x_workspace_key))}
    except (OSError, ValueError):
        return {'items': []}


# Optional compiled frontend. Container image builds it to /app/frontend/dist.
DIST = Path(__file__).resolve().parents[2] / 'frontend' / 'dist'
if DIST.is_dir():
    app.mount('/assets', StaticFiles(directory=DIST / 'assets'), name='assets')

    @app.get('/{full_path:path}', include_in_schema=False)
    def spa(full_path: str):
        # Never turn a missing API endpoint into an HTML response.
        if full_path.startswith('api/'):
            raise HTTPException(status_code=404, detail='Not found')
        target = DIST / full_path
        if full_path and target.is_file() and target.resolve().is_relative_to(DIST.resolve()):
            return FileResponse(target)
        return FileResponse(DIST / 'index.html')
