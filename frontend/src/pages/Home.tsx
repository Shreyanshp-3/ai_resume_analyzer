import { useQuery } from "@tanstack/react-query"

import api from "../lib/api"

function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get("/health")
      return response.data
    },
  })

  if (isLoading) {
    return <h1>Checking API...</h1>
  }

  if (error) {
    return <h1>Backend connection failed</h1>
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          AI Resume Analyzer
        </h1>

        <p className="mt-4">
          API Status: {data.status}
        </p>
      </div>
    </div>
  )
}

export default Home