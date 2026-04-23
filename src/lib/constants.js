export const COLORS = {
  cream: '#FAF8F5', beige: '#F0EBE3', sand: '#E8DDD1', blush: '#E8D5CC',
  taupe: '#C4AFA0', champagne: '#D4B896', gold: '#B8975A', warmGray: '#8B7D72',
  darkTaupe: '#5C4D44', text: '#3D2E27', textLight: '#8B7D72', white: '#FFFFFF',
  green: '#7A9E7E', amber: '#C9934A', red: '#B85C5C',
}

export const WEDDING_DATE = new Date('2026-11-20T17:00:00')
export const VENUE = 'Quinta Montes Molina'
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'bodacaroluis2026'

export const NAV_SECTIONS = [
  { label: 'Principal', items: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'timeline', icon: '📅', label: 'Timeline' },
    { id: 'proveedores', icon: '💳', label: 'Proveedores' },
  ]},
  { label: 'Ceremonias', items: [
    { id: 'civil', icon: '📜', label: 'Boda Civil' },
    { id: 'misa', icon: '⛪', label: 'Misa' },
  ]},
  { label: 'Planeación', items: [
    { id: 'invitados', icon: '👥', label: 'Invitados' },
    { id: 'logistica', icon: '🗺️', label: 'Logística' },
    { id: 'fotos', icon: '📷', label: 'Fotos' },
    { id: 'week', icon: '🗓️', label: 'Week Planner' },
    { id: 'eventos', icon: '🥂', label: 'Eventos' },
  ]},
  { label: 'Notas & más', items: [
    { id: 'notas', icon: '📝', label: 'Notas Maestras' },
    { id: 'categorias', icon: '✨', label: 'Categorías' },
    { id: 'archivos', icon: '🗂️', label: 'Archivos' },
    { id: 'importar', icon: '🤖', label: 'Importar IA' },
  ]},
]

export const SYSTEM_PROMPT = `Eres un asistente especializado en análisis de notas de planeación de bodas.
Analiza el texto y devuelve ÚNICAMENTE un objeto JSON válido sin texto adicional ni backticks.

Estructura exacta:
{
  "resumen": "string max 120 chars",
  "categoria_sugerida": "proveedores|civil|misa|invitados|logistica|fotos|week|eventos|notas|categorias",
  "confianza": 0.0-1.0,
  "proveedores": [{"nombre":"","categoria":"","contacto":null,"total":null,"pagado":null,"saldo":null,"fecha_pago":null,"status":"pendiente","notas":null}],
  "eventos": [{"nombre":"","fecha":null,"hora":null,"lugar":null,"descripcion":null,"tipo":"otro"}],
  "tareas": [{"texto":"","completada":false,"prioridad":"media","fecha_limite":null}],
  "invitados": [{"grupo":"","cantidad":null,"confirmados":null,"notas":null}],
  "pagos": [{"concepto":"","monto":0,"fecha":null,"estado":"pendiente","proveedor":null}],
  "logistica": [{"hora":null,"actividad":"","responsable":null,"lugar":null}],
  "links": [{"titulo":"","url":"","nota":null}],
  "alertas_duplicado": [{"tipo":"proveedor|evento|pago","descripcion":""}]
}`
