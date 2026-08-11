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

function getScoreStyle(score: number | null) {
  if (score === null) {
    return {
      text: "text-gray-900",
      bg: "bg-gray-100",
      ring: "text-gray-400",
    }
  }

  if (score >= 80) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "text-emerald-500",
    }
  }

  if (score >= 60) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      ring: "text-amber-500",
    }
  }

  return {
    text: "text-red-600",
    bg: "bg-red-50",
    ring: "text-red-500",
  }
}

function ScoreRing({
  score,
  label,
}: {
  score: number | null
  label: string
}) {
  const value = score ?? 0
  const scoreStyle = getScoreStyle(score)

  return (
    <div className="flex items-center gap-5">
      <div
        className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full ${scoreStyle.ring}`}
        style={{
          background: `conic-gradient(currentColor ${
            value * 3.6
          }deg, #e5e7eb ${value * 3.6}deg)`,
        }}
      >
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white">
          <span
            className={`text-2xl font-bold tracking-tight ${scoreStyle.text}`}
          >
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
      ? Math.min(
          100,
          Math.max(
            0,
            (dimension.score / dimension.max) * 100,
          ),
        )
      : 0

  const barColor =
    percentage >= 80
      ? "bg-emerald-500"
      : percentage >= 60
        ? "bg-amber-500"
        : "bg-red-500"

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700">
          {label}
        </p>

        <p className="text-sm font-semibold text-gray-900">
          {dimension.score}
          <span className="font-normal text-gray-400">
            /{dimension.max}
          </span>
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{
            width: `${percentage}%`,
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
              • {note}
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
            className="text-sm font-medium text-gray-600 transition hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              !
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Analysis unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
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
            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}

        <section>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-500 transition hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Resume Analysis
              </p>

              <h2 className="mt-2 break-words text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                {resume?.filename || "Resume"}
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                AI-powered analysis generated using{" "}
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
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Resume Performance
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  Overall assessment
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Your score reflects how well the resume
                  matches the target role, communicates
                  impact, and performs against common ATS
                  screening criteria.
                </p>
              </div>

              <ScoreRing
                score={analysis.overall_score}
                label="Overall Score"
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              ATS Compatibility
            </p>

            <h3 className="mt-2 text-2xl font-bold tracking-tight">
              Screening score
            </h3>

            <div className="mt-7">
              <ScoreRing
                score={analysis.ats_score}
                label="ATS Score"
              />
            </div>
          </div>
        </section>

        {/* Summary */}

        <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg">
              ✦
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                AI Assessment
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight">
                Executive Summary
              </h3>
            </div>
          </div>

          <p className="mt-6 max-w-5xl text-[15px] leading-7 text-gray-600">
            {analysis.summary ||
              "No summary was generated."}
          </p>
        </section>

        {/* Dimension Breakdown */}

        {dimensions && (
          <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Score Breakdown
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight">
                How your resume scored
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Each category contributes to your overall
                score.
              </p>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <DimensionBar
                label="Parseability"
                dimension={dimensions.parseability}
              />

              <DimensionBar
                label="Role & Keyword Match"
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

        {/* Top Fixes */}

        {analysis.top_3_fixes.length > 0 && (
          <section className="mt-6 rounded-3xl border border-gray-200 bg-gray-950 p-7 text-white shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg">
                ↑
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Highest Impact
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  Top 3 fixes
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Focus on these changes first to improve
                  your resume.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3">
              {analysis.top_3_fixes.map(
                (fix, index) => (
                  <div
                    key={`${fix}-${index}`}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-950">
                      {index + 1}
                    </div>

                    <p className="pt-1 text-sm leading-6 text-gray-200">
                      {fix}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* Skills */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Detected Skills */}

          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Resume Content
                </p>

                <h3 className="mt-1 text-2xl font-bold tracking-tight">
                  Skills detected
                </h3>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {analysis.skills.length > 0 ? (
                analysis.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
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

          {/* Missing Skills */}

          <div className="rounded-3xl border border-amber-100 bg-amber-50/40 p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                +
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Opportunity
                </p>

                <h3 className="mt-1 text-2xl font-bold tracking-tight">
                  Missing skills
                </h3>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Skills that could strengthen your resume for
              the target role.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {analysis.missing_skills.length > 0 ? (
                analysis.missing_skills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-800"
                    >
                      + {skill}
                    </span>
                  ),
                )
              ) : (
                <p className="text-sm text-gray-500">
                  No missing skills identified.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Keyword Match */}

        {dimensions?.keyword_match && (
          <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                ATS Keywords
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight">
                Keyword match
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                How your resume aligns with keywords relevant
                to the target role.
              </p>
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Matched keywords
                  </h4>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {dimensions.keyword_match.matched_keywords.length}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {dimensions.keyword_match
                    .matched_keywords.length > 0 ? (
                    dimensions.keyword_match.matched_keywords.map(
                      (keyword, index) => (
                        <span
                          key={`${keyword}-${index}`}
                          className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100"
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

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Missing keywords
                  </h4>

                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {dimensions.keyword_match.missing_keywords.length}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {dimensions.keyword_match
                    .missing_keywords.length > 0 ? (
                    dimensions.keyword_match.missing_keywords.map(
                      (keyword, index) => (
                        <span
                          key={`${keyword}-${index}`}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
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
            </div>
          </section>
        )}

        {/* Strengths / Weaknesses */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Strengths */}

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg text-emerald-700">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  What's working
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-950">
                  Strengths
                </h3>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map(
                  (strength, index) => (
                    <div
                      key={`${strength}-${index}`}
                      className="flex gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        ✓
                      </span>

                      <p className="text-sm leading-6 text-gray-700">
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

          {/* Weaknesses */}

          <div className="rounded-3xl border border-red-100 bg-red-50/50 p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-lg text-red-700">
                !
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                  Needs attention
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-950">
                  Weaknesses
                </h3>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map(
                  (weakness, index) => (
                    <div
                      key={`${weakness}-${index}`}
                      className="flex gap-3 rounded-2xl border border-red-100 bg-white/80 p-4"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                        !
                      </span>

                      <p className="text-sm leading-6 text-gray-700">
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
            <section className="mt-6 rounded-3xl border border-red-200 bg-red-50/60 p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-lg text-red-700">
                  ⚠
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                    Recruiter / ATS Warning
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-950">
                    Red flags detected
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    These issues could negatively affect how
                    your resume is perceived or processed.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                {dimensions.red_flags.flags_found.map(
                  (flag, index) => (
                    <div
                      key={`${flag}-${index}`}
                      className="flex gap-3 rounded-2xl border border-red-100 bg-white p-4"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                        !
                      </span>

                      <p className="text-sm leading-6 text-gray-700">
                        {flag}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

        {/* Recommendations */}

        <section className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              →
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Next Steps
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight">
                Recommendations
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Practical changes you can make to improve
                the resume.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="flex gap-4 rounded-2xl border bg-gray-50/70 p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-100">
                      {index + 1}
                    </div>

                    <p className="pt-1 text-sm leading-6 text-gray-600">
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

        <div className="mt-10 flex justify-center pb-6">
          <Link
            to="/dashboard"
            className="rounded-xl border bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Analysis