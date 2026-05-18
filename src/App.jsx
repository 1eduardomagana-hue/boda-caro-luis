import { useState, useEffect } from 'react'
import GlobalStyles from './components/GlobalStyles.jsx'
import Layout from './components/Layout.jsx'
import Login from './components/Login.jsx'
import { Spinner, QuickActions } from './components/UI.jsx'
import { getProject } from './lib/db.js'

// Pages
import Dashboard from './pages/Dashboard.jsx'
import Pendientes from './pages/Pendientes.jsx'
import Timeline from './pages/Timeline.jsx'
import Proveedores from './pages/Proveedores.jsx'
import ChecklistPage from './pages/ChecklistPage.jsx'
import Invitados from './pages/Invitados.jsx'
import Notas from './pages/Notas.jsx'
import Archivos from './pages/Archivos.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [project, setProject] = useState(null)
  const [page, setPage] = useState('home')
  const [booting, setBooting] = useState(true)
  const [fab, setFab] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('boda_auth') === 'ok') setAuthed(true)
    setBooting(false)
  }, [])

  useEffect(() => {
    if (!authed) return
    getProject().then(p => setProject(p))
  }, [authed])

  const fabActions = [
    { icon: '📝', label: 'Nueva nota',      sub: 'Pega desde Apple Notes',  color: '#F0EBE3', onPress: () => setPage('notas') },
    { icon: '✓',  label: 'Nuevo pendiente', sub: 'Agrega una tarea',        color: '#EEF0F8', onPress: () => setPage('pending') },
    { icon: '💳', label: 'Nuevo proveedor', sub: 'Pago o servicio',         color: '#EEF5EF', onPress: () => setPage('proveedores') },
    { icon: '🗂️', label: 'Subir archivo',   sub: 'Foto, contrato o doc',   color: '#FDF3E8', onPress: () => setPage('archivos') },
  ]

  if (booting) return <><GlobalStyles /><Spinner msg="Cargando…" /></>
  if (!authed) return <><GlobalStyles /><Login onLogin={() => setAuthed(true)} /></>
  if (!project) return <><GlobalStyles /><Spinner msg="Conectando…" /></>

  const renderPage = () => {
    const nav = setPage
    switch (page) {
      case 'home':        return <Dashboard project={project} onNavigate={nav} />
      case 'pending':     return <Pendientes project={project} />
      case 'timeline':    return <Timeline project={project} />
      case 'proveedores': return <Proveedores project={project} />
      case 'civil':       return <ChecklistPage project={project} categorySlug="civil" title="Boda Civil"
                            subtitle="Viernes 20 de noviembre · 11:00h"
                            meta={[['Lugar','Registro Civil de Mérida'],['Hora','11:00h'],['Testigos','4 confirmados']]} />
      case 'misa':        return <ChecklistPage project={project} categorySlug="misa" title="Misa"
                            subtitle="Sábado 21 de noviembre · 16:00h"
                            meta={[['Parroquia','Del Carmen'],['Padre','Ignacio Mendoza'],['Coro','Ensemble Sagrado']]} />
      case 'invitados':   return <Invitados project={project} />
      case 'logistica':   return <PlaceholderPage pageId="logistica" project={project} />
      case 'fotos':       return <PlaceholderPage pageId="fotos" project={project} />
      case 'week':        return <PlaceholderPage pageId="week" project={project} />
      case 'eventos':     return <PlaceholderPage pageId="eventos" project={project} />
      case 'notas':       return <Notas project={project} />
      case 'archivos':    return <Archivos project={project} />
      default:            return <Dashboard project={project} onNavigate={nav} />
    }
  }

  return (
    <>
      <GlobalStyles />
      <Layout page={page} setPage={setPage}>
        {renderPage()}
      </Layout>
      <button className="fab" onClick={() => setFab(true)} aria-label="Acción rápida">＋</button>
      {fab && <QuickActions actions={fabActions} onClose={() => setFab(false)} />}
    </>
  )
}
