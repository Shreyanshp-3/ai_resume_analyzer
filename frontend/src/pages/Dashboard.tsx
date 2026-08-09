import { useAuth } from "../context/useAuth"

function Dashboard() {
  const {
    user,
    isLoading,
    logout,
  } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Welcome back
            </p>

            <h1 className="text-3xl font-bold">
              {user.name}
            </h1>

            <p className="mt-1 text-gray-600">
              {user.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Logout
          </button>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">
            Resume Analyzer
          </h2>

          <p className="mt-2 text-gray-600">
            Upload your resume to get started.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard