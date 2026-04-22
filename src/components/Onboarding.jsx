import { useState } from 'react'
import { createProject } from '../lib/supabase'

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: 'Boda Caro & Luis',
    event_date: '2026-11-20',
    location: 'Quinta Montes Molina',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const finish = async () => {
    setSaving(true)
    try {
      const project = await createProject({
        name: form.name,
        event_date: form.event_date || '2026-11-20',
        location: form.location,
      })
      onComplete(project)
    } catch (e) {
      // If Supabase not configured, create a mock project for demo
      onComplete({
        id: 'demo-' + Date.now(),
        name: form.name,
        event_date: form.event_date || '2026-11-20',
        location: form.location,
        _demo: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    {
      icon: '💍',
      title: 'Bienvenida',
      subtitle: 'Vamos a configurar tu planner de boda',
      content: (
        <div style={{ textAlign: 'center', padding: '12px 0 28px' }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 24 }}>
            Este es tu centro de mando para toda la planeación.<br />
            Empecemos con la información básica del evento.
          </p>
          <button className="btn" style={{ padding: '12px 32px', fontSize: 14 }} onClick={() => setStep(1)}>
            Comenzar →
          </button>
        </div>
      ),
    },
    {
      icon: '📋',
      title: 'El evento',
      subtitle: 'Confirma los datos principales',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--taupe)', display: 'block', marginBottom: 6 }}>Nombre del evento</label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} style={{ height: 'auto' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--taupe)', display: 'block', marginBottom: 6 }}>Fecha</label>
            <input type="date" className="input-field" value={form.event_date} onChange={e => set('event_date', e.target.value)} style={{ height: 'auto' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--taupe)', display: 'block', marginBottom: 6 }}>Lugar principal</label>
            <input className="input-field" value={form.location} onChange={e => set('location', e.target.value)} style={{ height: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn-ghost" onClick={() => setStep(0)}>← Atrás</button>
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>
              Continuar →
            </button>
          </div>
        </div>
      ),
    },
    {
      icon: '✨',
      title: 'Todo listo',
      subtitle: 'Tu planner está configurado',
      content: (
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ background: 'var(--beige)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
            {[
              ['Evento', form.name],
              ['Fecha', form.event_date ? new Date(form.event_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
              ['Lugar', form.location],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--sand)' }}>
                <span style={{ fontSize: 11, color: 'var(--taupe)', minWidth: 60 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--dark-taupe)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Editar</button>
            <button className="btn" style={{ flex: 1, justifyContent: 'center', padding: 14 }}
              onClick={finish} disabled={saving}>
              {saving ? 'Guardando...' : 'Entrar al planner →'}
            </button>
          </div>
        </div>
      ),
    },
  ]

  const current = steps[step]

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 36 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 99,
              background: i === step ? 'var(--champagne)' : 'var(--sand)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{current.icon}</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--dark-taupe)', marginBottom: 4 }}>
            {current.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{current.subtitle}</div>
        </div>

        {current.content}

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 10, color: 'var(--taupe)', fontStyle: 'italic' }}>
          con amor, tu bro
        </div>
      </div>
    </div>
  )
}
