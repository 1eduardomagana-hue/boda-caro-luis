import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, Btn, Input, Spinner, PageHeader, ProgressBar } from '../components/UI.jsx'
import { getGuests, upsertGuest } from '../lib/db.js'

const C = COLORS

export default function Invitados({ project }) {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ group_name: '', total_count: '', confirmed_count: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = () => getGuests(project.id).then(g => { setGuests(g); setLoading(false) })
  useEffect(() => { load() }, [project.id])

  const save = async () => {
    if (!form.group_name.trim()) return
    await upsertGuest({ project_id: project.id, ...form, total_count: Number(form.total_count)||0, confirmed_count: Number(form.confirmed_count)||0 })
    setForm({ group_name:'',total_count:'',confirmed_count:'',notes:'' }); setAdding(false); load()
  }

  if (loading) return <Spinner />
  const total = guests.reduce((a,g)=>a+g.total_count,0)
  const confirmed = guests.reduce((a,g)=>a+g.confirmed_count,0)

  return (
    <div>
      <PageHeader title="Invitados" subtitle="Control de grupos y confirmaciones de asistencia" />
      <div className="section-gap">
        <div className="grid-3">
          {[['Total',total,''],['Confirmados',confirmed,`${Math.round((confirmed/total)*100)||0}%`],['Pendientes',total-confirmed,'sin confirmar']].map(([l,v,s])=>(
            <div className="stat-card" key={l}><div className="stat-label">{l}</div><div className="stat-value">{v}</div><div className="stat-sub">{s}</div></div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <Btn onClick={()=>setAdding(a=>!a)}>+ Agregar grupo</Btn>
        </div>
        {adding && (
          <Card style={{ borderTop:`3px solid ${C.champagne}` }}>
            <CardTitle>Nuevo grupo</CardTitle>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <Input value={form.group_name} onChange={v=>set('group_name',v)} placeholder="Nombre del grupo (ej: Familia Caro)" />
              <div className="grid-3">
                <Input value={form.total_count} onChange={v=>set('total_count',v)} placeholder="Total invitados" type="number" />
                <Input value={form.confirmed_count} onChange={v=>set('confirmed_count',v)} placeholder="Confirmados" type="number" />
                <Input value={form.notes} onChange={v=>set('notes',v)} placeholder="Notas" />
              </div>
              <div style={{display:'flex',gap:8}}><Btn onClick={save}>Guardar</Btn><Btn ghost onClick={()=>setAdding(false)}>Cancelar</Btn></div>
            </div>
          </Card>
        )}
        <Card>
          <CardTitle>Grupos de invitados</CardTitle>
          <div style={{ marginBottom:16 }}><ProgressBar value={confirmed} max={total||1} /></div>
          {guests.map(g=>(
            <div key={g.id} style={{ marginBottom:14 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                <span style={{ fontSize:13,fontWeight:500,color:C.darkTaupe }}>{g.group_name}</span>
                <span style={{ fontSize:12,color:C.textLight }}>{g.confirmed_count}/{g.total_count} · {g.notes}</span>
              </div>
              <ProgressBar value={g.confirmed_count} max={g.total_count||1} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
