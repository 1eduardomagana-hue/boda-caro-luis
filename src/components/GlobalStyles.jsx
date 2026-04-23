import { COLORS } from '../lib/constants.js'
const C = COLORS

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.cream};font-family:'Jost',sans-serif;color:${C.text}}
  .app{display:flex;min-height:100vh}
  .sidebar{width:220px;min-width:220px;background:${C.darkTaupe};display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;overflow-y:auto}
  .sidebar-header{padding:28px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .sidebar-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;color:${C.champagne};letter-spacing:.5px;line-height:1.3}
  .sidebar-subtitle{font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:4px}
  .sidebar-date{font-size:11px;color:${C.champagne};margin-top:10px;font-weight:300;opacity:.8}
  .nav-section{padding:16px 0 8px}
  .nav-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);padding:0 20px 8px;font-weight:500}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;cursor:pointer;transition:all .2s;font-size:13px;color:#D6CCC6;font-weight:400;border-left:2px solid transparent}
  .nav-item:hover{color:#fff;background:rgba(255,255,255,0.08)}
  .nav-item.active{color:${C.champagne};background:rgba(212,184,150,0.15);border-left-color:${C.champagne};font-weight:500}
  .nav-icon{font-size:14px}
  .main{margin-left:220px;flex:1;padding:32px 36px;min-height:100vh}
  .page-header{margin-bottom:28px}
  .page-title{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:400;color:${C.darkTaupe};letter-spacing:-.3px}
  .page-subtitle{font-size:13px;color:${C.textLight};margin-top:4px;font-weight:300}
  .card{background:${C.white};border-radius:12px;padding:20px 24px;border:1px solid rgba(196,175,160,0.25);box-shadow:0 2px 12px rgba(92,77,68,.05)}
  .card-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:500;color:${C.darkTaupe};margin-bottom:14px;letter-spacing:.2px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .stat-card{background:${C.white};border-radius:12px;padding:18px 20px;border:1px solid rgba(196,175,160,.25);box-shadow:0 2px 8px rgba(92,77,68,.04)}
  .stat-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.taupe}}
  .stat-value{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:400;color:${C.darkTaupe};margin:4px 0 2px;line-height:1}
  .stat-sub{font-size:11px;color:${C.textLight}}
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:500;letter-spacing:.5px}
  .badge-green{background:#EEF5EF;color:#4A7A50}
  .badge-amber{background:#FDF3E8;color:#A06B25}
  .badge-red{background:#FAEAEA;color:#8B3232}
  .badge-gray{background:${C.beige};color:${C.warmGray}}
  .badge-blue{background:#EEF0F8;color:#3B4E8A}
  table{width:100%;border-collapse:collapse}
  th{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.taupe};padding:10px 12px;text-align:left;border-bottom:1px solid ${C.sand};font-weight:500}
  td{padding:11px 12px;font-size:12.5px;border-bottom:1px solid ${C.beige};vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:${C.cream}}
  .checklist-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid ${C.beige};cursor:pointer}
  .checklist-item:last-child{border-bottom:none}
  .check-box{width:16px;height:16px;border-radius:4px;border:1.5px solid ${C.taupe};flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .check-box.done{background:${C.champagne};border-color:${C.champagne}}
  .check-text{font-size:13px;line-height:1.5}
  .check-text.done{text-decoration:line-through;color:${C.taupe}}
  .progress-bar-outer{background:${C.beige};border-radius:99px;height:6px;overflow:hidden}
  .progress-bar-inner{height:100%;border-radius:99px;background:linear-gradient(90deg,${C.champagne},${C.gold});transition:width .5s ease}
  .accordion{border:1px solid ${C.sand};border-radius:10px;overflow:hidden;margin-bottom:10px}
  .accordion-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;cursor:pointer;background:${C.white};transition:background .2s}
  .accordion-header:hover{background:${C.cream}}
  .accordion-title{font-size:14px;font-weight:500;color:${C.darkTaupe}}
  .accordion-body{padding:16px 18px;background:${C.cream};border-top:1px solid ${C.sand}}
  .tabs{display:flex;gap:0;border-bottom:1px solid ${C.sand};margin-bottom:20px}
  .tab{padding:10px 18px;font-size:12px;cursor:pointer;color:${C.textLight};border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;font-weight:400;letter-spacing:.3px}
  .tab:hover{color:${C.darkTaupe}}
  .tab.active{color:${C.darkTaupe};border-bottom-color:${C.gold};font-weight:500}
  .input-field{width:100%;border:1px solid ${C.sand};border-radius:8px;padding:10px 14px;font-family:'Jost',sans-serif;font-size:13px;color:${C.text};background:${C.cream};resize:vertical;outline:none;transition:border .2s}
  .input-field:focus{border-color:${C.champagne};background:white}
  .btn{background:${C.darkTaupe};color:white;border:none;padding:9px 20px;border-radius:8px;font-family:'Jost',sans-serif;font-size:12px;cursor:pointer;letter-spacing:.5px;transition:opacity .2s}
  .btn:hover{opacity:.85}
  .btn-ghost{background:transparent;color:${C.darkTaupe};border:1px solid ${C.sand};padding:8px 16px;border-radius:8px;font-family:'Jost',sans-serif;font-size:12px;cursor:pointer;transition:all .2s}
  .btn-ghost:hover{border-color:${C.champagne}}
  .section-gap{display:flex;flex-direction:column;gap:16px}
  .timeline-item{display:flex;gap:16px;padding-bottom:20px}
  .timeline-dot{width:12px;height:12px;border-radius:50%;background:${C.champagne};border:2px solid ${C.gold};flex-shrink:0;margin-top:3px}
  .timeline-dot.past{background:${C.sand};border-color:${C.taupe}}
  .timeline-dot.urgent{background:${C.red};border-color:${C.red}}
  .timeline-connector{width:1px;background:${C.sand};flex:1;margin-top:4px}
  @media(max-width:768px){
    .sidebar{width:180px;min-width:180px}
    .main{margin-left:180px;padding:20px 14px}
    .grid-4{grid-template-columns:repeat(2,1fr)}
    .grid-3{grid-template-columns:1fr 1fr}
    .grid-2{grid-template-columns:1fr}
  }
  @media(max-width:480px){
    .sidebar{width:150px;min-width:150px}
    .main{margin-left:150px;padding:16px 12px}
    .nav-item{font-size:11px;padding:8px 12px}
  }
`

export default function GlobalStyles() {
  return <style>{css}</style>
}
