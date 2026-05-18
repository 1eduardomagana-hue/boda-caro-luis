import { useState, useEffect } from 'react'
import { getChecklist, toggleChecklistItem, upsertChecklistItem } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'
import { Spinner, PageHeader, CheckRow, ProgressBar, SectionRow, EmptyState, Inp } from '../components/UI.jsx'

export default function ChecklistPage({ project, categorySlug, title, subtitle, meta }) {
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(true)
  const [adding,setAdding] = useState(false)
  const [newText,setNewText] = useState('')

  const load=()=>getChecklist(project.id,categorySlug).then(d=>{setItems(d);setLoading(false)})
  useEffect(()=>{load()},[project.id,categorySlug])

  const toggle=async(item)=>{await toggleChecklistItem(item.id,!item.done);load()}
  const add=async()=>{if(!newText.trim())return;await upsertChecklistItem({project_id:project.id,category_slug:categorySlug,text:newText.trim(),done:false,priority:'media',sort_order:items.length});setNewText('');setAdding(false);load()}
  const del=async(id)=>{await supabase.from('checklist_items').delete().eq('id',id);load()}

  if(loading)return<Spinner/>
  const done=items.filter(i=>i.done).length

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setAdding(a=>!a)}>+</button>}/>
      <div className="scroll-area">
        {meta && (
          <div className="card">
            <div className="card-pad">
              {meta.map(([k,v])=>(
                <div key={k} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:'1px solid rgba(196,175,160,.12)'}}>
                  <span style={{fontSize:11,color:'#C4AFA0',minWidth:90,paddingTop:1,textTransform:'uppercase',letterSpacing:'1px'}}>{k}</span>
                  <span style={{fontSize:13,color:'#3D2E27'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionRow label={`Checklist · ${done}/${items.length}`}/>
          <ProgressBar value={done} max={items.length||1} style={{marginBottom:12}}/>

          {adding && (
            <div className="card" style={{marginBottom:10}}>
              <div className="card-pad">
                <div style={{display:'flex',gap:8}}>
                  <Inp value={newText} onChange={setNewText} placeholder="Nueva tarea…" style={{flex:1}}/>
                  <button className="btn" onClick={add} style={{width:'auto',padding:'13px 16px'}}>OK</button>
                </div>
              </div>
            </div>
          )}

          {items.length===0
            ? <EmptyState icon="✓" title="Sin tareas" sub="Agrega la primera tarea de esta sección." action="+ Agregar" onAction={()=>setAdding(true)}/>
            : (
              <div className="card" style={{overflow:'hidden'}}>
                {items.map(item=>(
                  <div key={item.id} style={{display:'flex',alignItems:'center',padding:'0 14px',borderBottom:'1px solid rgba(196,175,160,.1)'}}>
                    <div style={{flex:1}} onClick={()=>toggle(item)}>
                      <CheckRow item={item} onToggle={()=>toggle(item)}/>
                    </div>
                    <button onClick={()=>del(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14,padding:'0 4px',flexShrink:0}}>✕</button>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
