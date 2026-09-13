import React, { useCallback, useRef, useState } from "react";

export default function ResumeUpload({ onAnalyze, isAnalyzing, error }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        onAnalyze(null, "Please upload a PDF file.");
        return;
      }
      onAnalyze(file, null);
    },
    [onAnalyze]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="upload-panel">
      <div
        className={`dropzone ${isDragOver ? "dropzone--active" : ""} ${
          isAnalyzing ? "dropzone--scanning" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="scan-line" aria-hidden="true" />
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="dropzone-title">
          {isAnalyzing ? "Reading your resume…" : "Drop your resume here"}
        </p>
        <p className="dropzone-subtitle">
          {isAnalyzing ? "The model is scoring it now" : "PDF only · or click to browse"}
        </p>
      </div>
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
