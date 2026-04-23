import { useState } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, Btn, Spinner, PageHeader } from '../components/UI.jsx'
import { saveImport } from '../lib/db.js'

const C = COLORS

// URL de la Edge Function de Supabase — no requiere API key en el cliente
const EDGE_FN_URL = 'https://lqlvwlpbzznfvjuyrtpq.supabase.co/functions/v1/analyze-note'

const CATS_DESTINO = [
  {id:'proveedores',label:'Proveedores y pagos',icon:'💳'},
  {id:'civil',label:'Boda civil',icon:'📜'},
  {id:'misa',label:'Misa religiosa',icon:'⛪'},
  {id:'invitados',label:'Invitados',icon:'👥'},
  {id:'logistica',label:'Logística',icon:'🗺️'},
  {id:'fotos',label:'Fotos y sesiones',icon:'📷'},
  {id:'week',label:'Week planner',icon:'🗓️'},
  {id:'eventos',label:'Eventos especiales',icon:'🥂'},
  {id:'notas',label:'Notas maestras',icon:'📝'},
  {id:'categorias',label:'Categoría personalizada',icon:'✨'},
]

function ReviewSection({title, count, children}) {
  const [open, setOpen] = useState(true)
  if (!count) return null
  return (
    <div style={{marginBottom:12,border:`1px solid ${C.sand}`,borderRadius:10,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',cursor:'pointer',background:C.cream}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:13,fontWeight:500,color:C.darkTaupe}}>{title}</span>
          <span style={{background:C.champagne,color:C.darkTaupe,borderRadius:99,padding:'1px 8px',fontSize:10,fontWeight:600}}>{count}</span>
        </div>
        <span style={{fontSize:11,color:C.taupe}}>{open?'▲':'▼'}</span>
      </div>
      {open && <div style={{padding:'14px 16px',background:C.white}}>{children}</div>}
    </div>
  )
}

export default function Importar({ project }) {
  const [step, setStep] = useState('input')
  const [text, setText] = useState('')
  const [resultado, setResultado] = useState(null)
  const [catSel, setCatSel] = useState('notas')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [provs, setProvs] = useState([])
  const [evts, setEvts] = useState([])
  const [tasks, setTasks] = useState([])

  const analizar = async () => {
    if (!text.trim()) { setError('Pega el contenido de tu nota primero.'); return }
    setError(''); setStep('analyzing')
    try {
      // Llamada a Edge Function — la API key vive en Supabase, no en el cliente
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const parsed = await res.json()
      if (parsed.error) throw new Error(parsed.error)
      setResultado(parsed)
      setCatSel(parsed.categoria_sugerida || 'notas')
      setProvs(parsed.proveedores || [])
      setEvts(parsed.eventos || [])
      setTasks(parsed.tareas || [])
      setStep('review')
    } catch(e) {
      setError('Error al analizar: ' + e.message)
      setStep('input')
    }
  }

  const aprobar = async () => {
    setSaving(true)
    await saveImport(project.id, text, { ...resultado, categoria_sugerida: catSel, proveedores: provs, eventos: evts, tareas: tasks })
    setSaving(false); setStep('done')
  }

  const reset = () => { setStep('input'); setText(''); setResultado(null); setError(''); setProvs([]); setEvts([]); setTasks([]) }

  if (step === 'analyzing') return (
    <div><PageHeader title="Importar con IA" />
      <Card><div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 20px',gap:14}}>
        <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid ${C.sand}`,borderTopColor:C.gold,animation:'spin .9s linear infinite'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.darkTaupe}}>Analizando con IA...</div>
        <div style={{fontSize:12,color:C.textLight,textAlign:'center',lineHeight:1.6,maxWidth:280}}>Extrayendo proveedores, eventos, tareas y pagos de tu nota</div>
      </div></Card>
    </div>
  )

  if (step === 'done') return (
    <div><PageHeader title="Importar con IA" />
      <Card style={{textAlign:'center',padding:'48px 32px'}}>
        <div style={{fontSize:40,marginBottom:16}}>✅</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.darkTaupe,marginBottom:8}}>Nota importada y guardada</div>
        <div style={{fontSize:13,color:C.textLight,marginBottom:24}}>Los datos fueron aprobados y guardados en Supabase.</div>
        <Btn onClick={reset}>+ Importar otra nota</Btn>
      </Card>
    </div>
  )

  if (step === 'review' && resultado) return (
    <div>
      <PageHeader title="Revisar antes de importar" subtitle="Verifica y edita los datos detectados antes de aprobar" />
      <div className="section-gap">
        <Card style={{borderTop:`3px solid ${C.champagne}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:C.taupe,marginBottom:6}}>Resumen detectado</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.darkTaupe,marginBottom:8}}>{resultado.resumen}</div>
              <span style={{display:'inline-flex',alignItems:'center',gap:4,
                background:`${resultado.confianza>=.8?C.green:resultado.confianza>=.5?C.amber:C.red}22`,
                color:resultado.confianza>=.8?C.green:resultado.confianza>=.5?C.amber:C.red,
                borderRadius:99,padding:'2px 10px',fontSize:11,fontWeight:600}}>
                {Math.round((resultado.confianza||0)*100)}% confianza
              </span>
            </div>
            <div style={{minWidth:200}}>
              <div style={{fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:C.taupe,marginBottom:6}}>Categoría destino</div>
              <select value={catSel} onChange={e=>setCatSel(e.target.value)} className="input-field" style={{height:'auto',padding:'8px 12px',cursor:'pointer'}}>
                {CATS_DESTINO.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {resultado.alertas_duplicado?.length>0 && resultado.alertas_duplicado.map((a,i)=>(
          <div key={i} style={{background:'#FDF3E8',border:`1px solid #E8D0A8`,borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#8B5E1A',display:'flex',gap:8}}>
            ⚠️ <span><strong>Posible duplicado ({a.tipo}):</strong> {a.descripcion}</span>
          </div>
        ))}

        <ReviewSection title="Proveedores detectados" count={provs.length}>
          {provs.map((p,i)=>(
            <div key={i} style={{padding:'10px 0',borderBottom:`1px solid ${C.beige}`}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{fontWeight:500,color:C.darkTaupe}}>{p.nombre}</div>
                <button onClick={()=>setProvs(prev=>prev.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:C.taupe,fontSize:12}}>✕</button>
              </div>
              <div style={{fontSize:11.5,color:C.textLight}}>{p.categoria} · {p.status} {p.total?`· $${p.total.toLocaleString()}`:''}</div>
              {p.notas && <div style={{fontSize:11,color:C.taupe,marginTop:2}}>{p.notas}</div>}
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Eventos detectados" count={evts.length}>
          {evts.map((e,i)=>(
            <div key={i} style={{padding:'8px 0',borderBottom:`1px solid ${C.beige}`,display:'flex',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:500,color:C.darkTaupe}}>{e.nombre}</div>
                <div style={{fontSize:11.5,color:C.textLight}}>{e.fecha||''} {e.hora?`· ${e.hora}`:''} {e.lugar?`· ${e.lugar}`:''}</div>
              </div>
              <button onClick={()=>setEvts(prev=>prev.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:C.taupe,fontSize:12}}>✕</button>
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Tareas y pendientes" count={tasks.length}>
          {tasks.map((t,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'7px 0',borderBottom:`1px solid ${C.beige}`}}>
              <input type="checkbox" checked={t.completada} onChange={e=>setTasks(prev=>prev.map((x,j)=>j===i?{...x,completada:e.target.checked}:x))} style={{marginTop:3,accentColor:C.champagne}} />
              <span style={{flex:1,fontSize:13}}>{t.texto}</span>
              <span className={`badge ${t.prioridad==='alta'?'badge-red':t.prioridad==='media'?'badge-amber':'badge-gray'}`}>{t.prioridad}</span>
              <button onClick={()=>setTasks(prev=>prev.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:C.taupe,fontSize:12}}>✕</button>
            </div>
          ))}
        </ReviewSection>

        <div style={{background:C.white,border:`1px solid ${C.sand}`,borderRadius:12,padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:C.darkTaupe}}>¿Todo correcto?</div>
            <div style={{fontSize:12,color:C.textLight,marginTop:2}}>Los datos se guardarán en Supabase al aprobar.</div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn ghost onClick={reset}>Cancelar</Btn>
            <Btn onClick={aprobar} disabled={saving} style={{padding:'10px 24px',fontSize:13}}>
              {saving?'Guardando...':'✓ Aprobar e importar'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Importar con IA" subtitle="Pega una nota de Apple Notes y la IA extrae y clasifica todo automáticamente" />
      <div className="grid-2" style={{alignItems:'start'}}>
        <div className="section-gap">
          <Card>
            <CardTitle>Pegar nota directamente</CardTitle>
            <textarea value={text} onChange={e=>{setText(e.target.value);setError('')}}
              placeholder={'Pega aquí el contenido de tu nota de Apple Notes.\n\nEjemplo:\nPAGOS BODA PROVEEDORES\nQuinta Montes Molina — $180,000\nAnticipo pagado: $90,000\nSaldo: $90,000 (vence 1 nov)\n...'}
              className="input-field" rows={14}
              style={{fontFamily:"'Jost',sans-serif",fontSize:12.5,lineHeight:1.8}} />
            {text.length > 0 && (
              <div style={{fontSize:11,color:C.textLight,marginTop:6,textAlign:'right'}}>{text.length.toLocaleString()} caracteres</div>
            )}
          </Card>
          {error && (
            <div style={{background:'#FAEAEA',border:`1px solid #E0B0B0`,borderRadius:8,padding:'10px 14px',fontSize:12.5,color:C.red}}>{error}</div>
          )}
          <Btn onClick={analizar} disabled={!text.trim()} fullWidth style={{padding:'14px',fontSize:14}}>
            ✦ Analizar con IA
          </Btn>
        </div>
        <div className="section-gap">
          <Card>
            <CardTitle>Cómo funciona</CardTitle>
            {[
              ['01','Pega tu nota','Copia el contenido de Apple Notes tal como está.'],
              ['02','IA extrae los datos','Detecta proveedores, fechas, pagos, tareas y eventos.'],
              ['03','Tú revisas todo','Edita o elimina antes de guardar.'],
              ['04','Apruebas e importas','Se guarda en Supabase solo cuando confirmas.'],
            ].map(([n,t,d])=>(
              <div key={n} style={{display:'flex',gap:14,padding:'10px 0',borderBottom:`1px solid ${C.beige}`}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.champagne,opacity:.7,flexShrink:0,minWidth:28}}>{n}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:C.darkTaupe,marginBottom:2}}>{t}</div>
                  <div style={{fontSize:12,color:C.textLight,lineHeight:1.5}}>{d}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <CardTitle>Qué detecta la IA</CardTitle>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[['💳','Proveedores y pagos'],['📅','Fechas y eventos'],['✓','Tareas y checklists'],['👥','Invitados'],['🗓️','Plan horario'],['🔗','Links'],['⚠️','Duplicados potenciales'],['🏷️','Categoría sugerida']].map(([ic,l])=>(
                <div key={l} style={{display:'flex',gap:8,alignItems:'center',background:C.cream,borderRadius:7,padding:'8px 10px'}}>
                  <span style={{fontSize:14}}>{ic}</span>
                  <span style={{fontSize:12,color:C.darkTaupe}}>{l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
