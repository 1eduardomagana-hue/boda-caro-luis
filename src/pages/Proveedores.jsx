import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, StatusBadge, Btn, Input, Select, Spinner, PageHeader } from '../components/UI.jsx'
import { getProviders, upsertProvider, deleteProvider } from '../lib/db.js'

const C = COLORS
const CATS = ['Fotografía','Video','Catering','Flores','Música','Salón','Vestido','Maquillaje','Transporte','Pastel','Invitaciones','Ceremonia','Otro']

function ProveedorForm({ project, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', category: 'Otro', contact: '', total_amount: '', paid_amount: '',
    payment_due: '', status: 'pendiente', notes: '', ...initial,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true)
    const { error: e } = await upsertProvider({
      ...form,
      project_id: project.id,
      total_amount: form.total_amount ? Number(form.total_amount) : null,
      paid_amount: form.paid_amount ? Number(form.paid_amount) : 0,
    })
    setSaving(false)
    if (e) { setError(e.message); return }
    onSave()
  }
  return (
    <Card style={{ borderTop: `3px solid ${C.champagne}` }}>
      <CardTitle>{initial.id ? 'Editar proveedor' : 'Nuevo proveedor'}</CardTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input value={form.name} onChange={v => set('name', v)} placeholder="Nombre del proveedor *" />
        <Select value={form.category} onChange={v => set('category', v)} options={CATS} />
        <Input value={form.contact} onChange={v => set('contact', v)} placeholder="Contacto / email / teléfono" />
        <div className="grid-3">
          <Input value={form.total_amount} onChange={v => set('total_amount', v)} placeholder="Total MXN" type="number" />
          <Input value={form.paid_amount} onChange={v => set('paid_amount', v)} placeholder="Pagado MXN" type="number" />
          <Input value={form.payment_due} onChange={v => set('payment_due', v)} placeholder="Fecha límite" type="date" />
        </div>
        <Select value={form.status} onChange={v => set('status', v)} options={['pendiente','parcial','pagado']} />
        <Input value={form.notes} onChange={v => set('notes', v)} placeholder="Notas adicionales..." rows={2} />
        {error && <div style={{ fontSize: 12, color: C.red, background: '#FAEAEA', padding: '7px 10px', borderRadius: 6 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          <Btn ghost onClick={onCancel}>Cancelar</Btn>
        </div>
      </div>
    </Card>
  )
}

export default function Proveedores({ project }) {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('todos')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => getProviders(project.id).then(p => { setProviders(p); setLoading(false) })
  useEffect(() => { load() }, [project.id])

  const filtered = tab === 'todos' ? providers : providers.filter(p => p.status === tab)
  const total = providers.reduce((a, p) => a + (p.total_amount || 0), 0)
  const paid = providers.reduce((a, p) => a + (p.paid_amount || 0), 0)
  const balance = providers.reduce((a, p) => a + (p.balance || 0), 0)

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return
    await deleteProvider(id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Proveedores y pagos" subtitle="Control financiero de todos los servicios contratados" />
      <div className="section-gap">
        <div className="grid-3">
          {[['Total presupuesto',`$${(total/1000).toFixed(0)}k`,`${providers.length} proveedores`],
            ['Pagado',`$${(paid/1000).toFixed(0)}k`,`${Math.round((paid/total)*100)||0}% del total`],
            ['Saldo pendiente',`$${(balance/1000).toFixed(0)}k`,`${providers.filter(p=>p.status!=='pagado').length} con saldo`]
          ].map(([l,v,s]) => (
            <div className="stat-card" key={l}>
              <div className="stat-label">{l}</div>
              <div className="stat-value">{v}</div>
              <div className="stat-sub">{s}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div />
          <Btn onClick={() => { setAdding(true); setEditing(null) }}>+ Agregar proveedor</Btn>
        </div>

        {(adding && !editing) && (
          <ProveedorForm project={project} onSave={() => { setAdding(false); load() }} onCancel={() => setAdding(false)} />
        )}
        {editing && (
          <ProveedorForm project={project} initial={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
        )}

        <Card>
          <div className="tabs">
            {[['todos','Todos'],['pagado','Pagados'],['parcial','Parcial'],['pendiente','Pendiente']].map(([v,l]) => (
              <div key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</div>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Proveedor</th><th>Categoría</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Vence</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: C.darkTaupe }}>{p.name}</div>
                      {p.contact && <div style={{ fontSize: 11, color: C.textLight }}>{p.contact.split('·')[0]}</div>}
                    </td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td style={{ fontWeight: 500 }}>${(p.total_amount||0).toLocaleString()}</td>
                    <td style={{ color: C.green }}>${(p.paid_amount||0).toLocaleString()}</td>
                    <td style={{ color: (p.balance||0) > 0 ? C.red : C.green, fontWeight: (p.balance||0) > 0 ? 600 : 400 }}>
                      ${(p.balance||0).toLocaleString()}
                    </td>
                    <td style={{ color: C.textLight, fontSize: 12 }}>{p.payment_due || '—'}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditing(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.taupe }}>✎</button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.taupe }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: C.textLight, fontSize: 13 }}>Sin proveedores en esta categoría.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
