"""
Deepfake detector using prithivMLmods/Deep-Fake-Detector-v2-Model (ViT).

Labels: {0: 'Realism', 1: 'Deepfake'}  — from model config

Key design decision: calibrated threshold.
Models trained on synthetic datasets are biased toward calling things fake.
We only call FAKE if fake_prob > FAKE_THRESHOLD (default 0.65), otherwise REAL.
This trades a small amount of fake-detection sensitivity for far fewer false positives
on real-world photos.
"""

from transformers import ViTForImageClassification, ViTImageProcessor
import torch
import torch.nn.functional as F
from PIL import Image
import io

MODEL_NAME = "prithivMLmods/Deep-Fake-Detector-v2-Model"

# Only classify as FAKE if model is at least this confident.
# 0.50 = raw model output (too many false positives on real photos)
# 0.65 = recommended balance for real-world use
# 0.75 = very conservative (fewer false positives, may miss some fakes)
FAKE_THRESHOLD = 0.65


class DeepfakeDetector:
    def __init__(self):
        print(f"Loading model: {MODEL_NAME}")
        self.processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
        self.model = ViTForImageClassification.from_pretrained(MODEL_NAME)
        self.model.eval()
        print(f"Model loaded. FAKE threshold: {FAKE_THRESHOLD}")
        # Log the actual label mapping so we can verify
        print(f"Label map: {self.model.config.id2label}")

    def _predict(self, image: Image.Image) -> dict:
        if image.mode != "RGB":
            image = image.convert("RGB")

        inputs = self.processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = self.model(**inputs)

        probs = F.softmax(outputs.logits, dim=1).squeeze().tolist()
        id2label = self.model.config.id2label

        real_prob = 0.0
        fake_prob = 0.0

        for i, p in enumerate(probs):
            label = id2label[i].lower()
            # "realism" = real, "deepfake" = fake
            if "real" in label or "realism" in label:
                real_prob = round(p, 4)
            elif "fake" in label or "deepfake" in label:
                fake_prob = round(p, 4)

        # Calibrated threshold: only FAKE if sufficiently confident
        if fake_prob >= FAKE_THRESHOLD:
            prediction = "FAKE"
            confidence = fake_prob
        else:
            prediction = "REAL"
            confidence = real_prob

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "details": {
                "raw_fake_prob": fake_prob,
                "raw_real_prob": real_prob,
                "threshold_used": FAKE_THRESHOLD,
                "model": MODEL_NAME,
            }
        }

    def predict_from_bytes(self, data: bytes) -> dict:
        image = Image.open(io.BytesIO(data))
        return self._predict(image)

    def predict_from_pil(self, image: Image.Image) -> dict:
        return self._predict(image)