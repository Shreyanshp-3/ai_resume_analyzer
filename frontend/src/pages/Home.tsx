import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ResumeAI
            </h1>

            <p className="text-xs text-gray-500">
              Intelligent Resume Analysis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
              AI-powered resume analysis
            </div>

            <h2 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Make your resume
              <span className="block text-gray-400">
                stronger.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Upload your resume and get a detailed AI analysis
              of your ATS compatibility, skills, strengths,
              weaknesses, and areas for improvement.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Analyze My Resume →
              </Link>

              <Link
                to="/login"
                className="rounded-xl border px-6 py-3 text-sm font-semibold transition hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Trust line */}

          <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 text-sm text-gray-500">
            <span>✓ ATS scoring</span>
            <span>✓ Role-specific analysis</span>
            <span>✓ Skills analysis</span>
            <span>✓ Actionable recommendations</span>
          </div>
        </section>

        {/* Feature Preview */}

        <section className="border-y bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-gray-500">
                What you get
              </p>

              <h3 className="mt-2 text-3xl font-bold tracking-tight">
                Understand what is holding your resume back.
              </h3>

              <p className="mt-3 text-gray-600">
                ResumeAI evaluates your resume against the role
                you're targeting instead of giving generic
                writing advice.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {/* ATS */}

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  01
                </div>

                <h4 className="mt-5 text-lg font-semibold">
                  ATS Score
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  See how effectively your resume can match
                  the requirements of your target role.
                </p>
              </div>

              {/* Skills */}

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  02
                </div>

                <h4 className="mt-5 text-lg font-semibold">
                  Skills & Gaps
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Discover relevant skills you're showcasing
                  and important skills you may be missing.
                </p>
              </div>

              {/* Improvements */}

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  03
                </div>

                <h4 className="mt-5 text-lg font-semibold">
                  Clear Improvements
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Get specific recommendations you can apply
                  to make your resume stronger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl bg-black px-8 py-12 text-white sm:px-12">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-gray-400">
                Ready to improve your resume?
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Find out how your resume performs.
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Upload your resume, choose your target role,
                and let AI identify the areas that matter most.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ResumeAI</p>

          <p>AI-powered resume analysis</p>
        </div>
      </footer>
    </div>
  )
}

export default Home