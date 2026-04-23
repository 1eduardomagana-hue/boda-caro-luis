import { useState, useEffect } from 'react'
import { COLORS } from '../lib/constants.js'
import { Card, CardTitle, Btn, Input, Select, Spinner, PageHeader } from '../components/UI.jsx'
import { getLinks, upsertLink, deleteLink, getFiles, uploadFile, deleteFile } from '../lib/db.js'

const C = COLORS
const LINK_CATS = ['Todos','Contratos','Proveedores','Invitados','Inspiracion','Musica','Logistica','Otros']

function formatSize(b){
  if(b<1024) return b+' B'
  if(b<1024*1024) return (b/1024).toFixed(1)+' KB'
  return (b/(1024*1024)).toFixed(1)+' MB'
}

export default function Archivos({ project }) {
  const [tab, setTab] = useState('links')
  const [links, setLinks] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingLink, setAddingLink] = useState(false)
  const [newLink, setNewLink] = useState({title:'',url:'',category:'Otros',notes:''})
  const [linkCat, setLinkCat] = useState('Todos')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [linkError, setLinkError] = useState('')

  const loadAll = async () => {
    const [l, f] = await Promise.all([getLinks(project.id), getFiles(project.id)])
    setLinks(l); setFiles(f); setLoading(false)
  }
  useEffect(()=>{loadAll()},[project.id])

  const saveLink = async () => {
    if (!newLink.title.trim()) { setLinkError('El título es obligatorio.'); return }
    if (!newLink.url.trim()) { setLinkError('La URL es obligatoria.'); return }
    await upsertLink({ project_id: project.id, ...newLink })
    setNewLink({title:'',url:'',category:'Otros',notes:''}); setAddingLink(false); setLinkError(''); loadAll()
  }
  const removeLink = async (id) => {
    if (!window.confirm('¿Eliminar este link?')) return
    await deleteLink(id); loadAll()
  }

  const handleUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return
    setUploading(true)
    await uploadFile(project.id, f, '')
    setUploading(false); loadAll(); e.target.value = ''
  }
  const removeFile = async (f) => {
    if (!window.confirm('¿Eliminar este archivo?')) return
    await deleteFile(f.id, f.storage_path); loadAll()
  }

  const filteredLinks = links.filter(l => {
    const matchCat = linkCat==='Todos' || l.category===linkCat
    const q = search.toLowerCase()
    return matchCat && (!q || l.title.toLowerCase().includes(q) || (l.notes||'').toLowerCase().includes(q))
  })

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Archivos y galerías" subtitle="Links importantes y documentos del proyecto" />
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Buscar en links o archivos..." className="input-field" style={{height:'auto'}} />
      </div>
      <div className="tabs">
        {[['links',`🔗 Links (${filteredLinks.length})`],['files',`📎 Archivos (${files.length})`]].map(([v,l])=>(
          <div key={v} className={`tab ${tab===v?'active':''}`} onClick={()=>setTab(v)}>{l}</div>
        ))}
      </div>

      {tab==='links' && (
        <div className="section-gap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {LINK_CATS.map(c=>(
                <button key={c} onClick={()=>setLinkCat(c)} style={{padding:'4px 12px',borderRadius:99,fontSize:11,cursor:'pointer',border:`1px solid ${linkCat===c?C.gold:C.sand}`,background:linkCat===c?C.darkTaupe:C.white,color:linkCat===c?C.champagne:C.warmGray,fontFamily:"'Jost',sans-serif",transition:'all .15s'}}>{c}</button>
              ))}
            </div>
            <Btn onClick={()=>setAddingLink(true)}>+ Agregar link</Btn>
          </div>
          {addingLink && (
            <Card style={{borderTop:`3px solid ${C.champagne}`}}>
              <CardTitle>Nuevo link</CardTitle>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <Input value={newLink.title} onChange={v=>setNewLink(n=>({...n,title:v}))} placeholder="Título *" />
                <Input value={newLink.url} onChange={v=>setNewLink(n=>({...n,url:v}))} placeholder="URL completa (https://...)" />
                <Select value={newLink.category} onChange={v=>setNewLink(n=>({...n,category:v}))} options={LINK_CATS.filter(c=>c!=='Todos')} />
                <Input value={newLink.notes} onChange={v=>setNewLink(n=>({...n,notes:v}))} placeholder="Nota opcional..." rows={2} />
                {linkError && <div style={{fontSize:11.5,color:C.red,background:'#FAEAEA',padding:'6px 10px',borderRadius:6}}>{linkError}</div>}
                <div style={{display:'flex',gap:8}}><Btn onClick={saveLink}>Guardar</Btn><Btn ghost onClick={()=>{setAddingLink(false);setLinkError('')}}>Cancelar</Btn></div>
              </div>
            </Card>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {filteredLinks.map(l=>(
              <Card key={l.id} style={{borderLeft:`3px solid ${C.champagne}`,position:'relative'}}>
                <button onClick={()=>removeLink(l.id)} style={{position:'absolute',top:10,right:10,background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.taupe}}>✕</button>
                <span className="badge badge-gray" style={{marginBottom:8,display:'inline-flex'}}>{l.category}</span>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500,color:C.darkTaupe,marginBottom:5,paddingRight:20}}>{l.title}</div>
                {l.notes && <div style={{fontSize:11.5,color:C.textLight,marginBottom:10,lineHeight:1.6}}>{l.notes}</div>}
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11.5,color:C.gold,textDecoration:'none',borderBottom:`1px solid ${C.champagne}`,paddingBottom:1,fontWeight:500}}>Abrir ↗</a>
              </Card>
            ))}
            {filteredLinks.length===0 && <div style={{fontSize:13,color:C.textLight,padding:'20px 0',gridColumn:'1/-1'}}>Sin links para esta categoría.</div>}
          </div>
        </div>
      )}

      {tab==='files' && (
        <div className="section-gap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,color:C.textLight}}>{files.length} archivo{files.length!==1?'s':''} guardado{files.length!==1?'s':''}</span>
            <label style={{cursor:'pointer'}}>
              <span className="btn">{uploading?'Subiendo...':'+ Subir archivo'}</span>
              <input type="file" onChange={handleUpload} style={{display:'none'}} disabled={uploading} />
            </label>
          </div>
          {files.length===0 && (
            <div style={{textAlign:'center',padding:'48px 20px',background:C.white,borderRadius:12,border:`2px dashed ${C.sand}`}}>
              <div style={{fontSize:32,marginBottom:8}}>📂</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.darkTaupe,marginBottom:6}}>Sin archivos</div>
              <div style={{fontSize:12,color:C.textLight}}>Los archivos se guardan en Supabase Storage y están disponibles en todos tus dispositivos.</div>
            </div>
          )}
          {files.length>0 && (
            <Card style={{padding:0,overflow:'hidden'}}>
              {files.map((f,i)=>(
                <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<files.length-1?`1px solid ${C.beige}`:'none',transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cream}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{fontSize:22,flexShrink:0}}>📄</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:C.darkTaupe,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                    <div style={{fontSize:10.5,color:C.textLight}}>{f.file_type?.toUpperCase()} · {formatSize(f.file_size||0)}</div>
                  </div>
                  {f.public_url && <a href={f.public_url} target="_blank" rel="noopener noreferrer" style={{fontSize:11.5,color:C.gold,textDecoration:'none',fontWeight:500,border:`1px solid ${C.champagne}`,borderRadius:6,padding:'4px 10px',flexShrink:0}}>Ver ↗</a>}
                  <button onClick={()=>removeFile(f)} style={{background:'none',border:'none',cursor:'pointer',color:C.taupe,fontSize:13,padding:'2px 4px',flexShrink:0}}>✕</button>
                </div>
              ))}
            </Card>
          )}
          <div style={{background:C.beige,borderRadius:8,padding:'10px 16px',fontSize:11.5,color:C.warmGray,lineHeight:1.6}}>
            Los archivos se guardan en Supabase Storage y son accesibles desde cualquier dispositivo.
          </div>
        </div>
      )}
    </div>
  )
}
