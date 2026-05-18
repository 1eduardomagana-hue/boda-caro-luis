import { useState } from 'react'
import { APP_PASSWORD } from '../lib/constants.js'

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 350))
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
      minHeight:'100dvh', background:'#FAF8F5',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'24px 28px',
    }}>
      {/* Logo area */}
      <div style={{textAlign:'center', marginBottom:48}}>
        <div style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:52, fontWeight:300, color:'#5C4D44',
          letterSpacing:'-1px', lineHeight:1,
        }}>C & L</div>
        <div style={{
          fontSize:10, letterSpacing:'4px', textTransform:'uppercase',
          color:'#C4AFA0', marginTop:12,
        }}>BODA · 20 NOV 2026</div>
        <div style={{fontSize:12, color:'#C4AFA0', marginTop:4}}>
          Quinta Montes Molina
        </div>
      </div>

      {/* Card */}
      <div style={{
        background:'white', borderRadius:24, padding:'28px 24px',
        width:'100%', maxWidth:360,
        border:'1px solid rgba(196,175,160,.2)',
        boxShadow:'0 8px 40px rgba(92,77,68,.1)',
      }}>
        <div style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:22, color:'#5C4D44', marginBottom:4, textAlign:'center',
        }}>Acceso privado</div>
        <div style={{fontSize:13,color:'#8B7D72',textAlign:'center',marginBottom:22}}>
          Tu planeador de boda
        </div>

        <form onSubmit={submit}>
          <input
            type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr('')}}
            placeholder="Contraseña del evento"
            className="input-field"
            style={{textAlign:'center',letterSpacing:'4px',marginBottom:12,fontSize:16}}
            autoFocus autoComplete="current-password"
          />
          {err && (
            <div style={{fontSize:12,color:'#B85C5C',textAlign:'center',marginBottom:10,
              background:'#FAEAEA',padding:'8px',borderRadius:8}}>{err}</div>
          )}
          <button type="submit" className="btn-primary"
            style={{opacity:loading?.7:1}}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <div style={{marginTop:32,fontSize:11,color:'#C4AFA0',fontStyle:'italic',opacity:.7}}>
        con amor, tu bro
      </div>
    </div>
  )
}
