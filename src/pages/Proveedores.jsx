import { useState, useEffect } from 'react'
import { getProviders, upsertProvider, deleteProvider } from '../lib/db.js'
import { Spinner, PageHeader, SectionRow, StatusBadge, EmptyState, Inp, Sel,  Alert } from '../components/UI.jsx'

const CATS = ['Fotografía','Video','Catering','Flores','Música','Salón','Vestido','Maquillaje','Transporte','Pastel','Invitaciones','Ceremonia','Otro']

function ProviderSheet({ project, initial={}, onSave, onCancel }) {
  const [form,setForm] = useState(()=>({name:'',category:'Otro',contact:'',payment_due:'',status:'pendiente',notes:'',...initial,total_amount:initial.total_amount!=null?String(initial.total_amount):'',paid_amount:initial.paid_amount!=null?String(initial.paid_amount):''}))
  const [saving,setSaving] = useState(false)
  const [err,setErr] = useState('')
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const save = async () => {
    if (!form.name.trim()){setErr('El nombre es obligatorio');return}
    setSaving(true)
    const {error} = await upsertProvider({...form,project_id:project.id,total_amount:form.total_amount?Number(form.total_amount):null,paid_amount:form.paid_amount?Number(form.paid_amount):0})
    if(error){setErr(error.message);setSaving(false);return}
    onSave()
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel}/>
      <div className="sheet" style={{maxHeight:'92dvh',overflowY:'auto'}}>
        <div className="sheet-handle"/>
        <div className="sheet-title">{initial.id?'Editar proveedor':'Nuevo proveedor'}</div>
        <div className="form-stack">
          <Inp value={form.name} onChange={v=>set('name',v)} placeholder="Nombre del proveedor *"/>
          <Sel value={form.category} onChange={v=>set('category',v)} options={CATS}/>
          <Inp value={form.contact||''} onChange={v=>set('contact',v)} placeholder="Contacto / teléfono / email"/>
          <div className="grid-2-mob">
            <Inp value={String(form.total_amount)} onChange={v=>set('total_amount',v)} placeholder="Total MXN" type="number" label="Total"/>
            <Inp value={String(form.paid_amount)} onChange={v=>set('paid_amount',v)} placeholder="Pagado MXN" type="number" label="Pagado"/>
          </div>
          <div className="grid-2-mob">
            <Inp value={form.payment_due||''} onChange={v=>set('payment_due',v)} type="date" label="Fecha límite"/>
            <Sel value={form.status} onChange={v=>set('status',v)} options={['pendiente','parcial','pagado']} label="Estado"/>
          </div>
          <Inp value={form.notes||''} onChange={v=>set('notes',v)} placeholder="Notas adicionales…" rows={3}/>
          {err && <div style={{background:"#FAEAEA",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#B85C5C"}}>{err}</div>}
          <button className="btn" onClick={save} disabled={saving}>{saving?'Guardando…':'Guardar proveedor'}</button>
          <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </>
  )
}

function Provider({ p, onEdit, onDelete }) {
  const [open,setOpen] = useState(false)
  const pct = p.total_amount ? Math.round((p.paid_amount||0)/p.total_amount*100) : 0
  return (
    <div className="provider-card">
      <div style={{height:3,background:p.status==='pagado'?'#7A9E7E':p.status==='parcial'?'#C9934A':'#B85C5C'}}/>
      <div className="provider-card-top" onClick={()=>setOpen(o=>!o)} style={{cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:600,color:'#3D2E27'}}>{p.name}</div>
            <div style={{fontSize:12,color:'#8B7D72',marginTop:2}}>{p.category}</div>
          </div>
          <div style={{textAlign:'right',marginLeft:12}}>
            <div style={{fontSize:16,fontWeight:600,color:'#3D2E27'}}>${(p.total_amount||0).toLocaleString()}</div>
            <StatusBadge status={p.status}/>
          </div>
        </div>
        {p.total_amount > 0 && (
          <div style={{marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:11,color:'#8B7D72'}}>Pagado ${(p.paid_amount||0).toLocaleString()}</span>
              <span style={{fontSize:11,color:'#B8975A',fontWeight:600}}>{pct}%</span>
            </div>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{width:`${pct}%`}}/>
            </div>
            {(p.balance||0) > 0 && (
              <div style={{fontSize:12,color:'#B85C5C',marginTop:6}}>Saldo: ${(p.balance||0).toLocaleString()} MXN</div>
            )}
          </div>
        )}
      </div>
      {open && (
        <div className="provider-card-footer">
          <div>
            {p.contact && <div style={{fontSize:12,color:'#8B7D72'}}>{p.contact}</div>}
            {p.payment_due && <div style={{fontSize:11,color:'#C4AFA0',marginTop:2}}>Vence: {p.payment_due}</div>}
            {p.notes && <div style={{fontSize:12,color:'#8B7D72',marginTop:4}}>{p.notes}</div>}
          </div>
          <div style={{display:'flex',gap:8,marginLeft:12,flexShrink:0}}>
            <button onClick={onEdit} className="btn-icon" title="Editar">✎</button>
            <button onClick={onDelete} className="btn-icon" style={{color:'#B85C5C'}} title="Eliminar">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Proveedores({ project }) {
  const [providers,setProviders] = useState([])
  const [loading,setLoading] = useState(true)
  const [sheet,setSheet] = useState(null) // null | 'new' | {provider}
  const [filter,setFilter] = useState('todos')

  const load = ()=>getProviders(project.id).then(p=>{setProviders(p);setLoading(false)})
  useEffect(()=>{load()},[project.id])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return
    await deleteProvider(id); load()
  }

  if (loading) return <Spinner/>

  const total = providers.reduce((a,p)=>a+(p.total_amount||0),0)
  const paid = providers.reduce((a,p)=>a+(p.paid_amount||0),0)
  const balance = providers.reduce((a,p)=>a+(p.balance||0),0)
  const filtered = filter==='todos'?providers:providers.filter(p=>p.status===filter)

  return (
    <div>
      <PageHeader title="Proveedores" subtitle="Pagos y saldos"
        right={<button className="btn-icon" style={{marginBottom:16,background:'#5C4D44',color:'#D4B896'}} onClick={()=>setSheet('new')}>+</button>}/>

      <div className="scroll-area">
        {/* Summary chips */}
        <div className="stat-row">
          <div className="stat-chip">
            <div className="stat-chip-label">Total</div>
            <div className="stat-chip-value">${(total/1000).toFixed(0)}k</div>
            <div className="stat-chip-sub">{providers.length} proveedores</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Pagado</div>
            <div className="stat-chip-value" style={{color:'#7A9E7E'}}>${(paid/1000).toFixed(0)}k</div>
            <div className="stat-chip-sub">{Math.round((paid/(total||1))*100)}% del total</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">Pendiente</div>
            <div className="stat-chip-value" style={{color:'#B85C5C'}}>${(balance/1000).toFixed(0)}k</div>
            <div className="stat-chip-sub">{providers.filter(p=>p.status!=='pagado').length} con saldo</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{display:'flex',gap:8}}>
          {[['todos','Todos'],['pendiente','Pendiente'],['parcial','Parcial'],['pagado','Pagado']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{
              padding:'7px 14px',borderRadius:99,fontSize:12,cursor:'pointer',
              border:`1px solid ${filter===v?'#B8975A':'rgba(196,175,160,.35)'}`,
              background:filter===v?'#5C4D44':'white',
              color:filter===v?'#D4B896':'#8B7D72',
              fontFamily:"'Jost',sans-serif",touchAction:'manipulation',transition:'all .15s' }}>{l}</button>
          ))}
        </div>

        {/* s */}
        {filtered.length===0
          ? <EmptyState icon="💳" title="Sin proveedores" sub="Agrega el primer proveedor." action="+ Agregar" onAction={()=>setSheet('new')}/>
          : filtered.map(p=>(
              <Provider key={p.id} p={p}
                onEdit={()=>setSheet(p)}
                onDelete={()=>handleDelete(p.id)}/>
            ))
        }
      </div>

      {/* Sheet */}
      {sheet && (
        <ProviderSheet
          project={project}
          initial={sheet==='new'?{}:sheet}
          onSave={()=>{setSheet(null);load()}}
          onCancel={()=>setSheet(null)}/>
      )}
    </div>
  )
}
