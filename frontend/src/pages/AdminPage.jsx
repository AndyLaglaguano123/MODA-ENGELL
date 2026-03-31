import React, { useEffect, useMemo, useState } from 'react'
import { Edit2, Eye, Package, ShieldCheck, ShoppingBag, Trash2, UserCircle2, Users } from 'lucide-react'
import { adminService, productService } from '../services/api'

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category: '', material: '', colors: '', sizes: '', sku: '' }

const money = (value) => `$${Number(value || 0).toFixed(2)}`
const dateText = (value) => value ? new Date(value).toLocaleString() : 'Sin fecha'

function resizeImage(file, maxSize = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1)
        const width = Math.round(image.width * ratio)
        const height = Math.round(image.height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('No se pudo procesar la imagen'))
          return
        }

        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }

      image.onerror = reject
      image.src = reader.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview')
  const [summary, setSummary] = useState({ metrics: {}, recent_users: [], top_products: [], recent_visits: [], recent_orders: [] })
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [imageError, setImageError] = useState('')

  const loadAll = async () => {
    setLoading(true)
    try {
      const [summaryRes, usersRes, productsRes, ordersRes] = await Promise.all([
        adminService.getSummary(),
        adminService.getUsers(),
        productService.getAll(),
        adminService.getOrders(),
      ])

      setSummary(summaryRes.data)
      setUsers(usersRes.data || [])
      setProducts(productsRes.data || [])
      setOrders(ordersRes.data || [])
    } catch (error) {
      console.error('Error cargando panel admin:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const metrics = useMemo(() => ([
    { label: 'Visitas registradas', value: summary.metrics?.total_visits || 0, icon: Users },
    { label: 'Clientes creados', value: summary.metrics?.total_customers || 0, icon: UserCircle2 },
    { label: 'Modelos activos', value: summary.metrics?.total_products || 0, icon: ShoppingBag },
    { label: 'Pedidos pendientes', value: summary.metrics?.pending_orders || 0, icon: Package },
  ]), [summary])

  const openCreateModal = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setImageError('')
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      image_url: product.image_url || '',
      category: product.category || '',
      material: product.material || '',
      colors: product.colors || '',
      sizes: product.sizes || '',
      sku: product.sku || '',
    })
    setImageError('')
    setShowModal(true)
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Selecciona un archivo de imagen valido.')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setImageError('La imagen debe pesar menos de 8 MB.')
      return
    }

    try {
      const dataUrl = await resizeImage(file)
      setFormData((current) => ({ ...current, image_url: dataUrl }))
      setImageError('')
    } catch (error) {
      setImageError('No se pudo cargar la imagen seleccionada.')
    }
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
      }

      if (editingId) {
        await productService.update(editingId, payload)
      } else {
        await productService.create(payload)
      }

      setShowModal(false)
      setFormData(emptyForm)
      setEditingId(null)
      setImageError('')
      await loadAll()
    } catch (error) {
      alert(error.response?.data?.message || 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Seguro que deseas eliminar este producto?')) return

    try {
      await productService.delete(id)
      await loadAll()
    } catch (error) {
      alert(error.response?.data?.message || 'No se pudo eliminar el producto')
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await adminService.updateRole(userId, role)
      await loadAll()
    } catch (error) {
      alert(error.response?.data?.message || 'No se pudo actualizar el rol')
    }
  }

  const handleOrderUpdate = async (orderId, status, paymentStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { status, payment_status: paymentStatus })
      await loadAll()
    } catch (error) {
      alert(error.response?.data?.message || 'No se pudo actualizar el pedido')
    }
  }

  if (loading) {
    return <div className="section-shell px-1 py-24 text-center text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Cargando panel administrativo</div>
  }

  return (
    <main className="pb-20 pt-4">
      <section className="section-shell px-1">
        <div className="rounded-[36px] bg-white/82 p-6 shadow-[0_24px_60px_rgba(34,24,33,0.08)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Administracion completa</p>
              <h1 className="headline mt-3 text-4xl font-bold text-[var(--ink)]">Panel de Moda Engell</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                Desde aqui controlas clientes registrados, visitas a la pagina, productos mas vistos, roles, inventario y pedidos pagados por transferencia.
              </p>
            </div>
            <div className="rounded-[28px] fashion-dark px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Facturacion total</p>
              <p className="mt-2 text-3xl font-extrabold">{money(summary.metrics?.revenue || 0)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { id: 'overview', label: 'Resumen' },
              { id: 'users', label: 'Usuarios' },
              { id: 'products', label: 'Productos' },
              { id: 'orders', label: 'Pedidos' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${tab === item.id ? 'bg-[var(--ink)] text-white' : 'border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {tab === 'overview' && (
        <section className="section-shell grid gap-6 px-1 py-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.label} className="rounded-[28px] border border-white/60 bg-white/84 p-5 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--muted)]">{item.label}</p>
                      <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><Icon size={18} /></div>
                    </div>
                    <p className="mt-5 text-3xl font-extrabold text-[var(--ink)]">{item.value}</p>
                  </article>
                )
              })}
            </div>

            <div className="rounded-[30px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Modelos mas visitados</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Lo que mas miran tus clientas</h2>
              </div>
              <div className="mt-5 space-y-3">
                {summary.top_products?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4">
                    <div>
                      <p className="font-bold text-[var(--ink)]">{product.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{product.category || 'Moda mujer'} • {money(product.price)} • stock {product.stock}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                      <Eye size={16} />
                      {product.views_count} vistas
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Clientes nuevos</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Usuarios registrados</h2>
              <div className="mt-5 space-y-3">
                {summary.recent_users?.map((entry) => (
                  <div key={entry.id} className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4">
                    <p className="font-bold text-[var(--ink)]">{entry.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{entry.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{entry.role} • {dateText(entry.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Actividad reciente</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Entradas a la pagina</h2>
              <div className="mt-5 space-y-3">
                {summary.recent_visits?.map((visit) => (
                  <div key={visit.id} className="rounded-[22px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4">
                    <p className="font-bold text-[var(--ink)]">/{visit.page}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{visit.visitor_name || 'Visitante anonimo'} {visit.visitor_email ? `• ${visit.visitor_email}` : ''}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Sesion {visit.session_id} • {dateText(visit.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === 'users' && (
        <section className="section-shell px-1 py-6">
          <div className="rounded-[30px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)] overflow-auto">
            <h2 className="text-2xl font-bold text-[var(--ink)]">Usuarios creados</h2>
            <table className="mt-6 min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                  <th className="pb-3 pr-4">Nombre</th>
                  <th className="pb-3 pr-4">Correo</th>
                  <th className="pb-3 pr-4">Rol</th>
                  <th className="pb-3">Registro</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--line)] align-top">
                    <td className="py-4 pr-4 font-semibold text-[var(--ink)]">{entry.name}</td>
                    <td className="py-4 pr-4 text-[var(--muted)]">{entry.email}</td>
                    <td className="py-4 pr-4">
                      <select
                        value={entry.role}
                        onChange={(event) => handleRoleChange(entry.id, event.target.value)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2"
                      >
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-4 text-[var(--muted)]">{dateText(entry.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'products' && (
        <section className="section-shell px-1 py-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ink)]">Catalogo administrable</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Agrega o corrige los modelos que vas a vender.</p>
            </div>
            <button onClick={openCreateModal} className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]">
              Nuevo producto
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-[28px] border border-white/60 bg-white/84 p-5 shadow-[0_18px_48px_rgba(34,24,33,0.08)]">
                <div className="rounded-[24px] bg-[linear-gradient(180deg,#f4bfd0,#fff1f6)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Moda Engell</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{product.category || 'Moda mujer'}</p>
                  <h3 className="mt-3 text-xl font-bold text-[var(--ink)]">{product.name}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{product.description}</p>
                  {product.image_url ? <p className="mt-3 truncate text-xs text-[var(--muted)]">Imagen cargada</p> : null}
                </div>
                <div className="mt-4 space-y-1 text-sm text-[var(--muted)]">
                  <p>{money(product.price)} • Stock {product.stock} • {Number(product.views_count || 0)} vistas</p>
                  <p>Material: {product.material || 'Tela premium'}</p>
                  <p>Tallas: {product.sizes || 'S, M, L'} • Colores: {product.colors || 'Negro, Rosado'}</p>
                </div>
                <div className="mt-5 flex gap-3">
                  <button onClick={() => openEditModal(product)} className="flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-3 font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    <Edit2 size={16} className="inline mr-2" />
                    Editar
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 rounded-full border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-100">
                    <Trash2 size={16} className="inline mr-2" />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'orders' && (
        <section className="section-shell px-1 py-6">
          <div className="rounded-[30px] border border-white/60 bg-white/84 p-6 shadow-[0_18px_48px_rgba(34,24,33,0.08)] overflow-auto">
            <h2 className="text-2xl font-bold text-[var(--ink)]">Pedidos por transferencia</h2>
            <table className="mt-6 min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                  <th className="pb-3 pr-4">Pedido</th>
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Pago</th>
                  <th className="pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--line)] align-top">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-[var(--ink)]">#{order.id}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{order.payment_method}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-[var(--ink)]">{order.customer_name}</p>
                      <p className="mt-1 text-[var(--muted)]">{order.customer_email}</p>
                    </td>
                    <td className="py-4 pr-4 font-semibold text-[var(--ink)]">{money(order.total_amount)}</td>
                    <td className="py-4 pr-4">
                      <select
                        value={order.status}
                        onChange={(event) => handleOrderUpdate(order.id, event.target.value, order.payment_status)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={order.payment_status || 'pending'}
                        onChange={(event) => handleOrderUpdate(order.id, order.status, event.target.value)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                      </select>
                    </td>
                    <td className="py-4 text-[var(--muted)]">{dateText(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-5 shadow-[0_18px_48px_rgba(34,24,33,0.18)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Producto</p>
                <h3 className="mt-2 text-2xl font-bold text-[var(--ink)]">{editingId ? 'Editar modelo' : 'Nuevo modelo'}</h3>
              </div>
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]"><ShieldCheck size={18} /></div>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4">
              <input
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre del producto"
                className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                required
              />
              <textarea
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="Descripcion comercial"
                className="h-28 w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Precio"
                  className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  required
                />
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(event) => setFormData((current) => ({ ...current, stock: event.target.value }))}
                  placeholder="Stock"
                  className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">Imagen de la prenda</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Puedes subir una foto desde tu computadora o pegar una URL.</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                    />
                    <input
                      value={formData.image_url}
                      onChange={(event) => setFormData((current) => ({ ...current, image_url: event.target.value }))}
                      placeholder="O pega aqui la URL de la imagen"
                      className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                    />
                    {imageError ? <p className="text-sm text-red-600">{imageError}</p> : null}
                  </div>
                  <div className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-white">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Vista previa" className="h-44 w-full object-cover" />
                    ) : (
                      <div className="flex h-44 items-center justify-center px-4 text-center text-sm text-[var(--muted)]">Vista previa de la prenda</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={formData.category}
                  onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Categoria"
                  className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
                <input
                  value={formData.material}
                  onChange={(event) => setFormData((current) => ({ ...current, material: event.target.value }))}
                  placeholder="Material"
                  className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={formData.colors}
                  onChange={(event) => setFormData((current) => ({ ...current, colors: event.target.value }))}
                  placeholder="Colores: Negro, Rosado"
                  className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
                <input
                  value={formData.sizes}
                  onChange={(event) => setFormData((current) => ({ ...current, sizes: event.target.value }))}
                  placeholder="Tallas: S, M, L"
                  className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </div>
              <input
                value={formData.sku}
                onChange={(event) => setFormData((current) => ({ ...current, sku: event.target.value }))}
                placeholder="SKU"
                className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              />
              <div className="sticky bottom-0 flex gap-3 rounded-[24px] bg-white/96 pt-2 backdrop-blur">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-[var(--line)] bg-white px-5 py-3 font-semibold text-[var(--ink)]">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-full bg-[var(--ink)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-70">
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
