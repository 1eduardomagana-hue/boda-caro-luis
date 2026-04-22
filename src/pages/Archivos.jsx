import { useState, useEffect } from 'react'
import { upsertLink, deleteLink as deleteLinkDB, uploadFile, deleteFile as deleteFileDB, getFiles } from '../lib/supabase.js'
import { DeleteBtn, EmptyState } from '../components/UI.jsx'

const LINK_CATEGORIES = ['Todos', 'Contratos', 'Proveedores', 'Invitados', 'Inspiración', 'Música', 'Logística', 'Otros']
const FILE_ICONS = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📋', pptx: '📋', txt: '📃', csv: '📊', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', webp: '🖼️' }

function getIcon(name) { return FILE_ICONS[name?.split('.').pop()?.toLowerCase()] || '📎' }
function fmtSize(b) {
  if (!b) return '—'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}
function linkCatColor(cat) {
  return { Contratos: 'badge-red', Proveedores: 'badge-amber', Invitados: 'badge-blue', Inspiración: 'badge-green', Música: 'badge-green', Logística: 'badge-amber' }[cat] || 'badge-gray'
}

const DEMO_LINKS = [
  { id: 'dl1', title: 'Contratos boda — Carpeta Drive', category: 'Contratos', url: 'https://drive.google.com', note: 'Contratos firmados: Quinta, catering, foto y video.' },
  { id: 'dl2', title: 'Album compartido — Quinta Montes Molina', category: 'Inspiración', url: 'https://photos.google.com', note: 'Fotos del venue y referencias de montajes.' },
  { id: 'dl3', title: 'Lista de regalos Liverpool', category: 'Invitados', url: 'https://liverpool.com.mx', note: 'Código: CAROLUIS2026' },
  { id: 'dl4', title: 'Formulario RSVP', category: 'Invitados', url: 'https://forms.google.com', note: 'Cierra el 1 de octubre.' },
  { id: 'dl5', title: 'Playlist Spotify — Boda', category: 'Música', url: 'https://open.spotify.com', note: 'Coctelera + entrada + baile.' },
]

export function Archivos({ links: rawLinks, setLinks, files: rawFiles, setFiles, project }) {
  const [tab, setTab] = useState('links')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [addingLink, setAddingLink] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', category: 'Otros', url: '', note: '' })
  const [linkError, setLinkError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [localImages, setLocalImages] = useState([])
  const [localFiles, setLocalFiles] = useState([])

  const links = rawLinks.length ? rawLinks : DEMO_LINKS
  const dbFiles = rawFiles

  const saveLink = async () => {
    if (!newLink.title.trim()) { setLinkError('El título es obligatorio.'); return }
    if (!newLink.url.trim()) { setLinkError('La URL es obligatoria.'); return }
    const payload = { ...newLink, project_id: project?.id }
    try {
      const saved = await upsertLink(payload)
      setLinks(prev => [saved, ...prev])
    } catch {
      setLinks(prev => [{ ...payload, id: Date.now() }, ...prev])
    }
    setNewLink({ title: '', category: 'Otros', url: '', note: '' })
    setLinkError('')
    setAddingLink(false)
  }

  const removeLink = async (id) => {
    try { await deleteLinkDB(id) } catch { }
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const handleImageUpload = async (fileList) => {
    const images = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    for (const file of images) {
      setUploading(true)
      try {
        const saved = await uploadFile(project?.id, file, 'galeria')
        setFiles(prev => [saved, ...prev])
      } catch {
        setLocalImages(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, size: file.size, url: URL.createObjectURL(file) }])
      } finally {
        setUploading(false)
      }
    }
  }

  const handleFileUpload = async (fileList) => {
    const files = Array.from(fileList)
    for (const file of files) {
      setUploading(true)
      try {
        const saved = await uploadFile(project?.id, file, 'documentos')
        setFiles(prev => [saved, ...prev])
      } catch {
        setLocalFiles(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, size: file.size, url: URL.createObjectURL(file), type: file.name.split('.').pop().toUpperCase() }])
      } finally {
        setUploading(false)
      }
    }
  }

  const removeFile = async (f) => {
    if (f.path) {
      try { await deleteFileDB(f.id, f.path) } catch { }
      setFiles(prev => prev.filter(x => x.id !== f.id))
    } else {
      if (f.url?.startsWith('blob:')) URL.revokeObjectURL(f.url)
      setLocalFiles(prev => prev.filter(x => x.id !== f.id))
    }
  }

  useEffect(() => () => {
    localImages.forEach(i => URL.revokeObjectURL(i.url))
    localFiles.forEach(f => f.url?.startsWith('blob:') && URL.revokeObjectURL(f.url))
  }, [])

  const filteredLinks = links.filter(l => {
    const matchCat = catFilter === 'Todos' || l.category === catFilter
    const q = search.toLowerCase()
    return matchCat && (!q || l.title.toLowerCase().includes(q) || (l.note || '').toLowerCase().includes(q))
  })

  const allImages = [...dbFiles.filter(f => ['png','jpg','jpeg','gif','webp'].includes(f.type?.toLowerCase() || f.name?.split('.').pop()?.toLowerCase())), ...localImages]
  const allFiles = [...dbFiles.filter(f => !['png','jpg','jpeg','gif','webp'].includes(f.type?.toLowerCase() || f.name?.split('.').pop()?.toLowerCase())), ...localFiles]

  const PREVIEWABLE = ['pdf','png','jpg','jpeg','gif','webp']

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--taupe)', fontSize: 13 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en links, imágenes o archivos..."
          className="input-field" style={{ paddingLeft: 34 }} />
      </div>

      {/* Tabs with counts */}
      <div className="tabs">
        {[['links', '🔗 Links', filteredLinks.length], ['gallery', '🖼️ Galería', allImages.length], ['files', '📎 Archivos', allFiles.length]].map(([v, l, count]) => (
          <div key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>
            {l}
            <span style={{ marginLeft: 6, fontSize: 10, background: tab === v ? 'var(--champagne)' : 'var(--sand)', color: tab === v ? 'var(--dark-taupe)' : 'var(--warm-gray)', borderRadius: 99, padding: '1px 7px', fontWeight: 600 }}>{count}</span>
          </div>
        ))}
      </div>

      {/* LINKS */}
      {tab === 'links' && (
        <div className="section-gap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LINK_CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, cursor: 'pointer', border: `1px solid ${catFilter === c ? 'var(--gold)' : 'var(--sand)'}`, background: catFilter === c ? 'var(--dark-taupe)' : 'var(--white)', color: catFilter === c ? 'var(--champagne)' : 'var(--warm-gray)', fontFamily: 'Jost, sans-serif', transition: 'all 0.15s' }}>
                  {c}
                </button>
              ))}
            </div>
            <button className="btn" onClick={() => setAddingLink(true)}>+ Agregar link</button>
          </div>

          {addingLink && (
            <div className="card" style={{ borderTop: '3px solid var(--champagne)' }}>
              <div className="card-title">Nuevo link</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Título" value={newLink.title} onChange={e => { setNewLink(n => ({ ...n, title: e.target.value })); setLinkError('') }} className="input-field" style={{ height: 'auto' }} />
                <input placeholder="URL (https://...)" value={newLink.url} onChange={e => { setNewLink(n => ({ ...n, url: e.target.value })); setLinkError('') }} className="input-field" style={{ height: 'auto' }} />
                <select value={newLink.category} onChange={e => setNewLink(n => ({ ...n, category: e.target.value }))} className="input-field" style={{ height: 'auto' }}>
                  {LINK_CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
                </select>
                <textarea placeholder="Nota opcional..." rows={2} value={newLink.note} onChange={e => setNewLink(n => ({ ...n, note: e.target.value }))} className="input-field" />
                {linkError && <div style={{ fontSize: 12, color: 'var(--red)', background: '#FAEAEA', borderRadius: 6, padding: '6px 10px' }}>{linkError}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={saveLink}>Guardar</button>
                  <button className="btn-ghost" onClick={() => { setAddingLink(false); setLinkError('') }}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {filteredLinks.length === 0
            ? <EmptyState icon="🔗" title="Sin links" hint="Agrega contratos, referencias, playlists o cualquier URL que uses seguido." action="+ Agregar link" onAction={() => setAddingLink(true)} />
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {filteredLinks.map(link => (
                  <div key={link.id} className="card" style={{ borderLeft: '3px solid var(--champagne)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      <DeleteBtn onConfirm={() => removeLink(link.id)} />
                    </div>
                    <div style={{ paddingRight: 24 }}>
                      <span className={`badge ${linkCatColor(link.category)}`} style={{ marginBottom: 8, display: 'inline-flex' }}>{link.category}</span>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 500, color: 'var(--dark-taupe)', marginBottom: 5, lineHeight: 1.3 }}>{link.title}</div>
                      {link.note && <div style={{ fontSize: 11.5, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.65 }}>{link.note}</div>}
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11.5, color: 'var(--gold)', textDecoration: 'none', borderBottom: '1px solid var(--champagne)', paddingBottom: 1, fontWeight: 500 }}>
                        Abrir ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {/* GALLERY */}
      {tab === 'gallery' && (
        <div className="section-gap">
          {allImages.length === 0 ? (
            <label style={{ cursor: 'pointer' }}>
              <EmptyState icon="🖼️" title="Galería vacía" hint="Carga fotos de inspiración, preboda, referencias o capturas de WhatsApp." />
              <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e.target.files)} style={{ display: 'none' }} />
            </label>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                {uploading && <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Subiendo...</span>}
                <label style={{ cursor: 'pointer' }}>
                  <span className="btn">+ Agregar fotos</span>
                  <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e.target.files)} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
                {allImages.map(img => (
                  <div key={img.id} style={{ background: 'var(--white)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--sand)' }}>
                    <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', background: 'var(--beige)' }}>
                      <img src={img.url} alt={img.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                        <a href={img.url} target="_blank" rel="noopener noreferrer"
                          style={{ background: 'rgba(0,0,0,0.45)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, textDecoration: 'none' }}>↗</a>
                        <button onClick={() => removeFile(img)}
                          style={{ background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: 'white', fontSize: 10 }}>✕</button>
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: 'var(--dark-taupe)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-light)' }}>{fmtSize(img.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* FILES */}
      {tab === 'files' && (
        <div className="section-gap">
          {allFiles.length === 0 ? (
            <label style={{ cursor: 'pointer' }}>
              <EmptyState icon="📂" title="Sin archivos" hint="Sube contratos, cotizaciones, listas de invitados o cualquier documento." />
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" onChange={e => handleFileUpload(e.target.files)} style={{ display: 'none' }} />
            </label>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {uploading && <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Subiendo...</span>}
                <label style={{ cursor: 'pointer' }}>
                  <span className="btn">+ Cargar archivos</span>
                  <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" onChange={e => handleFileUpload(e.target.files)} style={{ display: 'none' }} />
                </label>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {allFiles.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < allFiles.length - 1 ? '1px solid var(--beige)' : 'none' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{getIcon(f.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-light)' }}>{f.type || f.name?.split('.').pop()?.toUpperCase()} · {fmtSize(f.size)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {PREVIEWABLE.includes(f.type?.toLowerCase() || f.name?.split('.').pop()?.toLowerCase()) && (
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11.5, color: 'var(--warm-gray)', textDecoration: 'none', border: '1px solid var(--sand)', borderRadius: 6, padding: '4px 10px' }}>Ver ↗</a>
                      )}
                      <a href={f.url} download={f.name}
                        style={{ fontSize: 11.5, color: 'var(--gold)', textDecoration: 'none', border: '1px solid var(--champagne)', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>↓</a>
                      <DeleteBtn onConfirm={() => removeFile(f)} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ background: 'var(--beige)', borderRadius: 8, padding: '10px 16px', fontSize: 11.5, color: 'var(--warm-gray)', lineHeight: 1.6 }}>
            Los archivos se guardan en Supabase Storage cuando hay conexión. Sin conexión, viven solo en esta sesión. Para persistencia garantizada, usa links de Drive/iCloud.
          </div>
        </div>
      )}
    </div>
  )
}
