import './styles/global.css'
import { useState } from 'react'
import { useAuth, Login } from './components/Login.jsx'
import { Onboarding } from './components/Onboarding.jsx'
import { OfflineBanner, Spinner } from './components/UI.jsx'
import { useProject } from './hooks/useProject.js'
import {
  Dashboard, Timeline, Proveedores, ChecklistPage, Invitados,
  Logistica, NotasMaestras, WeekPlanner, EventosEspeciales,
} from './pages/Pages.jsx'
import { Archivos } from './pages/Archivos.jsx'
import { ImportarIA } from './pages/ImportarIA.jsx'

const NAV = [
  { section:'Principal', items:[
    { id:'dashboard', icon:'🏠', label:'Dashboard' },
    { id:'timeline',  icon:'📅', label:'Timeline' },
    { id:'proveedores',icon:'💳', label:'Proveedores' },
  ]},
  { section:'Ceremonias', items:[
    { id:'civil', icon:'📜', label:'Boda Civil' },
    { id:'misa',  icon:'⛪', label:'Misa' },
  ]},
  { section:'Planeación', items:[
    { id:'invitados', icon:'👥', label:'Invitados' },
    { id:'logistica', icon:'🗺️', label:'Logística' },
    { id:'fotos',     icon:'📷', label:'Fotos' },
    { id:'week',      icon:'🗓️', label:'Week Planner' },
    { id:'eventos',   icon:'🥂', label:'Eventos' },
  ]},
  { section:'Notas & más', items:[
    { id:'notas',    icon:'📝', label:'Notas Maestras' },
    { id:'archivos', icon:'🗂️', label:'Archivos' },
    { id:'importar', icon:'🤖', label:'Importar IA' },
  ]},
]

const PAGE_TITLES = {
  dashboard:'Dashboard', timeline:'Timeline general', proveedores:'Proveedores y pagos',
  civil:'Boda Civil', misa:'Misa religiosa', invitados:'Invitados',
  logistica:'Logística del día', fotos:'Fotos y sesiones', week:'Week Planner',
  eventos:'Eventos especiales', notas:'Notas Maestras', archivos:'Archivos y galerías',
  importar:'Importar con IA',
}

function Sidebar({ page, setPage, project, logout }) {
  const date = project?.event_date
    ? new Date(project.event_date+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})
    : '20 · noviembre · 2026'
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">{project?.name||'Caro & Luis'}</div>
        <div className="sidebar-subtitle">Wedding Planner</div>
        <div className="sidebar-date">{date}</div>
        {project?.location && <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:4}}>{project.location}</div>}
      </div>
      {NAV.map(({section,items})=>(
        <div className="nav-section" key={section}>
          <div className="nav-label">{section}</div>
          {items.map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="sidebar-footer">
        <div style={{marginBottom:8,fontStyle:'italic'}}>con amor, tu bro</div>
        <button onClick={logout} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.2)',fontSize:10,fontFamily:'Jost,sans-serif',padding:0}}>
          cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default function App() {
  const { authed, login, logout } = useAuth()
  const [page, setPage] = useState('dashboard')
  const {
    project, loading, online, reload,
    providers, setProviders,
    events, setEvents,
    checklist, setChecklist,
    guests, setGuests,
    links, setLinks,
    notes, setNotes,
    files, setFiles,
  } = useProject()

  if (!authed) return <Login onLogin={login} />

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)'}}>
      <Spinner message="Cargando tu boda..." />
    </div>
  )

  if (!project) return <Onboarding onComplete={reload} />

  const C = { project, online }

  const renderPage = () => {
    switch(page) {
      case 'dashboard':   return <Dashboard   {...C} providers={providers} events={events} guests={guests} />
      case 'timeline':    return <Timeline    {...C} events={events} />
      case 'proveedores': return <Proveedores {...C} providers={providers} setProviders={setProviders} />
      case 'civil':       return <ChecklistPage {...C} category="civil" checklist={checklist} setChecklist={setChecklist} />
      case 'misa':        return <ChecklistPage {...C} category="misa"  checklist={checklist} setChecklist={setChecklist} />
      case 'invitados':   return <Invitados   {...C} guests={guests} setGuests={setGuests} />
      case 'logistica':   return <Logistica   {...C} />
      case 'fotos':       return (
        <div className="card">
          <div className="card-title">Sesiones fotográficas</div>
          {[['Preboda','Por agendar','Sesión exterior — locación a definir'],
            ['Boda Civil','Pendiente','Raúl Molina — 2 horas · 19 nov'],
            ['Getting Ready','Pendiente','Hotel Chablé · 20 nov 8:00am'],
            ['Ceremonia','Pendiente','Cobertura total · 20 nov 16:00h'],
            ['Recepción','Pendiente','Quinta Montes Molina · hasta 00:00h'],
          ].map(([t,s,d],i)=>(
            <div key={i} style={{padding:'10px 0',borderBottom:'1px solid var(--beige)',display:'flex',justifyContent:'space-between'}}>
              <div><div style={{fontSize:13,fontWeight:500,color:'var(--dark-taupe)'}}>{t}</div><div style={{fontSize:11.5,color:'var(--text-light)'}}>{d}</div></div>
              <span className="badge badge-amber">{s}</span>
            </div>
          ))}
        </div>
      )
      case 'week':      return <WeekPlanner      {...C} />
      case 'eventos':   return <EventosEspeciales {...C} events={events} />
      case 'notas':     return <NotasMaestras     {...C} notes={notes} setNotes={setNotes} />
      case 'archivos':  return <Archivos          {...C} links={links} setLinks={setLinks} files={files} setFiles={setFiles} />
      case 'importar':  return <ImportarIA        {...C} reload={reload} />
      default:          return <Dashboard {...C} providers={providers} events={events} guests={guests} />
    }
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} project={project} logout={logout} />
      <main className="main">
        {!online && <OfflineBanner />}
        {page!=='dashboard' && (
          <div className="page-header">
            <div className="page-title">{PAGE_TITLES[page]}</div>
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  )
}
