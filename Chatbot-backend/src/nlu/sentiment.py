from typing import Dict

# Lightweight sentiment stub. Replace with a trained model.
# For production, use transformers or a service-based sentiment model.

def analyze_sentiment(text: str) -> Dict[str, float]:
    t = text.lower()
    score = 0.0
    if any(w in t for w in ["sad", "angry", "upset", "frustrated", "annoyed"]):
        score = -0.6
    elif any(w in t for w in ["happy", "great", "awesome", "thanks", "thank you"]):
        score = 0.6
    else:
        score = 0.0

    tone = "neutral"
    if score < -0.3:
        tone = "frustrated"
    elif score > 0.3:
        tone = "positive"

    return {"score": score, "tone": tone}
