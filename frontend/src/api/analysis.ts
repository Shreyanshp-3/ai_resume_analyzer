import api from "../lib/api"

export interface DimensionScore {
  score: number
  max: number
  notes: string[]
}

export interface KeywordMatchDimension
  extends DimensionScore {
  missing_keywords: string[]
  matched_keywords: string[]
}

export interface RedFlagsDimension
  extends DimensionScore {
  flags_found: string[]
}

export interface DimensionScores {
  parseability: DimensionScore
  keyword_match: KeywordMatchDimension
  experience_alignment: DimensionScore
  impact_quantification: DimensionScore
  formatting_length: DimensionScore
  red_flags: RedFlagsDimension
}

export interface ResumeAnalysis {
  id: string
  resume_id: string

  target_role: string
  years_of_experience: number

  overall_score: number | null
  ats_score: number | null

  dimension_scores: DimensionScores | null

  skills: string[]
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  recommendations: string[]
  top_3_fixes: string[]

  summary: string | null
  model_name: string | null
  created_at: string
}

interface ResumeAnalysisListResponse {
  analyses: ResumeAnalysis[]
}

export interface AnalyzeResumeRequest {
  target_role: string
  years_of_experience: number
}

export async function analyzeResume(
  resumeId: string,
  data: AnalyzeResumeRequest,
): Promise<ResumeAnalysis> {
  const response = await api.post<ResumeAnalysis>(
    `/resumes/${resumeId}/analyze`,
    data,
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