import { useState, useEffect } from 'react'
import { getChecklist, toggleChecklistItem, upsertChecklistItem } from '../lib/db.js'
import { Spinner, CheckRow, PageHeader, SectionHeader, Card, EmptyState, Input, Btn } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'

const CATS = [
  { slug:'civil', label:'Boda Civil', icon:'📜' },
  { slug:'misa', label:'Misa', icon:'⛪' },
  { slug:'logistica', label:'Logística', icon:'🗺️' },
  { slug:'proveedores', label:'Proveedores', icon:'💳' },
  { slug:'general', label:'General', icon:'✓' },
]

export default function Pendientes({ project }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'pending' | cat
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [newCat, setNewCat] = useState('general')

  const load = () => getChecklist(project.id, null).then(d=>{setItems(d);setLoading(false)})
  useEffect(()=>{load()},[project.id])

  const toggle = async (item) => {
    await toggleChecklistItem(item.id, !item.done); load()
  }
  const addItem = async () => {
    if (!newText.trim()) return
    await upsertChecklistItem({project_id:project.id,category_slug:newCat,text:newText.trim(),done:false,priority:'media',sort_order:items.length})
    setNewText(''); setAdding(false); load()
  }
  const deleteItem = async (id) => {
    await supabase.from('checklist_items').delete().eq('id',id); load()
  }

  if (loading) return <Spinner message="Cargando pendientes…"/>

  // Filter
  const visible = items.filter(i => {
    if (filter === 'pending') return !i.done
    if (filter === 'all') return true
    return i.category_slug === filter
  })
  const pendingCount = items.filter(i=>!i.done).length
  const doneCount = items.filter(i=>i.done).length

  return (
    <div>
      <PageHeader
        title="Pendientes"
        subtitle={`${pendingCount} por hacer · ${doneCount} completados`}
        right={
          <button onClick={()=>setAdding(a=>!a)} className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}}>+</button>
        }
      />
      <div className="scroll-area">

        {/* Add form */}
        {adding && (
          <div className="card">
            <div className="card-pad">
              <div className="form-stack">
                <Input value={newText} onChange={setNewText} placeholder="¿Qué hay que hacer?" />
                <div className="grid-2-mob">
                  <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="input-field" style={{height:'auto'}}>
                    {CATS.map(c=><option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
                  </select>
                  <Btn onClick={addItem}>Guardar</Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
          {[{id:'all',label:'Todo'},{id:'pending',label:'Pendiente'},...CATS.map(c=>({id:c.slug,label:c.label}))].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{
              padding:'7px 14px', borderRadius:99, fontSize:12, cursor:'pointer',
              border:`1px solid ${filter===f.id?'#B8975A':'rgba(196,175,160,.35)'}`,
              background:filter===f.id?'#5C4D44':'white',
              color:filter===f.id?'#D4B896':'#8B7D72',
              fontFamily:"'Jost',sans-serif", whiteSpace:'nowrap', flexShrink:0,
              transition:'all .15s', touchAction:'manipulation',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Group by category */}
        {visible.length === 0 ? (
          <EmptyState icon="🎉" title={filter==='pending'?"Todo al día":"Sin items"} sub={filter==='pending'?"No hay pendientes en esta categoría.":"Agrega tu primera tarea."}/>
        ) : (
          CATS.filter(c => filter==='all' || filter==='pending' || filter===c.slug).map(cat => {
            const catItems = visible.filter(i=>i.category_slug===cat.slug)
            if (!catItems.length) return null
            return (
              <div key={cat.slug}>
                <SectionHeader label={`${cat.icon} ${cat.label}`}/>
                <div className="card" style={{overflow:'hidden'}}>
                  {catItems.map(item=>(
                    <div key={item.id} style={{display:'flex',alignItems:'center',borderBottom:'1px solid rgba(196,175,160,.1)',padding:'0 14px'}}>
                      <div style={{flex:1}} onClick={()=>toggle(item)}>
                        <CheckRow item={item} onToggle={()=>toggle(item)}/>
                      </div>
                      <button onClick={()=>deleteItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14,padding:'0 4px',flexShrink:0}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}

        {/* General items (no cat match) */}
        {(() => {
          const general = visible.filter(i => !CATS.find(c=>c.slug===i.category_slug))
          if (!general.length) return null
          return (
            <div>
              <SectionHeader label="✓ General"/>
              <div className="card" style={{overflow:'hidden'}}>
                {general.map(item=>(
                  <div key={item.id} style={{display:'flex',alignItems:'center',borderBottom:'1px solid rgba(196,175,160,.1)',padding:'0 14px'}}>
                    <div style={{flex:1}}><CheckRow item={item} onToggle={()=>toggle(item)}/></div>
                    <button onClick={()=>deleteItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14,padding:'0 4px'}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
