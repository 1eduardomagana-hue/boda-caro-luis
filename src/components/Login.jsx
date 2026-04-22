import { useState } from 'react'

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'boda2026'
const STORAGE_KEY = 'boda_auth'

export function useAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1')
  const login = (pwd) => {
    if (pwd === APP_PASSWORD) { sessionStorage.setItem(STORAGE_KEY, '1'); setAuthed(true); return true }
    return false
  }
  const logout = () => { sessionStorage.removeItem(STORAGE_KEY); setAuthed(false) }
  return { authed, login, logout }
}

export function Login({ onLogin }) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const ok = onLogin(pwd)
    if (!ok) { setError('Contraseña incorrecta'); setPwd('') }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💍</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--dark-taupe)', marginBottom: 4 }}>
            Caro &amp; Luis
          </div>
          <div style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--taupe)' }}>
            20 · noviembre · 2026
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError('') }}
              placeholder="Contraseña"
              className="input-field"
              style={{ paddingRight: 40 }}
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--taupe)' }}>
              {show ? '🙈' : '👁️'}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 13 }}>
            Entrar →
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 10, color: 'var(--taupe)', fontStyle: 'italic' }}>
          con amor, tu bro
        </div>
      </div>
    </div>
  )
}
