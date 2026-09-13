"""
Sends resume text to an LLM (OpenAI or Gemini, switchable via env var)
and parses the response into the AnalysisResult schema.

Set AI_PROVIDER=openai or AI_PROVIDER=gemini in your .env file.
"""
import json
import os
import re
from fastapi import HTTPException

from .models import AnalysisResult

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()

SYSTEM_PROMPT = """You are an expert technical recruiter and resume coach.
Analyze the resume text you are given and respond with ONLY valid JSON
(no markdown fences, no commentary) matching exactly this schema:

{
  "overall_score": <integer 0-100, overall resume quality/strength>,
  "summary": "<2-3 sentence overview>",
  "strengths": ["<short strength>", ...],
  "weaknesses": ["<short weakness>", ...],
  "missing_skills": [
    {"skill": "<skill name>", "why_it_matters": "<one sentence reason>"}
  ],
  "suggested_roles": ["<job title>", ...]
}

Give 3-6 items per list. Be specific and actionable, not generic."""


def _extract_json(raw_text: str) -> dict:
    """LLMs sometimes wrap JSON in markdown fences despite instructions."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502, detail=f"AI returned non-JSON output: {exc}"
        )


def _analyze_with_openai(resume_text: str) -> dict:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set")

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Resume text:\n\n{resume_text}"},
        ],
        temperature=0.4,
        response_format={"type": "json_object"},
    )
    return _extract_json(response.choices[0].message.content)


def _analyze_with_gemini(resume_text: str) -> dict:
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
    response = model.generate_content(
        f"{SYSTEM_PROMPT}\n\nResume text:\n\n{resume_text}"
    )
    return _extract_json(response.text)


def analyze_resume(resume_text: str) -> AnalysisResult:
    if AI_PROVIDER == "gemini":
        raw = _analyze_with_gemini(resume_text)
    else:
        raw = _analyze_with_openai(resume_text)

    try:
        return AnalysisResult(**raw)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"AI response did not match expected schema: {exc}"
        )
