import { useState, useEffect } from 'react'
import { getNotes, upsertNote } from '../lib/db.js'
import { Spinner, PageHeader, EmptyState, Inp } from '../components/UI.jsx'

export default function Notas({ project }) {
  const [notes,setNotes] = useState([])
  const [loading,setLoading] = useState(true)
  const [adding,setAdding] = useState(false)
  const [form,setForm] = useState({title:'',content:''})
  const [openIds,setOpenIds] = useState({})

  const load=()=>getNotes(project.id).then(n=>{setNotes(n);setLoading(false)})
  useEffect(()=>{load()},[project.id])

  const save=async()=>{if(!form.title.trim()||!form.content.trim())return;await upsertNote({project_id:project.id,title:form.title,content:form.content,source:'manual'});setForm({title:'',content:''});setAdding(false);load()}

  if(loading)return<Spinner/>

  return (
    <div>
      <PageHeader title="Notas maestras" subtitle="Tus Apple Notes, aquí"
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setAdding(a=>!a)}>+</button>}/>
      <div className="scroll-area">
        <div style={{background:'#FDF3E8',borderRadius:12,padding:'12px 14px',fontSize:12.5,color:'#8B5E1A',lineHeight:1.6,marginBottom:4}}>
          💡 Copia el contenido de cualquier nota de Apple Notes y pégala aquí tal como está.
        </div>
        {adding && (
          <div className="card">
            <div className="card-pad">
              <div className="form-stack">
                <Inp value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Nombre de la nota"/>
                <Inp value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} placeholder="Pega aquí el contenido completo…" rows={10}/>
                <button className="btn" onClick={save}>Guardar nota</button>
                <button className="btn-ghost" onClick={()=>setAdding(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {notes.length===0 && !adding
          ? <EmptyState icon="📝" title="Sin notas aún" sub="Pega aquí tus notas de Apple Notes para tenerlas siempre a mano." action="+ Agregar nota" onAction={()=>setAdding(true)}/>
          : notes.map(n=>(
              <div key={n.id} className="card" style={{overflow:'hidden'}}>
                <div style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',background:'#FAF8F5'}}
                  onClick={()=>setOpenIds(o=>({...o,[n.id]:!o[n.id]}))}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#3D2E27'}}>📋 {n.title}</div>
                    <div style={{fontSize:11,color:'#8B7D72',marginTop:2}}>{new Date(n.created_at).toLocaleDateString('es-MX')}</div>
                  </div>
                  <span style={{fontSize:12,color:'#C4AFA0'}}>{openIds[n.id]?'▲':'▼'}</span>
                </div>
                {openIds[n.id] && (
                  <div style={{padding:'14px 16px',fontSize:13,color:'#3D2E27',lineHeight:1.8,whiteSpace:'pre-wrap',borderTop:'1px solid rgba(196,175,160,.15)'}}>{n.content}</div>
                )}
              </div>
            ))
        }
      </div>
    </div>
  )
}
