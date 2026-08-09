import { createContext } from "react"

import type { User } from "../api/auth"

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<void>
  logout: () => void
}

export const AuthContext =
  createContext<AuthContextType | null>(null)