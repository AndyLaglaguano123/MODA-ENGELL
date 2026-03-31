import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user || data)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Error validating token:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) throw new Error('Login failed')

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Registration failed')

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider')
  return context
}
