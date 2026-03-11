import { useState, useCallback, useRef, useEffect } from "react";
import UploadZone from "./components/UploadZone";
import ResultPanel from "./components/ResultPanel";
import HistoryPage from "./components/HistoryPage";
import { addToHistory } from "./utils/history";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("detect");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleFile = useCallback((selectedFile) => {
    setResult(null);
    setError(null);
    setScanProgress(0);
    setFile(selectedFile);

    const isVideo = selectedFile.type.startsWith("video/");
    setFileType(isVideo ? "video" : "image");

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  }, []);

  const handleDetect = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setScanProgress(0);

    // Animate scan progress
    const progressInterval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + Math.random() * 12;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        fileType === "video"
          ? "http://localhost:8000/detect/video"
          : "http://localhost:8000/detect/image";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      clearInterval(progressInterval);
      setScanProgress(100);

      setTimeout(() => {
        setResult(data);
        addToHistory({
          filename: file.name,
          fileType,
          prediction: data.prediction,
          confidence: data.confidence,
          timestamp: new Date().toISOString(),
        });
        setLoading(false);
      }, 400);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || "Detection failed. Is the backend running?");
      setLoading(false);
      setScanProgress(0);
    }
  }, [file, fileType]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setFileType(null);
    setResult(null);
    setError(null);
    setScanProgress(0);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => { setPage("detect"); handleReset(); }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="var(--accent)" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="7" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="14" cy="14" r="2.5" fill="var(--accent)" />
              <line x1="14" y1="1" x2="14" y2="6" stroke="var(--accent)" strokeWidth="1.5" />
              <line x1="14" y1="22" x2="14" y2="27" stroke="var(--accent)" strokeWidth="1.5" />
              <line x1="1" y1="14" x2="6" y2="14" stroke="var(--accent)" strokeWidth="1.5" />
              <line x1="22" y1="14" x2="27" y2="14" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
            <span className="logo-text">VERITY<span className="logo-dot">.</span></span>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${page === "detect" ? "active" : ""}`}
              onClick={() => setPage("detect")}
            >
              Detect
            </button>
            <button
              className={`nav-btn ${page === "history" ? "active" : ""}`}
              onClick={() => setPage("history")}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {page === "detect" ? (
          <div className="detect-page">
            <div className="hero">
              <p className="hero-label">Deepfake Detection System</p>
              <h1 className="hero-title">
                Is it <span className="real-text">real</span>
                <span className="separator"> or </span>
                <span className="fake-text">fabricated</span>?
              </h1>
              <p className="hero-sub">
                Upload an image or video. Our AI scans for synthetic manipulation signatures at the pixel level.
              </p>
            </div>

            <div className="workspace">
              <UploadZone
                onFile={handleFile}
                preview={preview}
                fileType={fileType}
                onReset={handleReset}
              />

              {file && !result && (
                <div className="action-bar">
                  {error && <p className="error-msg">⚠ {error}</p>}
                  {loading ? (
                    <div className="scanning">
                      <div className="scan-bar">
                        <div
                          className="scan-fill"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <p className="scan-label">
                        {fileType === "video" ? "Sampling frames..." : "Analyzing pixels..."}{" "}
                        {Math.round(scanProgress)}%
                      </p>
                    </div>
                  ) : (
                    <button className="detect-btn" onClick={handleDetect}>
                      <span className="detect-btn-icon">◉</span>
                      Run Detection
                    </button>
                  )}
                </div>
              )}

              {result && (
                <ResultPanel
                  result={result}
                  filename={file?.name}
                  fileType={fileType}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        ) : (
          <HistoryPage />
        )}
      </main>

      <footer className="footer">
        <p>VERITY — Deepfake Detection · Powered by HuggingFace + FastAPI</p>
      </footer>
    </div>
  );
}