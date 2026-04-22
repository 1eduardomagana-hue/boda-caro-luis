import { useState, useEffect, useCallback } from 'react'
import {
  getProject, getProviders, getEvents, getChecklist,
  getGuests, getLinks, getNotes, getFiles,
} from '../lib/supabase'

export function useProject() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(true)

  // domain data
  const [providers, setProviders] = useState([])
  const [events, setEvents] = useState([])
  const [checklist, setChecklist] = useState([])
  const [guests, setGuests] = useState([])
  const [links, setLinks] = useState([])
  const [notes, setNotes] = useState([])
  const [files, setFiles] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = await getProject()
      setProject(p)
      if (p) {
        const [prov, evs, chk, gst, lnk, nts, fls] = await Promise.all([
          getProviders(p.id),
          getEvents(p.id),
          getChecklist(p.id),
          getGuests(p.id),
          getLinks(p.id),
          getNotes(p.id),
          getFiles(p.id),
        ])
        setProviders(prov)
        setEvents(evs)
        setChecklist(chk)
        setGuests(gst)
        setLinks(lnk)
        setNotes(nts)
        setFiles(fls)
      }
      setOnline(true)
    } catch {
      setOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return {
    project, loading, online, reload: load,
    providers, setProviders,
    events, setEvents,
    checklist, setChecklist,
    guests, setGuests,
    links, setLinks,
    notes, setNotes,
    files, setFiles,
  }
}
