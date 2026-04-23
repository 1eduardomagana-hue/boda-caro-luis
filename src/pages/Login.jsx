import { useState } from 'react'
import { COLORS, APP_PASSWORD } from '../lib/constants.js'

const C = COLORS

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (password === APP_PASSWORD) {
      localStorage.setItem('boda_auth', 'ok')
      onLogin()
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:C.cream,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{maxWidth:400,width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:300,color:C.darkTaupe,letterSpacing:'-0.5px',lineHeight:1.1}}>
            Caro & Luis
          </div>
          <div style={{fontSize:11,letterSpacing:'3px',textTransform:'uppercase',color:C.taupe,marginTop:10}}>
            Wedding Planner · 20 Nov 2026
          </div>
          <div style={{fontSize:11,color:C.taupe,marginTop:4}}>Quinta Montes Molina</div>
        </div>
        <div style={{background:C.white,borderRadius:16,padding:'32px',border:`1px solid rgba(196,175,160,.25)`,boxShadow:'0 8px 40px rgba(92,77,68,.08)'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.darkTaupe,marginBottom:6,textAlign:'center'}}>Acceso privado</div>
          <div style={{fontSize:12,color:C.textLight,textAlign:'center',marginBottom:24}}>Ingresa la contraseña del evento para continuar</div>
          <form onSubmit={submit}>
            <input
              type="password"
              value={password}
              onChange={e=>{setPassword(e.target.value);setError('')}}
              placeholder="Contraseña del evento"
              className="input-field"
              style={{marginBottom:12,textAlign:'center',letterSpacing:'4px'}}
              autoFocus
            />
            {error && <div style={{fontSize:12,color:C.red,textAlign:'center',marginBottom:12,background:'#FAEAEA',padding:'8px',borderRadius:6}}>{error}</div>}
            <button type="submit" className="btn" style={{width:'100%',padding:'12px',fontSize:14}}>
              Entrar
            </button>
          </form>
        </div>
        <div style={{textAlign:'center',marginTop:24,fontSize:10,color:C.taupe,fontStyle:'italic',opacity:.7}}>
          con amor, tu bro
        </div>
      </div>
    </div>
  )
}
