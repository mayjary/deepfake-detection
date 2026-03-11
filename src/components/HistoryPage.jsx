import { useState, useEffect } from "react";
import { getHistory, clearHistory } from "../utils/history";
import "./HistoryPage.css";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h2 className="history-title">Scan History</h2>
        </div>
        <div className="history-empty">
          <div className="empty-icon">◎</div>
          <p className="empty-text">No scans yet</p>
          <p className="empty-sub">Upload a file and run detection to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h2 className="history-title">Scan History</h2>
          <p className="history-count">{history.length} scan{history.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <button className="clear-btn" onClick={handleClear}>
          Clear all
        </button>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <span className="stat-num">{history.filter(h => h.prediction === "REAL").length}</span>
          <span className="stat-label real-label">REAL</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{history.filter(h => h.prediction === "FAKE").length}</span>
          <span className="stat-label fake-label">FAKE</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">
            {history.length > 0
              ? Math.round((history.reduce((s, h) => s + h.confidence, 0) / history.length) * 100)
              : 0}%
          </span>
          <span className="stat-label">AVG CONFIDENCE</span>
        </div>
      </div>

      <div className="history-list">
        {[...history].reverse().map((item, i) => (
          <div
            key={i}
            className={`history-item ${item.prediction === "FAKE" ? "item-fake" : "item-real"}`}
          >
            <div className="item-indicator" />
            <div className="item-info">
              <div className="item-top">
                <span className="item-filename">{item.filename}</span>
                <span className={`item-prediction ${item.prediction === "FAKE" ? "pred-fake" : "pred-real"}`}>
                  {item.prediction}
                </span>
              </div>
              <div className="item-bottom">
                <span className="item-meta">{item.fileType?.toUpperCase()}</span>
                <span className="item-meta">·</span>
                <span className="item-meta">{Math.round(item.confidence * 100)}% confidence</span>
                <span className="item-meta">·</span>
                <span className="item-meta">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div className="item-bar-wrap">
              <div
                className={`item-bar ${item.prediction === "FAKE" ? "bar-fake" : "bar-real"}`}
                style={{ height: `${Math.round(item.confidence * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
