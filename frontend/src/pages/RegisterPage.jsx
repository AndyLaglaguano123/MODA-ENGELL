import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Lock, Mail, Sparkles, User } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Las contrasenas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, role: 'customer' })
      navigate('/')
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  return (
    <main className="section-shell grid min-h-[calc(100vh-120px)] items-center gap-8 px-1 py-6 lg:grid-cols-[0.98fr_1.02fr]">
      <section className="glass-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Nueva cuenta</p>
          <h1 className="headline mt-3 text-3xl font-bold">Crea tu cuenta en Moda Engell</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Registra tus datos para comprar, guardar favoritos y seguir tus pedidos.</p>
        </div>

        {error && <div className="mb-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Nombre completo</span>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]" placeholder="Tu nombre" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Correo</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]" placeholder="cliente@modaengell.com" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Contrasena</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]" placeholder="Tu contrasena" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Confirmar contrasena</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]" placeholder="Repite tu contrasena" required />
            </div>
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--accent)] px-5 py-4 font-bold text-white transition hover:bg-[#db2d6a] disabled:opacity-70">
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--muted)]">Ya tienes acceso? <Link to="/login" className="font-bold text-[var(--danger)] underline-offset-4 hover:underline">Inicia sesion</Link></p>
      </section>

      <section className="overflow-hidden rounded-[36px] fashion-gradient px-8 py-10 text-white shadow-[0_28px_70px_rgba(244,63,123,0.22)] sm:px-10 sm:py-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-white"><Sparkles size={16} /> Cuenta de cliente</div>
        <h2 className="headline mt-6 text-5xl font-bold leading-tight">Tu estilo merece una tienda a la altura.</h2>
        <div className="mt-8 space-y-4">
          {[
            'Guarda favoritos y prendas destacadas.',
            'Compra mas rapido cuando quieras volver.',
            'Aprovecha el look visual de un ecommerce de moda real.',
            'Deja a Moda Engell lista para crecer en campanas y colecciones.'
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-[24px] border border-white/20 bg-white/10 px-5 py-4 font-semibold backdrop-blur-sm">
              <Heart size={16} />
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
