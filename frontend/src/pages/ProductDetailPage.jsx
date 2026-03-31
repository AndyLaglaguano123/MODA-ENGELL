import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Check, Eye, Heart, MessageCircle, PackageCheck, Ruler, Sparkles } from 'lucide-react'
import { analyticsService, productService } from '../services/api'
import { getVisitorSessionId } from '../utils/session'
import { useAuth } from '../context/AuthContext'

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '593999999999'

function splitList(value, fallback) {
  if (!value) return fallback
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productService.getById(id)
        setProduct(response.data)
        analyticsService.registerVisit({
          session_id: getVisitorSessionId(),
          page: `products/${id}`,
        }).catch(() => {})
      } catch (err) {
        setError('No pudimos cargar este producto.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleWhatsapp = () => {
    if (!product) return

    const lines = [
      'Hola Moda Engell, quiero este modelo.',
      '',
      `Producto: ${product.name}`,
      `Cantidad: ${quantity}`,
      `Precio: ${formatPrice(product.price)}`,
      `SKU: ${product.sku || `ME-${product.id}`}`,
      user?.name ? `Cliente: ${user.name}` : null,
      user?.email ? `Correo: ${user.email}` : null,
      'Metodo de pago: Transferencia bancaria',
    ].filter(Boolean)

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return <div className="section-shell px-1 py-24 text-center text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Cargando producto</div>
  }

  if (error || !product) {
    return (
      <div className="section-shell px-1 py-20">
        <div className="rounded-[32px] border border-red-200 bg-red-50 px-6 py-8 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5" />
            <div>
              <p className="font-bold">No pudimos mostrar este producto.</p>
              <p className="mt-2 text-sm">{error || 'Producto no disponible.'}</p>
              <Link to="/products" className="mt-4 inline-flex items-center gap-2 font-semibold underline">
                <ArrowLeft size={16} />
                Volver al catalogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const colors = splitList(product.colors, ['Negro', 'Rosado'])
  const sizes = splitList(product.sizes, ['S', 'M', 'L'])
  const available = Number(product.stock || 0) > 0
  const heroStyle = product.image_url
    ? { backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <main className="pb-20 pt-4">
      <section className="section-shell px-1">
        <div className="mb-5 flex items-center gap-3 text-sm text-[var(--muted)]">
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
            <ArrowLeft size={16} />
            Volver al catalogo
          </Link>
          <span>/</span>
          <span>{product.category || 'Moda mujer'}</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="rounded-[34px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
            <div className="grid gap-6 lg:grid-cols-[160px_1fr]">
              <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
                {colors.slice(0, 6).map((color, index) => (
                  <div key={`${color}-${index}`} className="rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,#f4bfd0,#fff1f6)] p-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {color}
                  </div>
                ))}
              </div>
              <div className="rounded-[32px] bg-[linear-gradient(180deg,#f6bfd0,#fff1f6)] p-8">
                <div style={heroStyle} className={`flex h-[520px] items-end justify-between rounded-[28px] border border-white/60 p-6 ${product.image_url ? 'bg-white/10' : 'bg-white/30'}`}>
                  <div className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                    {product.category || 'Moda mujer'}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                    <Eye size={16} />
                    {Number(product.views_count || 0)} vistas
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[34px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Moda Engell</p>
                <h1 className="mt-3 text-3xl font-bold text-[var(--ink)]">{product.name}</h1>
              </div>
              <button className="rounded-full border border-[var(--line)] bg-white p-3 text-[var(--ink)]"><Heart size={18} /></button>
            </div>

            <div className="mt-4 flex items-center gap-3 text-sm text-[#ff7a00]">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => <Check key={index} size={16} />)}
              </div>
              <span className="font-semibold">Modelo destacado</span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4 rounded-[28px] bg-[var(--surface-strong)] p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Precio</p>
                <p className="mt-2 text-4xl font-extrabold text-[var(--accent)]">{formatPrice(product.price)}</p>
              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-semibold ${available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {available ? `${product.stock} en stock` : 'Agotado'}
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{product.description}</p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Color disponible</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((color) => <span key={color} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--ink)]">{color}</span>)}
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Tallas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((size) => <span key={size} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--ink)]">{size}</span>)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-[var(--line)] bg-white px-4 py-3">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="rounded-full border border-[var(--line)] px-3 py-2 font-bold text-[var(--ink)]">-</button>
              <span className="min-w-8 text-center text-lg font-bold text-[var(--ink)]">{quantity}</span>
              <button onClick={() => setQuantity((value) => Math.min(Number(product.stock || 1), value + 1))} className="rounded-full border border-[var(--line)] px-3 py-2 font-bold text-[var(--ink)]">+</button>
              <span className="ml-auto text-sm text-[var(--muted)]">Cantidad</span>
            </div>

            <button onClick={handleWhatsapp} disabled={!available} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-4 font-bold text-white transition hover:bg-[#db2d6a] disabled:cursor-not-allowed disabled:bg-slate-300">
              <MessageCircle size={18} />
              Consultar y comprar por WhatsApp
            </button>

            <Link to="/products" className="mt-3 block w-full rounded-full border border-[var(--line)] bg-white px-5 py-4 text-center font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
              Ver mas modelos
            </Link>
          </aside>
        </div>
      </section>

      <section className="section-shell grid gap-6 px-1 py-8 lg:grid-cols-3">
        <article className="rounded-[28px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
          <div className="inline-flex rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><Sparkles size={18} /></div>
          <h2 className="mt-4 text-xl font-bold text-[var(--ink)]">Especificaciones</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
            <li><strong>SKU:</strong> {product.sku || `ME-${product.id}`}</li>
            <li><strong>Categoria:</strong> {product.category || 'Moda mujer'}</li>
            <li><strong>Material:</strong> {product.material || 'Tela premium'}</li>
            <li><strong>Disponibilidad:</strong> {available ? 'Disponible para entrega' : 'Sin stock temporalmente'}</li>
          </ul>
        </article>

        <article className="rounded-[28px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
          <div className="inline-flex rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><Ruler size={18} /></div>
          <h2 className="mt-4 text-xl font-bold text-[var(--ink)]">Tallas y colores</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
            <li><strong>Tallas:</strong> {sizes.join(', ')}</li>
            <li><strong>Colores:</strong> {colors.join(', ')}</li>
            <li><strong>Stock actual:</strong> {product.stock} unidades</li>
            <li><strong>Vista del modelo:</strong> ficha individual lista para que la clienta revise el detalle.</li>
          </ul>
        </article>

        <article className="rounded-[28px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
          <div className="inline-flex rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><PackageCheck size={18} /></div>
          <h2 className="mt-4 text-xl font-bold text-[var(--ink)]">Compra segura</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
            <li><strong>Pago:</strong> transferencia bancaria</li>
            <li><strong>Confirmacion:</strong> cierre por WhatsApp con atencion personalizada</li>
            <li><strong>Seguimiento:</strong> el admin puede revisar pedidos, visitas y productos mas consultados</li>
            <li><strong>Atencion:</strong> ideal para negocio real de moda femenina</li>
          </ul>
        </article>
      </section>
    </main>
  )
}
