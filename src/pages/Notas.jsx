import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, Btn, Input, Spinner, PageHeader } from '../components/UI.jsx'
import { getNotes, upsertNote } from '../lib/db.js'

const C = COLORS

export default function Notas({ project }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [openIds, setOpenIds] = useState({})

  const load = () => getNotes(project.id).then(n=>{setNotes(n);setLoading(false)})
  useEffect(()=>{load()},[project.id])

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    await upsertNote({ project_id: project.id, title: form.title, content: form.content, source: 'manual' })
    setForm({title:'',content:''}); setAdding(false); load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Notas maestras" subtitle="Pega el contenido de tus Apple Notes. Se guardan en la base de datos." />
      <div className="section-gap">
        <div style={{background:C.beige,borderRadius:10,padding:'13px 18px',fontSize:12.5,color:C.warmGray,lineHeight:1.6}}>
          💡 <strong>Tip:</strong> Copia cualquier nota de Apple Notes tal como está y pégala aquí. 
        </div>
        {notes.map(n=>(
          <div key={n.id} style={{background:C.white,borderRadius:12,border:`1px solid ${C.sand}`,overflow:'hidden'}}>
            <div style={{background:C.cream,padding:'13px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}
              onClick={()=>setOpenIds(o=>({...o,[n.id]:!o[n.id]}))}>
              <span style={{fontSize:13,fontWeight:500,color:C.darkTaupe}}>📋 {n.title}</span>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontSize:10,color:C.textLight}}>{new Date(n.created_at).toLocaleDateString('es-MX')}</span>
                <span style={{fontSize:11,color:C.taupe}}>{openIds[n.id]?'Cerrar':'Ver'}</span>
              </div>
            </div>
            {openIds[n.id] && (
              <div style={{padding:'16px 18px',fontSize:12.5,color:C.text,lineHeight:1.9,whiteSpace:'pre-wrap'}}>{n.content}</div>
            )}
          </div>
        ))}
        {adding ? (
          <Card style={{borderTop:`3px solid ${C.champagne}`}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Nombre de la nota (ej: LOGÍSTICA BODA)" />
              <Input value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} placeholder="Pega aquí el contenido completo..." rows={10} />
              <div style={{display:'flex',gap:8}}><Btn onClick={save}>Guardar nota</Btn><Btn ghost onClick={()=>setAdding(false)}>Cancelar</Btn></div>
            </div>
          </Card>
        ) : (
          <button className="btn-ghost" style={{width:'100%',padding:'14px'}} onClick={()=>setAdding(true)}>
            + Agregar nota desde Apple Notes
          </button>
        )}
      </div>
    </div>
  )
}
