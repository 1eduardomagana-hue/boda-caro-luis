import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, Spinner, Btn, Input, Select, PageHeader } from '../components/UI.jsx'
import { getEvents, upsertEvent } from '../lib/db.js'

const C = COLORS
const TIPOS = ['civil','misa','recepcion','preboda','ensayo','despedida','brunch','otro']

export default function Timeline({ project }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title:'',event_date:'',event_time:'',venue:'',description:'',event_type:'otro',status:'upcoming' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const load = () => getEvents(project.id).then(e=>{setEvents(e);setLoading(false)})
  useEffect(()=>{load()},[project.id])

  const save = async () => {
    if (!form.title.trim()) return
    await upsertEvent({ project_id: project.id, ...form })
    setForm({title:'',event_date:'',event_time:'',venue:'',description:'',event_type:'otro',status:'upcoming'})
    setAdding(false); load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Timeline general" subtitle="Hitos cronológicos de la planeación" />
      <div className="section-gap">
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <Btn onClick={()=>setAdding(a=>!a)}>+ Agregar evento</Btn>
        </div>
        {adding && (
          <Card style={{borderTop:`3px solid ${C.champagne}`}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Input value={form.title} onChange={v=>set('title',v)} placeholder="Nombre del evento *" />
              <div className="grid-3">
                <Input value={form.event_date} onChange={v=>set('event_date',v)} placeholder="Fecha" type="date" />
                <Input value={form.event_time} onChange={v=>set('event_time',v)} placeholder="Hora" type="time" />
                <Select value={form.event_type} onChange={v=>set('event_type',v)} options={TIPOS} />
              </div>
              <Input value={form.venue} onChange={v=>set('venue',v)} placeholder="Lugar" />
              <Input value={form.description} onChange={v=>set('description',v)} placeholder="Descripción" rows={2} />
              <div style={{display:'flex',gap:8}}><Btn onClick={save}>Guardar</Btn><Btn ghost onClick={()=>setAdding(false)}>Cancelar</Btn></div>
            </div>
          </Card>
        )}
        <Card>
          {events.map((e,i)=>(
            <div key={e.id} className="timeline-item">
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div className={`timeline-dot ${e.status==='past'?'past':''} ${e.is_urgent?'urgent':''}`} />
                {i<events.length-1 && <div className="timeline-connector" />}
              </div>
              <div style={{flex:1,paddingBottom:4}}>
                <div style={{fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:C.taupe}}>
                  {e.event_date ? new Date(e.event_date+'T00:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}) : 'Fecha por definir'}
                  {e.event_time ? ` · ${e.event_time.slice(0,5)}h` : ''}
                </div>
                <div style={{fontSize:14,fontWeight:500,color:e.status==='key'?C.gold:e.is_urgent?C.red:C.darkTaupe,margin:'2px 0 4px'}}>
                  {e.title}
                </div>
                <div style={{fontSize:12,color:C.textLight,lineHeight:1.5}}>{e.description}</div>
                {e.venue && <div style={{fontSize:11,color:C.taupe,marginTop:2}}>{e.venue}</div>}
                {e.status==='past' && <span className="badge badge-gray" style={{marginTop:4}}>Completado</span>}
                {e.status==='key' && <span className="badge badge-amber" style={{marginTop:4}}>Día especial</span>}
                {e.is_urgent && <span className="badge badge-red" style={{marginTop:4}}>Urgente</span>}
              </div>
            </div>
          ))}
          {events.length===0 && <div style={{fontSize:13,color:C.textLight,padding:'16px 0'}}>Sin eventos registrados. Agrega el primero arriba.</div>}
        </Card>
      </div>
    </div>
  )
}
