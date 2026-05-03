import json
import re
from typing import Any


def extract_json(text: str) -> dict[str, Any]:
    """
    Extract JSON object from LLM response.

    Handles cases like:
    - Pure JSON
    - JSON inside markdown block
    - Extra text before/after JSON
    """

    if not text or not text.strip():
        raise ValueError("Empty response from LLM")

    cleaned = text.strip()

    cleaned = cleaned.replace("```json", "")
    cleaned = cleaned.replace("```", "")
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)

    if not match:
        raise ValueError(f"No JSON object found in response: {text}")

    json_text = match.group(0)

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON returned by LLM: {json_text}") from exc