import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  getAnalysis,
  getResumeAnalyses,
} from "../api/analysis"
import type {
  DimensionScore,
  ResumeAnalysis,
} from "../api/analysis"
import { getResumes } from "../api/resumes"
import type { Resume } from "../api/resumes"
import { useAuth } from "../context/useAuth"

function ScoreBar({
  score,
  max,
}: {
  score: number
  max: number
}) {
  const percentage =
    max > 0 ? Math.min((score / max) * 100, 100) : 0

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Score</span>
        <span className="font-semibold text-gray-700">
          {score}/{max}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function DimensionCard({
  title,
  dimension,
}: {
  title: string
  dimension: DimensionScore
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold">{title}</h3>

        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold">
          {dimension.score}/{dimension.max}
        </span>
      </div>

      <ScoreBar
        score={dimension.score}
        max={dimension.max}
      />

      {dimension.notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {dimension.notes.map((note, index) => (
            <div
              key={`${note}-${index}`}
              className="flex gap-2"
            >
              <span className="mt-1 text-gray-400">•</span>

              <p className="text-sm leading-6 text-gray-600">
                {note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Analysis() {
  const { analysisId, resumeId } = useParams<{
    analysisId?: string
    resumeId?: string
  }>()

  const { user, isLoading: authLoading } = useAuth()

  const [analysis, setAnalysis] =
    useState<ResumeAnalysis | null>(null)

  const [resume, setResume] =
    useState<Resume | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user) {
        return
      }

      try {
        setError("")
        setIsLoading(true)

        if (analysisId) {
          const data = await getAnalysis(analysisId)

          setAnalysis(data)

          const resumes = await getResumes()

          const matchingResume = resumes.find(
            (item) => item.id === data.resume_id,
          )

          setResume(matchingResume ?? null)

          return
        }

        if (resumeId) {
          const analyses =
            await getResumeAnalyses(resumeId)

          if (analyses.length === 0) {
            setError(
              "No analysis found for this resume.",
            )

            return
          }

          setAnalysis(analyses[0])

          const resumes = await getResumes()

          const matchingResume = resumes.find(
            (item) => item.id === resumeId,
          )

          setResume(matchingResume ?? null)

          return
        }

        setError("Invalid analysis URL.")
      } catch {
        setError(
          "Unable to load the resume analysis.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [user, analysisId, resumeId])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading analysis...
        </p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-8 rounded-2xl border bg-white p-8">
            <h1 className="text-xl font-semibold">
              Analysis unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "We could not find this analysis."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const dimensions = analysis.dimension_scores

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ResumeAI
            </h1>

            <p className="text-xs text-gray-500">
              Intelligent Resume Analysis
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}

        <section>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Resume Analysis
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                {resume?.filename || "Resume"}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white">
                  {analysis.target_role}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                  {analysis.years_of_experience}{" "}
                  {analysis.years_of_experience === 1
                    ? "year"
                    : "years"}{" "}
                  experience
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Generated using{" "}
                {analysis.model_name || "AI"}
              </p>
            </div>

            <div className="text-sm text-gray-400">
              {new Date(
                analysis.created_at,
              ).toLocaleString()}
            </div>
          </div>
        </section>

        {/* Score Overview */}

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Overall Score
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-6xl font-bold tracking-tight">
                {analysis.overall_score ?? "—"}
              </span>

              <span className="mb-2 text-gray-400">
                / 100
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Overall quality of the resume against the
              selected target role.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              ATS Score
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-6xl font-bold tracking-tight">
                {analysis.ats_score ?? "—"}
              </span>

              <span className="mb-2 text-gray-400">
                / 100
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              How effectively the resume can be parsed and
              matched by ATS-style screening.
            </p>
          </div>
        </section>

        {/* Summary */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            AI Verdict
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            What the analysis says
          </h3>

          <p className="mt-4 max-w-4xl leading-7 text-gray-600">
            {analysis.summary ||
              "No summary was generated."}
          </p>
        </section>

        {/* Dimension Scores */}

        {dimensions && (
          <section className="mt-10">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Detailed Evaluation
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Score Breakdown
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Each category is scored against the
                requirements of the selected role.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <DimensionCard
                title="Parseability"
                dimension={dimensions.parseability}
              />

              <DimensionCard
                title="Keyword Match"
                dimension={dimensions.keyword_match}
              />

              <DimensionCard
                title="Experience Alignment"
                dimension={
                  dimensions.experience_alignment
                }
              />

              <DimensionCard
                title="Impact & Quantification"
                dimension={
                  dimensions.impact_quantification
                }
              />

              <DimensionCard
                title="Formatting & Length"
                dimension={
                  dimensions.formatting_length
                }
              />

              <DimensionCard
                title="Red Flags"
                dimension={dimensions.red_flags}
              />
            </div>
          </section>
        )}

        {/* Keyword Analysis */}

        {dimensions?.keyword_match && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Role & Keyword Match
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                Matched Keywords
              </h3>

              <div className="mt-5 flex flex-wrap gap-2">
                {dimensions.keyword_match
                  .matched_keywords.length > 0 ? (
                  dimensions.keyword_match.matched_keywords.map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700"
                      >
                        {keyword}
                      </span>
                    ),
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    No matched keywords identified.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Role & Keyword Match
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                Missing Keywords
              </h3>

              <div className="mt-5 flex flex-wrap gap-2">
                {dimensions.keyword_match
                  .missing_keywords.length > 0 ? (
                  dimensions.keyword_match.missing_keywords.map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border px-3 py-1.5 text-sm font-medium text-gray-700"
                      >
                        + {keyword}
                      </span>
                    ),
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    No critical missing keywords identified.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Skills */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Technical Profile
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            Skills Detected
          </h3>

          <div className="mt-5 flex flex-wrap gap-2">
            {analysis.skills.length > 0 ? (
              analysis.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No skills detected.
              </p>
            )}
          </div>
        </section>

        {/* Strengths + Weaknesses */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Positive Signals
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Strengths
            </h3>

            <div className="mt-5 space-y-4">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((strength) => (
                  <div
                    key={strength}
                    className="flex gap-3"
                  >
                    <span className="mt-0.5 font-bold text-green-600">
                      ✓
                    </span>

                    <p className="text-sm leading-6 text-gray-600">
                      {strength}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No strengths identified.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Areas to Improve
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Weaknesses
            </h3>

            <div className="mt-5 space-y-4">
              {analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map((weakness) => (
                  <div
                    key={weakness}
                    className="flex gap-3"
                  >
                    <span className="mt-0.5 font-bold text-red-500">
                      !
                    </span>

                    <p className="text-sm leading-6 text-gray-600">
                      {weakness}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No weaknesses identified.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Missing Skills */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Skills Gap
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            Missing Skills
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Skills that could strengthen your resume for
            the selected role.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {analysis.missing_skills.length > 0 ? (
              analysis.missing_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  + {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No missing skills identified.
              </p>
            )}
          </div>
        </section>

        {/* Red Flags */}

        {dimensions?.red_flags &&
          dimensions.red_flags.flags_found.length > 0 && (
            <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-600">
                Attention Required
              </p>

              <h3 className="mt-1 text-xl font-semibold text-red-900">
                Red Flags
              </h3>

              <div className="mt-5 space-y-3">
                {dimensions.red_flags.flags_found.map(
                  (flag) => (
                    <div
                      key={flag}
                      className="flex gap-3"
                    >
                      <span className="font-bold text-red-500">
                        !
                      </span>

                      <p className="text-sm leading-6 text-red-800">
                        {flag}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

        {/* Recommendations */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Action Plan
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            Recommendations
          </h3>

          <div className="mt-5 space-y-4">
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="flex gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                      {index + 1}
                    </div>

                    <p className="leading-6 text-gray-600">
                      {recommendation}
                    </p>
                  </div>
                ),
              )
            ) : (
              <p className="text-sm text-gray-500">
                No recommendations available.
              </p>
            )}
          </div>
        </section>

        {/* Top 3 Fixes */}

        {analysis.top_3_fixes.length > 0 && (
          <section className="mt-6 rounded-2xl border bg-black p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-gray-400">
              Highest Impact Changes
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Top 3 Fixes
            </h3>

            <div className="mt-5 space-y-4">
              {analysis.top_3_fixes.map(
                (fix, index) => (
                  <div
                    key={`${fix}-${index}`}
                    className="flex gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                      {index + 1}
                    </div>

                    <p className="leading-6 text-gray-200">
                      {fix}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Analysis