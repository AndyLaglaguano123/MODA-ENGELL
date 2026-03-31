import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Building2, Check, Heart, MessageCircle, Minus, Plus, Search, ShoppingBag, ShoppingCart, Star, Trash2 } from 'lucide-react'
import { analyticsService, orderService, productService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getVisitorSessionId } from '../utils/session'

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '593999999999'
const TRANSFER_BANK = import.meta.env.VITE_TRANSFER_BANK || 'Banco Pichincha'
const TRANSFER_OWNER = import.meta.env.VITE_TRANSFER_OWNER || 'Moda Engell'
const TRANSFER_ACCOUNT = import.meta.env.VITE_TRANSFER_ACCOUNT || 'Cuenta por configurar'

function normalizeProducts(data) {
  return (data || []).map((product) => ({
    ...product,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    views_count: Number(product.views_count || 0),
  }))
}

function productVisual(product, index) {
  if (product.image_url) {
    return (
      <img
        src={product.image_url}
        alt={product.name}
        className="h-full w-full rounded-[26px] object-cover"
      />
    )
  }

  return (
    <div className={`flex h-full items-end rounded-[26px] p-5 ${index % 3 === 0 ? 'bg-[linear-gradient(180deg,#f6bfd0,#fff1f6)]' : index % 3 === 1 ? 'bg-[linear-gradient(180deg,#f1d8e2,#fbf7fa)]' : 'bg-[linear-gradient(180deg,#ffd2df,#fff1f4)]'}`}>
      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{product.category || 'Moda Engell'}</div>
    </div>
  )
}

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [checkoutState, setCheckoutState] = useState({ loading: false, message: '', type: '' })
  const [customerData, setCustomerData] = useState({ city: '', address: '', notes: '' })

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getAll()
        setProducts(normalizeProducts(response.data))
      } catch (err) {
        setError('No pudimos cargar el catalogo en este momento.')
      } finally {
        setLoading(false)
      }
    }

    analyticsService.registerVisit({
      session_id: getVisitorSessionId(),
      page: 'products',
    }).catch(() => {})

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || ''
      const description = product.description?.toLowerCase() || ''
      return name.includes(normalizedQuery) || description.includes(normalizedQuery)
    })
  }, [products, query])

  const addToCart = (product) => {
    setCheckoutState({ loading: false, message: '', type: '' })
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id)
      if (existing) {
        return currentCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...currentCart, { ...product, quantity: 1 }]
    })
    setShowCart(true)
  }

  const registerInterest = async (product) => {
    try {
      await analyticsService.registerProductView(product.id)
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, views_count: Number(item.views_count || 0) + 1 } : item))
    } catch (err) {
      console.error('No se pudo registrar la vista del modelo', err)
    }
  }

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((currentCart) => currentCart.map((item) => item.id === productId ? { ...item, quantity } : item))
  }

  const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)
  const units = cart.reduce((acc, item) => acc + item.quantity, 0)

  const buildWhatsappMessage = (orderId) => {
    const lines = [
      'Hola Moda Engell, quiero confirmar mi compra por transferencia.',
      '',
      `Cliente: ${user?.name || 'Sin nombre'}`,
      `Correo: ${user?.email || 'Sin correo'}`,
      customerData.city ? `Ciudad: ${customerData.city}` : null,
      customerData.address ? `Direccion: ${customerData.address}` : null,
      orderId ? `Pedido registrado: #${orderId}` : null,
      '',
      'Modelos seleccionados:',
      ...cart.map((item) => `- ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`),
      '',
      `Total estimado: ${formatPrice(total)}`,
      'Metodo de pago: Transferencia bancaria',
      `Banco: ${TRANSFER_BANK}`,
      `Titular: ${TRANSFER_OWNER}`,
      `Cuenta: ${TRANSFER_ACCOUNT}`,
      customerData.notes ? `Notas: ${customerData.notes}` : null,
    ].filter(Boolean)

    return encodeURIComponent(lines.join('\n'))
  }

  const handleCheckout = async () => {
    if (!user) {
      setCheckoutState({ loading: false, type: 'error', message: 'Inicia sesion para continuar la compra por WhatsApp.' })
      return
    }

    if (cart.length === 0) {
      setCheckoutState({ loading: false, type: 'error', message: 'Agrega al menos un modelo al carrito.' })
      return
    }

    try {
      setCheckoutState({ loading: true, type: '', message: '' })
      const items = cart.map((item) => ({ product_id: item.id, quantity: item.quantity }))
      const response = await orderService.create({
        items,
        shipping_address: customerData.address || 'Confirmar direccion por WhatsApp',
        city: customerData.city || 'Por confirmar',
        customer_notes: customerData.notes || 'Cliente desea finalizar por WhatsApp con transferencia bancaria.',
        payment_method: 'transfer',
      })

      const orderId = response.data?.order?.id
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsappMessage(orderId)}`
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

      setCart([])
      setShowCart(false)
      setCustomerData({ city: '', address: '', notes: '' })
      setCheckoutState({ loading: false, type: 'success', message: `Pedido #${orderId || ''} creado. Continuamos por WhatsApp para confirmar la transferencia.` })
    } catch (err) {
      setCheckoutState({ loading: false, type: 'error', message: err.response?.data?.message || 'No se pudo completar la compra.' })
    }
  }

  if (loading) {
    return <div className="section-shell px-1 py-24 text-center text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Cargando catalogo</div>
  }

  return (
    <main className="pb-20 pt-4">
      <section className="section-shell grid gap-6 px-1 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[36px] bg-white/80 p-7 shadow-[0_24px_60px_rgba(34,24,33,0.08)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Moda Engell</p>
                <h1 className="headline mt-3 text-4xl font-bold text-[var(--ink)]">Catalogo de ropa femenina</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                  Compra visual, envio guiado por WhatsApp y pago por transferencia para cerrar ventas reales con atencion personalizada.
                </p>
              </div>
              <button
                onClick={() => setShowCart((open) => !open)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--brand-deep)]"
              >
                <ShoppingCart size={18} />
                Carrito ({units})
              </button>
            </div>

            <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar vestidos, blusas, tops, accesorios..."
                  className="w-full rounded-full border border-[var(--line)] bg-white px-12 py-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {['Vestidos', 'Blusas', 'Novedades', 'Rebajas'].map((chip) => (
                  <span key={chip} className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">{chip}</span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              <AlertCircle size={18} className="mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {checkoutState.message && (
            <div className={`flex items-start gap-3 rounded-[28px] px-5 py-4 ${checkoutState.type === 'success' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-700'}`}>
              {checkoutState.type === 'success' ? <Check size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}
              <p>{checkoutState.message}</p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <article key={product.id} className="group overflow-hidden rounded-[30px] border border-white/55 bg-white/84 shadow-[0_18px_48px_rgba(34,24,33,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_64px_rgba(34,24,33,0.12)]">
                <div className="relative h-72 overflow-hidden p-5">
                  <div className="absolute right-4 top-4 flex gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{index % 2 === 0 ? 'New' : 'Hot'}</span>
                    <button className="rounded-full bg-white p-2 text-[var(--ink)] shadow-sm"><Heart size={16} /></button>
                  </div>
                  {productVisual(product, index)}
                  <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{product.category || 'Moda Engell'}</div>
                    <div className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--ink)]">{product.views_count} visitas</div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-1 text-[#ff7a00]">
                    {Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} size={15} fill="currentColor" />)}
                    <span className="ml-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Top pick</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{index % 2 === 0 ? 'Elegido para ti' : 'Venta flash'}</p>
                  <h2 className="mt-2 text-lg font-bold text-[var(--ink)]">{product.name}</h2>
                  <p className="mt-2 min-h-[66px] text-sm leading-6 text-[var(--muted)]">{product.description || 'Producto listo para destacarse en una tienda de moda femenina.'}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Stock disponible: {product.stock}</p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Precio</p>
                      <p className="mt-1 text-3xl font-extrabold text-[var(--accent)]">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        onClick={() => registerInterest(product)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        Ver modelo
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <ShoppingBag size={16} />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className={`${showCart ? 'block' : 'hidden'} xl:block`}>
          <div className="sticky top-28 rounded-[32px] border border-white/55 bg-white/86 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Resumen</p>
                <h2 className="headline mt-2 text-2xl font-bold">Tu carrito</h2>
              </div>
              <div className="rounded-2xl bg-[var(--accent-soft)] px-4 py-2 text-sm font-bold text-[var(--accent)]">{units} items</div>
            </div>

            {!user && (
              <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Puedes explorar libremente. Para cerrar el pedido necesitas <Link to="/login" className="font-bold underline">iniciar sesion</Link>.
              </div>
            )}

            {cart.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-[var(--line)] px-5 py-10 text-center">
                <p className="font-semibold text-[var(--ink)]">Tu carrito esta vacio</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Agrega productos para ver aqui el resumen de compra.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-[var(--ink)]">{item.name}</h3>
                          <p className="mt-1 text-sm text-[var(--muted)]">{formatPrice(item.price)} c/u</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-600 transition hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-3 py-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-[var(--muted)]"><Minus size={16} /></button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[var(--muted)]"><Plus size={16} /></button>
                        </div>
                        <p className="font-bold text-[var(--ink)]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Datos para la entrega</p>
                  <div className="mt-4 grid gap-3">
                    <input
                      value={customerData.city}
                      onChange={(e) => setCustomerData((current) => ({ ...current, city: e.target.value }))}
                      placeholder="Ciudad"
                      className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                    />
                    <input
                      value={customerData.address}
                      onChange={(e) => setCustomerData((current) => ({ ...current, address: e.target.value }))}
                      placeholder="Direccion o sector"
                      className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                    />
                    <textarea
                      value={customerData.notes}
                      onChange={(e) => setCustomerData((current) => ({ ...current, notes: e.target.value }))}
                      placeholder="Talla, color o detalle para confirmar por WhatsApp"
                      className="h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/50 p-5 text-[var(--ink)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 text-[var(--accent)]"><Building2 size={18} /></div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Pago por transferencia</p>
                      <p className="text-base font-bold">{TRANSFER_BANK}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm leading-6">
                    <p><strong>Titular:</strong> {TRANSFER_OWNER}</p>
                    <p><strong>Cuenta:</strong> {TRANSFER_ACCOUNT}</p>
                    <p>Cuando confirmes, te llevamos a WhatsApp para coordinar el comprobante y finalizar la venta.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] fashion-dark p-5 text-white">
                  <div className="flex items-center justify-between text-sm text-slate-300"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-300"><span>Metodo</span><span>Transferencia</span></div>
                  <div className="mt-5 flex items-center justify-between text-2xl font-extrabold"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>

                <button onClick={handleCheckout} disabled={checkoutState.loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-4 font-bold text-white transition hover:bg-[#db2d6a] disabled:cursor-not-allowed disabled:opacity-70">
                  <MessageCircle size={18} />
                  {checkoutState.loading ? 'Procesando pedido...' : user ? 'Finalizar por WhatsApp' : 'Inicia sesion para comprar'}
                </button>
              </>
            )}
          </div>
        </aside>
      </section>
    </main>
  )
}
