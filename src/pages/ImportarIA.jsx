import { useState } from 'react'
import { saveImport } from '../lib/supabase.js'

const SYSTEM_PROMPT = `Eres un asistente especializado en analisis de notas de planeacion de bodas.
Analiza el texto y extrae informacion estructurada. Devuelve UNICAMENTE un objeto JSON valido, sin texto adicional, sin backticks.

Estructura exacta:
{
  "resumen": "string maximo 120 chars",
  "categoria_sugerida": "proveedores|civil|misa|invitados|logistica|fotos|week|eventos|notas|categorias",
  "confianza": 0.0 a 1.0,
  "proveedores": [{"nombre":"string","categoria":"string","contacto":"string|null","total":number|null,"pagado":number|null,"saldo":number|null,"fecha_pago":"YYYY-MM-DD|null","status":"pagado|parcial|pendiente","notas":"string|null"}],
  "eventos": [{"nombre":"string","fecha":"YYYY-MM-DD|null","hora":"HH:MM|null","lugar":"string|null","descripcion":"string|null","tipo":"civil|misa|recepcion|preboda|ensayo|despedida|brunch|otro"}],
  "tareas": [{"texto":"string","completada":false,"prioridad":"alta|media|baja","fecha_limite":"YYYY-MM-DD|null"}],
  "invitados": [{"grupo":"string","cantidad":number|null,"confirmados":number|null,"notas":"string|null"}],
  "pagos": [{"concepto":"string","monto":number,"fecha":"YYYY-MM-DD|null","estado":"pagado|pendiente|parcial","proveedor":"string|null"}],
  "logistica": [{"hora":"string|null","actividad":"string","responsable":"string|null","lugar":"string|null"}],
  "links": [{"titulo":"string","url":"string","nota":"string|null"}],
  "alertas_duplicado": [{"tipo":"proveedor|evento|pago","descripcion":"string"}]
}`

const CATEGORIAS = [
  { id: 'proveedores', label: 'Proveedores y pagos', icon: '💳' },
  { id: 'civil', label: 'Boda civil', icon: '📜' },
  { id: 'misa', label: 'Misa religiosa', icon: '⛪' },
  { id: 'invitados', label: 'Invitados', icon: '👥' },
  { id: 'logistica', label: 'Logística', icon: '🗺️' },
  { id: 'fotos', label: 'Fotos y sesiones', icon: '📷' },
  { id: 'week', label: 'Week planner', icon: '🗓️' },
  { id: 'eventos', label: 'Eventos especiales', icon: '🥂' },
  { id: 'notas', label: 'Notas maestras', icon: '📝' },
  { id: 'categorias', label: 'Categoría personalizada', icon: '✨' },
]

function ConfianzaBadge({ valor }) {
  const pct = Math.round(valor * 100)
  const color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'
  return <span style={{ background: `${color}22`, color, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{pct}% confianza</span>
}

function Section({ title, count, children }) {
  const [open, setOpen] = useState(true)
  if (!count) return null
  return (
    <div style={{ border: '1px solid var(--sand)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', cursor: 'pointer', background: 'var(--cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>{title}</span>
          <span style={{ background: 'var(--champagne)', color: 'var(--dark-taupe)', borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>{count}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--taupe)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={{ padding: '14px 16px', background: 'var(--white)' }}>{children}</div>}
    </div>
  )
}

export function ImportarIA({ project, reload }) {
  const [step, setStep] = useState('input')
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [catSel, setCatSel] = useState('notas')
  const [saving, setSaving] = useState(false)
  const [importados, setImportados] = useState([])

  const [provs, setProvs] = useState([])
  const [evs, setEvs] = useState([])
  const [tasks, setTasks] = useState([])

  const handleFile = async (file) => {
    setFileName(file.name)
    const ext = file.name.split('.').pop().toLowerCase()
    if (['txt', 'md'].includes(ext)) {
      setText(await file.text())
    } else {
      setText(`[Archivo: ${file.name}]\n\nPega el texto de la nota directamente para analizarlo con IA.`)
    }
  }

  const analyze = async () => {
    if (!text.trim()) { setError('Pega el contenido de tu nota primero.'); return }
    setError('')
    setStep('analyzing')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Analiza esta nota de planeacion de boda:\n\n${text}` }],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const raw = data.content?.find(b => b.type === 'text')?.text || ''
      const clean = raw.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setCatSel(parsed.categoria_sugerida || 'notas')
      setProvs(parsed.proveedores || [])
      setEvs(parsed.eventos || [])
      setTasks(parsed.tareas || [])
      setStep('review')
    } catch (e) {
      setError('Error al analizar: ' + e.message)
      setStep('input')
    }
  }

  const approve = async () => {
    setSaving(true)
    const structured = { ...result, categoria_sugerida: catSel, proveedores: provs, eventos: evs, tareas: tasks }
    try {
      await saveImport(project?.id, text, structured)
      if (reload) reload()
    } catch { }
    setImportados(prev => [...prev, { id: Date.now(), resumen: result.resumen, categoria: catSel, confianza: result.confianza }])
    setSaving(false)
    setStep('done')
  }

  const reset = () => {
    setStep('input'); setText(''); setFileName(null); setResult(null); setError('')
    setProvs([]); setEvs([]); setTasks([])
  }

  if (step === 'analyzing') return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="spinner" style={{ margin: '0 auto 16px' }} />
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--dark-taupe)', marginBottom: 8 }}>Analizando con IA...</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-light)' }}>Extrayendo proveedores, eventos, tareas y pagos</div>
    </div>
  )

  if (step === 'done') return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'var(--dark-taupe)', marginBottom: 8 }}>Nota importada correctamente</div>
      <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24 }}>Los datos fueron revisados y guardados en el sistema.</div>
      {importados.length > 0 && (
        <div style={{ marginBottom: 24, textAlign: 'left', maxWidth: 480, margin: '0 auto 24px' }}>
          {importados.map(imp => (
            <div key={imp.id} style={{ padding: '10px 14px', background: 'var(--white)', borderRadius: 8, border: '1px solid var(--sand)', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>{imp.resumen}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{CATEGORIAS.find(c => c.id === imp.categoria)?.label} · {Math.round(imp.confianza * 100)}% confianza</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn" onClick={reset}>+ Importar otra nota</button>
      </div>
    </div>
  )

  if (step === 'review' && result) return (
    <div className="section-gap">
      {/* Header */}
      <div className="card" style={{ borderTop: '3px solid var(--champagne)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--taupe)', marginBottom: 6 }}>Resumen detectado</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--dark-taupe)', marginBottom: 8 }}>{result.resumen}</div>
            <ConfianzaBadge valor={result.confianza} />
          </div>
          <div style={{ minWidth: 200 }}>
            <div style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--taupe)', marginBottom: 6 }}>Categoría destino</div>
            <select value={catSel} onChange={e => setCatSel(e.target.value)} className="input-field" style={{ height: 'auto', padding: '8px 12px' }}>
              {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {result.alertas_duplicado?.map((a, i) => (
        <div key={i} className="alert">⚠️ <span><strong>Posible duplicado ({a.tipo}):</strong> {a.descripcion}</span></div>
      ))}

      {/* Sections */}
      <Section title="Proveedores detectados" count={provs.length}>
        {provs.map((p, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--beige)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--dark-taupe)' }}>{p.nombre}</span>
                <span className="badge badge-gray" style={{ marginLeft: 8 }}>{p.categoria}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                {p.total != null && <div>${p.total.toLocaleString()} total</div>}
                {p.saldo != null && <div style={{ color: 'var(--red)' }}>${p.saldo.toLocaleString()} saldo</div>}
              </div>
            </div>
            {p.notas && <div style={{ fontSize: 11.5, color: 'var(--text-light)', marginTop: 4 }}>{p.notas}</div>}
            <button onClick={() => setProvs(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 11, color: 'var(--taupe)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>✕ Eliminar</button>
          </div>
        ))}
      </Section>

      <Section title="Eventos detectados" count={evs.length}>
        {evs.map((ev, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--beige)' }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--dark-taupe)' }}>{ev.nombre}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-light)' }}>{ev.fecha || '—'} {ev.hora ? `· ${ev.hora}h` : ''} {ev.lugar ? `· ${ev.lugar}` : ''}</div>
            <button onClick={() => setEvs(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 11, color: 'var(--taupe)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}>✕ Eliminar</button>
          </div>
        ))}
      </Section>

      <Section title="Tareas y pendientes" count={tasks.length}>
        {tasks.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid var(--beige)' }}>
            <input type="checkbox" checked={t.completada} onChange={e => setTasks(prev => prev.map((x, j) => j === i ? { ...x, completada: e.target.checked } : x))} style={{ marginTop: 3 }} />
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{t.texto}</div>
            <span className={`badge ${t.prioridad === 'alta' ? 'badge-red' : t.prioridad === 'media' ? 'badge-amber' : 'badge-gray'}`}>{t.prioridad}</span>
            <button onClick={() => setTasks(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 11, color: 'var(--taupe)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
      </Section>

      {/* Original text */}
      <div style={{ border: '1px solid var(--sand)', borderRadius: 10, overflow: 'hidden' }}>
        <details>
          <summary style={{ padding: '12px 16px', cursor: 'pointer', background: 'var(--cream)', fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>Ver nota original</summary>
          <pre style={{ padding: '14px 16px', fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 280, overflowY: 'auto', background: 'var(--white)' }}>{text}</pre>
        </details>
      </div>

      {/* Approve */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)' }}>¿Todo correcto?</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>Puedes editar o eliminar items antes de importar.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={reset}>Cancelar</button>
          <button className="btn" onClick={approve} disabled={saving} style={{ padding: '10px 24px' }}>
            {saving ? 'Guardando...' : '✓ Aprobar e importar'}
          </button>
        </div>
      </div>
    </div>
  )

  // INPUT STEP
  return (
    <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
      <div className="section-gap">
        <div className="card">
          <div className="card-title">Pegar nota de Apple Notes</div>
          <textarea value={text} onChange={e => { setText(e.target.value); setError('') }}
            placeholder={'Pega aquí el contenido de tu nota...\n\nEjemplo:\nPAGOS PROVEEDORES\nQuinta Montes Molina — $220,000\nAnticipo: $110,000\nSaldo: $110,000 (vence 1 oct)\n...'}
            className="input-field" rows={14} style={{ fontFamily: 'Jost, sans-serif', fontSize: 12.5, lineHeight: 1.8 }} />
          {text.trim().length > 0 && <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6, textAlign: 'right' }}>{text.length.toLocaleString()} caracteres</div>}
        </div>

        <div className="card">
          <div className="card-title">O subir archivo</div>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', borderRadius: 10, cursor: 'pointer', border: '2px dashed var(--sand)', background: 'var(--cream)', textAlign: 'center' }}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--sand)' }}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); e.currentTarget.style.borderColor = 'var(--sand)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{fileName ? '📄' : '📂'}</div>
            <div style={{ fontSize: 13, color: 'var(--dark-taupe)', marginBottom: 4 }}>{fileName || 'Arrastra un archivo o haz clic'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-light)' }}>TXT, MD — PDF/DOC requieren texto directo</div>
            <input type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = '' }} style={{ display: 'none' }} />
          </label>
        </div>

        {error && <div style={{ background: '#FAEAEA', border: '1px solid #E0B0B0', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: 'var(--red)' }}>{error}</div>}

        <button className="btn" onClick={analyze} disabled={!text.trim()} style={{ padding: '14px 28px', fontSize: 14, width: '100%', justifyContent: 'center', opacity: !text.trim() ? 0.4 : 1 }}>
          ✦ Analizar con IA
        </button>
      </div>

      <div className="section-gap">
        <div className="card">
          <div className="card-title">Cómo funciona</div>
          {[['01', 'Pega tu nota', 'Copia cualquier nota de Apple Notes tal como está.'],
            ['02', 'IA extrae datos', 'El modelo detecta proveedores, fechas, pagos, tareas e invitados.'],
            ['03', 'Tú revisas todo', 'Ves y editas cada item antes de guardar.'],
            ['04', 'Apruebas', 'Solo cuando confirmas se guarda. Nunca importación automática.']].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--beige)' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--champagne)', opacity: 0.7, flexShrink: 0, minWidth: 28 }}>{n}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)', marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Qué detecta la IA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['💳', 'Proveedores y pagos'], ['📅', 'Fechas y eventos'], ['✓', 'Tareas y checklists'], ['👥', 'Grupos de invitados'], ['🗓️', 'Plan horario'], ['🔗', 'Links y referencias'], ['⚠️', 'Duplicados potenciales'], ['🏷️', 'Categoría sugerida']].map(([ic, l]) => (
              <div key={l} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--cream)', borderRadius: 7, padding: '8px 10px' }}>
                <span style={{ fontSize: 15 }}>{ic}</span>
                <span style={{ fontSize: 12, color: 'var(--dark-taupe)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
