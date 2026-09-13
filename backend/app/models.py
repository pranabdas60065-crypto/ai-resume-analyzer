"""
Pydantic models describing the shape of data moving through the API
and stored in MongoDB.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SkillGap(BaseModel):
    skill: str
    why_it_matters: str


class AnalysisResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[SkillGap]
    suggested_roles: List[str] = []


class ReportOut(BaseModel):
    id: str
    filename: str
    created_at: datetime
    analysis: AnalysisResult

    class Config:
        from_attributes = True


class ReportSummary(BaseModel):
    id: str
    filename: str
    created_at: datetime
    overall_score: int
