import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── helpers ─────────────────────────────────────────────────────────────────
export async function getProject() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
    .maybeSingle()
  return data
}

export async function createProject(payload) {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getProviders(projectId) {
  const { data } = await supabase
    .from('providers')
    .select('*, payments(*)')
    .eq('project_id', projectId)
    .order('created_at')
  return data || []
}

export async function upsertProvider(payload) {
  const { data, error } = await supabase
    .from('providers')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProvider(id) {
  return supabase.from('providers').delete().eq('id', id)
}

export async function getEvents(projectId) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('project_id', projectId)
    .order('event_date')
  return data || []
}

export async function upsertEvent(payload) {
  const { data, error } = await supabase
    .from('events')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getChecklist(projectId, category) {
  const query = supabase
    .from('checklist_items')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at')
  if (category) query.eq('category', category)
  const { data } = await query
  return data || []
}

export async function toggleChecklistItem(id, done) {
  return supabase.from('checklist_items').update({ done }).eq('id', id)
}

export async function upsertChecklistItem(payload) {
  const { data, error } = await supabase
    .from('checklist_items')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getGuests(projectId) {
  const { data } = await supabase
    .from('guests')
    .select('*')
    .eq('project_id', projectId)
    .order('group_name')
  return data || []
}

export async function upsertGuest(payload) {
  const { data, error } = await supabase
    .from('guests')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLinks(projectId) {
  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function upsertLink(payload) {
  const { data, error } = await supabase
    .from('links')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLink(id) {
  return supabase.from('links').delete().eq('id', id)
}

export async function getNotes(projectId) {
  const { data } = await supabase
    .from('notes_raw')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function upsertNote(payload) {
  const { data, error } = await supabase
    .from('notes_raw')
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFiles(projectId) {
  const { data } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function uploadFile(projectId, file, category = '') {
  const ext = file.name.split('.').pop()
  const path = `${projectId}/${Date.now()}_${file.name}`
  const { error: upErr } = await supabase.storage
    .from('wedding-files')
    .upload(path, file)
  if (upErr) throw upErr

  const { data: urlData } = supabase.storage
    .from('wedding-files')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('files')
    .insert({
      project_id: projectId,
      name: file.name,
      path,
      url: urlData.publicUrl,
      size: file.size,
      type: ext.toUpperCase(),
      category,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFile(id, path) {
  await supabase.storage.from('wedding-files').remove([path])
  return supabase.from('files').delete().eq('id', id)
}

export async function saveImport(projectId, rawText, structured) {
  const { data, error } = await supabase
    .from('notes_raw')
    .insert({
      project_id: projectId,
      title: structured.resumen || 'Nota importada',
      content: rawText,
      category: structured.categoria_sugerida,
      metadata: structured,
    })
    .select()
    .single()
  if (error) throw error

  // persist providers
  for (const p of structured.proveedores || []) {
    await supabase.from('providers').insert({
      project_id: projectId,
      name: p.nombre,
      category: p.categoria,
      contact: p.contacto,
      total_amount: p.total,
      paid_amount: p.pagado,
      balance: p.saldo,
      due_date: p.fecha_pago,
      status: p.status,
      notes: p.notas,
    })
  }
  // persist events
  for (const ev of structured.eventos || []) {
    await supabase.from('events').insert({
      project_id: projectId,
      title: ev.nombre,
      event_date: ev.fecha,
      event_time: ev.hora,
      location: ev.lugar,
      description: ev.descripcion,
      type: ev.tipo,
    })
  }
  // persist checklist
  for (const t of structured.tareas || []) {
    await supabase.from('checklist_items').insert({
      project_id: projectId,
      text: t.texto,
      done: t.completada,
      priority: t.prioridad,
      due_date: t.fecha_limite,
      category: structured.categoria_sugerida,
    })
  }
  return data
}

export async function getAppSetting(key) {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value
}

export async function setAppSetting(key, value) {
  return supabase
    .from('app_settings')
    .upsert({ key, value })
}
