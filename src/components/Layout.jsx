import { useState } from 'react'
import { useDevice } from '../hooks/useDevice.js'
import { NAV_SECTIONS, MORE_ITEMS, BOTTOM_NAV } from '../lib/constants.js'

// ── More Drawer (mobile) ─────────────────────────────────────────────────────
function MoreDrawer({ onSelect, onClose }) {
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle-wrap"><div className="sheet-handle" /></div>
        <div className="sheet-title">Secciones</div>
        <div className="sheet-body" style={{ paddingBottom: 8 }}>
          {MORE_ITEMS.map(it => (
            <button key={it.id} className="sheet-action-row" onClick={() => { onSelect(it.id); onClose(); }}>
              <div className="sheet-action-icon" style={{ background: it.color }}>{it.icon}</div>
              <div>
                <div className="sheet-action-label">{it.label}</div>
                {it.sub && <div className="sheet-action-sub">{it.sub}</div>}
              </div>
              <span style={{ marginLeft: 'auto', color: '#C4AFA0', fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ page, setPage }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <nav className="bnav">
        {BOTTOM_NAV.map(tab => {
          const active = tab.id === 'more' ? false : page === tab.id
          return (
            <button
              key={tab.id}
              className={`bnav-item ${active ? 'active' : ''}`}
              onClick={() => tab.id === 'more' ? setShowMore(true) : setPage(tab.id)}
            >
              {active && <div className="bnav-active-dot" />}
              <span className="bnav-icon">{tab.icon}</span>
              <span className="bnav-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
      {showMore && <MoreDrawer onSelect={setPage} onClose={() => setShowMore(false)} />}
    </>
  )
}

// ── Desktop Sidebar ───────────────────────────────────────────────────────────
function Sidebar({ page, setPage }) {
  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">Caro & Luis</div>
        <div className="sidebar-meta">20 · Nov · 2026 · Quinta Montes Molina</div>
      </div>
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(s => (
          <div key={s.label}>
            <div className="sidebar-section-label">{s.label}</div>
            {s.items.map(n => (
              <button key={n.id} className={`sidebar-btn ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>
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

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function Layout({ page, setPage, children }) {
  const { isMobile } = useDevice()

  // MOBILE: full-screen + bottom nav only. Zero sidebar.
  if (isMobile) {
    return (
      <div className="mobile-root">
        <div className="mobile-screen">
          {children}
        </div>
        <BottomNav page={page} setPage={setPage} />
      </div>
    )
  }

  // DESKTOP: sidebar fixed + main content
  return (
    <div className="desktop-root">
      <Sidebar page={page} setPage={setPage} />
      <main className="desktop-main">
        {children}
      </main>
    </div>
  )
}
