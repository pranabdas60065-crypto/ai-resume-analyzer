import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import ResumeUpload from "./components/ResumeUpload";
import ReportsHistory from "./components/ReportsHistory";
import AnalysisReport from "./components/AnalysisReport";
import { uploadResume, fetchReports, fetchReport } from "./api";

export default function App() {
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (e) {
      // history is non-critical; fail silently in the UI
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleAnalyze = async (file, validationError) => {
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await uploadResume(file);
      setActiveReport(result);
      loadReports();
    } catch (e) {
      setError(e.message || "Something went wrong analyzing this resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectReport = async (id) => {
    try {
      const result = await fetchReport(id);
      setActiveReport(result);
    } catch (e) {
      setError(e.message || "Could not load that report.");
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">Resume Analyzer</span>
        </div>

        <ResumeUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} error={error} />

        <div className="sidebar-divider" />

        <p className="eyebrow eyebrow--muted">History</p>
        <ReportsHistory
          reports={reports}
          activeId={activeReport?.id}
          onSelect={handleSelectReport}
        />
      </aside>

      <main className="main">
        <AnalysisReport report={activeReport} />
      </main>
    </div>
  );
}
