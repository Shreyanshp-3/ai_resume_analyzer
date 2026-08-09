import api from "../lib/api"

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: string
  name: string
  email: string
}

export const registerUser = async (
  data: RegisterData,
) => {
  const response = await api.post<User>(
    "/auth/register",
    data,
  )

  return response.data
}

export const loginUser = async (
  data: LoginData,
) => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data,
  )

  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get<User>("/auth/me")

  return response.data
}