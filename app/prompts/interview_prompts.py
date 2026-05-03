def build_question_prompt(
    role: str,
    topic: str,
    difficulty: str,
    experience_years: int,
) -> str:
    return f"""
You are a senior technical interviewer.

Your task is to ask one practical interview question.

Candidate profile:
- Role: {role}
- Topic: {topic}
- Difficulty: {difficulty}
- Experience: {experience_years} years

Rules:
- Ask only one question.
- Do not provide the answer.
- Make the question realistic for an actual job interview.
- Match the question to the candidate's experience level.
- Return only valid JSON.
- Do not wrap JSON inside markdown.

JSON format:
{{
  "question": "your interview question here",
  "expected_focus": [
    "point 1 candidate should cover",
    "point 2 candidate should cover",
    "point 3 candidate should cover"
  ]
}}
"""


def build_evaluation_prompt(
    role: str,
    topic: str,
    difficulty: str,
    experience_years: int,
    question: str,
    user_answer: str,
) -> str:
    return f"""
You are a strict but helpful senior technical interviewer.

Evaluate the candidate's answer.

Candidate profile:
- Role: {role}
- Topic: {topic}
- Difficulty: {difficulty}
- Experience: {experience_years} years

Interview question:
{question}

Candidate answer:
{user_answer}

Evaluation rules:
- Score from 0 to 10.
- Be strict but fair.
- Identify what is correct.
- Identify what is missing.
- Give a better ideal answer.
- Ask one follow-up question.
- Return only valid JSON.
- Do not wrap JSON inside markdown.

JSON format:
{{
  "score": 0,
  "level": "Poor/Average/Good/Excellent",
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "missing_points": [
    "missing point 1",
    "missing point 2"
  ],
  "ideal_answer": "complete improved answer here",
  "follow_up_question": "one follow-up question here"
}}
"""