'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  password: string
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const sessionAuth = sessionStorage.getItem('admin_auth')
    const localAuth = localStorage.getItem('admin_auth')
    const savedPassword = localStorage.getItem('admin_password')

    if (sessionAuth === 'true' || localAuth === 'true') {
      setIsAuthenticated(true)
      if (savedPassword) {
        setPassword(savedPassword)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (pwd: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/analytics/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      })

      if (response.ok) {
        sessionStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_password', pwd)
        setIsAuthenticated(true)
        setPassword(pwd)
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_password')
    setIsAuthenticated(false)
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Laden...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, password, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
