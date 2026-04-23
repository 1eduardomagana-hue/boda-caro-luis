import { useState, useEffect } from 'react'
import GlobalStyles from './components/GlobalStyles.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Timeline from './pages/Timeline.jsx'
import Proveedores from './pages/Proveedores.jsx'
import ChecklistPage from './pages/ChecklistPage.jsx'
import Invitados from './pages/Invitados.jsx'
import Notas from './pages/Notas.jsx'
import Archivos from './pages/Archivos.jsx'
import Importar from './pages/Importar.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import { Spinner } from './components/UI.jsx'
import { getProject } from './lib/db.js'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [project, setProject] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('boda_auth')
    if (stored === 'ok') setAuthed(true)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authed) return
    getProject().then(p => setProject(p))
  }, [authed])

  if (loading) return (
    <>
      <GlobalStyles />
      <Spinner message="Cargando..." />
    </>
  )

  if (!authed) return (
    <>
      <GlobalStyles />
      <Login onLogin={() => setAuthed(true)} />
    </>
  )

  if (!project) return (
    <>
      <GlobalStyles />
      <Spinner message="Conectando con Supabase..." />
    </>
  )

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard project={project} />
      case 'timeline': return <Timeline project={project} />
      case 'proveedores': return <Proveedores project={project} />
      case 'civil': return (
        <ChecklistPage
          project={project} categorySlug="civil"
          title="Boda Civil" subtitle="Registro Civil de Mérida · Viernes 20 de noviembre · 11:00h"
          meta={[
            ['Fecha','Viernes 20 de noviembre, 2026'],
            ['Hora','11:00h'],
            ['Lugar','Registro Civil de Mérida'],
            ['Testigos','4 testigos confirmados'],
          ]}
        />
      )
      case 'misa': return (
        <ChecklistPage
          project={project} categorySlug="misa"
          title="Misa religiosa" subtitle="Parroquia del Carmen · Sábado 21 de noviembre · 16:00h"
          meta={[
            ['Parroquia','Parroquia del Carmen, Mérida'],
            ['Hora','16:00h'],
            ['Padre','Padre Ignacio Mendoza'],
            ['Coro','Ensemble Sagrado'],
            ['Ensayo','16 de noviembre, 18:00h'],
          ]}
        />
      )
      case 'invitados': return <Invitados project={project} />
      case 'logistica': return <PlaceholderPage pageId="logistica" project={project} />
      case 'fotos': return <PlaceholderPage pageId="fotos" project={project} />
      case 'week': return <PlaceholderPage pageId="week" project={project} />
      case 'eventos': return <PlaceholderPage pageId="eventos" project={project} />
      case 'notas': return <Notas project={project} />
      case 'categorias': return <PlaceholderPage pageId="categorias" project={project} />
      case 'archivos': return <Archivos project={project} />
      case 'importar': return <Importar project={project} />
      default: return <Dashboard project={project} />
    }
  }

  return (
    <>
      <GlobalStyles />
      <Layout page={page} setPage={setPage}>
        {renderPage()}
      </Layout>
    </>
  )
}
