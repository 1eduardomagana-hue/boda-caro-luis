import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, CheckItem, Btn, Input, ProgressBar, Spinner, PageHeader } from '../components/UI.jsx'
import { getChecklist, toggleChecklistItem, upsertChecklistItem } from '../lib/db.js'

const C = COLORS

export default function ChecklistPage({ project, categorySlug, title, subtitle, meta }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)

  const load = () => getChecklist(project.id, categorySlug).then(d => { setItems(d); setLoading(false) })
  useEffect(() => { load() }, [project.id, categorySlug])

  const toggle = async (item) => {
    await toggleChecklistItem(item.id, !item.done)
    load()
  }
  const addItem = async () => {
    if (!newText.trim()) return
    await upsertChecklistItem({ project_id: project.id, category_slug: categorySlug, text: newText.trim(), done: false, priority: 'media', sort_order: items.length })
    setNewText(''); setAdding(false); load()
  }

  if (loading) return <Spinner />
  const done = items.filter(i => i.done).length

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="section-gap">
        {meta && (
          <Card>
            <CardTitle>Datos principales</CardTitle>
            {meta.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.beige}` }}>
                <span style={{ fontSize: 11, color: C.taupe, minWidth: 110, paddingTop: 1 }}>{k}</span>
                <span style={{ fontSize: 13, color: C.darkTaupe }}>{v}</span>
              </div>
            ))}
          </Card>
        )}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <CardTitle>Checklist — {done}/{items.length} completados</CardTitle>
            <Btn ghost onClick={() => setAdding(a => !a)}>+ Agregar</Btn>
          </div>
          <div style={{ marginBottom: 14 }}>
            <ProgressBar value={done} max={items.length || 1} />
          </div>
          {adding && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Input value={newText} onChange={setNewText} placeholder="Nueva tarea..." style={{ height: 'auto' }} />
              <Btn onClick={addItem}>OK</Btn>
              <Btn ghost onClick={() => setAdding(false)}>✕</Btn>
            </div>
          )}
          {items.map(item => (
            <CheckItem key={item.id} item={item} onToggle={() => toggle(item)} />
          ))}
          {items.length === 0 && <div style={{ fontSize: 13, color: C.textLight, padding: '8px 0' }}>Sin items. Agrega el primero arriba.</div>}
        </Card>
      </div>
    </div>
  )
}
