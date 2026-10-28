# QA & Validation Checklist

## Automated tests

Run from project root:

```bash
PYTHONPATH=backend python -m pytest -q backend/tests
```

For Windows PowerShell:

```powershell
$env:PYTHONPATH='backend'
python -m pytest -q backend/tests
```

Tests cover API health, cost math, weather recommendations, unsupported file types, malformed files, demo inference labeling, request schema errors, chat length validation, image notes, and separation between report histories.

## Manual end-to-end checks before submitting

- [ ] Open the live site. Confirm dashboard loads and **API Connected** displays.
- [ ] Open `/api/health`. Verify `status: ok` and check `ai_enabled`.
- [ ] Upload valid JPG/PNG to Safety. Real AI must be enabled to claim photo analysis.
- [ ] Upload an image to Crack Diagnostics; ensure there are cautious limitations and no invented width.
- [ ] Upload an invalid text file renamed to `.png`; confirm a validation error.
- [ ] In Planning enter 1,000 sq. ft × ₹2,000/sq. ft, 25% completion, ₹3,500/sq. ft market rate. Expect ₹20,00,000 total budget, ₹5,00,000 spent, and ₹35,00,000 indicative value.
- [ ] Change building type and confirm the isometric concept sketch updates.
- [ ] Generate an advisory for **Heavy Rain**; then switch to **High Wind** and compare outputs.
- [ ] Ask Assistant about site PPE in two messages. In real mode it must respond through Gemini; without key it must show **DEMO RESPONSE**.
- [ ] Check Report History and export one JSON file.
- [ ] Refresh the browser and confirm the workspace history is retained if instance storage persists.
- [ ] Open the UI on a phone-width browser and verify navigation, cards and inputs remain accessible.
- [ ] Verify GitHub repo source, README, Dockerfile, and `render.yaml` are accessible to your mentor.
- [ ] Copy the deployed HTTPS page and attach it to Skill Wallet **Add Demo Link**.

### Known conditions not validated by local unit tests

- Live Gemini API calls require a real key, network access, and available provider quota.
- Cloud Docker build requires npm/PyPI access; run CI and check Render build logs.
- React production build should be confirmed via `npm run build` before claiming successful deployment.
- Domain output quality requires evaluation with multiple real construction images and a qualified reviewer.
