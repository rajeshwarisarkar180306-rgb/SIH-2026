import json
import sys

# Mapped categories to specific HEI identifiers
HEI_ROUTING_MAP = {
    "Water & Sanitation": "HEI_NIT_RANCHI_ENV",
    "Infrastructure & Roads": "HEI_BIT_MESRA_CIVIL",
    "Agriculture & Farming": "HEI_BAU_AGRI",
    "Healthcare & Sanitation": "HEI_RIMS_HEALTH",
    "Electricity & Power": "HEI_BIT_MESRA_EEE",
    "Environmental & Waste": "HEI_NIT_RANCHI_ENV"
}

# Rich category dictionary with primary keywords
CATEGORY_MAPPINGS = {
    "Water & Sanitation": [
        "water", "drainage", "sewage", "river", "pipe", "leakage", "pipeline", "contamination", "tanker"
    ],
    "Infrastructure & Roads": [
        "road", "pothole", "bridge", "traffic", "highway", "asphalt", "street", "crack", "footpath", "sidewalk"
    ],
    "Agriculture & Farming": [
        "crop", "soil", "fertilizer", "pest", "irrigation", "farming", "harvest", "monsoon"
    ],
    "Healthcare & Sanitation": [
        "hospital", "clinic", "disease", "garbage", "trash", "overflowing", "dump", "stagnant", "mosquito"
    ],
    "Electricity & Power": [
        "transformer", "blackout", "wire", "power", "sparking", "streetlight", "voltage", "current"
    ]
}

def classify_and_route(problem_title: str, problem_desc: str):
    title_text = problem_title.lower()
    desc_text = problem_desc.lower()
    
    category_scores = {}
    
    # Calculate keyword match weight (Title keywords count double)
    for category, keywords in CATEGORY_MAPPINGS.items():
        score = 0
        for kw in keywords:
            if kw in title_text:
                score += 2
            if kw in desc_text:
                score += 1
        category_scores[category] = score

    # Determine highest scoring category
    best_category = max(category_scores, key=category_scores.get)
    max_score = category_scores[best_category]

    # Fallback for ambiguous/unmatched text
    if max_score == 0:
        return {
            "category": "General Public Works",
            "assigned_hei_id": HEI_ROUTING_MAP.get("General Public Works", "HEI_CENTRAL_POOL"),
            "confidence_score": 0.40
        }

    # Dynamic confidence scoring scaled between 0.65 and 0.98
    confidence = min(0.65 + (max_score * 0.08), 0.98)

    assigned_hei = HEI_ROUTING_MAP.get(best_category, "HEI_CENTRAL_POOL")
    
    return {
        "category": best_category,
        "assigned_hei_id": assigned_hei,
        "confidence_score": round(confidence, 2)
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Accepts JSON string payload passed from Node child process
        try:
            input_data = json.loads(sys.argv[1])
            title = input_data.get("title", "")
            desc = input_data.get("description", sys.argv[1])
        except json.JSONDecodeError:
            title = "Submitted Problem"
            desc = sys.argv[1]

        output = classify_and_route(title, desc)
        print(json.dumps(output))
    else:
        # Local CLI test case
        sample_title = "Sparking Live Wire"
        sample_desc = "Dangerous broken street wire causing blackout near school."
        output = classify_and_route(sample_title, sample_desc)
        print(json.dumps(output))