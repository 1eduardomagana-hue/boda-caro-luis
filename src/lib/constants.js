export const COLORS = {
  cream: '#FAF8F5', beige: '#F0EBE3', sand: '#E8DDD1', blush: '#E8D5CC',
  taupe: '#C4AFA0', champagne: '#D4B896', gold: '#B8975A', warmGray: '#8B7D72',
  darkTaupe: '#5C4D44', text: '#3D2E27', textLight: '#8B7D72', white: '#FFFFFF',
  green: '#7A9E7E', amber: '#C9934A', red: '#B85C5C',
}

export const WEDDING_DATE = new Date('2026-11-20T17:00:00')
export const VENUE = 'Quinta Montes Molina'
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'bodacaroluis2026'

// Bottom nav — 5 tabs
export const BOTTOM_NAV = [
  { id: 'home',      icon: '🏠', label: 'Inicio' },
  { id: 'pending',   icon: '✓',  label: 'Pendientes' },
  { id: 'timeline',  icon: '📅', label: 'Timeline' },
  { id: 'archivos',  icon: '🗂️', label: 'Archivos' },
  { id: 'more',      icon: '⋯',  label: 'Más' },
]

// Full nav sections (desktop sidebar + "Más" drawer)
export const NAV_SECTIONS = [
  { label: 'Principal', items: [
    { id: 'home',       icon: '🏠', label: 'Inicio' },
    { id: 'pending',    icon: '✓',  label: 'Pendientes' },
    { id: 'timeline',   icon: '📅', label: 'Timeline' },
  ]},
  { label: 'Ceremonias', items: [
    { id: 'civil',      icon: '📜', label: 'Boda Civil' },
    { id: 'misa',       icon: '⛪', label: 'Misa' },
  ]},
  { label: 'Planeación', items: [
    { id: 'proveedores',icon: '💳', label: 'Proveedores' },
    { id: 'invitados',  icon: '👥', label: 'Invitados' },
    { id: 'logistica',  icon: '🗺️', label: 'Logística' },
    { id: 'fotos',      icon: '📷', label: 'Fotos' },
    { id: 'week',       icon: '🗓️', label: 'Week Planner' },
    { id: 'eventos',    icon: '🥂', label: 'Eventos' },
  ]},
  { label: 'Notas & más', items: [
    { id: 'notas',      icon: '📝', label: 'Notas Maestras' },
    { id: 'archivos',   icon: '🗂️', label: 'Archivos' },
  ]},
]

// "Más" drawer items (mobile)
export const MORE_ITEMS = [
  { id: 'proveedores', icon: '💳', label: 'Proveedores',    sub: 'Pagos y saldos', color: '#EEF5EF' },
  { id: 'invitados',   icon: '👥', label: 'Invitados',      sub: 'Grupos y confirmaciones', color: '#EEF0F8' },
  { id: 'civil',       icon: '📜', label: 'Boda Civil',     sub: 'Documentos y pendientes', color: '#FDF3E8' },
  { id: 'misa',        icon: '⛪', label: 'Misa',           sub: 'Ceremonia religiosa', color: '#F0EBF8' },
  { id: 'logistica',   icon: '🗺️', label: 'Logística',      sub: 'Plan del día', color: '#FAEAEA' },
  { id: 'fotos',       icon: '📷', label: 'Fotos',          sub: 'Shots y sesiones', color: '#EEF5EF' },
  { id: 'week',        icon: '🗓️', label: 'Week Planner',   sub: 'Semana de la boda', color: '#FDF3E8' },
  { id: 'eventos',     icon: '🥂', label: 'Eventos',        sub: 'Despedida, brunch…', color: '#EEF0F8' },
  { id: 'notas',       icon: '📝', label: 'Notas Maestras', sub: 'Apple Notes aquí', color: '#F0EBE3' },
]
