import { useState } from 'react'
import { APP_PASSWORD } from '../lib/constants.js'

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!pw) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    if (pw === APP_PASSWORD) {
      localStorage.setItem('boda_auth', 'ok')
      onLogin()
    } else {
      setErr('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #FAF8F5 0%, #F0EBE3 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 28px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 56, fontWeight: 300,
          color: '#5C4D44', letterSpacing: '-2px', lineHeight: 1,
        }}>C & L</div>
        <div style={{
          fontSize: 10, letterSpacing: '4px',
          textTransform: 'uppercase', color: '#C4AFA0', marginTop: 14,
        }}>20 · NOV · 2026</div>
        <div style={{ fontSize: 12, color: '#C4AFA0', marginTop: 4 }}>
          Quinta Montes Molina
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: 24,
        padding: '28px 24px', width: '100%', maxWidth: 360,
        boxShadow: '0 8px 40px rgba(92,77,68,0.1), 0 0 0 0.5px rgba(196,175,160,0.2)',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22, color: '#5C4D44',
          textAlign: 'center', marginBottom: 4,
        }}>Acceso privado</div>
        <div style={{ fontSize: 13, color: '#8B7D72', textAlign: 'center', marginBottom: 22, fontWeight: 300 }}>
          Tu planeador de boda personal
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password" value={pw}
            onChange={e => { setPw(e.target.value); setErr('') }}
            placeholder="Contraseña del evento"
            className="inp"
            style={{ textAlign: 'center', letterSpacing: '4px', fontSize: 18 }}
            autoFocus autoComplete="current-password"
          />
          {err && (
            <div style={{
              fontSize: 13, color: '#B85C5C', textAlign: 'center',
              background: '#FAEAEA', padding: '9px', borderRadius: 10,
            }}>{err}</div>
          )}
          <button type="submit" className="btn" disabled={loading || !pw}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 32, fontSize: 11, color: '#C4AFA0', fontStyle: 'italic', opacity: 0.6 }}>
        con amor, tu bro
      </div>
    </div>
  )
}
