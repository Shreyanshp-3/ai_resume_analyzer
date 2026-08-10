import api from "../lib/api"

export interface ResumeAnalysis {
  id: string
  resume_id: string
  overall_score: number | null
  ats_score: number | null
  skills: string[]
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  recommendations: string[]
  summary: string | null
  model_name: string | null
  created_at: string
}

interface ResumeAnalysisListResponse {
  analyses: ResumeAnalysis[]
}

export async function analyzeResume(
  resumeId: string,
): Promise<ResumeAnalysis> {
  const response = await api.post<ResumeAnalysis>(
    `/resumes/${resumeId}/analyze`,
  )

  return response.data
}

export async function getResumeAnalyses(
  resumeId: string,
): Promise<ResumeAnalysis[]> {
  const response =
    await api.get<ResumeAnalysisListResponse>(
      `/resumes/${resumeId}/analyses`,
    )

  return response.data.analyses
}

export async function getAnalysis(
  analysisId: string,
): Promise<ResumeAnalysis> {
  const response = await api.get<ResumeAnalysis>(
    `/analyses/${analysisId}`,
  )

  return response.data
}