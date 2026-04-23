import { supabase } from './supabase.js'

export async function getProject() {
  const { data, error } = await supabase.from('projects').select('*').limit(1).single()
  if (error) return null
  return data
}

export async function getProviders(projectId) {
  const { data } = await supabase.from('providers').select('*').eq('project_id', projectId).order('created_at')
  return data || []
}

export async function upsertProvider(provider) {
  const { data, error } = await supabase.from('providers').upsert(provider).select().single()
  return { data, error }
}

export async function deleteProvider(id) {
  return supabase.from('providers').delete().eq('id', id)
}

export async function getGuests(projectId) {
  const { data } = await supabase.from('guests').select('*').eq('project_id', projectId).order('created_at')
  return data || []
}

export async function upsertGuest(guest) {
  return supabase.from('guests').upsert(guest).select().single()
}

export async function getEvents(projectId) {
  const { data } = await supabase.from('events').select('*').eq('project_id', projectId).order('event_date')
  return data || []
}

export async function upsertEvent(event) {
  return supabase.from('events').upsert(event).select().single()
}

export async function getChecklist(projectId, categorySlug) {
  let q = supabase.from('checklist_items').select('*').eq('project_id', projectId)
  if (categorySlug) q = q.eq('category_slug', categorySlug)
  const { data } = await q.order('sort_order')
  return data || []
}

export async function toggleChecklistItem(id, done) {
  return supabase.from('checklist_items').update({ done }).eq('id', id)
}

export async function upsertChecklistItem(item) {
  return supabase.from('checklist_items').upsert(item).select().single()
}

export async function getNotes(projectId) {
  const { data } = await supabase.from('notes_raw').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data || []
}

export async function upsertNote(note) {
  return supabase.from('notes_raw').upsert(note).select().single()
}

export async function getLinks(projectId) {
  const { data } = await supabase.from('links').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data || []
}

export async function upsertLink(link) {
  return supabase.from('links').upsert(link).select().single()
}

export async function deleteLink(id) {
  return supabase.from('links').delete().eq('id', id)
}

export async function getFiles(projectId) {
  const { data } = await supabase.from('files').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  return data || []
}

export async function uploadFile(projectId, file, category = '') {
  const ext = file.name.split('.').pop()
  const path = `${projectId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('wedding-files').upload(path, file)
  if (uploadError) return { error: uploadError }
  const { data: { publicUrl } } = supabase.storage.from('wedding-files').getPublicUrl(path)
  const { data, error } = await supabase.from('files').insert({
    project_id: projectId, name: file.name, storage_path: path,
    file_type: ext, file_size: file.size, category,
    mime_type: file.type, public_url: publicUrl,
  }).select().single()
  return { data, error }
}

export async function deleteFile(id, storagePath) {
  await supabase.storage.from('wedding-files').remove([storagePath])
  return supabase.from('files').delete().eq('id', id)
}

export async function saveImport(projectId, raw, structured) {
  const { data: noteRaw } = await supabase.from('notes_raw').insert({
    project_id: projectId, title: structured.resumen, content: raw,
    source: 'ai_import', ai_analyzed: true, ai_confidence: structured.confianza,
    category_slug: structured.categoria_sugerida,
  }).select().single()

  if (structured.proveedores?.length) {
    const rows = structured.proveedores.map(p => ({
      project_id: projectId, name: p.nombre, category: p.categoria,
      contact: p.contacto, total_amount: p.total, paid_amount: p.pagado,
      payment_due: p.fecha_pago, status: p.status, notes: p.notas,
    }))
    await supabase.from('providers').insert(rows)
  }

  if (structured.eventos?.length) {
    const rows = structured.eventos.map(e => ({
      project_id: projectId, title: e.nombre, event_date: e.fecha,
      event_time: e.hora, venue: e.lugar, description: e.descripcion,
      event_type: e.tipo, status: 'upcoming',
    }))
    await supabase.from('events').insert(rows)
  }

  if (structured.tareas?.length) {
    const rows = structured.tareas.map((t, i) => ({
      project_id: projectId, category_slug: structured.categoria_sugerida || 'notas',
      text: t.texto, done: t.completada, priority: t.prioridad,
      due_date: t.fecha_limite, sort_order: i,
    }))
    await supabase.from('checklist_items').insert(rows)
  }

  if (structured.links?.length) {
    const rows = structured.links.map(l => ({
      project_id: projectId, title: l.titulo, url: l.url, notes: l.nota,
    }))
    await supabase.from('links').insert(rows)
  }

  return noteRaw
}
