import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "../context/useAuth"


function Login() {
  const navigate = useNavigate()

  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      await login(email, password)

      navigate("/dashboard")
    } catch {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">

        <h1 className="mb-2 text-3xl font-bold">
          Welcome back
        </h1>

        <p className="mb-8 text-gray-600">
          Login to your AI Resume Analyzer account.
        </p>


        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              placeholder="you@example.com"
            />
          </div>


          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              placeholder="••••••••"
            />
          </div>


          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {isLoading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-medium text-black underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}


export default Login