from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
from detector import DeepfakeDetector
from video_utils import extract_frames

app = FastAPI(title="VERITY Deepfake Detection API")

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = DeepfakeDetector()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"status": "VERITY backend running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type} ({ext})")

    try:
        contents = await file.read()
        result = detector.predict_from_bytes(contents)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    allowed_exts = {".mp4", ".avi", ".mov", ".webm", ".mkv"}
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type} ({ext})")

    # Save video temporarily
    tmp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        frames = extract_frames(tmp_path, fps=1, max_frames=30)

        if not frames:
            raise HTTPException(status_code=422, detail="Could not extract frames from video.")

        predictions = []
        for frame in frames:
            result = detector.predict_from_pil(frame)
            predictions.append(result)

        # Aggregate: average confidence per class
        real_scores = [p["confidence"] for p in predictions if p["prediction"] == "REAL"]
        fake_scores = [p["confidence"] for p in predictions if p["prediction"] == "FAKE"]

        total = len(predictions)
        real_avg = sum(real_scores) / total if total else 0
        fake_avg = sum(fake_scores) / total if total else 0

        if fake_avg > real_avg:
            return JSONResponse(content={"prediction": "FAKE", "confidence": round(fake_avg, 4), "frames_analyzed": total})
        else:
            return JSONResponse(content={"prediction": "REAL", "confidence": round(real_avg, 4), "frames_analyzed": total})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)