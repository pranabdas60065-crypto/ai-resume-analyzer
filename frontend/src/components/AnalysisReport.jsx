import React from "react";
import ScoreGauge from "./ScoreGauge";

export default function AnalysisReport({ report }) {
  if (!report) {
    return (
      <div className="report-placeholder">
        <p className="eyebrow">No report selected</p>
        <h2>Upload a resume to see its breakdown</h2>
        <p className="report-placeholder-body">
          We'll score it, flag what's working, what's missing, and which
          skills to add for the roles it's closest to.
        </p>
      </div>
    );
  }

  const { analysis, filename, created_at } = report;

  return (
    <article className="report">
      <header className="report-header">
        <div>
          <p className="eyebrow">{filename}</p>
          <h2>Resume breakdown</h2>
          <p className="report-date">
            Analyzed {new Date(created_at).toLocaleString()}
          </p>
        </div>
        <ScoreGauge score={analysis.overall_score} />
      </header>

      <p className="report-summary">{analysis.summary}</p>

      <div className="report-grid">
        <section className="report-card report-card--strengths">
          <h3>Strengths</h3>
          <ul>
            {analysis.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>

        <section className="report-card report-card--weaknesses">
          <h3>Weaknesses</h3>
          <ul>
            {analysis.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="report-card report-card--gaps">
        <h3>Missing skills</h3>
        <ul className="skill-gap-list">
          {analysis.missing_skills.map((gap, i) => (
            <li key={i}>
              <span className="skill-pill">{gap.skill}</span>
              <span className="skill-reason">{gap.why_it_matters}</span>
            </li>
          ))}
        </ul>
      </section>

      {analysis.suggested_roles?.length > 0 && (
        <section className="report-card report-card--roles">
          <h3>Roles this resume is closest to</h3>
          <div className="role-pills">
            {analysis.suggested_roles.map((role, i) => (
              <span key={i} className="role-pill">
                {role}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
