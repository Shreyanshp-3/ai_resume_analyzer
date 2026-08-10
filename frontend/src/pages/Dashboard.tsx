import { useEffect, useState } from "react"

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

  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setError("")

        const data = await getResumes()

        setResumes(data)
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
      const data = await getResumes()
      setResumes(data)
    } catch {
      setError("Unable to refresh your resumes.")
    }
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
    } catch {
      setError("Unable to delete the resume.")
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
            to improve your chances of landing your next role.
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
                Upload your latest resume to start the analysis.
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
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
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

                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="text-xs text-gray-400">
                      Ready for analysis
                    </span>

                    <button
                      onClick={() =>
                        handleDelete(resume.id)
                      }
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard