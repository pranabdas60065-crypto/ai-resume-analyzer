# AI Resume Analyzer

Upload a resume PDF, get an AI-generated breakdown of its strengths,
weaknesses, missing skills, and best-fit roles — with every report saved
to MongoDB so you can revisit it later.

**Stack:** React · Python (FastAPI) · MongoDB · OpenAI / Gemini

## How it works

1. The React frontend lets you drag-and-drop a PDF resume.
2. The FastAPI backend extracts the text (`pdfplumber`), sends it to an
   LLM (OpenAI or Gemini — your choice) with a structured prompt, and
   parses the response into a typed `AnalysisResult`.
3. The result is stored in MongoDB and returned to the frontend, which
   renders a score gauge, strengths/weaknesses, missing skills, and
   suggested roles.
4. Past reports are listed in a sidebar and can be reopened any time.

## Project structure

```
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI routes
│   │   ├── ai_analyzer.py   # OpenAI/Gemini prompt + parsing
│   │   ├── resume_parser.py # PDF -> text
│   │   ├── database.py      # MongoDB (Motor) connection
│   │   └── models.py        # Pydantic schemas
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ResumeUpload.jsx
    │   │   ├── ReportsHistory.jsx
    │   │   ├── AnalysisReport.jsx
    │   │   └── ScoreGauge.jsx
    │   ├── App.jsx
    │   └── api.js
    └── .env.example
```

## Setup

### 1. MongoDB
Easiest option: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
Or run locally with Docker:
```bash
docker run -d -p 27017:27017 --name resume-mongo mongo:7
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then fill in MONGO_URI and your API key
uvicorn app.main:app --reload --port 8000
```
Visit `http://localhost:8000/api/health` — you should see `mongodb_connected: true`.

By default the app uses OpenAI. To use Gemini instead, set `AI_PROVIDER=gemini`
and `GEMINI_API_KEY` in `.env`.

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```
Open `http://localhost:3000`.

## API reference

| Method | Route                | Description                          |
|--------|-----------------------|---------------------------------------|
| POST   | `/api/upload`          | Upload a PDF, returns the full report |
| GET    | `/api/reports`         | List saved reports (id, filename, score, date) |
| GET    | `/api/reports/{id}`    | Fetch one full report                 |
| GET    | `/api/health`          | Health check + MongoDB connectivity   |

## Deployment notes

- **Backend:** any host that runs ASGI apps (Render, Railway, Fly.io, an EC2/VM
  behind nginx). Set the env vars from `.env.example`.
- **Frontend:** Vercel/Netlify for `npm run build`; set `REACT_APP_API_BASE`
  to your deployed backend URL.
- Lock down CORS (`allow_origins` in `main.py`) to your real frontend domain
  before going to production.

## Putting this on your resume

Suggested bullet:
> Built a full-stack AI resume analyzer (React, FastAPI, MongoDB) that
> parses PDF resumes, scores them with an LLM, and surfaces missing
> skills and role fit — with persisted history and a REST API.

Things worth customizing before you ship it as a portfolio piece:
- Swap the OpenAI/Gemini prompt in `ai_analyzer.py` to tune the kind of
  feedback it gives (e.g. target a specific job description).
- Add auth (e.g. simple JWT) if you want per-user report history instead
  of one shared collection.
- Add a `/api/reports/{id}` DELETE route if you want users to manage
  their own history.
