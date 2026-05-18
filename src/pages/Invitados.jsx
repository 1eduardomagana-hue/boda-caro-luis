import { useState, useEffect } from 'react'
import { getGuests, upsertGuest } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'
import { Spinner, PageHeader, ProgressBar, EmptyState, Input, Btn } from '../components/UI.jsx'

function GuestSheet({ project, initial={}, onSave, onCancel }) {
  const [form,setForm] = useState(()=>({group_name:'',notes:'',...initial,total_count:initial.total_count!=null?String(initial.total_count):'',confirmed_count:initial.confirmed_count!=null?String(initial.confirmed_count):''}))
  const [saving,setSaving] = useState(false)
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const save=async()=>{if(!form.group_name.trim())return;setSaving(true);await upsertGuest({...form,project_id:project.id,total_count:Number(form.total_count)||0,confirmed_count:Number(form.confirmed_count)||0});onSave()}
  return (
    <>
      <div className="sheet-overlay" onClick={onCancel}/>
      <div className="sheet">
        <div className="sheet-handle"/>
        <div className="sheet-title">{initial.id?'Editar grupo':'Nuevo grupo'}</div>
        <div className="form-stack">
          <Input value={form.group_name} onChange={v=>set('group_name',v)} placeholder="Nombre del grupo *"/>
          <div className="grid-2-mob">
            <Input value={String(form.total_count)} onChange={v=>set('total_count',v)} placeholder="Total" type="number" label="Total"/>
            <Input value={String(form.confirmed_count)} onChange={v=>set('confirmed_count',v)} placeholder="Confirmados" type="number" label="Confirmados"/>
          </div>
          <Input value={form.notes||''} onChange={v=>set('notes',v)} placeholder="Notas"/>
          <Btn onClick={save} disabled={saving}>{saving?'Guardando…':'Guardar'}</Btn>
          <Btn secondary onClick={onCancel}>Cancelar</Btn>
        </div>
      </div>
    </>
  )
}

export default function Invitados({ project }) {
  const [guests,setGuests] = useState([])
  const [loading,setLoading] = useState(true)
  const [sheet,setSheet] = useState(null)

  const load=()=>getGuests(project.id).then(g=>{setGuests(g);setLoading(false)})
  useEffect(()=>{load()},[project.id])
  const del=async(id)=>{if(!window.confirm('¿Eliminar?'))return;await supabase.from('guests').delete().eq('id',id);load()}

  if(loading)return <Spinner/>
  const total=guests.reduce((a,g)=>a+g.total_count,0)
  const conf=guests.reduce((a,g)=>a+g.confirmed_count,0)

  return (
    <div>
      <PageHeader title="Invitados" subtitle={`${conf} confirmados de ${total}`}
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setSheet('new')}>+</button>}/>
      <div className="scroll-area">
        <div className="stat-row">
          {[['Total',total,''],['Confirmados',conf,`${Math.round(conf/(total||1)*100)}%`],['Pendientes',total-conf,'sin confirmar']].map(([l,v,s])=>(
            <div key={l} className="stat-chip">
              <div className="stat-chip-label">{l}</div>
              <div className="stat-chip-value">{v}</div>
              <div className="stat-chip-sub">{s}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:4}}>
          <ProgressBar value={conf} max={total||1}/>
          <div style={{fontSize:11,color:'#8B7D72',marginTop:6,textAlign:'right'}}>{Math.round(conf/(total||1)*100)}% confirmado</div>
        </div>
        {guests.length===0
          ? <EmptyState icon="👥" title="Sin grupos" sub="Agrega grupos de invitados." action="+ Agregar" onAction={()=>setSheet('new')}/>
          : guests.map(g=>(
              <div key={g.id} className="card" style={{overflow:'hidden',marginBottom:0}}>
                <div style={{padding:'16px 18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:600,color:'#3D2E27'}}>{g.group_name}</div>
                      {g.notes&&<div style={{fontSize:12,color:'#8B7D72',marginTop:2}}>{g.notes}</div>}
                    </div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <span style={{fontSize:13,color:'#8B7D72'}}>{g.confirmed_count}/{g.total_count}</span>
                      <button onClick={()=>setSheet(g)} className="btn-icon" style={{width:32,height:32}}>✎</button>
                      <button onClick={()=>del(g.id)} className="btn-icon" style={{width:32,height:32,color:'#B85C5C'}}>✕</button>
                    </div>
                  </div>
                  <ProgressBar value={g.confirmed_count} max={g.total_count||1}/>
                </div>
              </div>
            ))
        }
      </div>
      {sheet&&<GuestSheet project={project} initial={sheet==='new'?{}:sheet} onSave={()=>{setSheet(null);load()}} onCancel={()=>setSheet(null)}/>}
    </div>
  )
}
