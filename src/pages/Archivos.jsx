import { useState, useEffect } from 'react'
import { getLinks, upsertLink, deleteLink, getFiles, uploadFile, deleteFile } from '../lib/db.js'
import { Spinner, PageHeader, SectionRow, EmptyState, Inp, Sel } from '../components/UI.jsx'

const LINK_CATS=['Contratos','Proveedores','Invitados','Inspiracion','Musica','Logistica','Otros']
const fmt=(b)=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB'

export default function Archivos({ project }) {
  const [tab,setTab] = useState('links')
  const [links,setLinks] = useState([])
  const [files,setFiles] = useState([])
  const [loading,setLoading] = useState(true)
  const [sheet,setSheet] = useState(false)
  const [newLink,setNewLink] = useState({title:'',url:'',category:'Otros',notes:''})
  const [uploading,setUploading] = useState(false)
  const [err,setErr] = useState('')

  const loadAll=async()=>{const[l,f]=await Promise.all([getLinks(project.id),getFiles(project.id)]);setLinks(l);setFiles(f);setLoading(false)}
  useEffect(()=>{loadAll()},[project.id])

  const saveLink=async()=>{if(!newLink.title.trim()||!newLink.url.trim()){setErr('Título y URL obligatorios');return}
    await upsertLink({project_id:project.id,...newLink});setNewLink({title:'',url:'',category:'Otros',notes:''});setSheet(false);setErr('');loadAll()}
  const rmLink=async(id)=>{if(!window.confirm('¿Eliminar?'))return;await deleteLink(id);loadAll()}

  const handleUpload=async(e)=>{const f=e.target.files[0];if(!f)return;setUploading(true);await uploadFile(project.id,f,'');setUploading(false);loadAll();e.target.value=''}
  const rmFile=async(f)=>{if(!window.confirm('¿Eliminar?'))return;await deleteFile(f.id,f.storage_path);loadAll()}

  if(loading)return<Spinner/>

  return (
    <div>
      <PageHeader title="Archivos"/>
      <div className="scroll-area">
        {/* Tabs */}
        <div style={{display:'flex',gap:6,background:'#F0EBE3',borderRadius:12,padding:4}}>
          {[['links',`🔗 Links (${links.length})`],['files',`📎 Archivos (${files.length})`]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{
              flex:1,padding:'9px 12px',borderRadius:10,fontSize:13,fontWeight:500,
              background:tab===v?'white':'transparent',
              color:tab===v?'#3D2E27':'#8B7D72',
              border:'none',cursor:'pointer',fontFamily:"'Jost',sans-serif",
              boxShadow:tab===v?'0 1px 4px rgba(92,77,68,.1)':'none',
              transition:'all .2s' }}>{l}</button>
          ))}
        </div>

        {tab==='links' && (
          <>
            <button className="btn" onClick={()=>setSheet(true)}>+ Agregar link</button>
            {sheet && (
              <>
                <div className="sheet-overlay" onClick={()=>setSheet(false)}/>
                <div className="sheet">
                  <div className="sheet-handle"/>
                  <div className="sheet-title">Nuevo link</div>
                  <div className="form-stack">
                    <Inp value={newLink.title} onChange={v=>setNewLink(n=>({...n,title:v}))} placeholder="Título *"/>
                    <Inp value={newLink.url} onChange={v=>setNewLink(n=>({...n,url:v}))} placeholder="https://…"/>
                    <Sel value={newLink.category} onChange={v=>setNewLink(n=>({...n,category:v}))} options={LINK_CATS}/>
                    <Inp value={newLink.notes||''} onChange={v=>setNewLink(n=>({...n,notes:v}))} placeholder="Nota opcional…" rows={2}/>
                    {err&&<div style={{fontSize:12,color:'#B85C5C'}}>{err}</div>}
                    <button className="btn" onClick={saveLink}>Guardar</button>
                    <button className="btn-ghost" onClick={()=>setSheet(false)}>Cancelar</button>
                  </div>
                </div>
              </>
            )}
            {links.length===0
              ? <EmptyState icon="🔗" title="Sin links" sub="Guarda links de Drive, Spotify, Pinterest o cualquier referencia."/>
              : links.map(l=>(
                  <div key={l.id} className="card" style={{overflow:'hidden'}}>
                    <div style={{padding:'14px 16px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div style={{flex:1,paddingRight:12}}>
                          <span className="badge badge-gray" style={{marginBottom:8,display:'inline-flex'}}>{l.category}</span>
                          <div style={{fontSize:15,fontWeight:500,color:'#3D2E27',marginBottom:4}}>{l.title}</div>
                          {l.notes&&<div style={{fontSize:12,color:'#8B7D72',marginBottom:8}}>{l.notes}</div>}
                          <a href={l.url} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:13,color:'#B8975A',textDecoration:'none',fontWeight:500}}>
                            Abrir ↗
                          </a>
                        </div>
                        <button onClick={()=>rmLink(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:15,flexShrink:0}}>✕</button>
                      </div>
                    </div>
                  </div>
                ))
            }
          </>
        )}

        {tab==='files' && (
          <>
            <label style={{cursor:'pointer',display:'block'}}>
              <div className="btn-primary" style={{textAlign:'center',borderRadius:12}}>
                {uploading?'Subiendo…':'+ Subir archivo'}
              </div>
              <input type="file" onChange={handleUpload} style={{display:'none'}} disabled={uploading}/>
            </label>
            {files.length===0
              ? <EmptyState icon="📂" title="Sin archivos" sub="Sube contratos, cotizaciones o cualquier documento. Se guardan en la nube."/>
              : (
                <div className="card" style={{overflow:'hidden'}}>
                  {files.map((f,i)=>(
                    <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:i<files.length-1?'1px solid rgba(196,175,160,.1)':'none'}}>
                      <div style={{fontSize:24,flexShrink:0}}>📄</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,color:'#3D2E27',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                        <div style={{fontSize:11,color:'#8B7D72'}}>{f.file_type?.toUpperCase()} · {fmt(f.file_size||0)}</div>
                      </div>
                      {f.public_url&&<a href={f.public_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#B8975A',textDecoration:'none',fontWeight:500,flexShrink:0}}>Ver ↗</a>}
                      <button onClick={()=>rmFile(f)} style={{background:'none',border:'none',cursor:'pointer',color:'#C4AFA0',fontSize:14,flexShrink:0}}>✕</button>
                    </div>
                  ))}
                </div>
              )
            }
            <div style={{background:'#F0EBE3',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#8B7D72',lineHeight:1.6}}>
              Los archivos se guardan en la nube y están disponibles desde cualquier dispositivo.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
