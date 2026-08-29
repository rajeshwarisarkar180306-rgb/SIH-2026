import json
import sys

HEI_ROUTING_MAP = {
    "Water & Sanitation": "HEI_NIT_RANCHI_ENV",
    "Infrastructure & Roads": "HEI_BIT_MESRA_CIVIL",
    "Agriculture & Farming": "HEI_BAU_AGRI",
    "Healthcare & Sanitation": "HEI_RIMS_HEALTH"
}

def classify_and_route(problem_title: str, problem_desc: str):
    full_text = f"{problem_title} {problem_desc}".lower()
    
    # Simple rule/keyword fallback engine (or replace with LLM/NLP embedding model)
    if any(k in full_text for k in ["water", "drainage", "sewage", "river"]):
        category = "Water & Sanitation"
    elif any(k in full_text for k in ["road", "pothole", "bridge", "traffic"]):
        category = "Infrastructure & Roads"
    elif any(k in full_text for k in ["crop", "soil", "fertilizer", "pest"]):
        category = "Agriculture & Farming"
    else:
        category = "General Public Works"

    assigned_hei = HEI_ROUTING_MAP.get(category, "HEI_CENTRAL_POOL")
    
    return {
        "category": category,
        "assigned_hei_id": assigned_hei,
        "confidence_score": 0.92  # Mock or actual score
    }

if __name__ == "__main__":
    # Expect text input passed as a CLI argument
    if len(sys.argv) > 1:
        text_input = sys.argv[1]
        output = classify_and_route("Submitted Problem", text_input)
        print(json.dumps(output))
    else:
        # Fallback test case
        sample = "Severe water logging and blocked sewage pipe near main market road."
        output = classify_and_route("Sample Title", sample)
        print(json.dumps(output))