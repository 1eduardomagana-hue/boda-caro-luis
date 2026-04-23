import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, Btn, Input, Select, Spinner, PageHeader } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'

const C = COLORS

// ─── LOGÍSTICA ───────────────────────────────────────────────────────────────
function LogisticaRow({ item, onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: `1px solid ${C.beige}`, alignItems: 'flex-start' }}>
      <span style={{ minWidth: 52, fontSize: 12, fontWeight: 600, color: C.gold, flexShrink: 0 }}>{item.hora || '—'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.darkTaupe }}>{item.actividad}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
          {item.responsable && <span style={{ fontSize: 11, color: C.textLight }}>{item.responsable}</span>}
          {item.lugar && <span style={{ fontSize: 11, color: C.taupe }}>· {item.lugar}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={() => onEdit(item)} style={btnStyle(C.sand, C.warmGray)}>✎</button>
        <button onClick={() => onDelete(item.id)} style={btnStyle(C.sand, C.taupe, C.red)}>✕</button>
      </div>
    </div>
  )
}

function btnStyle(border, color, hoverColor) {
  return {
    background: 'none', border: `1px solid ${border}`, borderRadius: 6,
    padding: '3px 9px', fontSize: 11, color, cursor: 'pointer',
  }
}

function LogisticaForm({ projectId, initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({ hora: '', actividad: '', responsable: '', lugar: '', ...initial })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.actividad.trim()) return
    setSaving(true)
    await supabase.from('checklist_items').upsert({
      ...form.id ? { id: form.id } : {},
      project_id: projectId, category_slug: 'logistica',
      text: form.actividad, done: false, priority: 'media',
      // Store extra fields in metadata via text format: "hora|responsable|lugar|actividad"
      // We'll use the notes pattern: store as JSON in text field
      text: `${form.hora}|||${form.responsable}|||${form.lugar}|||${form.actividad}`,
    })
    setSaving(false); onSave()
  }
  return (
    <Card style={{ borderTop: `3px solid ${C.champagne}`, marginBottom: 12 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: C.darkTaupe, marginBottom: 12 }}>
        {initial.id ? 'Editar actividad' : 'Nueva actividad'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="grid-2">
          <Input value={form.hora} onChange={v => set('hora', v)} placeholder="Hora (ej: 16:00)" />
          <Input value={form.actividad} onChange={v => set('actividad', v)} placeholder="Actividad *" />
        </div>
        <div className="grid-2">
          <Input value={form.responsable} onChange={v => set('responsable', v)} placeholder="Responsable" />
          <Input value={form.lugar} onChange={v => set('lugar', v)} placeholder="Lugar" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
          <Btn ghost onClick={onCancel}>Cancelar</Btn>
        </div>
      </div>
    </Card>
  )
}

function Logistica({ project }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('checklist_items')
      .select('*').eq('project_id', project.id).eq('category_slug', 'logistica').order('text')
    // Parse the stored format: "hora|||responsable|||lugar|||actividad"
    const parsed = (data || []).map(d => {
      const parts = (d.text || '').split('|||')
      return { id: d.id, hora: parts[0] || '', responsable: parts[1] || '', lugar: parts[2] || '', actividad: parts[3] || d.text }
    }).sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
    setItems(parsed); setLoading(false)
  }
  useEffect(() => { load() }, [project.id])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return
    await supabase.from('checklist_items').delete().eq('id', id); load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Logística del día" subtitle="Plan horario, traslados y responsables" />
      <div className="section-gap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => { setAdding(true); setEditing(null) }}>+ Agregar actividad</Btn>
        </div>
        {adding && !editing && <LogisticaForm projectId={project.id} onSave={() => { setAdding(false); load() }} onCancel={() => setAdding(false)} />}
        {editing && <LogisticaForm projectId={project.id} initial={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />}
        <Card>
          <CardTitle>Plan del día — 21 de noviembre 2026</CardTitle>
          {items.length === 0 && (
            <div style={{ fontSize: 13, color: C.textLight, padding: '12px 0' }}>
              Sin actividades. Agrega el plan horario del día de la boda.
            </div>
          )}
          {items.map(item => (
            <LogisticaRow key={item.id} item={item}
              onEdit={i => { setEditing(i); setAdding(false) }}
              onDelete={handleDelete} />
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─── FOTOS ───────────────────────────────────────────────────────────────────
function Fotos({ project }) {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)
  const [newShot, setNewShot] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const load = async () => {
    const { data } = await supabase.from('checklist_items')
      .select('*').eq('project_id', project.id).eq('category_slug', 'fotos').order('sort_order')
    setShots(data || []); setLoading(false)
  }
  useEffect(() => { load() }, [project.id])

  const addShot = async () => {
    if (!newShot.trim()) return
    await supabase.from('checklist_items').insert({
      project_id: project.id, category_slug: 'fotos',
      text: newShot.trim(), done: false, priority: 'media', sort_order: shots.length,
    })
    setNewShot(''); setAdding(false); load()
  }
  const saveEdit = async (id) => {
    if (!editText.trim()) return
    await supabase.from('checklist_items').update({ text: editText }).eq('id', id)
    setEditingId(null); load()
  }
  const toggleDone = async (item) => {
    await supabase.from('checklist_items').update({ done: !item.done }).eq('id', item.id); load()
  }
  const deleteShot = async (id) => {
    if (!window.confirm('¿Eliminar este shot?')) return
    await supabase.from('checklist_items').delete().eq('id', id); load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Fotos, sesiones y contenido" subtitle="Lista de shots obligatorios y sesiones fotográficas" />
      <div className="section-gap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => setAdding(a => !a)}>+ Agregar shot</Btn>
        </div>
        {adding && (
          <Card>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input value={newShot} onChange={setNewShot} placeholder="Descripción del shot..." />
              <Btn onClick={addShot}>OK</Btn>
              <Btn ghost onClick={() => setAdding(false)}>✕</Btn>
            </div>
          </Card>
        )}
        <Card>
          <CardTitle>Lista de shots — {shots.filter(s => s.done).length}/{shots.length} listos</CardTitle>
          {shots.length === 0 && (
            <div style={{ fontSize: 13, color: C.textLight }}>Sin shots registrados. Agrega la lista de tomas obligatorias.</div>
          )}
          {shots.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.beige}` }}>
              <div className={`check-box ${s.done ? 'done' : ''}`} onClick={() => toggleDone(s)} style={{ cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                {s.done && <span style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>✓</span>}
              </div>
              {editingId === s.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <Input value={editText} onChange={setEditText} style={{ height: 'auto', fontSize: 12, padding: '4px 8px' }} />
                  <Btn onClick={() => saveEdit(s.id)} style={{ padding: '4px 12px', fontSize: 11 }}>✓</Btn>
                  <Btn ghost onClick={() => setEditingId(null)} style={{ padding: '4px 8px', fontSize: 11 }}>✕</Btn>
                </div>
              ) : (
                <>
                  <span className={`check-text ${s.done ? 'done' : ''}`} style={{ flex: 1 }}>{s.text}</span>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setEditingId(s.id); setEditText(s.text) }}
                      style={{ background: 'none', border: `1px solid ${C.sand}`, borderRadius: 5, padding: '2px 8px', fontSize: 10, color: C.warmGray, cursor: 'pointer' }}>✎</button>
                    <button onClick={() => deleteShot(s.id)}
                      style={{ background: 'none', border: `1px solid ${C.sand}`, borderRadius: 5, padding: '2px 8px', fontSize: 10, color: C.taupe, cursor: 'pointer' }}>✕</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─── WEEK PLANNER ─────────────────────────────────────────────────────────────
const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function WeekPlanner({ project }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [form, setForm] = useState({ dia: 'Lunes', texto: '', prioridad: 'media' })

  const load = async () => {
    const { data } = await supabase.from('checklist_items')
      .select('*').eq('project_id', project.id).eq('category_slug', 'week').order('sort_order')
    setTasks(data || []); setLoading(false)
  }
  useEffect(() => { load() }, [project.id])

  const addTask = async () => {
    if (!form.texto.trim()) return
    await supabase.from('checklist_items').insert({
      project_id: project.id, category_slug: 'week',
      // dia stored in first part: "dia|||texto"
      text: `${form.dia}|||${form.texto}`,
      done: false, priority: form.prioridad, sort_order: tasks.length,
    })
    setForm({ dia: 'Lunes', texto: '', prioridad: 'media' }); setAdding(false); load()
  }
  const saveEdit = async (id) => {
    if (!editText.trim()) return
    const task = tasks.find(t => t.id === id)
    const parts = (task.text || '').split('|||')
    await supabase.from('checklist_items').update({ text: `${parts[0]}|||${editText}` }).eq('id', id)
    setEditingId(null); load()
  }
  const deleteTask = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    await supabase.from('checklist_items').delete().eq('id', id); load()
  }
  const toggleDone = async (item) => {
    await supabase.from('checklist_items').update({ done: !item.done }).eq('id', item.id); load()
  }

  const parseTask = t => {
    const parts = (t.text || '').split('|||')
    return { ...t, dia: parts[0] || 'Lunes', texto: parts[1] || t.text }
  }
  const parsed = tasks.map(parseTask)

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Week Planner" subtitle="Semana del 16 al 22 de noviembre de 2026" />
      <div className="section-gap">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={() => setAdding(a => !a)}>+ Agregar tarea</Btn>
        </div>
        {adding && (
          <Card style={{ borderTop: `3px solid ${C.champagne}` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="grid-3">
                <Select value={form.dia} onChange={v => setForm(f => ({ ...f, dia: v }))} options={DIAS} />
                <Input value={form.texto} onChange={v => setForm(f => ({ ...f, texto: v }))} placeholder="Tarea *" />
                <Select value={form.prioridad} onChange={v => setForm(f => ({ ...f, prioridad: v }))} options={['alta','media','baja']} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn onClick={addTask}>Guardar</Btn>
                <Btn ghost onClick={() => setAdding(false)}>Cancelar</Btn>
              </div>
            </div>
          </Card>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {DIAS.map(dia => {
            const dayTasks = parsed.filter(t => t.dia === dia)
            return (
              <div key={dia} style={{ background: C.white, borderRadius: 10, padding: '12px 10px', border: `1px solid ${C.sand}`, minHeight: 120 }}>
                <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.taupe, marginBottom: 4 }}>{dia.slice(0,3)}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: C.darkTaupe, fontWeight: 500, marginBottom: 8 }}>{dia}</div>
                <div style={{ height: 1, background: C.sand, marginBottom: 8 }} />
                {dayTasks.map(t => (
                  <div key={t.id} style={{ marginBottom: 6 }}>
                    {editingId === t.id ? (
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        <Input value={editText} onChange={setEditText} style={{ height: 'auto', fontSize: 11, padding: '2px 6px' }} />
                        <button onClick={() => saveEdit(t.id)} style={{ fontSize: 10, border: 'none', background: C.champagne, borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>✓</button>
                        <button onClick={() => setEditingId(null)} style={{ fontSize: 10, border: `1px solid ${C.sand}`, background: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                        <div className={`check-box ${t.done ? 'done' : ''}`} onClick={() => toggleDone(t)}
                          style={{ cursor: 'pointer', width: 13, height: 13, flexShrink: 0, marginTop: 2 }}>
                          {t.done && <span style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 11, color: t.done ? C.taupe : C.text, textDecoration: t.done ? 'line-through' : 'none', flex: 1, lineHeight: 1.4 }}>{t.texto}</span>
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button onClick={() => { setEditingId(t.id); setEditText(t.texto) }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: C.taupe, padding: 1 }}>✎</button>
                          <button onClick={() => deleteTask(t.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: C.taupe, padding: 1 }}>✕</button>
                        </div>
                      </div>
                    )}
                    {t.priority === 'alta' && !t.done && (
                      <span style={{ fontSize: 9, color: C.red, marginLeft: 18 }}>● urgente</span>
                    )}
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <div style={{ fontSize: 10, color: C.taupe, fontStyle: 'italic' }}>Sin tareas</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────
export default function PlaceholderPage({ pageId, project }) {
  if (pageId === 'logistica') return <Logistica project={project} />
  if (pageId === 'fotos') return <Fotos project={project} />
  if (pageId === 'week') return <WeekPlanner project={project} />

  const titles = {
    eventos: 'Eventos especiales',
    categorias: 'Categorías personalizadas',
  }

  return (
    <div>
      <PageHeader title={titles[pageId] || pageId} />
      <div style={{ background: C.white, borderRadius: 12, border: `2px dashed ${C.sand}`, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: C.darkTaupe, marginBottom: 8 }}>Sección disponible</div>
        <div style={{ fontSize: 13, color: C.textLight, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
          Usa <strong>Importar IA</strong> para agregar contenido, o <strong>Notas maestras</strong> para pegar información directamente desde Apple Notes.
        </div>
      </div>
    </div>
  )
}
