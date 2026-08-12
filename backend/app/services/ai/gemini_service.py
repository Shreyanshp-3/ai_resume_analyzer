from google import genai
from google.genai import types
from google.genai.errors import ClientError, ServerError

from app.core.config import settings
from app.schemas.analysis import ResumeAnalysisCreate
from app.services.ai.base import AIService


class GeminiQuotaError(Exception):
    """Gemini API quota or rate limit was exceeded."""


class GeminiUnavailableError(Exception):
    """Gemini API is temporarily unavailable."""


class GeminiAIService(AIService):
    def __init__(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not configured"
            )

        self.model_name = settings.GEMINI_MODEL

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    def analyze_resume(
        self,
        resume_text: str,
        target_role: str,
        years_of_experience: float,
    ) -> ResumeAnalysisCreate:
        prompt = f"""
You are an ATS (Applicant Tracking System) resume analyzer.

You evaluate resumes the way real ATS software and recruiters
screen them — not as a generic writing coach.

Be strict, specific, and evidence-based.

Every score must be justified by a concrete observation
from the resume text.

You will receive:

target_role:
{target_role}

years_of_experience:
{years_of_experience}

resume_text:
{resume_text}

Evaluate the resume across these dimensions.

1. PARSEABILITY (0-25 points)

Evaluate:

- Standard section headers such as Experience, Education,
  Skills, Projects, etc.
- Whether the extracted text appears to have a logical order.
- Whether there are signs of tables, columns, text boxes,
  images, or other layouts causing text to run together.
- Whether dates use consistent and parseable formats.
- Whether contact information such as email, phone, and
  location is present near the top.
- Whether there are orphaned fragments suggesting text was
  trapped in images or icons.
- Whether experience is presented in reverse chronological order.

2. ROLE & KEYWORD MATCH (0-30 points)

Evaluate the resume specifically against the target role:

{target_role}

Identify approximately 10-15 important keywords or skills
that a realistic job posting for this role would require.

Consider:

- Programming languages
- Frameworks
- Libraries
- Databases
- Development tools
- Cloud/platform technologies
- Testing technologies
- Relevant certifications
- Role-specific technical skills

Check both literal matches and close variants.

For example:

"Node.js", "NodeJS", and "Node" may represent the same
underlying skill.

Distinguish between:

- Keywords appearing only in a Skills section.
- Keywords supported by actual experience bullets.

Skills appearing only in a skills list are weaker evidence.

Identify critical missing keywords for the target role.

3. EXPERIENCE ALIGNMENT (0-15 points)

Evaluate whether the candidate's experience aligns with:

Target role:
{target_role}

Claimed experience:
{years_of_experience} years

Check:

- Seniority of previous titles.
- Responsibilities described in experience bullets.
- Whether responsibilities are appropriate for the claimed
  experience level.
- Whether the candidate appears significantly overqualified
  or underqualified.
- Unexplained employment gaps.
- Inconsistent employment timelines.

Do not invent gaps if the resume does not provide enough
information to establish them.

4. IMPACT & QUANTIFICATION (0-15 points)

Evaluate:

- Percentage of bullets containing measurable results.
- Numbers, percentages, scale, revenue, users, latency,
  performance improvements, time saved, etc.
- Strong action verbs.
- Specificity of accomplishments.
- Difference between measurable achievements and generic
  responsibility statements.

For example:

"Improved performance"

is weaker than:

"Reduced API response time by 40%."

5. FORMATTING & LENGTH (0-10 points)

Evaluate:

- Whether resume length is appropriate for the candidate's
  experience level.
- Whether the resume is scannable.
- Whether content uses concise bullets.
- Whether there are walls of text.
- Spelling and grammar issues visible in the extracted text.

6. RED FLAGS (0-5 points)

Identify problems such as:

- Keyword stuffing.
- Excessive skills with little evidence of usage.
- Generic or templated language.
- Missing or broken portfolio, LinkedIn, or GitHub links.
- Other concrete ATS or recruiter red flags.

Do not invent problems that are not supported by the resume.

SCORING RULES

The six dimensions must use exactly these maximum scores:

Parseability: 25
Keyword Match: 30
Experience Alignment: 15
Impact & Quantification: 15
Formatting & Length: 10
Red Flags: 5

The overall score must equal the sum of these six dimension
scores.

Do not inflate scores.

A generic, poorly quantified resume should generally score
between 40 and 60.

A strong resume should earn a high score only when the
resume provides concrete evidence supporting that score.

IMPORTANT:

Do not invent experience, skills, achievements, education,
employment history, links, or other information.

Use only information contained in the resume.

Return only structured JSON matching the provided response
schema.
"""

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    response_mime_type="application/json",
                    response_schema=ResumeAnalysisCreate,
                ),
            )

        except ClientError as exc:
            error_message = str(exc)

            if (
                "429" in error_message
                or "RESOURCE_EXHAUSTED" in error_message
                or "quota" in error_message.lower()
                or "rate limit" in error_message.lower()
            ):
                raise GeminiQuotaError(
                    "Gemini API quota or rate limit exceeded"
                ) from exc

            raise GeminiUnavailableError(
                "Gemini API request failed"
            ) from exc

        except ServerError as exc:
            raise GeminiUnavailableError(
                "Gemini API is temporarily unavailable"
            ) from exc

        if not response.parsed:
            raise RuntimeError(
                "Gemini returned an empty analysis"
            )

        analysis = ResumeAnalysisCreate.model_validate(
            response.parsed
        )

        analysis.target_role = target_role
        analysis.years_of_experience = years_of_experience

        return analysis