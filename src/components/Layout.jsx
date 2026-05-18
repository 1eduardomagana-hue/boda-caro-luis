import { useState } from 'react'
import { BOTTOM_NAV, NAV_SECTIONS, MORE_ITEMS } from '../lib/constants.js'

// ── Desktop Sidebar ──────────────────────────────────────────────────────────
function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">Caro & Luis</div>
        <div className="sidebar-date">20 · nov · 2026 · Quinta Montes Molina</div>
      </div>
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(s => (
          <div key={s.label}>
            <div className="sidebar-section-label">{s.label}</div>
            {s.items.map(n => (
              <button key={n.id} className={`sidebar-item ${page===n.id?'active':''}`}
                onClick={() => setPage(n.id)}>
                <span style={{fontSize:14}}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bro">con amor, tu bro</div>
    </aside>
  )
}

// ── "Más" Drawer (mobile) ────────────────────────────────────────────────────
function MoreDrawer({ onSelect, onClose }) {
  return (
    <div>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet" style={{maxHeight:'85dvh',overflowY:'auto'}}>
        <div className="sheet-handle" />
        <div className="sheet-title">Secciones</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {MORE_ITEMS.map(it => (
            <button key={it.id} className="sheet-action" onClick={() => { onSelect(it.id); onClose(); }}>
              <div className="sheet-action-icon" style={{background:it.color}}>{it.icon}</div>
              <div>
                <div className="sheet-action-label">{it.label}</div>
                <div className="sheet-action-sub">{it.sub}</div>
              </div>
              <span style={{marginLeft:'auto',color:'#C4AFA0',fontSize:16}}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Bottom Nav (mobile) ──────────────────────────────────────────────────────
function BottomNav({ page, setPage }) {
  const [showMore, setShowMore] = useState(false)

  const handleTab = (id) => {
    if (id === 'more') { setShowMore(true); return; }
    setPage(id)
  }

  const isActive = (id) => {
    if (id === 'more') return false
    return page === id
  }

  return (
    <>
      <nav className="bottom-nav">
        {BOTTOM_NAV.map(n => (
          <button key={n.id} className={`bottom-nav-item ${isActive(n.id)?'active':''}`}
            onClick={() => handleTab(n.id)}>
            <div className="nav-icon-wrap">{n.icon}</div>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
      {showMore && (
        <MoreDrawer onSelect={setPage} onClose={() => setShowMore(false)} />
      )}
    </>
  )
}

// ── Layout root ──────────────────────────────────────────────────────────────
export default function Layout({ page, setPage, children }) {
  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {children}
      </main>
      {/* Bottom nav only on mobile via CSS */}
      <div style={{display:'block'}} className="mobile-nav-wrapper">
        <BottomNav page={page} setPage={setPage} />
      </div>
    </div>
  )
}
