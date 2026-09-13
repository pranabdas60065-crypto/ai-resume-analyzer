"""
FastAPI application entry point.

Routes:
  POST /api/upload          -> analyze a resume PDF, store + return the report
  GET  /api/reports         -> list past reports (summary view)
  GET  /api/reports/{id}    -> fetch one full report
  GET  /api/health          -> liveness + DB check
"""
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .ai_analyzer import analyze_resume
from .database import ping_database, reports_collection
from .models import ReportOut, ReportSummary
from .resume_parser import extract_text_from_pdf

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend's origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    db_ok = await ping_database()
    return {"status": "ok", "mongodb_connected": db_ok}


@app.post("/api/upload", response_model=ReportOut)
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    analysis = analyze_resume(resume_text)

    document = {
        "filename": file.filename,
        "created_at": datetime.now(timezone.utc),
        "analysis": analysis.model_dump(),
    }
    result = await reports_collection.insert_one(document)

    return ReportOut(
        id=str(result.inserted_id),
        filename=document["filename"],
        created_at=document["created_at"],
        analysis=analysis,
    )


@app.get("/api/reports", response_model=list[ReportSummary])
async def list_reports():
    cursor = reports_collection.find().sort("created_at", -1).limit(50)
    summaries = []
    async for doc in cursor:
        summaries.append(
            ReportSummary(
                id=str(doc["_id"]),
                filename=doc["filename"],
                created_at=doc["created_at"],
                overall_score=doc["analysis"]["overall_score"],
            )
        )
    return summaries


@app.get("/api/reports/{report_id}", response_model=ReportOut)
async def get_report(report_id: str):
    try:
        oid = ObjectId(report_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid report id.")

    doc = await reports_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found.")

    return ReportOut(
        id=str(doc["_id"]),
        filename=doc["filename"],
        created_at=doc["created_at"],
        analysis=doc["analysis"],
    )
