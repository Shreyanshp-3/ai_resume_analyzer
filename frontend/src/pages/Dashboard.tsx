import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  analyzeResume,
  getResumeAnalyses,
} from "../api/analysis"
import type { ResumeAnalysis } from "../api/analysis"
import { deleteResume, getResumes } from "../api/resumes"
import type { Resume } from "../api/resumes"
import ResumeUpload from "../components/ResumeUpload"
import { useAuth } from "../context/useAuth"

function getScoreStyle(score: number | null) {
  if (score === null) {
    return {
      text: "text-gray-500",
      bg: "bg-gray-50",
    }
  }

  if (score >= 80) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    }
  }

  if (score >= 60) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
    }
  }

  return {
    text: "text-red-600",
    bg: "bg-red-50",
  }
}

function Dashboard() {
  const {
    user,
    isLoading: authLoading,
    logout,
  } = useAuth()

  const navigate = useNavigate()

  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoadingResumes, setIsLoadingResumes] =
    useState(true)

  const [analyzingResumeId, setAnalyzingResumeId] =
    useState<string | null>(null)

  const [analyses, setAnalyses] = useState<
    Record<string, ResumeAnalysis>
  >({})

  const [error, setError] = useState("")

  const [selectedResumeId, setSelectedResumeId] =
    useState<string | null>(null)

  const [targetRole, setTargetRole] = useState("")
  const [yearsOfExperience, setYearsOfExperience] =
    useState("")

  const selectedResume = selectedResumeId
    ? resumes.find(
        (resume) => resume.id === selectedResumeId,
      )
    : null

  const selectedAnalysis = selectedResumeId
    ? analyses[selectedResumeId]
    : undefined

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setError("")

        const data = await getResumes()

        setResumes(data)

        const analysisResults: Record<
          string,
          ResumeAnalysis
        > = {}

        await Promise.all(
          data.map(async (resume) => {
            try {
              const resumeAnalyses =
                await getResumeAnalyses(resume.id)

              if (resumeAnalyses.length > 0) {
                analysisResults[resume.id] =
                  resumeAnalyses[0]
              }
            } catch {
              // Resume may not have an analysis yet.
            }
          }),
        )

        setAnalyses(analysisResults)
      } catch {
        setError("Unable to load your resumes.")
      } finally {
        setIsLoadingResumes(false)
      }
    }

    if (user) {
      fetchResumes()
    }
  }, [user])

  const refreshResumes = async () => {
    try {
      setError("")

      const data = await getResumes()

      setResumes(data)
    } catch {
      setError("Unable to refresh your resumes.")
    }
  }

  const openAnalyzeModal = (resumeId: string) => {
    setError("")

    const existingAnalysis = analyses[resumeId]

    if (existingAnalysis) {
      setTargetRole(existingAnalysis.target_role)
      setYearsOfExperience(
        String(existingAnalysis.years_of_experience),
      )
    } else {
      setTargetRole("")
      setYearsOfExperience("")
    }

    setSelectedResumeId(resumeId)
  }

  const closeAnalyzeModal = () => {
    if (analyzingResumeId) {
      return
    }

    setSelectedResumeId(null)
    setTargetRole("")
    setYearsOfExperience("")
  }

  const handleDelete = async (resumeId: string) => {
    const resume = resumes.find(
      (item) => item.id === resumeId,
    )

    if (!resume) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${resume.filename}"? This will also delete its analyses.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")

      await deleteResume(resumeId)

      setResumes((currentResumes) =>
        currentResumes.filter(
          (item) => item.id !== resumeId,
        ),
      )

      setAnalyses((currentAnalyses) => {
        const updated = { ...currentAnalyses }

        delete updated[resumeId]

        return updated
      })
    } catch {
      setError("Unable to delete the resume.")
    }
  }

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      return
    }

    const trimmedRole = targetRole.trim()
    const parsedExperience = Number(yearsOfExperience)

    if (!trimmedRole) {
      setError("Please enter the target role.")
      return
    }

    if (
      yearsOfExperience.trim() === "" ||
      !Number.isFinite(parsedExperience) ||
      parsedExperience < 0 ||
      parsedExperience > 50
    ) {
      setError(
        "Please enter a valid number of years of experience.",
      )
      return
    }

    try {
      setError("")
      setAnalyzingResumeId(selectedResumeId)

      const analysis = await analyzeResume(
        selectedResumeId,
        {
          target_role: trimmedRole,
          years_of_experience: parsedExperience,
        },
      )

      setAnalyses((currentAnalyses) => ({
        ...currentAnalyses,
        [selectedResumeId]: analysis,
      }))

      setSelectedResumeId(null)
      setTargetRole("")
      setYearsOfExperience("")

      navigate(`/analysis/${analysis.id}`)
    } catch {
      setError(
        "Unable to analyze the resume. Please try again.",
      )
    } finally {
      setAnalyzingResumeId(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAnalyzing = Boolean(analyzingResumeId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard">
            <h1 className="text-xl font-bold tracking-tight">
              ResumeAI
            </h1>

            <p className="text-xs text-gray-500">
              Intelligent Resume Analysis
            </p>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Welcome back,{" "}
            {user.name.split(" ")[0]} 👋
          </h2>

          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-gray-500">
            Upload your resume and get targeted AI insights
            to improve your chances of landing your next
            role.
          </p>
        </section>

        {/* Stats */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Resumes
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-sm">
                📄
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight">
              {resumes.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Uploaded to your account
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Supported Formats
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm text-blue-600">
                ✓
              </div>
            </div>

            <p className="mt-5 text-xl font-bold tracking-tight">
              PDF · DOCX
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Resume text extraction supported
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                File Limit
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-sm text-amber-600">
                ↑
              </div>
            </div>

            <p className="mt-5 text-xl font-bold tracking-tight">
              5 MB
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Maximum upload size
            </p>
          </div>
        </section>

        {/* Upload */}

        <section className="mt-8">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="border-b px-7 py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-lg text-white">
                  +
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Get started
                  </p>

                  <h3 className="mt-1 text-2xl font-bold tracking-tight">
                    Analyze a Resume
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Upload your latest resume and we'll
                    extract the content before running the AI
                    analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-7">
              <ResumeUpload
                onUploadSuccess={refreshResumes}
              />
            </div>
          </div>
        </section>

        {/* Error */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <p className="text-sm leading-6 text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Resumes */}

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Your workspace
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight">
                My Resumes
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review and analyze your uploaded resumes.
              </p>
            </div>

            {resumes.length > 0 && (
              <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                {resumes.length}{" "}
                {resumes.length === 1
                  ? "resume"
                  : "resumes"}
              </span>
            )}
          </div>

          {isLoadingResumes ? (
            <div className="mt-5 rounded-3xl border bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

              <p className="mt-4 text-sm text-gray-500">
                Loading your resumes...
              </p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                📄
              </div>

              <h4 className="mt-5 text-lg font-semibold">
                No resumes yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Upload your first resume above. Once uploaded,
                you'll be able to analyze it against a target
                role.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {resumes.map((resume) => {
                const analysis = analyses[resume.id]

                const isResumeAnalyzing =
                  analyzingResumeId === resume.id

                const overallStyle = getScoreStyle(
                  analysis?.overall_score ?? null,
                )

                const atsStyle = getScoreStyle(
                  analysis?.ats_score ?? null,
                )

                return (
                  <div
                    key={resume.id}
                    className="rounded-3xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Resume Header */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg">
                          📄
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-gray-950">
                            {resume.filename}
                          </h4>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium uppercase text-gray-600">
                              {resume.file_type.replace(
                                ".",
                                "",
                              )}
                            </span>

                            <span className="text-xs text-gray-400">
                              {new Date(
                                resume.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        Uploaded
                      </span>
                    </div>

                    {/* Scores */}

                    {analysis && (
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div
                          className={`rounded-2xl p-4 ${overallStyle.bg}`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">
                              Overall Score
                            </p>

                            <span
                              className={`text-xs font-semibold ${overallStyle.text}`}
                            >
                              /100
                            </span>
                          </div>

                          <p
                            className={`mt-2 text-3xl font-bold tracking-tight ${overallStyle.text}`}
                          >
                            {analysis.overall_score ??
                              "—"}
                          </p>
                        </div>

                        <div
                          className={`rounded-2xl p-4 ${atsStyle.bg}`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">
                              ATS Score
                            </p>

                            <span
                              className={`text-xs font-semibold ${atsStyle.text}`}
                            >
                              /100
                            </span>
                          </div>

                          <p
                            className={`mt-2 text-3xl font-bold tracking-tight ${atsStyle.text}`}
                          >
                            {analysis.ats_score ??
                              "—"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Analysis Context */}

                    {analysis && (
                      <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Target Role
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                              {analysis.target_role}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Experience
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                              {analysis.years_of_experience}{" "}
                              {analysis.years_of_experience ===
                              1
                                ? "year"
                                : "years"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status */}

                    <div className="mt-5 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          analysis
                            ? "bg-emerald-500"
                            : "bg-gray-300"
                        }`}
                      />

                      <span
                        className={`text-xs font-medium ${
                          analysis
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        {analysis
                          ? "Analysis complete"
                          : "Ready for analysis"}
                      </span>
                    </div>

                    {/* Actions */}

                    <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        onClick={() =>
                          handleDelete(resume.id)
                        }
                        disabled={isAnalyzing}
                        className="order-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50 sm:order-1 sm:w-auto"
                      >
                        Delete
                      </button>

                      <div className="order-1 flex w-full flex-col gap-2 sm:order-2 sm:w-auto sm:flex-row">
                        {analysis && (
                          <Link
                            to={`/analysis/${analysis.id}`}
                            className="rounded-xl border px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            View Analysis
                          </Link>
                        )}

                        <button
                          onClick={() =>
                            openAnalyzeModal(resume.id)
                          }
                          disabled={isAnalyzing}
                          className="rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isResumeAnalyzing
                            ? "Analyzing..."
                            : analysis
                              ? "Re-analyze"
                              : "Analyze Resume"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Analyze Modal */}

      {selectedResumeId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isAnalyzing
            ) {
              closeAnalyzeModal()
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="analyze-resume-title"
          >
            {/* Modal Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Resume Analysis
                </p>

                <h3
                  id="analyze-resume-title"
                  className="mt-1 text-2xl font-bold tracking-tight"
                >
                  {selectedAnalysis
                    ? "Re-analyze Resume"
                    : "Analyze Resume"}
                </h3>
              </div>

              <button
                onClick={closeAnalyzeModal}
                disabled={isAnalyzing}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Selected Resume */}

            {selectedResume && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  📄
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {selectedResume.filename}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {selectedAnalysis
                      ? "Existing analysis context"
                      : "Ready for analysis"}
                  </p>
                </div>
              </div>
            )}

            {/* Existing Analysis Notice */}

            {selectedAnalysis && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs leading-5 text-blue-700">
                  This resume already has an analysis. The
                  existing target role and experience are
                  being reused.
                </p>
              </div>
            )}

            {/* Form */}

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="target-role"
                  className="text-sm font-semibold text-gray-800"
                >
                  Target Role
                </label>

                <input
                  id="target-role"
                  type="text"
                  value={targetRole}
                  onChange={(event) =>
                    setTargetRole(event.target.value)
                  }
                  disabled={Boolean(selectedAnalysis)}
                  placeholder="e.g. Full Stack Developer"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {!selectedAnalysis && (
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Enter the role you're targeting.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="years-of-experience"
                  className="text-sm font-semibold text-gray-800"
                >
                  Years of Experience
                </label>

                <input
                  id="years-of-experience"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={yearsOfExperience}
                  onChange={(event) =>
                    setYearsOfExperience(
                      event.target.value,
                    )
                  }
                  disabled={Boolean(selectedAnalysis)}
                  placeholder="e.g. 2"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {!selectedAnalysis && (
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Use 0 for an entry-level candidate.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={closeAnalyzeModal}
                disabled={isAnalyzing}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAnalyze}
                disabled={
                  isAnalyzing ||
                  !targetRole.trim() ||
                  yearsOfExperience.trim() === ""
                }
                className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing
                  ? "Analyzing..."
                  : selectedAnalysis
                    ? "Re-analyze"
                    : "Analyze Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard