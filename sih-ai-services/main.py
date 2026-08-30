import io
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from PIL import Image
import pytesseract

# Global model and embedding storage
ml_models = {}

# Category-to-University Mapping
DOMAIN_HEI_MAP = {
    "Water Resources": "IIT (ISM) Dhanbad",
    "Agriculture & Farming": "Birsa Agricultural University (BAU) Kanke",
    "Urban Infrastructure & Mining": "BIT Mesra",
    "Healthcare & Sanitation": "RIMS Ranchi",
    "Education & Rural Livelihoods": "NIT Jamshedpur"
}

domain_categories = list(DOMAIN_HEI_MAP.keys())

# Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading NLP Model (all-MiniLM-L6-v2)... Please wait.")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    ml_models["transformer"] = model
    ml_models["domain_embeddings"] = model.encode(domain_categories)
    print("NLP Model and embeddings loaded successfully!")
    
    yield
    
    ml_models.clear()

app = FastAPI(title="Jharkhand AI Classification & Vision Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to extract EXIF GPS metadata from uploaded PIL Image
def extract_gps_coordinates(image: Image.Image) -> Optional[str]:
    try:
        exif = image._getexif()
        if not exif:
            return None
        
        # Tag 34853 refers to GPSInfo in EXIF data
        gps_info = exif.get(34853)
        if not gps_info:
            return None

        def convert_to_degrees(value):
            d, m, s = value
            return d + (m / 60.0) + (s / 3600.0)

        lat = convert_to_degrees(gps_info[2])
        if gps_info[1] == 'S':
            lat = -lat

        lon = convert_to_degrees(gps_info[4])
        if gps_info[3] == 'W':
            lon = -lon

        return f"GPS ({round(lat, 4)}, {round(lon, 4)})"
    except Exception:
        return None

# Request Data Schema for JSON-based deduplication
class DeduplicationInput(BaseModel):
    new_description: str
    existing_descriptions: List[str]

# --- Endpoints ---

@app.get("/")
def home():
    return {"status": "AI Microservice is Live!", "model": "all-MiniLM-L6-v2"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": "transformer" in ml_models}

@app.post("/classify-and-route")
async def classify_and_route(
    title: str = Form(...),
    description: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """Auto-categorizes text, extracts image GPS metadata, and uses OCR as fallback if confidence < 0.30."""
    model = ml_models.get("transformer")
    domain_embeddings = ml_models.get("domain_embeddings")
    
    if not model or domain_embeddings is None:
        raise HTTPException(status_code=500, detail="ML Model not initialized properly")

    extracted_location = None
    ocr_text = ""
    image_bytes = None

    if image:
        image_bytes = await image.read()
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            # Extract GPS metadata if present in original photo
            extracted_location = extract_gps_coordinates(pil_img)
        except Exception as e:
            print(f"Warning processing image metadata: {e}")

    # Initial NLP Encoding
    full_text = f"{title}. {description}"
    input_embedding = model.encode([full_text])
    
    similarities = cosine_similarity(input_embedding, domain_embeddings)[0]
    best_match_idx = int(np.argmax(similarities))
    confidence_score = float(similarities[best_match_idx])

    # Vision Fallback: If text confidence is low (< 0.30) and image exists, run OCR
    if confidence_score < 0.30 and image_bytes:
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            ocr_text = pytesseract.image_to_string(pil_img).strip()

            if len(ocr_text) > 5:
                enhanced_text = f"{full_text}. Image Text: {ocr_text}"
                ocr_embedding = model.encode([enhanced_text])
                ocr_similarities = cosine_similarity(ocr_embedding, domain_embeddings)[0]
                
                ocr_best_idx = int(np.argmax(ocr_similarities))
                ocr_confidence = float(ocr_similarities[ocr_best_idx])

                # Use OCR results if confidence improved
                if ocr_confidence > confidence_score:
                    best_match_idx = ocr_best_idx
                    confidence_score = ocr_confidence
        except Exception as e:
            print(f"OCR processing failed or Tesseract missing: {e}")

    # Low-confidence fallback check
    if confidence_score < 0.30:
        return {
            "predicted_category": "General Societal Issue",
            "confidence_score": round(confidence_score, 3),
            "assigned_university": "General HEI Review Pool",
            "is_low_confidence": True,
            "extracted_location": extracted_location,
            "ocr_applied": bool(ocr_text)
        }

    predicted_category = domain_categories[best_match_idx]
    assigned_hei = DOMAIN_HEI_MAP[predicted_category]

    return {
        "predicted_category": predicted_category,
        "confidence_score": round(confidence_score, 3),
        "assigned_university": assigned_hei,
        "is_low_confidence": False,
        "extracted_location": extracted_location,
        "ocr_applied": bool(ocr_text)
    }

@app.post("/check-duplicate")
def check_duplicate(data: DeduplicationInput):
    """Checks if an incoming problem is a duplicate of existing database entries."""
    model = ml_models.get("transformer")
    if not model:
        raise HTTPException(status_code=500, detail="ML Model not initialized")
        
    if not data.existing_descriptions:
        return {"is_duplicate": False, "max_similarity_score": 0.0, "matched_index": None}
        
    new_emb = model.encode([data.new_description])
    existing_embs = model.encode(data.existing_descriptions)
    
    similarities = cosine_similarity(new_emb, existing_embs)[0]
    max_score = float(np.max(similarities))
    matched_idx = int(np.argmax(similarities))
    
    is_dup = max_score >= 0.75
    
    return {
        "is_duplicate": is_dup,
        "max_similarity_score": round(max_score, 3),
        "matched_index": matched_idx if is_dup else None
    }