import React from "react";

export default function ReportsHistory({ reports, activeId, onSelect }) {
  if (!reports.length) {
    return <p className="history-empty">Past reports will appear here.</p>;
  }

  return (
    <ul className="history-list">
      {reports.map((r) => (
        <li key={r.id}>
          <button
            className={`history-item ${r.id === activeId ? "history-item--active" : ""}`}
            onClick={() => onSelect(r.id)}
          >
            <span className="history-filename">{r.filename}</span>
            <span className="history-meta">
              <span className="history-score">{r.overall_score}</span>
              <span className="history-date">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
