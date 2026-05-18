import { useState, useEffect } from 'react'
import { WEDDING_DATE, VENUE } from '../lib/constants.js'
import { getProviders, getGuests, getEvents, getChecklist } from '../lib/db.js'
import { Spinner, ProgressBar, StatusBadge, SectionHeader, EmptyState } from '../components/UI.jsx'

function useCountdown(d) {
  const [t, setT] = useState({days:0,hours:0,mins:0,secs:0})
  useEffect(()=>{
    const tick=()=>{
      const ms=Math.max(0,d-new Date())
      setT({days:Math.floor(ms/86400000),hours:Math.floor(ms%86400000/3600000),
        mins:Math.floor(ms%3600000/60000),secs:Math.floor(ms%60000/1000)})
    }
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id)
  },[d])
  return t
}

export default function Dashboard({ project, onNavigate }) {
  const cd = useCountdown(WEDDING_DATE)
  const [providers,setProviders] = useState([])
  const [guests,setGuests] = useState([])
  const [events,setEvents] = useState([])
  const [checks,setChecks] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    if (!project?.id) return
    Promise.all([
      getProviders(project.id),
      getGuests(project.id),
      getEvents(project.id),
      getChecklist(project.id, null),
    ]).then(([p,g,e,c])=>{
      setProviders(p); setGuests(g); setEvents(e); setChecks(c); setLoading(false)
    })
  },[project?.id])

  if (loading) return <Spinner message="Preparando tu boda…"/>

  const totalGuests = guests.reduce((a,g)=>a+g.total_count,0)
  const confirmedGuests = guests.reduce((a,g)=>a+g.confirmed_count,0)
  const totalPaid = providers.reduce((a,p)=>a+(p.paid_amount||0),0)
  const totalBudget = providers.reduce((a,p)=>a+(p.total_amount||0),0)
  const pendingChecks = checks.filter(c=>!c.done)
  const upcoming = events.filter(e=>e.status!=='past').slice(0,3)
  const urgentPayments = providers.filter(p=>p.status!=='pagado' && p.balance>0)
    .sort((a,b)=>new Date(a.payment_due||'9999')-new Date(b.payment_due||'9999'))
    .slice(0,2)

  const progressPct = totalBudget>0 ? Math.round((totalPaid/totalBudget)*100) : 0
  const guestPct = totalGuests>0 ? Math.round((confirmedGuests/totalGuests)*100) : 0

  return (
    <div>
      {/* Page header */}
      <div className="page-top">
        <div className="page-title-mobile" style={{paddingBottom:16,borderBottom:'1px solid rgba(196,175,160,.15)'}}>
          Hola, Caro ✨
        </div>
      </div>

      <div className="scroll-area">

        {/* Countdown */}
        <div className="countdown-card">
          <div className="countdown-eyebrow">Cuenta regresiva</div>
          <div className="countdown-venue">20 de Noviembre · {VENUE}</div>
          <div className="countdown-nums">
            {[['días',cd.days],['horas',cd.hours],['min',cd.mins],['seg',cd.secs]].map(([l,v])=>(
              <div className="countdown-unit" key={l}>
                <span className="countdown-num">{String(v).padStart(2,'0')}</span>
                <span className="countdown-unit-label">{l}</span>
              </div>
            ))}
          </div>
          <div className="countdown-bro">con amor, tu bro</div>
        </div>

        {/* Stats row */}
        <div>
          <SectionHeader label="Resumen"/>
          <div className="stat-row">
            <div className="stat-chip" onClick={()=>onNavigate('invitados')} style={{cursor:'pointer'}}>
              <div className="stat-chip-label">Invitados</div>
              <div className="stat-chip-value">{confirmedGuests}</div>
              <div className="stat-chip-sub">de {totalGuests} confirmados</div>
            </div>
            <div className="stat-chip" onClick={()=>onNavigate('proveedores')} style={{cursor:'pointer'}}>
              <div className="stat-chip-label">Pagado</div>
              <div className="stat-chip-value">${(totalPaid/1000).toFixed(0)}k</div>
              <div className="stat-chip-sub">{progressPct}% del total</div>
            </div>
            <div className="stat-chip" onClick={()=>onNavigate('pending')} style={{cursor:'pointer'}}>
              <div className="stat-chip-label">Pendientes</div>
              <div className="stat-chip-value">{pendingChecks.length}</div>
              <div className="stat-chip-sub">tareas activas</div>
            </div>
            <div className="stat-chip">
              <div className="stat-chip-label">Proveedores</div>
              <div className="stat-chip-value">{providers.length}</div>
              <div className="stat-chip-sub">{providers.filter(p=>p.status==='pagado').length} liquidados</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card">
          <div className="card-pad">
            <div className="card-title" style={{marginBottom:16}}>Avance general</div>
            {[
              ['Presupuesto pagado', progressPct],
              ['Invitados confirmados', guestPct],
              ['Civil — documentos', Math.round((checks.filter(c=>c.category_slug==='civil'&&c.done).length/Math.max(1,checks.filter(c=>c.category_slug==='civil').length))*100)],
              ['Misa — preparativos', Math.round((checks.filter(c=>c.category_slug==='misa'&&c.done).length/Math.max(1,checks.filter(c=>c.category_slug==='misa').length))*100)],
            ].map(([name,pct])=>(
              <div key={name} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:13,color:'#3D2E27'}}>{name}</span>
                  <span style={{fontSize:12,color:'#B8975A',fontWeight:600}}>{pct}%</span>
                </div>
                <ProgressBar value={pct} max={100}/>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        {upcoming.length > 0 && (
          <div>
            <SectionHeader label="Próximos eventos" action="Ver todos" onAction={()=>onNavigate('timeline')}/>
            <div className="card" style={{overflow:'hidden'}}>
              {upcoming.map((e,i)=>(
                <div key={e.id} className="list-item" onClick={()=>onNavigate('timeline')}>
                  <div className="list-item-icon" style={{background:e.status==='key'?'#FDF3E8':'#F0EBE3'}}>
                    {e.event_type==='civil'?'📜':e.event_type==='misa'?'⛪':e.event_type==='recepcion'?'🥂':'📅'}
                  </div>
                  <div className="list-item-body">
                    <div className="list-item-title">{e.title}</div>
                    <div className="list-item-sub">
                      {e.event_date ? new Date(e.event_date+'T00:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'}) : 'Fecha TBD'}
                      {e.venue ? ` · ${e.venue}` : ''}
                    </div>
                  </div>
                  {e.status==='key' && <span className="badge badge-amber">Especial</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Urgent payments */}
        {urgentPayments.length > 0 && (
          <div>
            <SectionHeader label="Pagos urgentes" action="Ver todos" onAction={()=>onNavigate('proveedores')}/>
            <div className="card" style={{overflow:'hidden'}}>
              {urgentPayments.map(p=>(
                <div key={p.id} className="list-item" onClick={()=>onNavigate('proveedores')}>
                  <div className="list-item-icon" style={{background:'#FAEAEA'}}>💳</div>
                  <div className="list-item-body">
                    <div className="list-item-title">{p.name}</div>
                    <div className="list-item-sub">Vence: {p.payment_due||'por definir'}</div>
                  </div>
                  <div className="list-item-right">
                    <div className="list-item-value">${(p.balance||0).toLocaleString()}</div>
                    <StatusBadge status={p.status}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick nav tiles */}
        <div>
          <SectionHeader label="Ir a"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {icon:'💳',label:'Proveedores',id:'proveedores',color:'#EEF5EF'},
              {icon:'👥',label:'Invitados',id:'invitados',color:'#EEF0F8'},
              {icon:'📜',label:'Boda Civil',id:'civil',color:'#FDF3E8'},
              {icon:'📷',label:'Fotos',id:'fotos',color:'#F0EBF8'},
            ].map(t=>(
              <button key={t.id} onClick={()=>onNavigate(t.id)} style={{
                background:'white', borderRadius:16, padding:'16px',
                border:'1px solid rgba(196,175,160,.2)',
                display:'flex',alignItems:'center',gap:12,
                cursor:'pointer', touchAction:'manipulation',
                boxShadow:'0 2px 12px rgba(92,77,68,.06)',
              }}>
                <div style={{width:38,height:38,borderRadius:12,background:t.color,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                  {t.icon}
                </div>
                <span style={{fontSize:13,fontWeight:500,color:'#3D2E27'}}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
