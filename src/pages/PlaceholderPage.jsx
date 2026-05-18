import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Spinner, PageHeader, SectionRow, EmptyState, Inp, Sel } from '../components/UI.jsx'

// ── Logística ─────────────────────────────────────────────────────────────────
function Logistica({ project }) {
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(true)
  const [sheet,setSheet] = useState(null)
  const [form,setForm] = useState({hora:'',actividad:'',responsable:'',lugar:''})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const load=async()=>{const{data}=await supabase.from('checklist_items').select('*').eq('project_id',project.id).eq('category_slug','logistica').order('text');
    setItems((data||[]).map(d=>{const p=(d.text||'').split('|||');return{id:d.id,hora:p[0]||'',responsable:p[1]||'',lugar:p[2]||'',actividad:p[3]||d.text}}));setLoading(false)}
  useEffect(()=>{load()},[project.id])

  const save=async()=>{
    if(!form.actividad.trim())return
    const stored=`${form.hora}|||${form.responsable}|||${form.lugar}|||${form.actividad}`
    const payload={project_id:project.id,category_slug:'logistica',text:stored,done:false,priority:'media'}
    if(sheet?.id)await supabase.from('checklist_items').update({text:stored}).eq('id',sheet.id)
    else await supabase.from('checklist_items').insert(payload)
    setSheet(null);setForm({hora:'',actividad:'',responsable:'',lugar:''});load()
  }
  const del=async(id)=>{if(!window.confirm('¿Eliminar?'))return;await supabase.from('checklist_items').delete().eq('id',id);load()}
  const openEdit=(it)=>{setForm({hora:it.hora,actividad:it.actividad,responsable:it.responsable,lugar:it.lugar});setSheet(it)}

  if(loading)return<Spinner/>
  const sorted=[...items].sort((a,b)=>(a.hora||'').localeCompare(b.hora||''))

  return (
    <div>
      <PageHeader title="Logística" subtitle="Plan horario del gran día"
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>{setForm({hora:'',actividad:'',responsable:'',lugar:''});setSheet('new')}}>+</button>}/>
      <div className="scroll-area">
        {sheet && (
          <>
            <div className="sheet-overlay" onClick={()=>setSheet(null)}/>
            <div className="sheet">
              <div className="sheet-handle"/>
              <div className="sheet-title">{sheet==='new'?'Nueva actividad':'Editar actividad'}</div>
              <div className="form-stack">
                <div className="grid-2-mob">
                  <Inp value={form.hora} onChange={v=>set('hora',v)} placeholder="16:00" label="Hora"/>
                  <Inp value={form.actividad} onChange={v=>set('actividad',v)} placeholder="Actividad *" label="Actividad"/>
                </div>
                <div className="grid-2-mob">
                  <Inp value={form.responsable} onChange={v=>set('responsable',v)} placeholder="Responsable" label="Responsable"/>
                  <Inp value={form.lugar} onChange={v=>set('lugar',v)} placeholder="Lugar" label="Lugar"/>
                </div>
                <button className="btn" onClick={save}>Guardar</button>
                <button className="btn-ghost" onClick={()=>setSheet(null)}>Cancelar</button>
              </div>
            </div>
          </>
        )}
        {sorted.length===0
          ? <EmptyState icon="🗺️" title="Plan vacío" sub="Agrega las actividades del día de la boda con su horario." action="+ Agregar actividad" onAction={()=>{setForm({hora:'',actividad:'',responsable:'',lugar:''});setSheet('new')}}/>
          : (
            <div className="card" style={{overflow:'hidden'}}>
              {sorted.map(it=>(
                <div key={it.id} style={{display:'flex',gap:12,padding:'13px 16px',borderBottom:'1px solid rgba(196,175,160,.1)',alignItems:'flex-start'}}>
                  <span style={{minWidth:46,fontSize:12,fontWeight:700,color:'#B8975A',flexShrink:0,paddingTop:1}}>{it.hora||'—'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:'#3D2E27'}}>{it.actividad}</div>
                    {it.responsable&&<div style={{fontSize:11.5,color:'#8B7D72',marginTop:1}}>{it.responsable}</div>}
                    {it.lugar&&<div style={{fontSize:11,color:'#C4AFA0'}}>{it.lugar}</div>}
                  </div>
                  <div style={{display:'flex',gap:4,flexShrink:0}}>
                    <button onClick={()=>openEdit(it)} className="btn-icon" style={{width:30,height:30,fontSize:12}}>✎</button>
                    <button onClick={()=>del(it.id)} className="btn-icon" style={{width:30,height:30,fontSize:12,color:'#B85C5C'}}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ── Fotos ─────────────────────────────────────────────────────────────────────
function Fotos({ project }) {
  const [shots,setShots] = useState([])
  const [loading,setLoading] = useState(true)
  const [newShot,setNewShot] = useState('')
  const [adding,setAdding] = useState(false)
  const [editId,setEditId] = useState(null)
  const [editText,setEditText] = useState('')

  const load=async()=>{const{data}=await supabase.from('checklist_items').select('*').eq('project_id',project.id).eq('category_slug','fotos').order('sort_order');setShots(data||[]);setLoading(false)}
  useEffect(()=>{load()},[project.id])

  const add=async()=>{if(!newShot.trim())return;await supabase.from('checklist_items').insert({project_id:project.id,category_slug:'fotos',text:newShot.trim(),done:false,priority:'media',sort_order:shots.length});setNewShot('');setAdding(false);load()}
  const saveEdit=async(id)=>{if(!editText.trim())return;await supabase.from('checklist_items').update({text:editText}).eq('id',id);setEditId(null);load()}
  const toggle=async(item)=>{await supabase.from('checklist_items').update({done:!item.done}).eq('id',item.id);load()}
  const del=async(id)=>{if(!window.confirm('¿Eliminar?'))return;await supabase.from('checklist_items').delete().eq('id',id);load()}

  if(loading)return<Spinner/>
  const done=shots.filter(s=>s.done).length

  return (
    <div>
      <PageHeader title="Fotos" subtitle={`${done}/${shots.length} shots listos`}
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setAdding(a=>!a)}>+</button>}/>
      <div className="scroll-area">
        {adding && (
          <div className="card"><div className="card-pad">
            <div style={{display:'flex',gap:8}}>
              <Inp value={newShot} onChange={setNewShot} placeholder="Descripción del shot…"/>
              <button className="btn" onClick={add} style={{width:'auto',padding:'13px 16px'}}>OK</button>
            </div>
          </div></div>
        )}
        {shots.length===0 && !adding
          ? <EmptyState icon="📷" title="Sin shots" sub="Agrega tu lista de tomas obligatorias para el fotógrafo." action="+ Agregar shot" onAction={()=>setAdding(true)}/>
          : (
            <div className="card" style={{overflow:'hidden'}}>
              {shots.map(s=>(
                <div key={s.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 16px',borderBottom:'1px solid rgba(196,175,160,.1)'}}>
                  <div className={`check-box ${s.done?'done':''}`} onClick={()=>toggle(s)} style={{cursor:'pointer',marginTop:2,flexShrink:0}}>
                    {s.done&&<span style={{color:'white',fontSize:11,fontWeight:'bold'}}>✓</span>}
                  </div>
                  {editId===s.id
                    ? <div style={{flex:1,display:'flex',gap:6}}>
                        <Inp value={editText} onChange={setEditText} style={{flex:1}}/>
                        <button className="btn" onClick={()=>saveEdit(s.id)} style={{width:'auto',padding:'9px 12px',fontSize:12}}>✓</button>
                        <button className="btn-ghost" onClick={()=>setEditId(null)} style={{width:'auto',padding:'9px 10px',fontSize:12}}>✕</button>
                      </div>
                    : <>
                        <span className={`check-text ${s.done?'done':''}`} style={{flex:1}}>{s.text}</span>
                        <button onClick={()=>{setEditId(s.id);setEditText(s.text)}} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14,flexShrink:0}}>✎</button>
                        <button onClick={()=>del(s.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14,flexShrink:0}}>✕</button>
                      </>
                  }
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ── Week Planner ──────────────────────────────────────────────────────────────
const DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function WeekPlanner({ project }) {
  const [tasks,setTasks] = useState([])
  const [loading,setLoading] = useState(true)
  const [sheet,setSheet] = useState(false)
  const [form,setForm] = useState({dia:'Lunes',texto:'',prioridad:'media'})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const load=async()=>{const{data}=await supabase.from('checklist_items').select('*').eq('project_id',project.id).eq('category_slug','week').order('sort_order');setTasks(data||[]);setLoading(false)}
  useEffect(()=>{load()},[project.id])

  const add=async()=>{if(!form.texto.trim())return;await supabase.from('checklist_items').insert({project_id:project.id,category_slug:'week',text:`${form.dia}|||${form.texto}`,done:false,priority:form.prioridad,sort_order:tasks.length});setForm({dia:'Lunes',texto:'',prioridad:'media'});setSheet(false);load()}
  const toggle=async(item)=>{await supabase.from('checklist_items').update({done:!item.done}).eq('id',item.id);load()}
  const del=async(id)=>{if(!window.confirm('¿Eliminar?'))return;await supabase.from('checklist_items').delete().eq('id',id);load()}

  const parse=(t)=>{const p=(t.text||'').split('|||');return{...t,dia:p[0]||'Lunes',texto:p[1]||t.text}}
  const parsed=tasks.map(parse)

  if(loading)return<Spinner/>

  return (
    <div>
      <PageHeader title="Week Planner" subtitle="Semana de la boda"
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setSheet(true)}>+</button>}/>
      <div className="scroll-area">
        {sheet && (
          <>
            <div className="sheet-overlay" onClick={()=>setSheet(false)}/>
            <div className="sheet">
              <div className="sheet-handle"/>
              <div className="sheet-title">Nueva tarea</div>
              <div className="form-stack">
                <Sel value={form.dia} onChange={v=>set('dia',v)} options={DIAS} label="Día"/>
                <Inp value={form.texto} onChange={v=>set('texto',v)} placeholder="¿Qué hay que hacer? *" label="Tarea"/>
                <Sel value={form.prioridad} onChange={v=>set('prioridad',v)} options={['alta','media','baja']} label="Prioridad"/>
                <button className="btn" onClick={add}>Guardar</button>
                <button className="btn-ghost" onClick={()=>setSheet(false)}>Cancelar</button>
              </div>
            </div>
          </>
        )}
        {/* Horizontal scroll week view */}
        {parsed.length > 0 ? (
          <>
            <div className="week-scroll">
              {DIAS.map(dia=>{
                const dayTasks=parsed.filter(t=>t.dia===dia)
                return (
                  <div key={dia} className="week-day-card">
                    <div className="week-day-name">{dia.slice(0,3).toUpperCase()}</div>
                    <div className="week-day-date">{dia}</div>
                    {dayTasks.length===0
                      ? <div style={{fontSize:11,color:'#C4AFA0',fontStyle:'italic'}}>Sin tareas</div>
                      : dayTasks.map(t=>(
                          <div key={t.id} className="week-task">
                            <span className="week-dot"/>
                            <span style={{textDecoration:t.done?'line-through':'none',color:t.done?'#C4AFA0':'inherit'}}>{t.texto}</span>
                          </div>
                        ))
                    }
                  </div>
                )
              })}
            </div>
            {/* List view below */}
            <SectionRow label="Todas las tareas"/>
            <div className="card" style={{overflow:'hidden'}}>
              {parsed.map(t=>(
                <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 16px',borderBottom:'1px solid rgba(196,175,160,.1)'}}>
                  <div className={`check-box ${t.done?'done':''}`} onClick={()=>toggle(t)} style={{cursor:'pointer',flexShrink:0}}>
                    {t.done&&<span style={{color:'white',fontSize:11,fontWeight:'bold'}}>✓</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:'#3D2E27',textDecoration:t.done?'line-through':'none'}}>{t.texto}</div>
                    <div style={{fontSize:11,color:'#C4AFA0'}}>{t.dia}</div>
                  </div>
                  {t.priority==='alta'&&!t.done&&<span className="badge badge-red">urgente</span>}
                  <button onClick={()=>del(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14}}>✕</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon="🗓️" title="Semana vacía" sub="Agrega las tareas de la semana de tu boda." action="+ Agregar tarea" onAction={()=>setSheet(true)}/>
        )}
      </div>
    </div>
  )
}

// ── Router ─────────────────────────────────────────────────────────────────────
export default function PlaceholderPage({ pageId, project }) {
  if (pageId==='logistica') return <Logistica project={project}/>
  if (pageId==='fotos') return <Fotos project={project}/>
  if (pageId==='week') return <WeekPlanner project={project}/>
  const meta={eventos:{icon:'🥂',title:'Eventos especiales',sub:'Despedida, brunch y más'},categorias:{icon:'✨',title:'Categorías',sub:''}}
  const m=meta[pageId]||{icon:'📋',title:pageId,sub:''}
  return (
    <div>
      <PageHeader title={m.title}/>
      <div className="scroll-area">
        <EmptyState icon={m.icon} title="Próximamente" sub="Esta sección está disponible. Usa Notas maestras para agregar información directamente."/>
      </div>
    </div>
  )
}
