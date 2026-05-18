import { useState } from 'react'

export function Spinner({ msg = 'Cargando…' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span className="spinner-label">{msg}</span>
    </div>
  )
}

export function ProgressBar({ value, max = 100 }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100))
  return (
    <div className="prog-outer">
      <div className="prog-inner" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    pagado: ['bg-green', '● Pagado'],
    parcial: ['bg-amber', '◑ Parcial'],
    pendiente: ['bg-red', '○ Pendiente'],
  }
  const [cls, label] = map[status] || ['bg-gray', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

export function SectionRow({ label, action, onAction }) {
  return (
    <div className="sec-row">
      <span className="sec-label">{label}</span>
      {action && <button onClick={onAction} className="sec-action">{action}</button>}
    </div>
  )
}

export function CheckRow({ item, onToggle }) {
  return (
    <div className="check-row" onClick={onToggle}>
      <div className={`check-box ${item.done ? 'done' : ''}`}>
        {item.done && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
      <span className={`check-text ${item.done ? 'done' : ''}`}>{item.text || item.texto}</span>
    </div>
  )
}

export function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {action && (
        <button className="btn" style={{ maxWidth: 200, margin: '0 auto' }} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

export function Sheet({ title, onClose, children }) {
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle-wrap">
          <div className="sheet-handle" />
        </div>
        {title && <div className="sheet-title">{title}</div>}
        <div className="sheet-body">{children}</div>
      </div>
    </>
  )
}

export function Inp({ value, onChange, placeholder, type = 'text', rows, label, style = {} }) {
  return (
    <div className="field">
      {label && <div className="field-label">{label}</div>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="inp" style={style} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} className="inp" style={style} />}
    </div>
  )
}

export function Sel({ value, onChange, options, label }) {
  return (
    <div className="field">
      {label && <div className="field-label">{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} className="inp" style={{ cursor: 'pointer' }}>
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function QuickActions({ actions, onClose }) {
  return (
    <Sheet title="Acción rápida" onClose={onClose}>
      <div className="form-stack" style={{ paddingBottom: 8 }}>
        {actions.map((a, i) => (
          <button key={i} className="sheet-action-row" onClick={() => { a.onPress(); onClose(); }}>
            <div className="sheet-action-icon" style={{ background: a.color || '#F0EBE3' }}>{a.icon}</div>
            <div>
              <div className="sheet-action-label">{a.label}</div>
              {a.sub && <div className="sheet-action-sub">{a.sub}</div>}
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="page-header">
      <div className="page-header-inner">
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  )
}

export function AddBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 10,
      background: '#5C4D44', color: '#D4B896',
      border: 'none', fontSize: 20, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, touchAction: 'manipulation',
    }}>+</button>
  )
}
