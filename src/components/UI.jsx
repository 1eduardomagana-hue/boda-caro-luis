import { useState } from 'react'
import { COLORS } from '../lib/constants.js'

export const C = COLORS

export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

export function CardTitle({ children }) {
  return <div className="card-title">{children}</div>
}

export function Badge({ type = 'gray', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>
}

export function Btn({ children, onClick, ghost = false, disabled = false, style = {}, fullWidth = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={ghost ? 'btn-ghost' : 'btn'}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', width: fullWidth ? '100%' : undefined, ...style }}
    >
      {children}
    </button>
  )
}

export function Input({ value, onChange, placeholder, type = 'text', rows, style = {} }) {
  if (rows) return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      rows={rows} className="input-field" style={style} />
  )
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      type={type} className="input-field" style={{ height: 'auto', ...style }} />
  )
}

export function Select({ value, onChange, options, style = {} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="input-field" style={{ height: 'auto', cursor: 'pointer', ...style }}>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  )
}

export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <span className="accordion-title">{title}</span>
        <span style={{ color: C.taupe, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  )
}

export function ProgressBar({ value, max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress-bar-outer">
      <div className="progress-bar-inner" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function SectionGap({ children }) {
  return <div className="section-gap">{children}</div>
}

export function Grid({ cols = 2, children, gap = 16 }) {
  return (
    <div className={`grid-${cols}`} style={{ gap }}>
      {children}
    </div>
  )
}

export function Spinner({ message = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: 14 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `3px solid ${C.sand}`, borderTopColor: C.gold,
        animation: 'spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize: 13, color: C.textLight }}>{message}</div>
    </div>
  )
}

export function StatusDot({ status }) {
  const color = status === 'pagado' ? C.green : status === 'parcial' ? C.amber : C.red
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 6 }} />
}

export function StatusBadge({ status }) {
  const map = { pagado: ['badge-green', '● Pagado'], parcial: ['badge-amber', '◑ Parcial'], pendiente: ['badge-red', '○ Pendiente'] }
  const [cls, label] = map[status] || ['badge-gray', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

export function Alert({ children, type = 'warning' }) {
  return (
    <div style={{
      background: '#FDF3E8', border: '1px solid #E8D0A8', borderRadius: 8,
      padding: '10px 14px', fontSize: 12.5, color: '#8B5E1A',
      marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8,
    }}>
      {type === 'warning' ? '⚠️' : 'ℹ️'} <span>{children}</span>
    </div>
  )
}

export function CheckItem({ item, onToggle }) {
  return (
    <div className="checklist-item" onClick={onToggle}>
      <div className={`check-box ${item.done ? 'done' : ''}`}>
        {item.done && <span style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>✓</span>}
      </div>
      <span className={`check-text ${item.done ? 'done' : ''}`}>{item.text}</span>
    </div>
  )
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div className="page-title">{title}</div>
      {subtitle && <div className="page-subtitle">{subtitle}</div>}
    </div>
  )
}
