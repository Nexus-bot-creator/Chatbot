from typing import Tuple

# Minimal rule-based intent predictor for scaffolding.
# Replace with a trained classifier (Hugging Face / spaCy) for production.

INTENT_KEYWORDS = {
    "greeting": ["hello", "hi", "hey"],
    "goodbye": ["bye", "goodbye", "see you"],
    "help": ["help", "support", "assist", "how do i"],
    "report_issue": ["broken", "doesn't work", "issue", "problem", "error"],
}


def predict_intent(text: str) -> Tuple[str, float]:
    """Return (intent_label, confidence).
    This is a placeholder. Use an ML model for real confidence scores.
    """
    t = text.lower()
    scores = {}
    for intent, kws in INTENT_KEYWORDS.items():
        scores[intent] = sum(1 for kw in kws if kw in t)

    best_intent = max(scores, key=lambda k: scores[k])
    best_score = scores[best_intent]

    if best_score == 0:
        return "unknown", 0.0

    # crude confidence: normalize by token count
    confidence = min(0.95, 0.2 + (best_score / max(1, len(t.split()))) )
    return best_intent, confidence
