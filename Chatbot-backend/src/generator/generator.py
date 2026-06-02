import os
from typing import Optional, Dict
from rag.retriever import retrieve
from huggingface_hub import InferenceClient

# RAG helper to format retrieved documents
def _format_retrieved(docs: list) -> str:
    if not docs:
        return ""
    out = ["I found the following relevant documents:"]
    for d in docs:
        src = d.get("metadata", {}).get("source", d.get("id"))
        out.append(f"- ({src}) {d.get('document')}")
    return "\n".join(out)


def generate_response(user_text: str, intent: Optional[str], intent_confidence: float, sentiment: Dict, context: Dict) -> str:
    # 1) Try retrieval for factual/contextual help
    retrieved = retrieve(user_text, top_k=3)

    # Decide whether to use retrieved docs (simple heuristic based on distance)
    use_rag = False
    context_str = ""
    if retrieved:
        best = retrieved[0]
        # chroma distances are small for similar docs; threshold tuned for miniLM
        if best.get("distance", 1.0) < 0.35:
            use_rag = True
            context_str = "\n".join([f"- {d.get('document')}" for d in retrieved])

    # Check for Hugging Face API key
    hf_token = os.environ.get("HUGGINGFACE_API_KEY", "").strip()

    if not hf_token:
        # Fallback to local rule-based stubs if no token is configured
        if intent_confidence < 0.7 or intent == "unknown":
            return "I didn't understand that. Could you clarify or choose from these options: A) Account help B) Report an issue C) General question?"
        if intent == "greeting":
            return "Hello! How can I help you today?"
        if intent == "goodbye":
            return "Goodbye! Feel free to reach out if you need anything else."
        if intent == "help":
            base = "Sure — what do you need help with? You can ask about account settings, troubleshooting, or feature requests."
            if use_rag:
                docs_text = _format_retrieved(retrieved)
                return f"{base}\n\n{docs_text}"
            return base
        if intent == "report_issue":
            if sentiment.get("tone") == "frustrated":
                base = "I'm sorry you're experiencing this. Please tell me the device and a brief description of the problem."
            else:
                base = "I can help with that. What's the product and the issue you're seeing?"
            if use_rag:
                docs_text = _format_retrieved(retrieved)
                return f"{base}\n\n{docs_text}"
            return base

        # Default fallback
        if use_rag:
            docs_text = _format_retrieved(retrieved)
            return f"I found some information that may help:\n\n{docs_text}"
        return "Thanks — I'll look into that and get back to you."

    try:
        client = InferenceClient(
            token=hf_token,
        )
        
        # Construct system prompts incorporating RAG context & tone
        system_instruction = (
            "You are a helpful and polite customer support chatbot. "
            "Use the provided context to answer the user's question. "
            "Keep your responses concise, professional, and friendly."
        )
        if use_rag and context_str:
            system_instruction += f"\n\nRelevant Context:\n{context_str}"
            
        system_instruction += (
            f"\n\nAdditional Details:\n"
            f"- Detected User Intent: {intent} (confidence: {intent_confidence})\n"
            f"- Detected Sentiment: {sentiment.get('tone', 'neutral')}"
        )
        
        messages = [
            {"role": "system", "content": system_instruction}
        ]
        
        # Load conversation turns from history for context memory
        if context and "turns" in context:
            for turn in context["turns"]:
                messages.append({"role": "user", "content": turn["user"]})
                messages.append({"role": "assistant", "content": turn["bot"]})
                
        # Append current user prompt
        messages.append({"role": "user", "content": user_text})
        
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.1-8B-Instruct",
            messages=messages,
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content

    except Exception as e:
        # If API rate limits or errors out, fallback to text formatted stubs
        base_err = f"Note: (Llama API error: {str(e)})\n\n"
        if intent == "greeting":
            return base_err + "Hello! How can I help you today?"
        if use_rag:
            docs_text = _format_retrieved(retrieved)
            return base_err + f"I found some information that may help:\n\n{docs_text}"
        return base_err + "Thanks — I'll look into that and get back to you."