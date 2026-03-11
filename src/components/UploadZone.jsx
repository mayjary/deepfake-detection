import { useCallback, useRef, useState } from "react";
import "./UploadZone.css";

export default function UploadZone({ onFile, preview, fileType, onReset }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleChange = useCallback(
    (e) => {
      const f = e.target.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  if (preview) {
    return (
      <div className="preview-container">
        <div className="preview-media">
          {fileType === "video" ? (
            <video src={preview} controls className="preview-video" />
          ) : (
            <img src={preview} alt="Preview" className="preview-img" />
          )}
          <div className="preview-overlay">
            <div className="preview-badge">
              <span className="preview-badge-dot" />
              {fileType === "video" ? "VIDEO" : "IMAGE"} LOADED
            </div>
          </div>
        </div>
        <button className="reset-btn" onClick={onReset}>
          ✕ Remove & upload new
        </button>
      </div>
    );
  }

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <div className="upload-inner">
        <div className="upload-icon-wrap">
          <svg className="upload-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <path d="M20 27V13M14 19l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dragging && <div className="upload-ripple" />}
        </div>
        <p className="upload-title">
          {dragging ? "Drop to analyze" : "Drop file here"}
        </p>
        <p className="upload-sub">or click to browse</p>
        <div className="upload-types">
          <span className="type-tag">JPG</span>
          <span className="type-tag">PNG</span>
          <span className="type-tag">WEBP</span>
          <span className="type-sep">·</span>
          <span className="type-tag">MP4</span>
          <span className="type-tag">AVI</span>
          <span className="type-tag">MOV</span>
        </div>
      </div>
    </div>
  );
}
