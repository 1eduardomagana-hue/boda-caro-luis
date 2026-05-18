import { useState, useEffect } from 'react'
import { WEDDING_DATE, VENUE } from '../lib/constants.js'
import { getProviders, getGuests, getEvents, getChecklist } from '../lib/db.js'
import { Spinner, ProgressBar, StatusBadge, SectionRow } from '../components/UI.jsx'

function useCountdown(d) {
  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, d - new Date())
      setT({
        days: Math.floor(ms / 86400000),
        hours: Math.floor(ms % 86400000 / 3600000),
        mins: Math.floor(ms % 3600000 / 60000),
        secs: Math.floor(ms % 60000 / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [d])
  return t
}

export default function Dashboard({ project, onNavigate }) {
  const cd = useCountdown(WEDDING_DATE)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!project?.id) return
    Promise.all([
      getProviders(project.id),
      getGuests(project.id),
      getEvents(project.id),
      getChecklist(project.id, null),
    ]).then(([p, g, e, c]) => setData({ p, g, e, c }))
  }, [project?.id])

  if (!data) return <Spinner msg="Preparando tu boda…" />

  const { p: providers, g: guests, e: events, c: checks } = data

  const totalGuests = guests.reduce((a, g) => a + g.total_count, 0)
  const confirmedGuests = guests.reduce((a, g) => a + g.confirmed_count, 0)
  const totalPaid = providers.reduce((a, p) => a + (p.paid_amount || 0), 0)
  const totalBudget = providers.reduce((a, p) => a + (p.total_amount || 0), 0)
  const pendingChecks = checks.filter(c => !c.done)
  const upcoming = events.filter(e => e.status !== 'past')
    .sort((a, b) => new Date(a.event_date || '9999') - new Date(b.event_date || '9999'))
    .slice(0, 3)
  const urgentPays = providers.filter(p => p.status !== 'pagado' && (p.balance || 0) > 0)
    .sort((a, b) => new Date(a.payment_due || '9999') - new Date(b.payment_due || '9999'))
    .slice(0, 3)

  const paidPct = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0
  const guestPct = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0

  const typeIcon = t => ({ civil: '📜', misa: '⛪', recepcion: '🥂', preboda: '💍', ensayo: '🎵', despedida: '🥂' }[t] || '📅')

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-title">Hola, Caro ✨</div>
          </div>
        </div>
      </div>

      <div className="content">

        {/* Countdown */}
        <div className="countdown-card">
          <div className="countdown-eyebrow">Cuenta regresiva</div>
          <div className="countdown-venue">20 de Noviembre · {VENUE}</div>
          <div className="countdown-nums">
            {[['días', cd.days], ['horas', cd.hours], ['min', cd.mins], ['seg', cd.secs]].map(([l, v]) => (
              <div className="countdown-unit" key={l}>
                <span className="countdown-n">{String(v).padStart(2, '0')}</span>
                <span className="countdown-l">{l}</span>
              </div>
            ))}
          </div>
          <div className="countdown-bro">con amor, tu bro</div>
        </div>

        {/* Stats */}
        <div>
          <SectionRow label="Resumen" />
          <div className="stat-scroll" style={{ marginTop: 10 }}>
            {[
              { l: 'Invitados', v: confirmedGuests, s: `de ${totalGuests}`, id: 'invitados' },
              { l: 'Pagado', v: `$${(totalPaid/1000).toFixed(0)}k`, s: `${paidPct}% del total`, id: 'proveedores' },
              { l: 'Pendientes', v: pendingChecks.length, s: 'por hacer', id: 'pending' },
              { l: 'Proveedores', v: providers.length, s: `${providers.filter(p=>p.status==='pagado').length} pagados`, id: 'proveedores' },
            ].map(chip => (
              <div key={chip.l} className="stat-chip" onClick={() => onNavigate(chip.id)}>
                <div className="stat-chip-l">{chip.l}</div>
                <div className="stat-chip-v">{chip.v}</div>
                <div className="stat-chip-s">{chip.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="card">
          <div className="card-body">
            <div className="card-title">Avance general</div>
            {[
              ['Presupuesto pagado', paidPct],
              ['Invitados confirmados', guestPct],
              ['Civil — documentos', Math.round((checks.filter(c=>c.category_slug==='civil'&&c.done).length/Math.max(1,checks.filter(c=>c.category_slug==='civil').length))*100)],
              ['Misa — preparativos', Math.round((checks.filter(c=>c.category_slug==='misa'&&c.done).length/Math.max(1,checks.filter(c=>c.category_slug==='misa').length))*100)],
            ].map(([name, pct]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#3D2E27' }}>{name}</span>
                  <span style={{ fontSize: 12, color: '#B8975A', fontWeight: 600 }}>{pct}%</span>
                </div>
                <ProgressBar value={pct} max={100} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <SectionRow label="Próximos eventos" action="Ver todos" onAction={() => onNavigate('timeline')} />
            <div className="card" style={{ marginTop: 10 }}>
              {upcoming.map((ev, i) => (
                <div key={ev.id} className="list-row" onClick={() => onNavigate('timeline')}
                  style={{ borderBottom: i < upcoming.length - 1 ? '0.5px solid rgba(196,175,160,0.15)' : 'none' }}>
                  <div className="list-icon" style={{ background: ev.status === 'key' ? '#FDF3E8' : '#F0EBE3' }}>
                    {typeIcon(ev.event_type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="list-title">{ev.title}</div>
                    <div className="list-sub">
                      {ev.event_date
                        ? new Date(ev.event_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                        : 'Fecha TBD'}
                      {ev.venue ? ` · ${ev.venue}` : ''}
                    </div>
                  </div>
                  {ev.status === 'key' && <span className="badge bg-amber">Especial</span>}
                  <span style={{ color: '#C4AFA0', fontSize: 18, marginLeft: 8 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Urgent payments */}
        {urgentPays.length > 0 && (
          <div>
            <SectionRow label="Pagos urgentes" action="Ver todos" onAction={() => onNavigate('proveedores')} />
            <div className="card" style={{ marginTop: 10 }}>
              {urgentPays.map((p, i) => (
                <div key={p.id} className="list-row" onClick={() => onNavigate('proveedores')}
                  style={{ borderBottom: i < urgentPays.length - 1 ? '0.5px solid rgba(196,175,160,0.15)' : 'none' }}>
                  <div className="list-icon" style={{ background: '#FAEAEA' }}>💳</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="list-title">{p.name}</div>
                    <div className="list-sub">Vence: {p.payment_due || 'por definir'}</div>
                  </div>
                  <div className="list-right">
                    <div className="list-value">${(p.balance || 0).toLocaleString()}</div>
                    <div style={{ marginTop: 3 }}><StatusBadge status={p.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div>
          <SectionRow label="Ir a" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            {[
              { icon: '💳', label: 'Proveedores', id: 'proveedores', bg: '#EEF5EF' },
              { icon: '👥', label: 'Invitados',   id: 'invitados',   bg: '#EEF0F8' },
              { icon: '📜', label: 'Boda Civil',  id: 'civil',       bg: '#FDF3E8' },
              { icon: '📷', label: 'Fotos',       id: 'fotos',       bg: '#F0EBF8' },
            ].map(t => (
              <button key={t.id} onClick={() => onNavigate(t.id)} style={{
                background: 'white', borderRadius: 16, padding: '14px',
                border: '0.5px solid rgba(196,175,160,0.22)',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', touchAction: 'manipulation',
                boxShadow: '0 1px 8px rgba(92,77,68,0.06)',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: t.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{t.icon}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#3D2E27' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 8 }} />
      </div>
    </div>
  )
}
