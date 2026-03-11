import { useEffect, useState } from "react";
import "./ResultPanel.css";

export default function ResultPanel({ result, filename, fileType, onReset }) {
  const [revealed, setRevealed] = useState(false);
  const isFake = result.prediction === "FAKE";
  const confidencePct = Math.round(result.confidence * 100);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`result-panel ${revealed ? "revealed" : ""} ${isFake ? "is-fake" : "is-real"}`}>
      {/* Top verdict bar */}
      <div className="verdict-bar">
        <div className="verdict-icon">
          {isFake ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9l10 10M19 9L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8.5 14.5l4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="verdict-text">
          <span className="verdict-label">VERDICT</span>
          <span className={`verdict-value ${isFake ? "verdict-fake" : "verdict-real"}`}>
            {result.prediction}
          </span>
        </div>
        <div className="verdict-confidence">
          <span className="conf-label">Confidence</span>
          <span className="conf-value">{confidencePct}%</span>
        </div>
      </div>

      {/* Confidence meter */}
      <div className="meter-section">
        <div className="meter-labels">
          <span className="meter-label-real">REAL</span>
          <span className="meter-label-fake">FAKE</span>
        </div>
        <div className="meter-track">
          <div className="meter-center" />
          <div
            className={`meter-fill ${isFake ? "meter-fill-fake" : "meter-fill-real"}`}
            style={{
              width: `${revealed ? confidencePct / 2 : 0}%`,
              left: isFake ? "auto" : "50%",
              right: isFake ? "50%" : "auto",
            }}
          />
        </div>
        <div className="meter-pct-row">
          <span className="meter-pct">{isFake ? "" : `${confidencePct}%`}</span>
          <span className="meter-pct">{isFake ? `${confidencePct}%` : ""}</span>
        </div>
      </div>

      {/* Meta info */}
      <div className="result-meta">
        <div className="meta-row">
          <span className="meta-key">File</span>
          <span className="meta-val">{filename}</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">Type</span>
          <span className="meta-val">{fileType?.toUpperCase()}</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">Model</span>
          <span className="meta-val">dima806/deepfake_vs_real_image_detection</span>
        </div>
        <div className="meta-row">
          <span className="meta-key">Scanned</span>
          <span className="meta-val">{new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className={`interpretation ${isFake ? "interp-fake" : "interp-real"}`}>
        <p>
          {isFake
            ? `This ${fileType} shows signs of synthetic manipulation. The model detected artificial generation patterns with ${confidencePct}% confidence. Treat this media with caution.`
            : `This ${fileType} appears to be authentic. No significant deepfake signatures were detected. Confidence level: ${confidencePct}%.`}
        </p>
      </div>

      <button className="new-scan-btn" onClick={onReset}>
        ↺ Scan another file
      </button>
    </div>
  );
}
