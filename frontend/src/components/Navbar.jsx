import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut, Settings, Home, Search, ShoppingBag, User, Heart, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const menuItems = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Novedades', href: '/products', icon: ShoppingBag },
    { label: 'Ropa de mujer', href: '/products', icon: ShoppingBag },
    { label: 'Ofertas', href: '/products', icon: ShoppingBag },
    ...(user?.role === 'admin' ? [{ label: 'Admin', href: '/admin', icon: Settings }] : []),
  ]

  const linkClassName = ({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink)]/76 hover:bg-white/75 hover:text-[var(--ink)]'}`

  return (
    <header className="sticky top-0 z-50 px-4 py-4">
      <nav className="section-shell glass-panel flex items-center justify-between rounded-[28px] px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div>
            <p className="headline text-[2rem] font-bold leading-none tracking-tight">Moda Engell</p>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">Fashion marketplace</p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-2 xl:flex">
          {menuItems.map((item) => (
            <NavLink key={item.href} to={item.href} className={linkClassName}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2">
            <Search size={16} className="text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">Vestidos, blusas, faldas...</span>
          </div>
          {user ? (
            <>
              <div className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2 text-right">
                <p className="text-sm font-bold text-[var(--ink)]">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)]">
                <Heart size={16} />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : (
            <>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)]">
                <Heart size={16} />
              </button>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white/60">
                Iniciar sesion
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#db2d6a]">
                <User size={16} />
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 text-[var(--ink)] md:hidden"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="section-shell glass-panel mt-3 rounded-[28px] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-[var(--ink)] text-white' : 'bg-white/70 text-[var(--ink)]'}`}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </div>

          <div className="mt-4 border-t border-[var(--line)] pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/70 px-4 py-3">
                  <p className="font-bold">{user.name}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    <ShieldCheck size={14} />
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700"
                >
                  <LogOut size={16} />
                  Cerrar sesion
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-white/70 px-4 py-3 text-center font-semibold">
                  Iniciar sesion
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-[var(--ink)] px-4 py-3 text-center font-semibold text-white">
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
