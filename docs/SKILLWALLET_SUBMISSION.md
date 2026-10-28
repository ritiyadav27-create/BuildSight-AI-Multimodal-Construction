# Skill Wallet Submission — Project 1

Project title in the portal: **Multimodal Construction Intelligence Platform**

The accompanying 38-page Skill Wallet PDF specifies the project workflow in pages 26–32. Page 27 lists eight implementation instructions, and the project appendix (page 34) describes functional modules. The screenshots show 9 tracked workflow sections (including pre-requisites, project workflow and conclusion) with **six development epics** and **18 portal tasks**.

## What this package covers

| Skill Wallet area | Evidence in this repository |
|---|---|
| Pre-requisites | Python, FastAPI, React/Vite, project folders, README |
| Epic 1 Requirements and Environment | Requirements file, app configuration, architecture diagram |
| Epic 2 Image-Based Analysis | Image upload validation, Safety Audit, Crack Diagnostics and real Gemini integration when configured |
| Epic 3 Construction Planning and Valuation | Cost estimates, material calculations, INR market valuation, conceptual rendering prompt and isometric massing diagram |
| Epic 4 AI Intelligence Layer | Backend Google GenAI integration, prompt constraints and Pydantic JSON schemas |
| Epic 5 Assistant and Advisory Engine | Multi-turn chatbot, weather scenario engine |
| Epic 6 Interface, Testing and Deployment | React UI, API tests, Dockerfile, Render Blueprint and this test checklist |

## Mentor-ready submission steps

1. Extract the ZIP; **upload the project files into the root of a new GitHub repository**, not the ZIP itself.
2. Review `README.md` and confirm you understand which outputs are demos unless an AI key is configured.
3. Create a web service on Render using `render.yaml`; ensure the live app loads and API health is OK.
4. Configure `GEMINI_API_KEY` privately in Render if you want genuine image analysis and chat. Do not expose or paste the secret in code/screenshots.
5. Validate modules using the manual checklist in `docs/TEST_CHECKLIST.md`.
6. In Skill Wallet **Workspace / Kanban**, review the actual 18 activity cards and move **only verified work** to Completed. Do not mark tasks you have not validated.
7. Select **Add GitHub Link** and paste your repository's URL.
8. Select **Add Demo Link** and paste the live Render HTTPS page URL.
9. Capture screenshots: dashboard overview, safety output, crack report, cost planning, weather advisory, assistant, GitHub and the live Render URL; include your app's AI/demo status so output is represented correctly.
10. Check the portal's **Certificate** eligibility requirements after submission. The uploaded guide is inconsistent: page 26 suggests five projects, while its appendix (page 33) says exactly one; the portal's live eligibility state is the authoritative checklist for your account.

## Suggested demo walkthrough

**A.** Begin at Overview and explain the React ↔ FastAPI ↔ AI data flow. **B.** Demonstrate Safety Audit and Crack Diagnostics with real example photographs (if AI configured). **C.** Calculate a 1,000 sq. ft example and show material estimates and concept sketch. **D.** Generate High Wind advisory. **E.** Ask the assistant about PPE. **F.** Export JSON and show report history. **G.** Explain limitations and environment-based API-key security.

## Review honesty

This prototype is not certified safety software. It is not an independently trained crack detector; it is an optional vision-language-model screening system with structured prompting and conservative caveats. A demo-mode image output is a sample response **not inferred from the user's image**. Architectural massing is a deterministic illustrative diagram, not a photorealistic AI render.
