import { useState, useEffect } from 'react'
import { COLORS, WEDDING_DATE, VENUE } from '../lib/constants.js'
import { Card, CardTitle, Badge, StatusBadge, Alert, ProgressBar, Spinner } from '../components/UI.jsx'
import { getProviders, getGuests, getEvents } from '../lib/db.js'

const C = COLORS

function useCountdown(targetDate) {
  const [diff, setDiff] = useState({ days:0, hours:0, mins:0, secs:0 })
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const d = Math.max(0, targetDate - now)
      setDiff({
        days: Math.floor(d/(1000*60*60*24)),
        hours: Math.floor((d%(1000*60*60*24))/(1000*60*60)),
        mins: Math.floor((d%(1000*60*60))/(1000*60)),
        secs: Math.floor((d%(1000*60))/1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return diff
}

export default function Dashboard({ project }) {
  const [providers, setProviders] = useState([])
  const [guests, setGuests] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const cd = useCountdown(WEDDING_DATE)

  useEffect(() => {
    if (!project?.id) return
    Promise.all([
      getProviders(project.id),
      getGuests(project.id),
      getEvents(project.id),
    ]).then(([p, g, e]) => {
      setProviders(p); setGuests(g); setEvents(e); setLoading(false)
    })
  }, [project?.id])

  if (loading) return <Spinner message="Cargando dashboard..." />

  const totalGuests = guests.reduce((a,g) => a+g.total_count,0)
  const confirmedGuests = guests.reduce((a,g) => a+g.confirmed_count,0)
  const totalPaid = providers.reduce((a,p) => a+(p.paid_amount||0),0)
  const totalBalance = providers.reduce((a,p) => a+(p.balance||0),0)
  const urgentPayments = providers.filter(p => p.status !== 'pagado').slice(0,3)
  const upcomingEvents = events.filter(e => e.status !== 'past').slice(0,5)

  return (
    <div className="section-gap">
      {/* How to banner */}
      <div style={{background:`linear-gradient(135deg,${C.darkTaupe} 0%,#4A3A32 100%)`,borderRadius:14,padding:'24px 28px',color:'white'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.champagne,marginBottom:16}}>
          Tu boda, todo en un lugar · {project?.venue || VENUE}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {[['01','Dashboard','Avance general de tu planeación'],['02','Importar IA','Pega notas de Apple Notes'],['03','Proveedores','Pagos y saldos pendientes'],['04','Timeline','Eventos y fechas clave']].map(([n,t,d]) => (
            <div key={n} style={{textAlign:'center'}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.champagne,opacity:.6,display:'block'}}>{n}</span>
              <div style={{fontSize:12,fontWeight:500,color:'white',margin:'2px 0'}}>{t}</div>
              <span style={{fontSize:10,color:'rgba(255,255,255,0.55)',lineHeight:1.4}}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-label">Invitados totales</div>
          <div className="stat-value">{totalGuests}</div>
          <div className="stat-sub">{confirmedGuests} confirmados · {totalGuests-confirmedGuests} pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pagado</div>
          <div className="stat-value">${(totalPaid/1000).toFixed(0)}k</div>
          <div className="stat-sub">MXN pagado a proveedores</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saldo pendiente</div>
          <div className="stat-value" style={{color:C.red}}>${(totalBalance/1000).toFixed(0)}k</div>
          <div className="stat-sub">{providers.filter(p=>p.status!=='pagado').length} proveedores con saldo</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Proveedores</div>
          <div className="stat-value">{providers.length}</div>
          <div className="stat-sub">{providers.filter(p=>p.status==='pagado').length} pagados completamente</div>
        </div>
      </div>

      {/* Countdown + Progress */}
      <div className="grid-2">
        <div style={{background:C.darkTaupe,borderRadius:16,padding:'24px 28px',color:'white',gridColumn:'span 1'}}>
          <div style={{fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:8}}>Cuenta regresiva</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,color:C.champagne,marginBottom:16}}>
            20 de Noviembre de 2026
          </div>
          <div style={{display:'flex',gap:20}}>
            {[['días',cd.days],['horas',cd.hours],['min',cd.mins],['seg',cd.secs]].map(([l,v]) => (
              <div key={l} style={{textAlign:'center'}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:'white',lineHeight:1,display:'block'}}>
                  {String(v).padStart(2,'0')}
                </span>
                <span style={{fontSize:9,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.4)'}}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:14}}>{project?.venue || VENUE} · Mérida, Yucatán</div>
        </div>
        <Card>
          <CardTitle>Avance por categoría</CardTitle>
          {[
            ['Proveedores confirmados', providers.filter(p=>p.status==='pagado').length, providers.length],
            ['Invitados confirmados', confirmedGuests, totalGuests],
            ['Documentación civil', 5, 9],
            ['Misa / ceremonia', 6, 9],
          ].map(([name, val, max]) => (
            <div key={name} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <span style={{fontSize:12,color:C.text}}>{name}</span>
                <span style={{fontSize:11,color:C.taupe,fontWeight:500}}>{max>0?Math.round((val/max)*100):0}%</span>
              </div>
              <ProgressBar value={val} max={max} />
            </div>
          ))}
        </Card>
      </div>

      {/* Upcoming events + urgent payments */}
      <div className="grid-2">
        <Card>
          <CardTitle>Próximas fechas clave</CardTitle>
          {upcomingEvents.length === 0 ? (
            <div style={{fontSize:13,color:C.textLight}}>Sin eventos próximos registrados.</div>
          ) : upcomingEvents.map((e,i) => (
            <div key={e.id} style={{borderBottom:`1px solid ${C.beige}`,paddingBottom:10,marginBottom:10}}>
              <div style={{fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:C.taupe}}>
                {e.event_date ? new Date(e.event_date+'T00:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}) : 'Fecha por definir'}
              </div>
              <div style={{fontSize:13,fontWeight:500,color:e.is_urgent?C.red:C.darkTaupe,marginTop:2}}>{e.title}</div>
              {e.description && <div style={{fontSize:11,color:C.textLight}}>{e.description}</div>}
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>Pagos pendientes urgentes</CardTitle>
          {urgentPayments.map(p => (
            <div key={p.id} style={{borderBottom:`1px solid ${C.beige}`,paddingBottom:12,marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:C.darkTaupe}}>{p.name}</div>
                  <div style={{fontSize:11,color:C.textLight}}>Vence: {p.payment_due || 'por definir'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.darkTaupe}}>${(p.balance||0).toLocaleString()}</div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>
          ))}
          <div style={{padding:'10px 0 0',fontSize:12,color:C.textLight}}>
            Total pendiente: <strong style={{color:C.darkTaupe}}>${totalBalance.toLocaleString()} MXN</strong>
          </div>
        </Card>
      </div>
    </div>
  )
}
