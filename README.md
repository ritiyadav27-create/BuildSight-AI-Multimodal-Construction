# BuildSight AI — Multimodal Construction Intelligence Platform

**Skill Wallet / FutureSkills Prime Capstone: Multimodal Construction Intelligence Platform**

A responsive full-stack construction decision-support demonstration built with **React + Vite**, **FastAPI + Python**, structured JSON outputs, and optional **Google Gemini multimodal AI**. A single Docker service serves both the built frontend and the backend API.

> **Important:** Photo screening is not a safety certification, engineering inspection, building-code compliance audit, or professional property valuation. **Without a Gemini API key**, photo and chatbot features display explicitly marked **DEMO** examples; they do **not** analyze the uploaded photograph. Cost calculations and selected-condition weather checklists are functional without an AI key.

## Features

| Area | What the user can do | Epic |
|---|---|---|
| Site Safety & PPE Audit | Upload site photos (PNG/JPG, up to 8 MB), enter optional observations, obtain structured PPE visibility and hazard screening; export JSON | 2 / 4 |
| Crack Diagnostics | Upload concrete/wall photos, get tentative defect category, possible causes, severity, recommendations and limitations | 2 / 4 |
| Construction Planning & Valuation | Enter building type, built-up area, editable price and material factors, city tier and completion; obtain INR totals, quantities, massing illustration and architectural concept prompt | 3 |
| Weather-Aware Advisory | Select normal, heavy rain, wind or extreme heat and obtain condition-specific construction guidance (not live weather data) | 5 |
| AI Site Assistant | Multi-turn construction Q&A, real AI if Gemini is configured or explicitly labeled demo responses | 5 |
| Report History | Workspace-separated recent reports (SQLite, stored server-side on current instance); export report JSON | 4 / 6 |

### Architecture

```text
Browser / React SPA ── HTTP JSON + multipart ──► FastAPI backend
        │                                            │
        │                                            ├── Domain calculations / weather rules
        │                                            ├── Gemini multimodal AI (optional)
        │                                            └── SQLite workspace report history
        │
        └── Displays analysis, estimates, chat and report exports
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for architecture, endpoints and design decisions.

## Run locally on Windows (VS Code)

Install **Python 3.11 or 3.12** and **Node.js 20.19+ / 22+**. Open the extracted project root in VS Code.

**Terminal 1 — FastAPI backend (PowerShell)**

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit backend/.env to set GEMINI_API_KEY if you want live AI.
uvicorn app.main:app --reload --port 8000
```

If `py -3.12` is not installed, use `python -m venv .venv` with your available supported Python version. API docs are at `http://127.0.0.1:8000/docs` and `/api/health`.

**Terminal 2 — React frontend**

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Vite proxies requests starting `/api` to FastAPI on port 8000; no special frontend environment variables are required.

**macOS/Linux equivalent**: `python3 -m venv .venv`, `source .venv/bin/activate`, then use the same pip/npm/uvicorn commands.

### Test the project

```powershell
# From the project root; after installing backend dependencies
$env:PYTHONPATH='backend'
python -m pytest -q backend/tests
```

```powershell
cd frontend
npm install
npm run build
```

The Python test suite uses no real Gemini calls. Live AI output requires an API key, provider quota, and an uploaded image. See [`docs/TEST_CHECKLIST.md`](docs/TEST_CHECKLIST.md).

## Deploy on Render (single web service)

A root [`Dockerfile`](Dockerfile) compiles the React SPA and runs FastAPI with Uvicorn. The included [`render.yaml`](render.yaml) defines the service for Render Blueprints.

1. Create a **new, empty GitHub repository** named `multimodal-construction-intelligence` (recommended) and upload **all files in this project directory** to its root (not a ZIP file nested in the repository).
2. In Render, choose **New → Blueprint**, connect your GitHub repo and select its root `render.yaml`. Alternatively, create a **Web Service** configured as **Docker** and use the repository's `Dockerfile`.
3. Review the service plan before creating it. Render's free instance availability and limits depend on the account; the YAML requests a free plan where available.
4. For **real multimodal AI**, set the environment variable `GEMINI_API_KEY` in Render to your secret AI Studio key. For an interactive demo without a key, leave it empty; the interface labels the image/chat results as demonstration outputs. `GEMINI_MODEL` defaults to `gemini-2.5-flash`.
5. Deploy, wait for the service to report live, then open `https://<your-service>.onrender.com` and verify `/api/health`.
6. Upload a real image and test the safety/crack reports. Test Planning, Weather and Assistant. Download JSON reports and confirm history behaves as expected.
7. Paste the **public GitHub repository URL** into Skill Wallet's **Add GitHub Link** and paste the live HTTPS service URL into **Add Demo Link**. Complete the applicable Kanban tasks only after validating their functionality.

**Do not commit real API keys.** A Render environment variable is different from the `backend/.env.example` template. API provider access and usage may incur fees or quotas. If making the deployment public with a funded API key, apply suitable access controls and rate limiting before inviting unrestricted traffic.

### Git CLI upload (optional)

Run these commands inside the extracted project directory after creating an empty repository under your account:

```bash
git init
git add .
git commit -m "Build full-stack multimodal construction intelligence capstone"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/multimodal-construction-intelligence.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your real GitHub username. Git may ask you to authenticate in your browser.

## Configuration

| Variable | Used by | Required? |
|---|---|---|
| `GEMINI_API_KEY` | Backend | Required only for real AI image/chat functionality |
| `GEMINI_MODEL` | Backend | Optional; default `gemini-2.5-flash` |
| `CORS_ORIGINS` | Backend | Optional for split frontend/backend; React & FastAPI are same-origin on Render |
| `HISTORY_DB_PATH` | Backend | Optional local SQLite path; ephemeral storage is not durable |
| `VITE_API_BASE_URL` | Frontend | Optional only if frontend is deployed separately |

## Limitations & responsible use

- Live AI could not be validated without a supplied Gemini key and network connectivity. AI generated results must be reviewed and may be incorrect.
- Construction rates, cement/steel factors and market rates are **user-provided assumptions**, not live market data; this is not a financial appraisal.
- Crack width cannot be inferred reliably from an uncalibrated photograph. All structural decisions need qualified on-site evaluation.
- Weather advisor is **scenario-based**, not a live alert API. Confirm local official weather advisories.
- Conceptual 3D massing illustration is programmatic, **not a generated architectural render**. A detailed concept-art prompt is also included for use with a suitable image-generation provider.
- SQLite storage is local and may reset on Render free instances. Workspace keys provide simple separation of histories, **not authentication**; do not upload confidential data to a public demo.
- This is a capstone prototype, not production construction software. Advanced identity management, auditing, verified standards lookup and live data integrations are out of scope.

## Skill Wallet submission

See [`docs/SKILLWALLET_SUBMISSION.md`](docs/SKILLWALLET_SUBMISSION.md) for the final mentor checklist and required GitHub/demo evidence. The uploaded guide has inconsistent language about **one vs all five** capstones; confirm the final requirement in your actual Skill Wallet certificate dashboard rather than assuming every capstone is mandatory.
