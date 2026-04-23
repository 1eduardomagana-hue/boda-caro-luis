import { useState, useEffect, useCallback } from 'react'
import { ProgressRow, StatusBadge, Accordion, CheckItem, EmptyState, DeleteBtn } from '../components/UI.jsx'
import {
  upsertProvider, deleteProvider, upsertEvent, toggleChecklistItem,
  upsertChecklistItem, upsertGuest, upsertLink, deleteLink, upsertNote,
  uploadFile, deleteFile as deleteFileDB,
} from '../lib/supabase.js'

// ─── DEMO DATA (used when offline / no Supabase) ───────────
const DEMO_PROVIDERS = [
  { id:'d1', name:'Quinta Montes Molina', category:'Salón', contact:'eventos@quinta.mx', total_amount:220000, paid_amount:110000, balance:110000, due_date:'2026-10-01', status:'parcial', notes:'Anticipo 50%. Saldo antes del 1 oct.' },
  { id:'d2', name:'Raúl Molina Studio', category:'Fotografía', contact:'raul@foto.mx', total_amount:55000, paid_amount:25000, balance:30000, due_date:'2026-10-15', status:'parcial', notes:'Segundo pago antes del ensayo.' },
  { id:'d3', name:'Frames & Stories', category:'Video', contact:'hola@frames.mx', total_amount:38000, paid_amount:18000, balance:20000, due_date:'2026-10-20', status:'parcial', notes:'Incluye video boda civil.' },
  { id:'d4', name:'Floral by Monse', category:'Flores', contact:'monse@florals.mx', total_amount:32000, paid_amount:16000, balance:16000, due_date:'2026-11-05', status:'parcial', notes:'Decoración altar + centros de mesa.' },
  { id:'d5', name:'Bridal by Elisa', category:'Vestido', contact:'elisa@bridal.mx', total_amount:48000, paid_amount:48000, balance:0, due_date:'2026-04-01', status:'pagado', notes:'Última prueba: 25 oct.' },
  { id:'d6', name:'DJ Ariel Mix', category:'Música', contact:'ariel@djmix.mx', total_amount:20000, paid_amount:10000, balance:10000, due_date:'2026-11-10', status:'parcial', notes:'Set 6 horas + sonido.' },
  { id:'d7', name:'La Mesa Ideal', category:'Catering', contact:'catering@lamesaideal.mx', total_amount:145000, paid_amount:70000, balance:75000, due_date:'2026-11-12', status:'parcial', notes:'Menú 3 tiempos + cena.' },
  { id:'d8', name:'Atelier Dulce', category:'Pastel', contact:'pedidos@atelier.mx', total_amount:11000, paid_amount:0, balance:11000, due_date:'2026-11-15', status:'pendiente', notes:'Pastel 3 pisos + mesa de postres.' },
]

const DEMO_EVENTS = [
  { id:'e1', title:'Sesión preboda', event_date:'2026-06-15', event_time:'10:00', location:'Centro histórico Mérida', type:'preboda', status:'upcoming', is_urgent:false },
  { id:'e2', title:'Última prueba vestido', event_date:'2026-10-25', event_time:'11:00', location:'Bridal by Elisa', type:'otro', status:'upcoming', is_urgent:false },
  { id:'e3', title:'Despedida de soltera', event_date:'2026-11-07', event_time:null, location:'Tulum', type:'despedida', status:'upcoming', is_urgent:false },
  { id:'e4', title:'Boda Civil', event_date:'2026-11-19', event_time:'11:00', location:'Registro Civil Mérida', type:'civil', status:'upcoming', is_urgent:false },
  { id:'e5', title:'Cena íntima familiar', event_date:'2026-11-19', event_time:'20:00', location:'Restaurante privado', type:'otro', status:'upcoming', is_urgent:false },
  { id:'e6', title:'🎊 Boda Caro & Luis', event_date:'2026-11-20', event_time:'16:00', location:'Quinta Montes Molina', type:'recepcion', status:'key', is_urgent:false },
  { id:'e7', title:'Brunch post-boda', event_date:'2026-11-21', event_time:'11:00', location:'Hotel Chablé', type:'brunch', status:'upcoming', is_urgent:false },
]

const DEMO_CHECKLIST_CIVIL = [
  { id:'c1', text:'Acta de nacimiento Caro (apostillada)', done:true, category:'civil' },
  { id:'c2', text:'Acta de nacimiento Luis (apostillada)', done:true, category:'civil' },
  { id:'c3', text:'CURP ambos', done:true, category:'civil' },
  { id:'c4', text:'INE vigente ambos', done:true, category:'civil' },
  { id:'c5', text:'Testigos confirmados (4)', done:false, category:'civil' },
  { id:'c6', text:'Pago de derechos Registro Civil', done:false, category:'civil' },
  { id:'c7', text:'Bouquet civil coordinado con Monse', done:false, category:'civil' },
]

const DEMO_CHECKLIST_MISA = [
  { id:'m1', text:'Reserva parroquia pagada', done:true, category:'misa' },
  { id:'m2', text:'Curso prematrimonial completado', done:true, category:'misa' },
  { id:'m3', text:'Pláticas parroquia (3/3)', done:true, category:'misa' },
  { id:'m4', text:'Ensayo misa — 15 Nov 18:00h', done:false, category:'misa' },
  { id:'m5', text:'Programa impreso de misa', done:false, category:'misa' },
  { id:'m6', text:'Decoración altar coordinada', done:false, category:'misa' },
]

const DEMO_GUESTS = [
  { id:'g1', group_name:'Familia Caro', total:45, confirmed:38, notes:'Incluye viajeros DF y GDL' },
  { id:'g2', group_name:'Familia Luis', total:50, confirmed:46, notes:'Familia grande de Mérida' },
  { id:'g3', group_name:'Amigos Caro', total:30, confirmed:22, notes:'Universidad + trabajo' },
  { id:'g4', group_name:'Amigos Luis', total:28, confirmed:20, notes:'Amigos de toda la vida' },
  { id:'g5', group_name:'Compañeros trabajo', total:15, confirmed:10, notes:'Ambos trabajos' },
]

const DEMO_LINKS = [
  { id:'l1', title:'Contratos boda — Carpeta Drive', category:'Contratos', url:'https://drive.google.com', note:'Contratos firmados: Quinta, catering, foto y video.' },
  { id:'l2', title:'Album compartido — Quinta Montes Molina', category:'Inspiración', url:'https://photos.google.com', note:'Fotos del venue y referencias de montajes.' },
  { id:'l3', title:'Lista de regalos Liverpool', category:'Invitados', url:'https://liverpool.com.mx', note:'Código: CAROLUIS2026' },
  { id:'l4', title:'Formulario RSVP', category:'Invitados', url:'https://forms.google.com', note:'Cierra el 1 de octubre.' },
  { id:'l5', title:'Playlist Spotify — Boda', category:'Música', url:'https://open.spotify.com', note:'Coctelera + entrada + baile.' },
]

// ─── DASHBOARD ─────────────────────────────────────────────
function useCountdown(targetDate) {
  const [diff, setDiff] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  useEffect(() => {
    const tick = () => {
      const d = Math.max(0, new Date(targetDate) - new Date())
      setDiff({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d % 86400000) / 3600000),
        mins: Math.floor((d % 3600000) / 60000),
        secs: Math.floor((d % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return diff
}

export function Dashboard({ project, providers: rawProviders, events: rawEvents, guests: rawGuests, online }) {
  const providers = rawProviders.length ? rawProviders : DEMO_PROVIDERS
  const events = rawEvents.length ? rawEvents : DEMO_EVENTS
  const guests = rawGuests.length ? rawGuests : DEMO_GUESTS
  const eventDate = project?.event_date || '2026-11-20'
  const cd = useCountdown(eventDate + 'T16:00:00')

  const totalGuests = guests.reduce((a, g) => a + (g.total || 0), 0)
  const confirmedGuests = guests.reduce((a, g) => a + (g.confirmed || 0), 0)
  const totalBudget = providers.reduce((a, p) => a + (p.total_amount || 0), 0)
  const totalPaid = providers.reduce((a, p) => a + (p.paid_amount || 0), 0)
  const totalBalance = providers.reduce((a, p) => a + (p.balance || 0), 0)

  const upcoming = events
    .filter(e => e.status !== 'past')
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 5)

  const urgentPayments = providers.filter(p => p.status !== 'pagado').slice(0, 3)

  return (
    <div className="section-gap">
      {!online && (
        <div className="alert">
          ℹ️ Mostrando datos de ejemplo — conecta Supabase para ver tus datos reales.
        </div>
      )}

      {/* Howto */}
      <div className="howto">
        <div className="howto-title">Tu boda, más clara que nunca</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            ['01', 'Aquí ves el avance general y alertas urgentes'],
            ['02', 'En Notas Maestras pegas contenido de Apple Notes'],
            ['03', 'En Proveedores controlas pagos y saldos'],
            ['04', 'Revisa pagos pendientes en Proveedores'],
          ].map(([n, t]) => (
            <div key={n} style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--champagne)', opacity: 0.6, display: 'block' }}>{n}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-label">Invitados</div>
          <div className="stat-value">{totalGuests}</div>
          <div className="stat-sub">{confirmedGuests} confirmados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pagado</div>
          <div className="stat-value">${(totalPaid / 1000).toFixed(0)}k</div>
          <div className="stat-sub">de ${(totalBudget / 1000).toFixed(0)}k total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saldo pendiente</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>${(totalBalance / 1000).toFixed(0)}k</div>
          <div className="stat-sub">MXN</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Proveedores</div>
          <div className="stat-value">{providers.length}</div>
          <div className="stat-sub">{providers.filter(p => p.status === 'pagado').length} pagados</div>
        </div>
      </div>

      {/* Countdown + progress */}
      <div className="grid-2">
        <div className="countdown-card">
          <div className="countdown-label">Cuenta regresiva</div>
          <div className="countdown-title">
            {project?.name || 'Caro & Luis'} · {project?.location || 'Quinta Montes Molina'}
          </div>
          <div className="countdown-nums">
            {[['días', cd.days], ['horas', cd.hours], ['min', cd.mins], ['seg', cd.secs]].map(([l, v]) => (
              <div className="countdown-unit" key={l}>
                <span className="countdown-num">{String(v).padStart(2, '0')}</span>
                <span className="countdown-unit-label">{l}</span>
              </div>
            ))}
          </div>
          <div className="countdown-date">
            {new Date((project?.event_date || '2026-11-20') + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Avance por categoría</div>
          <ProgressRow name="Documentación civil" value={65} />
          <ProgressRow name="Proveedores y pagos" value={Math.round((totalPaid / Math.max(totalBudget, 1)) * 100)} max={100} />
          <ProgressRow name="Logística del día" value={55} />
          <ProgressRow name="Invitados" value={Math.round((confirmedGuests / Math.max(totalGuests, 1)) * 100)} max={100} />
          <ProgressRow name="Misa religiosa" value={70} />
          <ProgressRow name="Fotos y video" value={50} />
        </div>
      </div>

      {/* Upcoming + urgent payments */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Próximas fechas clave</div>
          {upcoming.map((ev, i) => (
            <div key={ev.id || i} style={{ borderBottom: '1px solid var(--beige)', paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--taupe)' }}>
                {ev.event_date ? new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ev.status === 'key' ? 'var(--gold)' : 'var(--dark-taupe)', marginTop: 2 }}>{ev.title}</div>
              {ev.location && <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{ev.location}</div>}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Saldos urgentes</div>
          {urgentPayments.map((p, i) => (
            <div key={p.id || i} style={{ borderBottom: '1px solid var(--beige)', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{p.due_date || 'Sin fecha'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-taupe)' }}>${(p.balance || 0).toLocaleString()}</div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--text-light)', paddingTop: 8 }}>
            Total pendiente: <strong style={{ color: 'var(--dark-taupe)' }}>${totalBalance.toLocaleString()} MXN</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TIMELINE ──────────────────────────────────────────────
export function Timeline({ events: rawEvents, project }) {
  const events = rawEvents.length ? rawEvents : DEMO_EVENTS
  const sorted = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
  return (
    <div className="card">
      {sorted.map((ev, i) => (
        <div className="timeline-item" key={ev.id || i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`timeline-dot ${ev.status === 'past' ? 'past' : ''} ${ev.is_urgent ? 'urgent' : ''}`} />
            {i < sorted.length - 1 && <div className="timeline-connector" />}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div className="timeline-date">
              {ev.event_date ? new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              {ev.event_time && ` · ${ev.event_time}h`}
            </div>
            <div className="timeline-ev-title" style={{ color: ev.status === 'key' ? 'var(--gold)' : ev.is_urgent ? 'var(--red)' : 'var(--dark-taupe)' }}>
              {ev.title}
            </div>
            {ev.location && <div className="timeline-desc">{ev.location}</div>}
            {ev.description && <div className="timeline-desc">{ev.description}</div>}
            {ev.status === 'past' && <span className="badge badge-gray" style={{ marginTop: 4 }}>Completado</span>}
            {ev.status === 'key' && <span className="badge badge-amber" style={{ marginTop: 4 }}>Día especial</span>}
            {ev.is_urgent && <span className="badge badge-red" style={{ marginTop: 4 }}>Urgente</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── PROVEEDORES ────────────────────────────────────────────
export function Proveedores({ providers: rawProviders, setProviders, project }) {
  const providers = rawProviders.length ? rawProviders : DEMO_PROVIDERS
  const [tab, setTab] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Otro', contact: '', total_amount: '', paid_amount: '', due_date: '', status: 'pendiente', notes: '' })

  const filtered = tab === 'todos' ? providers : providers.filter(p => p.status === tab)
  const totalBudget = providers.reduce((a, p) => a + (p.total_amount || 0), 0)
  const totalPaid = providers.reduce((a, p) => a + (p.paid_amount || 0), 0)
  const totalBalance = providers.reduce((a, p) => a + (p.balance || 0), 0)

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const payload = {
      ...form,
      project_id: project?.id,
      total_amount: Number(form.total_amount) || 0,
      paid_amount: Number(form.paid_amount) || 0,
      balance: (Number(form.total_amount) || 0) - (Number(form.paid_amount) || 0),
    }
    try {
      const saved = await upsertProvider(payload)
      setProviders(prev => [saved, ...prev.filter(p => p.id !== saved.id)])
    } catch {
      setProviders(prev => [{ ...payload, id: Date.now() }, ...prev])
    }
    setForm({ name: '', category: 'Otro', contact: '', total_amount: '', paid_amount: '', due_date: '', status: 'pendiente', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  const remove = async (id) => {
    try { await deleteProvider(id) } catch { }
    setProviders(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="section-gap">
      <div className="grid-3">
        <div className="stat-card"><div className="stat-label">Presupuesto total</div><div className="stat-value">${(totalBudget / 1000).toFixed(0)}k</div></div>
        <div className="stat-card"><div className="stat-label">Pagado</div><div className="stat-value" style={{ color: 'var(--green)' }}>${(totalPaid / 1000).toFixed(0)}k</div></div>
        <div className="stat-card"><div className="stat-label">Saldo</div><div className="stat-value" style={{ color: 'var(--red)' }}>${(totalBalance / 1000).toFixed(0)}k</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {[['todos', 'Todos'], ['pagado', 'Pagados'], ['parcial', 'Parcial'], ['pendiente', 'Pendiente']].map(([v, l]) => (
              <div key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</div>
            ))}
          </div>
          <button className="btn" onClick={() => setShowForm(s => !s)}>+ Proveedor</button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid var(--sand)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {[['name', 'Nombre'], ['contact', 'Contacto'], ['total_amount', 'Total MXN'], ['paid_amount', 'Pagado']].map(([k, l]) => (
                <div key={k}>
                  <label style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{l}</label>
                  <input className="input-field" style={{ height: 'auto' }} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Categoría</label>
                <select className="input-field" style={{ height: 'auto' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Fotografía', 'Video', 'Catering', 'Flores', 'Música', 'Salón', 'Vestido', 'Maquillaje', 'Transporte', 'Pastel', 'Invitaciones', 'Otro'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Estado</label>
                <select className="input-field" style={{ height: 'auto' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['pagado', 'parcial', 'pendiente'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Notas</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Proveedor</th><th>Categoría</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id || i}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--dark-taupe)' }}>{p.name}</div>
                    {p.contact && <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{p.contact.split('·')[0]}</div>}
                  </td>
                  <td><span className="badge badge-gray">{p.category}</span></td>
                  <td style={{ fontWeight: 500 }}>${(p.total_amount || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--green)' }}>${(p.paid_amount || 0).toLocaleString()}</td>
                  <td style={{ color: (p.balance || 0) > 0 ? 'var(--red)' : 'var(--green)', fontWeight: (p.balance || 0) > 0 ? 600 : 400 }}>${(p.balance || 0).toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-light)' }}>{p.due_date || '—'}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><DeleteBtn onConfirm={() => remove(p.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── CHECKLIST PAGE (Civil / Misa) ─────────────────────────
export function ChecklistPage({ category, title, subtitle, checklist: rawChecklist, setChecklist, project }) {
  const demo = category === 'civil' ? DEMO_CHECKLIST_CIVIL : DEMO_CHECKLIST_MISA
  const items = rawChecklist.filter(c => c.category === category).length
    ? rawChecklist.filter(c => c.category === category)
    : demo
  const done = items.filter(c => c.done).length
  const [newText, setNewText] = useState('')

  const toggle = async (item) => {
    const next = !item.done
    try { await toggleChecklistItem(item.id, next) } catch { }
    setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: next } : c))
  }

  const add = async () => {
    if (!newText.trim()) return
    const payload = { text: newText, done: false, category, project_id: project?.id, priority: 'media' }
    try {
      const saved = await upsertChecklistItem(payload)
      setChecklist(prev => [...prev, saved])
    } catch {
      setChecklist(prev => [...prev, { ...payload, id: Date.now() }])
    }
    setNewText('')
  }

  return (
    <div className="section-gap">
      <div className="card">
        <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text-light)' }}>{done}/{items.length} completados</div>
        <div className="progress-outer" style={{ marginBottom: 20, height: 8 }}>
          <div className="progress-inner" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
        {items.map((c, i) => (
          <CheckItem key={c.id || i} item={c} onToggle={() => toggle(c)} />
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input className="input-field" style={{ height: 'auto' }} placeholder="Nueva tarea..." value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <button className="btn" onClick={add}>+</button>
        </div>
      </div>
    </div>
  )
}

// ─── INVITADOS ──────────────────────────────────────────────
export function Invitados({ guests: rawGuests, setGuests, project }) {
  const guests = rawGuests.length ? rawGuests : DEMO_GUESTS
  const total = guests.reduce((a, g) => a + (g.total || 0), 0)
  const confirmed = guests.reduce((a, g) => a + (g.confirmed || 0), 0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ group_name: '', total: '', confirmed: '', notes: '' })

  const save = async () => {
    if (!form.group_name) return
    const payload = { ...form, total: Number(form.total) || 0, confirmed: Number(form.confirmed) || 0, project_id: project?.id }
    try {
      const saved = await upsertGuest(payload)
      setGuests(prev => [saved, ...prev])
    } catch {
      setGuests(prev => [{ ...payload, id: Date.now() }, ...prev])
    }
    setForm({ group_name: '', total: '', confirmed: '', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="section-gap">
      <div className="grid-3">
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{total}</div></div>
        <div className="stat-card"><div className="stat-label">Confirmados</div><div className="stat-value" style={{ color: 'var(--green)' }}>{confirmed}</div><div className="stat-sub">{total ? Math.round(confirmed / total * 100) : 0}%</div></div>
        <div className="stat-card"><div className="stat-label">Sin confirmar</div><div className="stat-value" style={{ color: 'var(--amber)' }}>{total - confirmed}</div></div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{guests.length} grupos</span>
          <button className="btn" onClick={() => setShowForm(s => !s)}>+ Grupo</button>
        </div>
        {showForm && (
          <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid var(--sand)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['group_name', 'Nombre del grupo'], ['notes', 'Notas'], ['total', 'Total personas'], ['confirmed', 'Confirmados']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize: 10, color: 'var(--taupe)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 4 }}>{l}</label>
                <input className="input-field" style={{ height: 'auto' }} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8 }}>
              <button className="btn" onClick={save}>Guardar</button>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}
        {guests.map((g, i) => (
          <div key={g.id || i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>{g.group_name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{g.confirmed}/{g.total}</span>
            </div>
            <div className="progress-outer">
              <div className="progress-inner" style={{ width: `${g.total ? (g.confirmed / g.total) * 100 : 0}%` }} />
            </div>
            {g.notes && <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{g.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── LOGÍSTICA ──────────────────────────────────────────────
export function Logistica({ project }) {
  const HORARIO = [
    ['08:00', 'Getting ready', 'Hotel Chablé — Suite principal'],
    ['09:00', 'Fotografía getting ready', 'Raúl y asistente llegan'],
    ['10:00', 'Luis + chambelanes', 'Fotos previas en la Quinta'],
    ['12:00', 'Entrega de flores', 'Monse llega a Quinta Montes Molina'],
    ['14:00', 'Montaje final', 'Catering + decoración adentro'],
    ['15:00', 'Traslados a parroquia', 'Vanes confirmadas'],
    ['16:00', 'CEREMONIA RELIGIOSA', 'Parroquia del Carmen'],
    ['17:15', 'Fotos exteriores', 'Jardines parroquia · 45 min'],
    ['17:45', 'Traslado a Quinta', 'Todos hacia Quinta Montes Molina'],
    ['18:30', 'Llegada invitados', 'Coctelera jardín + cuarteto de cuerdas'],
    ['19:30', 'Entrada novios', 'Salón principal'],
    ['20:00', 'CENA', '3 tiempos'],
    ['21:30', 'Primer baile', 'Vals · Papás'],
    ['23:00', 'Hora loca', 'DJ Ariel toma el control'],
    ['02:00', 'Fin de evento', 'Traslados disponibles'],
  ]
  return (
    <div className="section-gap">
      <div className="card">
        <div className="card-title">Plan del día — 20 de noviembre 2026</div>
        {HORARIO.map(([t, e, d], i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--beige)' }}>
            <div style={{ minWidth: 52, fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>{t}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>{e}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Transporte</div>
          {[['Vane #1', 'Familia mayor', 'Hotel ↔ Parroquia ↔ Quinta'],
            ['Vane #2', 'Damas + familia Caro', 'Hotel Chablé → Parroquia → Quinta'],
            ['Vane #3', 'Invitados sin auto', 'Disponible bajo demanda']].map(([v, w, r]) => (
            <div key={v} style={{ padding: '10px 0', borderBottom: '1px solid var(--beige)' }}>
              <div style={{ fontWeight: 500, color: 'var(--dark-taupe)', fontSize: 13 }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{w} · {r}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Responsables</div>
          {[['Coordinadora', 'Caro'], ['Dama líder', 'Ana García'], ['Contacto proveedores', 'Fernanda López'], ['Traslados', 'Rodrigo Solis'], ['Foto', 'Raúl Molina'], ['Música', 'DJ Ariel']].map(([r, n]) => (
            <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--beige)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-light)' }}>{r}</span>
              <span style={{ fontWeight: 500, color: 'var(--dark-taupe)' }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── NOTAS MAESTRAS ─────────────────────────────────────────
export function NotasMaestras({ notes: rawNotes, setNotes, project }) {
  const notes = rawNotes.length ? rawNotes : []
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [open, setOpen] = useState({})

  const save = async () => {
    if (!form.title.trim()) return
    const payload = { ...form, project_id: project?.id, category: 'notas' }
    try {
      const saved = await upsertNote(payload)
      setNotes(prev => [saved, ...prev])
    } catch {
      setNotes(prev => [{ ...payload, id: Date.now(), created_at: new Date().toISOString() }, ...prev])
    }
    setForm({ title: '', content: '' })
    setAdding(false)
  }

  return (
    <div className="section-gap">
      <div style={{ background: 'var(--beige)', borderRadius: 10, padding: '12px 16px', fontSize: 12.5, color: 'var(--warm-gray)', lineHeight: 1.6 }}>
        💡 Pega aquí el contenido de tus Apple Notes tal como está. Cada nota queda en una tarjeta expandible. Para extraer datos automáticamente, usa <strong>Importar IA</strong>.
      </div>

      {notes.map((n, i) => (
        <div className="note-card" key={n.id || i}>
          <div className="note-card-header" onClick={() => setOpen(o => ({ ...o, [n.id || i]: !o[n.id || i] }))}>
            <span className="note-card-title">📋 {n.title}</span>
            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
              {n.created_at ? new Date(n.created_at).toLocaleDateString('es-MX') : ''} · {open[n.id || i] ? 'Cerrar' : 'Ver'}
            </span>
          </div>
          {open[n.id || i] && <div className="note-card-body">{n.content}</div>}
        </div>
      ))}

      {adding ? (
        <div className="card" style={{ borderTop: '3px solid var(--champagne)' }}>
          <div className="card-title">Nueva nota</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Nombre de la nota (ej: LOGÍSTICA BODA)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" style={{ height: 'auto' }} />
            <textarea placeholder="Pega aquí el contenido completo de tu nota..." rows={12} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="input-field" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={save}>Guardar nota</button>
              <button className="btn-ghost" onClick={() => setAdding(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      ) : (
        <button className="btn-ghost" style={{ width: '100%', padding: 14, textAlign: 'center' }} onClick={() => setAdding(true)}>
          + Agregar nota desde Apple Notes
        </button>
      )}
    </div>
  )
}

// ─── WEEK PLANNER ───────────────────────────────────────────
export function WeekPlanner({ project }) {
  const DAYS = [
    { day: 'Lun', date: '16 Nov', tasks: ['Ensayo de misa 18:00h', 'Confirmar llegada coro', 'Llamar a Quinta para montaje'] },
    { day: 'Mar', date: '17 Nov', tasks: ['Recibir flores en Quinta', 'Última prueba maquillaje', 'Confirmar menú final catering'] },
    { day: 'Mié', date: '18 Nov', tasks: ['Llevar vestido a Quinta', 'Coordinar traslados vanes', 'Entregar kit damas'] },
    { day: 'Jue', date: '19 Nov', tasks: ['Prueba de sonido DJ Ariel 17:00h', 'Recepción familia Luis', 'Confirmar room hotel'] },
    { day: 'Vie', date: '19 Nov', tasks: ['☀️ Boda Civil 11:00h', 'Tiempo libre tarde', 'Cena íntima 20:00h'] },
    { day: 'Sáb', date: '20 Nov', tasks: ['💐 Misa 16:00h', '📸 Sesión fotos 17:30h', '🥂 Banquete 18:30h', '✨ Toda la noche'] },
    { day: 'Dom', date: '21 Nov', tasks: ['Brunch hotel 11:00h', 'Apertura de regalos', 'Luna de miel ✈️'] },
  ]
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 20 }}>
        {DAYS.map((d, i) => (
          <div className="week-day" key={i}>
            <div className="week-day-header">{d.date}</div>
            <div className="week-day-name">{d.day}</div>
            <div style={{ height: 1, background: 'var(--sand)', margin: '8px 0' }} />
            {d.tasks.map((t, j) => <div className="week-task" key={j}><span style={{ color: 'var(--champagne)', marginRight: 6, fontSize: 10 }}>◆</span>{t}</div>)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── EVENTOS ESPECIALES ─────────────────────────────────────
export function EventosEspeciales({ events: rawEvents, project }) {
  const especiales = (rawEvents.length ? rawEvents : DEMO_EVENTS).filter(e => ['despedida', 'brunch', 'preboda', 'otro'].includes(e.type) || e.type !== 'misa' && e.type !== 'civil' && e.type !== 'recepcion')
  return (
    <div className="section-gap">
      {especiales.length === 0 && <EmptyState icon="🥂" title="Sin eventos especiales" hint="Los eventos como despedida, brunch o cenas aparecerán aquí." />}
      {(rawEvents.length ? rawEvents : DEMO_EVENTS).map((ev, i) => (
        <div key={ev.id || i} style={{ background: 'var(--white)', borderRadius: 12, padding: 18, border: '1px solid var(--sand)', borderLeft: '3px solid var(--champagne)' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--taupe)', marginBottom: 4 }}>
            {ev.event_date ? new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--dark-taupe)', marginBottom: 6 }}>{ev.title}</div>
          {ev.location && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{ev.location}</div>}
          {ev.description && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>{ev.description}</div>}
        </div>
      ))}
    </div>
  )
}
