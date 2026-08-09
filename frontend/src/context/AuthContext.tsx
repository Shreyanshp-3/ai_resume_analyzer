import {
  useEffect,
  useState,
} from "react"

import type { ReactNode } from "react"
import type { User } from "../api/auth"

import {
  getCurrentUser,
  loginUser,
} from "../api/auth"

import {
  getToken,
  removeToken,
  setToken,
} from "../lib/auth"

import { AuthContext } from "./auth-context"


interface AuthProviderProps {
  children: ReactNode
}


export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    null,
  )

  const [isLoading, setIsLoading] = useState(
    () => getToken() !== null,
  )


  useEffect(() => {
    const token = getToken()

    if (!token) {
      return
    }

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()

        setUser(currentUser)
      } catch {
        removeToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])


  const login = async (
    email: string,
    password: string,
  ) => {
    const response = await loginUser({
      email,
      password,
    })

    setToken(response.access_token)

    const currentUser = await getCurrentUser()

    setUser(currentUser)
  }


  const logout = () => {
    removeToken()
    setUser(null)
  }


  const value = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}