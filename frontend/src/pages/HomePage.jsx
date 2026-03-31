import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { analyticsService, adminService } from '../services/api'
import { getVisitorSessionId } from '../utils/session'
import { ArrowRight, BadgePercent, Heart, Package, ShieldCheck, Shirt, ShoppingCart, Sparkles, Star, TrendingUp, Truck, Users } from 'lucide-react'

const trendBlocks = [
  { title: 'Vestidos virales', text: 'Siluetas femeninas, colores suaves y caidas ligeras para compra impulsiva.' },
  { title: 'Nuevas ofertas', text: 'Promociones visibles con jerarquia clara, como en un gran marketplace fashion.' },
  { title: 'Looks para salir', text: 'Conjuntos, tops y basicos para convertir la home en una vitrina comercial.' },
]

const collectionCards = [
  { tag: 'Nueva temporada', title: 'Romantica urbana', subtitle: 'Blusas, faldas y vestidos midi', price: 'Desde $12.99' },
  { tag: 'Top ventas', title: 'Basicos con estilo', subtitle: 'Polos ajustados, denim y capas ligeras', price: 'Desde $8.99' },
  { tag: 'Weekend edit', title: 'Fiesta y salida', subtitle: 'Sets satinados y vestidos con brillo', price: 'Hasta -40%' },
]

const perks = [
  { icon: Truck, title: 'Envios veloces', text: 'La tienda comunica rapidez de compra y entrega desde la primera pantalla.' },
  { icon: ShieldCheck, title: 'Compra confiable', text: 'Checkout por transferencia y atencion personalizada por WhatsApp.' },
  { icon: Heart, title: 'Moda deseable', text: 'Una estetica mas cercana a ecommerce de ropa femenina masiva.' },
  { icon: Users, title: 'Comunidad fashion', text: 'Lista para medir visitas, clientes creados y modelos mas vistos.' },
]

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_visits: 0,
    revenue: 0,
  })

  useEffect(() => {
    analyticsService.registerVisit({
      session_id: getVisitorSessionId(),
      page: 'home',
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return

    const fetchStats = async () => {
      try {
        const response = await adminService.getSummary()
        setStats(response.data?.metrics || {})
      } catch (error) {
        console.error('Error cargando estadisticas:', error)
      }
    }

    fetchStats()
  }, [user])

  const adminCards = useMemo(() => ([
    { label: 'Visitas', value: stats.total_visits || 0, icon: Users },
    { label: 'Productos', value: stats.total_products || 0, icon: Package },
    { label: 'Pedidos', value: stats.total_orders || 0, icon: ShoppingCart },
    { label: 'Ventas', value: `$${Number(stats.revenue || 0).toFixed(2)}`, icon: TrendingUp },
  ]), [stats])

  return (
    <main className="pb-20">
      <section className="section-shell px-1 pt-4">
        <div className="overflow-hidden rounded-[38px] fashion-gradient p-6 text-white shadow-[0_30px_80px_rgba(244,63,123,0.22)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                <Sparkles size={14} />
                Moda femenina en tendencia
              </div>
              <h1 className="headline text-5xl font-bold leading-[0.9] sm:text-6xl xl:text-7xl">
                Moda Engell
                <span className="block text-[0.58em] font-semibold uppercase tracking-[0.28em] text-white/82">
                  Ropa de mujer lista para vender
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
                Catalogo visual, promociones visibles, compra guiada por WhatsApp y pago por transferencia para cerrar ventas mas rapido.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[var(--ink)] transition hover:bg-[#fff3f7]">
                  Comprar ahora
                  <ArrowRight size={18} />
                </Link>
                <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/16">
                  Ver novedades
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {trendBlocks.map((item) => (
                  <div key={item.title} className="rounded-[28px] border border-white/18 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/82">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {collectionCards.map((card, index) => (
                <article key={card.title} className={`overflow-hidden rounded-[30px] border border-white/35 bg-white/84 p-4 text-[var(--ink)] shadow-[0_18px_50px_rgba(34,24,33,0.12)] ${index === 0 ? 'xl:translate-y-8' : ''}`}>
                  <div className={`mb-4 flex h-56 items-end rounded-[24px] p-5 ${index === 0 ? 'bg-[linear-gradient(180deg,#f4bfd0,#fef3f7)]' : index === 1 ? 'bg-[linear-gradient(180deg,#e5d9df,#f8f5f7)]' : 'bg-[linear-gradient(180deg,#ffd6df,#fff0f5)]'}`}>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{card.tag}</div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Coleccion curada</p>
                  <h2 className="headline mt-3 text-3xl font-bold leading-tight">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.subtitle}</p>
                  <p className="mt-5 text-2xl font-extrabold text-[var(--accent)]">{card.price}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell px-1 py-6">
        <div className="grid gap-4 rounded-[36px] bg-white/78 p-5 shadow-[0_24px_60px_rgba(34,24,33,0.08)] sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
          {[
            { icon: BadgePercent, title: 'Flash deals', text: 'Banners y rebajas mas visibles para activar compra rapida.' },
            { icon: Shirt, title: 'Moda mujer', text: 'La experiencia ya apunta a ropa femenina y no a una tienda generica.' },
            { icon: Star, title: 'Top vendidos', text: 'Ideal para empujar productos estrella y novedades del dia.' },
            { icon: Heart, title: 'Wishlist visual', text: 'Mucho mas cercana al lenguaje visual de fashion ecommerce.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                <div className="inline-flex rounded-full bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><Icon size={18} /></div>
                <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      {user?.role === 'admin' && (
        <section className="section-shell px-1 py-4">
          <div className="rounded-[34px] bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.58))] p-6 shadow-[0_18px_50px_rgba(34,24,33,0.08)] sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Resumen operativo</p>
                <h2 className="headline mt-2 text-3xl font-bold">Panel rapido de Moda Engell</h2>
              </div>
              <Link to="/admin" className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--brand-deep)]">
                Abrir administracion
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {adminCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="rounded-[28px] border border-white/55 bg-white/78 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--muted)]">{card.label}</p>
                      <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><Icon size={20} /></div>
                    </div>
                    <p className="mt-5 text-3xl font-extrabold text-[var(--ink)]">{card.value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section-shell px-1 py-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {perks.map((perk) => {
            const Icon = perk.icon
            return (
              <article key={perk.title} className="metric-card rounded-[28px] p-6 transition hover:-translate-y-1">
                <div className="inline-flex rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><Icon size={22} /></div>
                <h3 className="mt-5 text-xl font-bold">{perk.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{perk.text}</p>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
