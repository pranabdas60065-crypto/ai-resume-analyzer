import React, { useEffect, useState } from "react";

const messages = [
  "Initializing AI engine...",
  "Connecting to database...",
  "Loading resume analyzer...",
  "Almost ready...",
];

export default function LoadingScreen({ onFinish }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 1;
      });
    }, 25);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const index = Math.floor((progress / 100) * messages.length);
    setMsgIndex(Math.min(index, messages.length - 1));
    if (progress === 100) {
      setTimeout(() => setFadeOut(true), 400);
      setTimeout(() => onFinish(), 900);
    }
  }, [progress, onFinish]);

  return (
    <div className={`loading-screen ${fadeOut ? "loading-screen--out" : ""}`}>
      <div className="loading-content">
        {/* Logo / brand */}
        <div className="loading-logo">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="14" fill="var(--accent)" opacity="0.12" />
            <path
              d="M14 36L20 20L26 30L32 22L38 36"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="26" cy="16" r="3" fill="var(--accent)" />
          </svg>
        </div>

        <h1 className="loading-title">Resume Analyzer</h1>
        <p className="loading-subtitle">Powered by Gemini AI</p>

        {/* Progress bar */}
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated message */}
        <p className="loading-message">{messages[msgIndex]}</p>

        {/* Floating dots */}
        <div className="loading-dots">
          <span className="dot dot--1" />
          <span className="dot dot--2" />
          <span className="dot dot--3" />
        </div>
      </div>
    </div>
  );
}