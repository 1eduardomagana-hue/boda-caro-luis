import { useState, useEffect } from 'react'
import { getEvents, upsertEvent } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'
import { Spinner, PageHeader, EmptyState, Input, Select, Btn } from '../components/UI.jsx'

const TIPOS = ['civil','misa','recepcion','preboda','ensayo','despedida','brunch','otro']

function EventSheet({ project, initial={}, onSave, onCancel }) {
  const [form,setForm] = useState(()=>({title:'',event_date:'',venue:'',description:'',event_type:'otro',status:'upcoming',is_urgent:false,...initial,event_time:initial.event_time?String(initial.event_time).slice(0,5):''}))
  const [saving,setSaving] = useState(false)
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const save=async()=>{if(!form.title.trim())return;setSaving(true);await upsertEvent({...form,project_id:project.id});onSave()}
  return (
    <>
      <div className="sheet-overlay" onClick={onCancel}/>
      <div className="sheet" style={{maxHeight:'90dvh',overflowY:'auto'}}>
        <div className="sheet-handle"/>
        <div className="sheet-title">{initial.id?'Editar evento':'Nuevo evento'}</div>
        <div className="form-stack">
          <Input value={form.title} onChange={v=>set('title',v)} placeholder="Nombre del evento *"/>
          <div className="grid-2-mob">
            <Input value={form.event_date} onChange={v=>set('event_date',v)} type="date" label="Fecha"/>
            <Input value={form.event_time} onChange={v=>set('event_time',v)} type="time" label="Hora"/>
          </div>
          <Input value={form.venue||''} onChange={v=>set('venue',v)} placeholder="Lugar"/>
          <Input value={form.description||''} onChange={v=>set('description',v)} placeholder="Descripción" rows={2}/>
          <div className="grid-2-mob">
            <Select value={form.event_type} onChange={v=>set('event_type',v)} options={TIPOS} label="Tipo"/>
            <Select value={form.status} onChange={v=>set('status',v)} options={[{value:'upcoming',label:'Próximo'},{value:'past',label:'Listo'},{value:'key',label:'Especial'}]} label="Estado"/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'#3D2E27',cursor:'pointer',padding:'4px 0'}}>
            <input type="checkbox" checked={form.is_urgent} onChange={e=>set('is_urgent',e.target.checked)} style={{width:18,height:18,accentColor:'#B85C5C'}}/>
            Marcar como urgente
          </label>
          <Btn onClick={save} disabled={saving}>{saving?'Guardando…':'Guardar'}</Btn>
          <Btn secondary onClick={onCancel}>Cancelar</Btn>
        </div>
      </div>
    </>
  )
}

export default function Timeline({ project }) {
  const [events,setEvents] = useState([])
  const [loading,setLoading] = useState(true)
  const [sheet,setSheet] = useState(null)

  const load=()=>getEvents(project.id).then(e=>{setEvents(e);setLoading(false)})
  useEffect(()=>{load()},[project.id])
  const del=async(id)=>{if(!window.confirm('¿Eliminar?'))return;await supabase.from('events').delete().eq('id',id);load()}

  if (loading) return <Spinner/>

  return (
    <div>
      <PageHeader title="Timeline" subtitle="Tu historia de planeación"
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setSheet('new')}>+</button>}/>
      <div className="scroll-area">
        {events.length===0
          ? <EmptyState icon="📅" title="Sin eventos aún" sub="Agrega hitos, citas y fechas clave de tu boda." action="+ Agregar evento" onAction={()=>setSheet('new')}/>
          : (
            <div className="card" style={{padding:'18px'}}>
              {events.map((e,i)=>(
                <div key={e.id} className="timeline-row">
                  <div className="timeline-dot-wrap">
                    <div className={`timeline-dot ${e.status==='past'?'past':e.status==='key'?'key':''} ${e.is_urgent?'urgent':''}`}/>
                    {i<events.length-1&&<div className="timeline-line"/>}
                  </div>
                  <div className="timeline-content" style={{paddingBottom:i<events.length-1?0:0}}>
                    <div className="timeline-date">
                      {e.event_date?new Date(e.event_date+'T00:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}):'Fecha TBD'}
                      {e.event_time?` · ${String(e.event_time).slice(0,5)}h`:''}
                    </div>
                    <div className="timeline-title" style={{color:e.status==='key'?'#B8975A':e.is_urgent?'#B85C5C':'#3D2E27'}}>{e.title}</div>
                    {e.description&&<div className="timeline-desc">{e.description}</div>}
                    {e.venue&&<div style={{fontSize:11,color:'#C4AFA0',marginTop:2}}>{e.venue}</div>}
                    <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                      {e.status==='past'&&<span className="badge badge-gray">Listo</span>}
                      {e.status==='key'&&<span className="badge badge-amber">Especial</span>}
                      {e.is_urgent&&<span className="badge badge-red">Urgente</span>}
                      <button onClick={()=>setSheet(e)} style={{fontSize:12,color:'#B8975A',background:'none',border:'none',cursor:'pointer',padding:0}}>Editar</button>
                      <button onClick={()=>del(e.id)} style={{fontSize:12,color:'#C4AFA0',background:'none',border:'none',cursor:'pointer',padding:0}}>Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      {sheet&&<EventSheet project={project} initial={sheet==='new'?{}:sheet} onSave={()=>{setSheet(null);load()}} onCancel={()=>setSheet(null)}/>}
    </div>
  )
}
