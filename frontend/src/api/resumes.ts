import api from "../lib/api"

export interface Resume {
  id: string
  filename: string
  file_type: string
  upload_status: string
  extracted_text: string | null
  created_at: string
  updated_at: string
}

interface ResumeListResponse {
  resumes: Resume[]
}

export const getResumes = async (): Promise<Resume[]> => {
  const response = await api.get<ResumeListResponse>("/resumes")

  return response.data.resumes
}

export const deleteResume = async (
  resumeId: string,
): Promise<void> => {
  await api.delete(`/resumes/${resumeId}`)
}


export const uploadResume = async (
  file: File,
): Promise<Resume> => {
  const formData = new FormData()

  formData.append("file", file)

  const response = await api.post<Resume>(
    "/resumes/upload",
    formData,
  )

  return response.data
}