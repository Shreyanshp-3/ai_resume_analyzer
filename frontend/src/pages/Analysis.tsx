import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  getAnalysis,
  getResumeAnalyses,
} from "../api/analysis"
import type { ResumeAnalysis } from "../api/analysis"
import { getResumes } from "../api/resumes"
import type { Resume } from "../api/resumes"
import { useAuth } from "../context/useAuth"

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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

      {/* Main */}

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}

        <section>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-black"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm font-medium text-gray-500">
            Resume Analysis
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            {resume?.filename || "Resume"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            AI-powered analysis generated using{" "}
            {analysis.model_name || "AI"}
          </p>
        </section>

        {/* Scores */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Overall Score
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-bold">
                {analysis.overall_score ?? "—"}
              </span>

              <span className="mb-1 text-gray-400">
                / 100
              </span>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              ATS Score
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-bold">
                {analysis.ats_score ?? "—"}
              </span>

              <span className="mb-1 text-gray-400">
                / 100
              </span>
            </div>
          </div>
        </section>

        {/* Summary */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            AI Summary
          </h3>

          <p className="mt-3 leading-7 text-gray-600">
            {analysis.summary ||
              "No summary was generated."}
          </p>
        </section>

        {/* Skills */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            Skills Detected
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
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
            <h3 className="text-xl font-semibold">
              Strengths
            </h3>

            <div className="mt-4 space-y-3">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((strength) => (
                  <div
                    key={strength}
                    className="flex gap-3"
                  >
                    <span className="mt-0.5 text-green-600">
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
            <h3 className="text-xl font-semibold">
              Weaknesses
            </h3>

            <div className="mt-4 space-y-3">
              {analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map((weakness) => (
                  <div
                    key={weakness}
                    className="flex gap-3"
                  >
                    <span className="mt-0.5 text-red-500">
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
          <h3 className="text-xl font-semibold">
            Missing Skills
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Skills that could strengthen your resume.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
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

        {/* Recommendations */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">
            Recommendations
          </h3>

          <div className="mt-4 space-y-4">
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={recommendation}
                    className="flex gap-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
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
      </main>
    </div>
  )
}

export default Analysis