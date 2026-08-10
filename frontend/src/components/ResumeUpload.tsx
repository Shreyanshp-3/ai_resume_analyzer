import { useRef, useState } from "react"
import type { ChangeEvent } from "react"

import axios from "axios"

import { uploadResume } from "../api/resumes"

interface ResumeUploadProps {
  onUploadSuccess: () => void
}

function ResumeUpload({
  onUploadSuccess,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setError("")
    setSuccess("")

    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase()

    if (![".pdf", ".docx"].includes(extension)) {
      setFile(null)
      setError(
        "Only PDF and DOCX files are supported.",
      )
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null)
      setError(
        "File size must be less than 5 MB.",
      )
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume first.")
      return
    }

    try {
      setIsUploading(true)
      setError("")
      setSuccess("")

      await uploadResume(file)

      setFile(null)

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      setSuccess(
        "Resume uploaded successfully.",
      )

      onUploadSuccess()
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail

        if (Array.isArray(detail)) {
          const messages = detail
            .map((item) => item?.msg)
            .filter(Boolean)
            .join(", ")

          setError(
            messages || "Unable to upload resume.",
          )
        } else if (typeof detail === "string") {
          setError(detail)
        } else {
          setError("Unable to upload resume.")
        }
      } else {
        setError("Unable to upload resume.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border p-6">
      <h3 className="text-lg font-semibold">
        Upload Resume
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Upload a PDF or DOCX file up to 5 MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="mt-4 block w-full text-sm"
      />

      {file && (
        <div className="mt-4 rounded-lg border p-4">
          <p className="font-medium">
            {file.name}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 text-sm text-green-600">
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading
          ? "Uploading..."
          : "Upload Resume"}
      </button>
    </div>
  )
}

export default ResumeUpload