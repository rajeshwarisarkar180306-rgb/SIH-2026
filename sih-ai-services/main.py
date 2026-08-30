from fastapi import FastAPI
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List

app = FastAPI(title="Jharkhand AI Classification Engine")

# 1. Load lightweight Hugging Face model
print("Loading NLP Model (all-MiniLM-L6-v2)... Please wait.")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("NLP Model loaded successfully!")

# 2. Category-to-University Mapping
DOMAIN_HEI_MAP = {
    "Water Resources": "IIT (ISM) Dhanbad",
    "Agriculture & Farming": "Birsa Agricultural University (BAU) Kanke",
    "Urban Infrastructure & Mining": "BIT Mesra",
    "Healthcare & Sanitation": "RIMS Ranchi",
    "Education & Rural Livelihoods": "NIT Jamshedpur"
}

# Pre-compute target embeddings for fast matching
domain_categories = list(DOMAIN_HEI_MAP.keys())
domain_embeddings = model.encode(domain_categories)

# Request Data Schemas
class ProblemInput(BaseModel):
    title: str = Field(..., example="Iron contamination in drinking water in Dumka district")
    description: str = Field(..., example="The handpump water is coming out rusty orange causing health issues.")

class DeduplicationInput(BaseModel):
    new_description: str
    existing_descriptions: List[str]

# --- Endpoints ---

@app.get("/")
def home():
    return {"status": "AI Microservice is Live!"}

@app.post("/classify-and-route")
def classify_and_route(data: ProblemInput):
    """Auto-categorizes a problem statement and routes it to a university."""
    full_text = f"{data.title}. {data.description}"
    input_embedding = model.encode([full_text])
    
    similarities = cosine_similarity(input_embedding, domain_embeddings)[0]
    best_match_idx = int(np.argmax(similarities))
    
    predicted_category = domain_categories[best_match_idx]
    confidence_score = float(similarities[best_match_idx])
    assigned_hei = DOMAIN_HEI_MAP[predicted_category]
    
    return {
        "predicted_category": predicted_category,
        "confidence_score": round(confidence_score, 3),
        "assigned_university": assigned_hei
    }

@app.post("/check-duplicate")
def check_duplicate(data: DeduplicationInput):
    """Checks if an incoming problem is a duplicate of existing database entries."""
    if not data.existing_descriptions:
        return {"is_duplicate": False, "max_similarity_score": 0.0}
        
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