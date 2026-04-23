import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, Btn, Input, Select, Spinner, PageHeader } from '../components/UI.jsx'
import { getEvents, upsertEvent } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'

const C = COLORS
const TIPOS = ['civil','misa','recepcion','preboda','ensayo','despedida','brunch','otro']
const STATUS_OPTS = ['upcoming','past','key']

function EventForm({ project, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', event_date: '', venue: '',
    description: '', event_type: 'otro', status: 'upcoming', is_urgent: false,
    ...initial,
    event_time: initial.event_time ? String(initial.event_time).slice(0,5) : '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await upsertEvent({ ...form, project_id: project.id })
    setSaving(false)
    onSave()
  }

  return (
    <Card style={{ borderTop: `3px solid ${C.champagne}` }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 500, color: C.darkTaupe, marginBottom: 14 }}>
        {initial.id ? 'Editar evento' : 'Nuevo evento'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input value={form.title} onChange={v => set('title', v)} placeholder="Nombre del evento *" />
        <div className="grid-3">
          <Input value={form.event_date} onChange={v => set('event_date', v)} placeholder="Fecha" type="date" />
          <Input value={form.event_time} onChange={v => set('event_time', v)} placeholder="Hora" type="time" />
          <Select value={form.event_type} onChange={v => set('event_type', v)} options={TIPOS} />
        </div>
        <Input value={form.venue} onChange={v => set('venue', v)} placeholder="Lugar" />
        <Input value={form.description} onChange={v => set('description', v)} placeholder="Descripción" rows={2} />
        <div className="grid-2">
          <Select value={form.status} onChange={v => set('status', v)}
            options={[{value:'upcoming',label:'Próximo'},{value:'past',label:'Completado'},{value:'key',label:'Día especial'}]} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_urgent} onChange={e => set('is_urgent', e.target.checked)}
              style={{ accentColor: C.red }} />
            Marcar como urgente
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          <Btn ghost onClick={onCancel}>Cancelar</Btn>
        </div>
      </div>
    </Card>
  )
}

export default function Timeline({ project }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => getEvents(project.id).then(e => { setEvents(e); setLoading(false) })
  useEffect(() => { load() }, [project.id])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return
    await supabase.from('events').delete().eq('id', id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Timeline general" subtitle="Hitos cronológicos de la planeación" />
      <div className="section-gap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => { setAdding(true); setEditing(null) }}>+ Agregar evento</Btn>
        </div>

        {adding && !editing && (
          <EventForm project={project} onSave={() => { setAdding(false); load() }} onCancel={() => setAdding(false)} />
        )}
        {editing && (
          <EventForm project={project} initial={editing}
            onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
        )}

        <Card>
          {events.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: C.textLight }}>
              Sin eventos registrados. Agrega el primero arriba.
            </div>
          )}
          {events.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', gap: 16, paddingBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`timeline-dot ${e.status === 'past' ? 'past' : ''} ${e.is_urgent ? 'urgent' : ''}`} />
                {i < events.length - 1 && <div className="timeline-connector" />}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.taupe }}>
                  {e.event_date ? new Date(e.event_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha por definir'}
                  {e.event_time ? ` · ${e.event_time.slice(0,5)}h` : ''}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, margin: '2px 0 4px',
                  color: e.status === 'key' ? C.gold : e.is_urgent ? C.red : C.darkTaupe }}>
                  {e.title}
                </div>
                {e.description && <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.5 }}>{e.description}</div>}
                {e.venue && <div style={{ fontSize: 11, color: C.taupe, marginTop: 2 }}>{e.venue}</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {e.status === 'past' && <span className="badge badge-gray">Completado</span>}
                  {e.status === 'key' && <span className="badge badge-amber">Día especial</span>}
                  {e.is_urgent && <span className="badge badge-red">Urgente</span>}
                  <button onClick={() => { setEditing(e); setAdding(false) }}
                    style={{ background: 'none', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '2px 10px',
                      fontSize: 11, color: C.warmGray, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e2 => { e2.currentTarget.style.borderColor = C.champagne; e2.currentTarget.style.color = C.darkTaupe }}
                    onMouseLeave={e2 => { e2.currentTarget.style.borderColor = C.sand; e2.currentTarget.style.color = C.warmGray }}>
                    ✎ Editar
                  </button>
                  <button onClick={() => handleDelete(e.id)}
                    style={{ background: 'none', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '2px 10px',
                      fontSize: 11, color: C.taupe, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e2 => { e2.currentTarget.style.borderColor = C.red; e2.currentTarget.style.color = C.red }}
                    onMouseLeave={e2 => { e2.currentTarget.style.borderColor = C.sand; e2.currentTarget.style.color = C.taupe }}>
                    ✕ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
