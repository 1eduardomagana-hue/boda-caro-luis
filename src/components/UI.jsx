import { useState } from 'react'

export function Spinner({ message = 'Cargando...' }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 20px',gap:14}}>
      <div style={{width:32,height:32,borderRadius:'50%',border:'2.5px solid #E8DDD1',borderTopColor:'#B8975A',animation:'spin .9s linear infinite'}}/>
      <div style={{fontSize:13,color:'#8B7D72'}}>{message}</div>
    </div>
  )
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="page-top">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div>
          <div className="page-title-mobile">{title}</div>
          {subtitle && <div className="page-sub">{subtitle}</div>}
        </div>
        {right && <div style={{paddingBottom:16}}>{right}</div>}
      </div>
    </div>
  )
}

export function Card({ children, style={}, noPad=false }) {
  return (
    <div className="card" style={style}>
      {noPad ? children : <div className="card-pad">{children}</div>}
    </div>
  )
}

export function SectionHeader({ label, action, onAction }) {
  return (
    <div className="section-header">
      <div className="section-label">{label}</div>
      {action && (
        <button onClick={onAction} style={{fontSize:12,color:'#B8975A',background:'none',border:'none',cursor:'pointer',fontFamily:"'Jost',sans-serif"}}>
          {action}
        </button>
      )}
    </div>
  )
}

export function Badge({ type='gray', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = { pagado:['green','● Pagado'], parcial:['amber','◑ Parcial'], pendiente:['red','○ Pendiente'] }
  const [t,l] = map[status] || ['gray',status]
  return <Badge type={t}>{l}</Badge>
}

export function ProgressBar({ value, max=100, style={} }) {
  const pct = Math.min(100, Math.round((value/(max||1))*100))
  return (
    <div className="progress-bar-outer" style={style}>
      <div className="progress-bar-inner" style={{width:`${pct}%`}}/>
    </div>
  )
}

export function CheckRow({ item, onToggle }) {
  return (
    <div className="check-row" onClick={onToggle}>
      <div className={`check-box ${item.done?'done':''}`}>
        {item.done && <span style={{color:'white',fontSize:11,fontWeight:'bold'}}>✓</span>}
      </div>
      <span className={`check-text ${item.done?'done':''}`}>{item.text || item.texto}</span>
    </div>
  )
}

export function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {action && (
        <button className="btn-primary btn-sm" onClick={onAction}
          style={{marginTop:20,width:'auto',display:'inline-block'}}>
          {action}
        </button>
      )}
    </div>
  )
}

export function Accordion({ title, meta, children, defaultOpen=false }) {
  const [open,setOpen] = useState(defaultOpen)
  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={()=>setOpen(o=>!o)}>
        <div>
          <div style={{fontSize:14,fontWeight:500,color:'#3D2E27'}}>{title}</div>
          {meta && <div style={{fontSize:11,color:'#8B7D72',marginTop:2}}>{meta}</div>}
        </div>
        <span style={{color:'#C4AFA0',fontSize:12,transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}>▼</span>
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  )
}

export function Input({ value, onChange, placeholder, type='text', rows, label, style={} }) {
  return (
    <div className="input-group">
      {label && <div className="input-label">{label}</div>}
      {rows
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} className="input-field" style={style}/>
        : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} className="input-field" style={{height:'auto',...style}}/>
      }
    </div>
  )
}

export function Select({ value, onChange, options, label, style={} }) {
  return (
    <div className="input-group">
      {label && <div className="input-label">{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)} className="input-field" style={{height:'auto',cursor:'pointer',...style}}>
        {options.map(o=>(
          <option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>
            {typeof o==='string'?o:o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Btn({ children, onClick, secondary=false, disabled=false, style={}, sm=false }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${secondary?'btn-secondary':'btn-primary'}${sm?' btn-sm':''}`}
      style={{opacity:disabled?.5:1,cursor:disabled?'not-allowed':'pointer',...style}}>
      {children}
    </button>
  )
}

export function BtnRow({ children }) {
  return <div className="btn-row">{children}</div>
}

export function Alert({ children, type='warning' }) {
  const bg = type==='warning'?'#FDF3E8':type==='error'?'#FAEAEA':'#EEF5EF'
  const co = type==='warning'?'#8B5E1A':type==='error'?'#8B3232':'#4A7A50'
  return (
    <div style={{background:bg,borderRadius:10,padding:'11px 14px',fontSize:12.5,color:co,lineHeight:1.5}}>
      {children}
    </div>
  )
}

// Quick action sheet (FAB)
export function QuickSheet({ actions, onClose }) {
  return (
    <>
      <div className="sheet-overlay" onClick={onClose}/>
      <div className="sheet">
        <div className="sheet-handle"/>
        <div className="sheet-title">Acción rápida</div>
        <div className="sheet-actions">
          {actions.map((a,i)=>(
            <button key={i} className="sheet-action" onClick={()=>{a.onPress();onClose();}}>
              <div className="sheet-action-icon" style={{background:a.color||'#F0EBE3'}}>{a.icon}</div>
              <div>
                <div className="sheet-action-label">{a.label}</div>
                {a.sub && <div className="sheet-action-sub">{a.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
