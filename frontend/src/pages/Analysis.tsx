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

function ScoreRing({
  score,
  label,
}: {
  score: number | null
  label: string
}) {
  const value = score ?? 0

  return (
    <div className="flex items-center gap-5">
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#111 ${value * 3.6}deg, #e5e7eb ${value * 3.6}deg)`,
        }}
      >
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-bold tracking-tight">
            {score ?? "—"}
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">
          {label}
        </p>

        <p className="mt-1 text-sm text-gray-400">
          out of 100
        </p>
      </div>
    </div>
  )
}

function DimensionBar({
  label,
  dimension,
}: {
  label: string
  dimension: DimensionScore
}) {
  const percentage =
    dimension.max > 0
      ? (dimension.score / dimension.max) * 100
      : 0

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

        <span className="text-sm font-semibold text-gray-900">
          {dimension.score}
          <span className="font-normal text-gray-400">
            /{dimension.max}
          </span>
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      {dimension.notes.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {dimension.notes.map((note, index) => (
            <p
              key={`${note}-${index}`}
              className="text-xs leading-5 text-gray-500"
            >
              {note}
            </p>
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
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading analysis...
          </p>
        </div>
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
            className="text-sm font-medium text-gray-500 transition hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
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

      <nav className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
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
            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
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
            className="text-sm font-medium text-gray-500 transition hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Resume Analysis
              </p>

              <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                {resume?.filename || "Resume"}
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                Analysis generated by{" "}
                <span className="font-medium text-gray-700">
                  {analysis.model_name || "AI"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                {analysis.target_role}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                {analysis.years_of_experience}{" "}
                {analysis.years_of_experience === 1
                  ? "year"
                  : "years"}{" "}
                experience
              </span>
            </div>
          </div>
        </section>

        {/* Score Overview */}

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border bg-white p-7 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Resume Score
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Overall performance
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Your score reflects how well this resume
                  matches the target role and how effectively
                  it communicates your experience.
                </p>
              </div>

              <ScoreRing
                score={analysis.overall_score}
                label="Overall Score"
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-black p-7 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              ATS Compatibility
            </p>

            <div className="mt-5 flex items-end gap-2">
              <span className="text-6xl font-bold tracking-tight">
                {analysis.ats_score ?? "—"}
              </span>

              <span className="mb-2 text-gray-400">
                /100
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-400">
              Measures how effectively your resume can be
              parsed and matched against the target role.
            </p>
          </div>
        </section>

        {/* Top Fixes */}

        {analysis.top_3_fixes.length > 0 && (
          <section className="mt-6 rounded-3xl border bg-black p-7 text-white shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Priority Improvements
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Top 3 fixes
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                  Focus on these changes first. They are the
                  highest-impact improvements identified in
                  your resume.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black">
                3
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {analysis.top_3_fixes.map((fix, index) => (
                <div
                  key={`${fix}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                    {index + 1}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    {fix}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Score Breakdown */}

        {dimensions && (
          <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Score Breakdown
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Why you received this score
              </h3>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <DimensionBar
                label="Parseability"
                dimension={dimensions.parseability}
              />

              <DimensionBar
                label="Keyword Match"
                dimension={dimensions.keyword_match}
              />

              <DimensionBar
                label="Experience Alignment"
                dimension={
                  dimensions.experience_alignment
                }
              />

              <DimensionBar
                label="Impact & Quantification"
                dimension={
                  dimensions.impact_quantification
                }
              />

              <DimensionBar
                label="Formatting & Length"
                dimension={
                  dimensions.formatting_length
                }
              />

              <DimensionBar
                label="Red Flags"
                dimension={dimensions.red_flags}
              />
            </div>
          </section>
        )}

        {/* Summary */}

        <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Executive Summary
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            AI assessment
          </h3>

          <p className="mt-5 max-w-4xl text-base leading-8 text-gray-600">
            {analysis.summary ||
              "No summary was generated."}
          </p>
        </section>

        {/* Skills */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Skills
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              Skills detected
            </h3>

            <div className="mt-5 flex flex-wrap gap-2">
              {analysis.skills.length > 0 ? (
                analysis.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
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
          </div>

          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Missing Skills
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              Skills to consider
            </h3>

            <div className="mt-5 flex flex-wrap gap-2">
              {analysis.missing_skills.length > 0 ? (
                analysis.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
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
          </div>
        </section>

        {/* Keyword Analysis */}

        {dimensions && (
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Keyword Analysis
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Matched keywords
              </h3>

              <div className="mt-5 flex flex-wrap gap-2">
                {dimensions.keyword_match.matched_keywords
                  .length > 0 ? (
                  dimensions.keyword_match.matched_keywords.map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
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

            <div className="rounded-3xl border bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Keyword Gaps
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Missing keywords
              </h3>

              <div className="mt-5 flex flex-wrap gap-2">
                {dimensions.keyword_match
                  .missing_keywords.length > 0 ? (
                  dimensions.keyword_match.missing_keywords.map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
                      >
                        + {keyword}
                      </span>
                    ),
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    No major keyword gaps identified.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Strengths / Weaknesses */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                ✓
              </div>

              <h3 className="text-2xl font-bold">
                Strengths
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map(
                  (strength, index) => (
                    <div
                      key={`${strength}-${index}`}
                      className="flex gap-3"
                    >
                      <span className="mt-1 text-sm font-bold text-gray-900">
                        ✓
                      </span>

                      <p className="text-sm leading-6 text-gray-600">
                        {strength}
                      </p>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-gray-500">
                  No strengths identified.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                !
              </div>

              <h3 className="text-2xl font-bold">
                Weaknesses
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map(
                  (weakness, index) => (
                    <div
                      key={`${weakness}-${index}`}
                      className="flex gap-3"
                    >
                      <span className="mt-1 text-sm font-bold text-gray-900">
                        !
                      </span>

                      <p className="text-sm leading-6 text-gray-600">
                        {weakness}
                      </p>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-gray-500">
                  No weaknesses identified.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Red Flags */}

        {dimensions &&
          dimensions.red_flags.flags_found.length > 0 && (
            <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Recruiter / ATS Warning
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Red flags detected
              </h3>

              <div className="mt-5 space-y-3">
                {dimensions.red_flags.flags_found.map(
                  (flag, index) => (
                    <div
                      key={`${flag}-${index}`}
                      className="rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600"
                    >
                      {flag}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

        {/* Recommendations */}

        <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Recommendations
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            How to improve your resume
          </h3>

          <div className="mt-7 grid gap-4">
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="flex gap-4 rounded-2xl bg-gray-50 p-5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-gray-600">
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

        {/* Footer */}

        <div className="py-10 text-center">
          <p className="text-xs text-gray-400">
            Analysis generated from the uploaded resume
            and the selected target role.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Analysis