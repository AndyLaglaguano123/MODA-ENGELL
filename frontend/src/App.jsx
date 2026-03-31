import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminPage from './pages/AdminPage'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand)]" />
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Cargando Moda Engell</p>
      </div>
    </div>
  )
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />

  return children
}

function AppShell() {
  const { loading } = useAuth()

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
