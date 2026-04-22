import { useState } from 'react'

// ─── Progress row ──────────────────────────────────────────
export function ProgressRow({ name, value, max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress-row">
      <div className="progress-row-header">
        <span className="progress-row-name">{name}</span>
        <span className="progress-row-pct">{pct}%</span>
      </div>
      <div className="progress-outer">
        <div className="progress-inner" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Status badge ──────────────────────────────────────────
export function StatusBadge({ status }) {
  if (status === 'pagado')   return <span className="badge badge-green">● Pagado</span>
  if (status === 'parcial')  return <span className="badge badge-amber">◑ Parcial</span>
  return <span className="badge badge-red">○ Pendiente</span>
}

// ─── Accordion ─────────────────────────────────────────────
export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <span className="accordion-title">{title}</span>
        <span style={{ color: 'var(--taupe)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  )
}

// ─── Check item ─────────────────────────────────────────────
export function CheckItem({ item, onToggle }) {
  return (
    <div className="check-item" onClick={onToggle}>
      <div className={`check-box ${item.done ? 'done' : ''}`}>
        {item.done && <span style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>✓</span>}
      </div>
      <span className={`check-text ${item.done ? 'done' : ''}`}>{item.text || item.content}</span>
    </div>
  )
}

// ─── Spinner ────────────────────────────────────────────────
export function Spinner({ message = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 14 }}>
      <div className="spinner" />
      <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{message}</span>
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────
export function EmptyState({ icon, title, hint, action, onAction }) {
  return (
    <div style={{
      textAlign: 'center', padding: '52px 24px', background: 'var(--white)',
      borderRadius: 12, border: '1.5px dashed var(--sand)',
    }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--dark-taupe)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-light)', maxWidth: 300, margin: '0 auto 16px', lineHeight: 1.6 }}>{hint}</div>
      {action && <button className="btn-ghost" onClick={onAction}>{action}</button>}
    </div>
  )
}

// ─── Offline banner ─────────────────────────────────────────
export function OfflineBanner() {
  return (
    <div style={{
      background: '#FDF3E8', border: '1px solid #E8D0A8', borderRadius: 8,
      padding: '10px 16px', fontSize: 12, color: '#8B5E1A', marginBottom: 16,
      display: 'flex', gap: 8,
    }}>
      ⚠️ Sin conexión a Supabase — los datos mostrados son de demostración. Configura las variables de entorno para activar la persistencia.
    </div>
  )
}

// ─── Confirm delete button ──────────────────────────────────
export function DeleteBtn({ onConfirm, label = '✕' }) {
  const [confirm, setConfirm] = useState(false)
  if (confirm) return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--red)' }}>¿Eliminar?</span>
      <button className="btn" style={{ background: 'var(--red)', padding: '3px 8px', fontSize: 11 }} onClick={onConfirm}>Sí</button>
      <button className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setConfirm(false)}>No</button>
    </span>
  )
  return (
    <button onClick={() => setConfirm(true)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--taupe)', fontSize: 13, padding: '2px 5px', borderRadius: 4, transition: 'color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--taupe)'}>
      {label}
    </button>
  )
}
