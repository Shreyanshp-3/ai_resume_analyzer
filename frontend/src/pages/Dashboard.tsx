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
    try {
      setError("")

      await deleteResume(resumeId)

      setResumes((currentResumes) =>
        currentResumes.filter(
          (resume) => resume.id !== resumeId,
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
        <p className="text-gray-500">Loading...</p>
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
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ResumeAI
            </h1>

            <p className="text-xs text-gray-500">
              Intelligent Resume Analysis
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
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
          <p className="text-sm font-medium text-gray-500">
            Dashboard
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h2>

          <p className="mt-2 max-w-2xl text-gray-600">
            Upload your resume and get AI-powered insights
            to improve your chances of landing your next
            role.
          </p>
        </section>

        {/* Stats */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Resumes
            </p>

            <p className="mt-2 text-3xl font-bold">
              {resumes.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Supported Formats
            </p>

            <p className="mt-2 text-xl font-semibold">
              PDF · DOCX
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              File Limit
            </p>

            <p className="mt-2 text-xl font-semibold">
              5 MB
            </p>
          </div>
        </section>

        {/* Upload */}

        <section className="mt-8">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-semibold">
                Analyze a Resume
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Upload your latest resume to start the
                analysis.
              </p>
            </div>

            <ResumeUpload
              onUploadSuccess={refreshResumes}
            />
          </div>
        </section>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Resumes */}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                My Resumes
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Your uploaded resumes will appear here.
              </p>
            </div>

            {resumes.length > 0 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                {resumes.length}{" "}
                {resumes.length === 1
                  ? "resume"
                  : "resumes"}
              </span>
            )}
          </div>

          {isLoadingResumes ? (
            <div className="mt-5 rounded-2xl border bg-white p-10 text-center">
              <p className="text-gray-500">
                Loading resumes...
              </p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                📄
              </div>

              <h4 className="mt-4 font-semibold">
                No resumes yet
              </h4>

              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Upload your first resume above and we'll
                extract its content and prepare it for AI
                analysis.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {resumes.map((resume) => {
                const analysis = analyses[resume.id]

                const isResumeAnalyzing =
                  analyzingResumeId === resume.id

                return (
                  <div
                    key={resume.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Resume Header */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                          📄
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold">
                            {resume.filename}
                          </h4>

                          <div className="mt-2 flex items-center gap-2">
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

                      <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                        Uploaded
                      </span>
                    </div>

                    {/* Scores */}

                    {analysis && (
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-500">
                            Overall Score
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {analysis.overall_score ?? "—"}
                            <span className="text-sm font-medium text-gray-400">
                              /100
                            </span>
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-500">
                            ATS Score
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {analysis.ats_score ?? "—"}
                            <span className="text-sm font-medium text-gray-400">
                              /100
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Analysis Context */}

                    {analysis && (
                      <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">
                              Target Role
                            </p>

                            <p className="mt-1 font-medium">
                              {analysis.target_role}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Experience
                            </p>

                            <p className="mt-1 font-medium">
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

                    {/* Actions */}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <div>
                        {analysis ? (
                          <span className="text-xs font-medium text-green-600">
                            Analysis complete
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Ready for analysis
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {analysis && (
                          <Link
                            to={`/analysis/${analysis.id}`}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
                          >
                            View Analysis
                          </Link>
                        )}

                        <button
                          onClick={() =>
                            openAnalyzeModal(resume.id)
                          }
                          disabled={isAnalyzing}
                          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isResumeAnalyzing
                            ? "Analyzing..."
                            : analysis
                              ? "Re-analyze"
                              : "Analyze Resume"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(resume.id)
                          }
                          disabled={isAnalyzing}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="analyze-resume-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Resume Analysis
                </p>

                <h3
                  id="analyze-resume-title"
                  className="mt-1 text-xl font-semibold"
                >
                  {selectedAnalysis
                    ? "Re-analyze Resume"
                    : "Analyze Resume"}
                </h3>
              </div>

              <button
                onClick={closeAnalyzeModal}
                disabled={isAnalyzing}
                className="rounded-lg px-2 py-1 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {selectedResume && (
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="truncate text-sm font-medium">
                  {selectedResume.filename}
                </p>

                {selectedAnalysis && (
                  <p className="mt-1 text-xs text-gray-500">
                    Reusing the same analysis context from
                    the previous analysis.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="target-role"
                  className="text-sm font-medium text-gray-700"
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
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {!selectedAnalysis && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the role you're targeting.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="years-of-experience"
                  className="text-sm font-medium text-gray-700"
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
                    setYearsOfExperience(event.target.value)
                  }
                  disabled={Boolean(selectedAnalysis)}
                  placeholder="e.g. 2"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {!selectedAnalysis && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Use 0 for an entry-level candidate.
                  </p>
                )}
              </div>
            </div>

            {selectedAnalysis && (
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs leading-5 text-gray-500">
                  Want to analyze this resume for a
                  different role or experience level? Upload
                  the updated resume as a new version first.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeAnalyzeModal}
                disabled={isAnalyzing}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
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
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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