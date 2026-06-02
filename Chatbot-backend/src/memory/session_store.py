from typing import Dict, List

# Very small in-memory session store for development.
# Replace with Redis-backed store for production.

_sessions: Dict[str, List[Dict]] = {}

class SessionStore:
    def __init__(self):
        self._sessions = _sessions

    def get_context(self, session_id: str) -> Dict:
        turns = self._sessions.get(session_id, [])
        # Return a small summary object; in real use, include embeddings and summaries.
        return {
            "turns": turns[-10:],
            "turn_count": len(turns),
        }

    def append_turn(self, session_id: str, user_text: str, bot_text: str):
        self._sessions.setdefault(session_id, []).append({
            "user": user_text,
            "bot": bot_text,
        })

    def clear(self, session_id: str):
        self._sessions.pop(session_id, None)
