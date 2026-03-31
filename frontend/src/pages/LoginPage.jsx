import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Lock, Mail, Shirt } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'No pudimos iniciar sesion con esas credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="section-shell grid min-h-[calc(100vh-120px)] items-center gap-8 px-1 py-6 lg:grid-cols-[1fr_0.95fr]">
      <section className="overflow-hidden rounded-[36px] fashion-gradient px-8 py-10 text-white shadow-[0_28px_70px_rgba(244,63,123,0.22)] sm:px-10 sm:py-12">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            <Shirt size={18} />
            Accede a tus favoritos y pedidos
          </div>
          <h1 className="headline text-5xl font-bold leading-tight">Bienvenida a Moda Engell</h1>
          <p className="mt-5 text-base leading-7 text-white/90">
            Inicia sesion para comprar mas rapido, guardar tus prendas favoritas y continuar con la experiencia de moda femenina del sitio.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Wishlist y guardados', 'Pedidos y seguimiento', 'Promos para clientes', 'Acceso mas rapido'].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/20 bg-white/10 px-4 py-4 text-sm font-semibold backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Acceso cliente</p>
          <h2 className="headline mt-3 text-3xl font-bold">Iniciar sesion</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Entra a tu cuenta para seguir comprando en Moda Engell.</p>
        </div>

        {error && <div className="mb-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">Correo</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@modaengell.com" className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--ink)]">Contrasena</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingresa tu contrasena" className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]" required />
            </div>
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--ink)] px-5 py-4 font-bold text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-70">
            {loading ? 'Ingresando...' : 'Entrar a Moda Engell'}
          </button>
        </form>

        <div className="mt-6 rounded-[26px] bg-[var(--accent-soft)] p-4 text-sm leading-6 text-[var(--danger)]">
          <p className="flex items-center gap-2 font-bold"><Heart size={16} /> Guarda looks, favoritos y pedidos</p>
          <p className="mt-2">El catalogo es publico, pero tu compra final y tu historial requieren sesion.</p>
        </div>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Aun no tienes cuenta? <Link to="/register" className="font-bold text-[var(--danger)] underline-offset-4 hover:underline">Registrate aqui</Link>
        </p>
      </section>
    </main>
  )
}
