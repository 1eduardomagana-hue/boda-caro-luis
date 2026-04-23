import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, Btn, Input, Spinner, PageHeader, ProgressBar } from '../components/UI.jsx'
import { getGuests, upsertGuest } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'

const C = COLORS

function GuestForm({ project, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    group_name: '', total_count: '', confirmed_count: '', notes: '', ...initial,
    total_count: initial.total_count ?? '',
    confirmed_count: initial.confirmed_count ?? '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.group_name.trim()) return
    setSaving(true)
    await upsertGuest({
      ...form, project_id: project.id,
      total_count: Number(form.total_count) || 0,
      confirmed_count: Number(form.confirmed_count) || 0,
    })
    setSaving(false); onSave()
  }

  return (
    <Card style={{ borderTop: `3px solid ${C.champagne}` }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 500, color: C.darkTaupe, marginBottom: 14 }}>
        {initial.id ? 'Editar grupo' : 'Nuevo grupo de invitados'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input value={form.group_name} onChange={v => set('group_name', v)} placeholder="Nombre del grupo *" />
        <div className="grid-3">
          <Input value={String(form.total_count)} onChange={v => set('total_count', v)} placeholder="Total invitados" type="number" />
          <Input value={String(form.confirmed_count)} onChange={v => set('confirmed_count', v)} placeholder="Confirmados" type="number" />
          <Input value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Notas" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          <Btn ghost onClick={onCancel}>Cancelar</Btn>
        </div>
      </div>
    </Card>
  )
}

export default function Invitados({ project }) {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => getGuests(project.id).then(g => { setGuests(g); setLoading(false) })
  useEffect(() => { load() }, [project.id])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este grupo?')) return
    await supabase.from('guests').delete().eq('id', id)
    load()
  }

  if (loading) return <Spinner />

  const total = guests.reduce((a, g) => a + g.total_count, 0)
  const confirmed = guests.reduce((a, g) => a + g.confirmed_count, 0)

  return (
    <div>
      <PageHeader title="Invitados" subtitle="Control de grupos y confirmaciones de asistencia" />
      <div className="section-gap">
        <div className="grid-3">
          {[['Total', total, ''], ['Confirmados', confirmed, `${Math.round((confirmed / (total || 1)) * 100)}%`], ['Pendientes', total - confirmed, 'sin confirmar']].map(([l, v, s]) => (
            <div className="stat-card" key={l}>
              <div className="stat-label">{l}</div>
              <div className="stat-value">{v}</div>
              <div className="stat-sub">{s}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => { setAdding(true); setEditing(null) }}>+ Agregar grupo</Btn>
        </div>

        {adding && !editing && (
          <GuestForm project={project} onSave={() => { setAdding(false); load() }} onCancel={() => setAdding(false)} />
        )}
        {editing && (
          <GuestForm project={project} initial={editing}
            onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
        )}

        <Card>
          <CardTitle>Grupos de invitados</CardTitle>
          <div style={{ marginBottom: 16 }}><ProgressBar value={confirmed} max={total || 1} /></div>
          {guests.length === 0 && (
            <div style={{ fontSize: 13, color: C.textLight }}>Sin grupos registrados.</div>
          )}
          {guests.map(g => (
            <div key={g.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.beige}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.darkTaupe }}>{g.group_name}</div>
                  {g.notes && <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{g.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.textLight }}>{g.confirmed_count}/{g.total_count}</span>
                  <button onClick={() => { setEditing(g); setAdding(false) }}
                    style={{ background: 'none', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '3px 10px',
                      fontSize: 11, color: C.warmGray, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.champagne }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.sand }}>
                    ✎ Editar
                  </button>
                  <button onClick={() => handleDelete(g.id)}
                    style={{ background: 'none', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '3px 10px',
                      fontSize: 11, color: C.taupe, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.color = C.taupe }}>
                    ✕
                  </button>
                </div>
              </div>
              <ProgressBar value={g.confirmed_count} max={g.total_count || 1} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
