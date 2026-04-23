import { COLORS, NAV_SECTIONS } from '../lib/constants.js'

const C = COLORS

export default function Layout({ page, setPage, children }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Caro & Luis</div>
          <div className="sidebar-subtitle">Wedding Planner</div>
          <div className="sidebar-date">20 · nov · 2026</div>
        </div>
        {NAV_SECTIONS.map(section => (
          <div className="nav-section" key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map(n => (
              <div
                key={n.id}
                className={`nav-item ${page === n.id ? 'active' : ''}`}
                onClick={() => setPage(n.id)}
              >
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{
          marginTop: 'auto', padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.3)',
            fontStyle: 'italic', letterSpacing: '0.5px', lineHeight: 1.6,
          }}>
            con amor, tu bro
          </div>
        </div>
      </aside>
      <main className="main">
        {children}
      </main>
    </div>
  )
}
