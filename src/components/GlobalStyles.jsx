import { COLORS } from '../lib/constants.js'
const C = COLORS

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --cream: ${C.cream}; --beige: ${C.beige}; --sand: ${C.sand};
    --taupe: ${C.taupe}; --champagne: ${C.champagne}; --gold: ${C.gold};
    --warm: ${C.warmGray}; --dark: ${C.darkTaupe}; --text: ${C.text};
    --light: ${C.textLight}; --white: #fff;
    --green: ${C.green}; --amber: ${C.amber}; --red: ${C.red};
    --radius: 16px; --radius-sm: 10px; --radius-xs: 7px;
    --shadow: 0 2px 20px rgba(92,77,68,.08);
    --shadow-md: 0 4px 32px rgba(92,77,68,.12);
    --bottom-nav: 72px;
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }

  html { -webkit-text-size-adjust: 100%; }

  body {
    background: var(--cream); font-family: 'Jost', sans-serif;
    color: var(--text); min-height: 100dvh; overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ── LAYOUT ── */
  .app-shell { display: flex; min-height: 100dvh; }

  /* Mobile: single column + bottom nav */
  .main-content {
    flex: 1; padding: 0 0 calc(var(--bottom-nav) + var(--safe-bottom) + 16px);
    max-width: 100%;
  }

  /* Desktop sidebar */
  .sidebar {
    width: 240px; min-width: 240px; background: var(--dark);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    overflow-y: auto;
  }

  /* ── BOTTOM NAV (mobile) ── */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
    background: rgba(250,248,245,0.96);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 1px solid rgba(196,175,160,0.2);
    padding: 8px 0 calc(8px + var(--safe-bottom));
    display: flex; justify-content: space-around; align-items: center;
  }
  .bottom-nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 4px 12px; border-radius: 12px; cursor: pointer;
    transition: all .2s; border: none; background: none;
    min-width: 56px; touch-action: manipulation;
  }
  .bottom-nav-item.active .nav-icon-wrap {
    background: var(--dark); color: var(--champagne);
  }
  .bottom-nav-item.active .nav-label { color: var(--dark); font-weight: 600; }
  .nav-icon-wrap {
    width: 42px; height: 28px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; transition: all .2s; color: var(--warm);
  }
  .nav-label { font-size: 10px; color: var(--warm); letter-spacing: .3px; }

  /* ── PAGE HEADER ── */
  .page-top {
    padding: 20px 20px 0;
    position: sticky; top: 0; z-index: 50;
    background: rgba(250,248,245,0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .page-title-mobile {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 400; color: var(--dark);
    letter-spacing: -.3px; line-height: 1.1; padding-bottom: 16px;
    border-bottom: 1px solid rgba(196,175,160,.2);
  }
  .page-sub { font-size: 12px; color: var(--light); margin-top: 3px; font-weight: 300; }

  /* ── SCROLL AREA ── */
  .scroll-area { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }

  /* ── CARDS ── */
  .card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid rgba(196,175,160,.2); box-shadow: var(--shadow);
    overflow: hidden;
  }
  .card-pad { padding: 18px; }
  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 500; color: var(--dark);
    margin-bottom: 12px;
  }

  /* ── STAT CHIPS ── */
  .stat-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
  .stat-row::-webkit-scrollbar { display: none; }
  .stat-chip {
    background: var(--white); border-radius: 14px;
    border: 1px solid rgba(196,175,160,.2); box-shadow: var(--shadow);
    padding: 14px 16px; min-width: 110px; flex-shrink: 0;
  }
  .stat-chip-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--taupe); }
  .stat-chip-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 400; color: var(--dark);
    line-height: 1.1; margin: 2px 0;
  }
  .stat-chip-sub { font-size: 10px; color: var(--light); }

  /* ── COUNTDOWN ── */
  .countdown-card {
    background: linear-gradient(135deg, var(--dark) 0%, #4A3A32 100%);
    border-radius: var(--radius); padding: 22px 20px; color: white;
  }
  .countdown-eyebrow {
    font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
    color: rgba(255,255,255,.45); margin-bottom: 6px;
  }
  .countdown-venue {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; color: var(--champagne); margin-bottom: 16px; font-weight: 300;
  }
  .countdown-nums { display: flex; gap: 16px; align-items: flex-end; }
  .countdown-unit { text-align: center; }
  .countdown-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px; font-weight: 300; color: white;
    line-height: 1; display: block;
  }
  .countdown-unit-label {
    font-size: 8px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,.35); margin-top: 3px;
  }
  .countdown-bro {
    margin-top: 14px; font-size: 10px; color: rgba(255,255,255,.25);
    font-style: italic; letter-spacing: .5px;
  }

  /* ── PROGRESS ── */
  .progress-bar-outer {
    background: var(--beige); border-radius: 99px; height: 5px; overflow: hidden;
  }
  .progress-bar-inner {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--champagne), var(--gold));
    transition: width .6s ease;
  }

  /* ── LIST ITEMS (replaces tables) ── */
  .list-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-bottom: 1px solid rgba(196,175,160,.12);
    cursor: pointer; transition: background .15s; touch-action: manipulation;
  }
  .list-item:last-child { border-bottom: none; }
  .list-item:active { background: var(--cream); }
  .list-item-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .list-item-body { flex: 1; min-width: 0; }
  .list-item-title { font-size: 14px; font-weight: 500; color: var(--dark); }
  .list-item-sub { font-size: 11.5px; color: var(--light); margin-top: 1px; }
  .list-item-right { text-align: right; flex-shrink: 0; }
  .list-item-value { font-size: 14px; font-weight: 500; color: var(--dark); }
  .list-item-meta { font-size: 11px; color: var(--light); }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center; padding: 3px 9px;
    border-radius: 99px; font-size: 10px; font-weight: 600; letter-spacing: .3px;
  }
  .badge-green { background: #EEF5EF; color: #4A7A50; }
  .badge-amber { background: #FDF3E8; color: #A06B25; }
  .badge-red { background: #FAEAEA; color: #8B3232; }
  .badge-gray { background: var(--beige); color: var(--warm); }
  .badge-blue { background: #EEF0F8; color: #3B4E8A; }
  .badge-dark { background: var(--dark); color: var(--champagne); }

  /* ── CHECKLIST ── */
  .check-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid rgba(196,175,160,.12);
    cursor: pointer; touch-action: manipulation;
  }
  .check-row:last-child { border-bottom: none; }
  .check-box {
    width: 22px; height: 22px; border-radius: 7px;
    border: 1.5px solid var(--taupe); flex-shrink: 0; margin-top: 1px;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .check-box.done { background: var(--champagne); border-color: var(--champagne); }
  .check-text { font-size: 14px; line-height: 1.5; color: var(--text); }
  .check-text.done { text-decoration: line-through; color: var(--taupe); }

  /* ── BUTTONS ── */
  .btn-primary {
    background: var(--dark); color: white; border: none;
    padding: 13px 22px; border-radius: 12px;
    font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; letter-spacing: .3px; transition: opacity .2s;
    touch-action: manipulation; width: 100%;
  }
  .btn-primary:active { opacity: .8; }
  .btn-secondary {
    background: var(--white); color: var(--dark);
    border: 1.5px solid rgba(196,175,160,.4);
    padding: 12px 20px; border-radius: 12px;
    font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 400;
    cursor: pointer; transition: all .2s; touch-action: manipulation;
  }
  .btn-secondary:active { background: var(--cream); }
  .btn-sm {
    padding: 8px 14px; border-radius: 9px; font-size: 12px;
  }
  .btn-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: var(--cream); border: 1px solid rgba(196,175,160,.25);
    cursor: pointer; font-size: 16px; touch-action: manipulation;
    flex-shrink: 0;
  }
  .btn-row { display: flex; gap: 10px; }

  /* ── QUICK ACTIONS FAB ── */
  .fab {
    position: fixed; right: 20px;
    bottom: calc(var(--bottom-nav) + var(--safe-bottom) + 16px);
    z-index: 150;
    width: 52px; height: 52px; border-radius: 16px;
    background: var(--dark); color: var(--champagne);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; box-shadow: 0 4px 20px rgba(92,77,68,.3);
    cursor: pointer; border: none; touch-action: manipulation;
    transition: transform .15s, box-shadow .15s;
  }
  .fab:active { transform: scale(.93); box-shadow: 0 2px 12px rgba(92,77,68,.2); }

  /* Quick action sheet */
  .sheet-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.4);
    z-index: 300; backdrop-filter: blur(4px);
    animation: fadeIn .2s ease;
  }
  .sheet {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--white); border-radius: 24px 24px 0 0;
    padding: 12px 20px calc(24px + var(--safe-bottom));
    z-index: 301; animation: slideUp .25s ease;
  }
  .sheet-handle {
    width: 36px; height: 4px; border-radius: 99px;
    background: var(--sand); margin: 0 auto 20px;
  }
  .sheet-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; color: var(--dark); margin-bottom: 16px; text-align: center;
  }
  .sheet-actions { display: flex; flex-direction: column; gap: 10px; }
  .sheet-action {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px; background: var(--cream);
    cursor: pointer; border: none; width: 100%; touch-action: manipulation;
    transition: background .15s;
  }
  .sheet-action:active { background: var(--sand); }
  .sheet-action-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .sheet-action-label { font-size: 15px; font-weight: 500; color: var(--dark); text-align: left; }
  .sheet-action-sub { font-size: 12px; color: var(--light); margin-top: 1px; }

  /* ── INLINE FORM ── */
  .form-stack { display: flex; flex-direction: column; gap: 10px; }
  .input-field {
    width: 100%; background: var(--cream); border: 1.5px solid rgba(196,175,160,.35);
    border-radius: 12px; padding: 13px 14px;
    font-family: 'Jost', sans-serif; font-size: 15px; color: var(--text);
    outline: none; resize: vertical; transition: border .2s;
    -webkit-appearance: none;
  }
  .input-field:focus { border-color: var(--champagne); background: white; }
  .input-field::placeholder { color: var(--taupe); }
  .input-label {
    font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--taupe); margin-bottom: 5px; font-weight: 500;
  }
  .input-group { display: flex; flex-direction: column; }
  .grid-2-mob { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* ── ACCORDION ── */
  .accordion-item { border-radius: var(--radius-sm); overflow: hidden; background: var(--white); border: 1px solid rgba(196,175,160,.2); margin-bottom: 8px; }
  .accordion-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 16px; cursor: pointer; touch-action: manipulation;
    transition: background .15s;
  }
  .accordion-header:active { background: var(--cream); }
  .accordion-body { padding: 0 16px 14px; font-size: 13px; color: var(--text); line-height: 1.7; white-space: pre-wrap; }

  /* ── TIMELINE ── */
  .timeline-row { display: flex; gap: 14px; padding-bottom: 20px; }
  .timeline-dot-wrap { display: flex; flex-direction: column; align-items: center; }
  .timeline-dot {
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--champagne); border: 2px solid var(--gold); flex-shrink: 0;
  }
  .timeline-dot.past { background: var(--sand); border-color: var(--taupe); }
  .timeline-dot.key { background: var(--gold); border-color: var(--gold); }
  .timeline-dot.urgent { background: var(--red); border-color: var(--red); }
  .timeline-line { width: 1px; background: var(--sand); flex: 1; margin-top: 4px; }
  .timeline-content { flex: 1; }
  .timeline-date { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--taupe); }
  .timeline-title { font-size: 15px; font-weight: 500; color: var(--dark); margin: 3px 0 4px; }
  .timeline-desc { font-size: 12.5px; color: var(--light); line-height: 1.5; }

  /* ── WEEK GRID ── */
  .week-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
  .week-scroll::-webkit-scrollbar { display: none; }
  .week-day-card {
    min-width: 130px; background: var(--white); border-radius: 14px;
    border: 1px solid rgba(196,175,160,.2); padding: 12px; flex-shrink: 0;
  }
  .week-day-card.today { border-color: var(--champagne); background: #FFFBF7; }
  .week-day-name { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--taupe); }
  .week-day-date { font-family: 'Cormorant Garamond', serif; font-size: 15px; color: var(--dark); font-weight: 500; margin: 2px 0 8px; }
  .week-task { font-size: 11.5px; color: var(--text); padding: 4px 0; border-bottom: 1px solid rgba(196,175,160,.12); line-height: 1.4; }
  .week-task:last-child { border-bottom: none; }
  .week-dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--champagne); margin-right: 6px; vertical-align: middle; }

  /* ── EMPTY STATE ── */
  .empty-state { text-align: center; padding: 44px 24px; }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }
  .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--dark); margin-bottom: 6px; }
  .empty-sub { font-size: 13px; color: var(--light); line-height: 1.6; max-width: 260px; margin: 0 auto; }

  /* ── SECTION HEADER ── */
  .section-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .section-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--taupe); font-weight: 500; }

  /* ── PROVIDER CARD ── */
  .provider-card {
    background: var(--white); border-radius: var(--radius); overflow: hidden;
    border: 1px solid rgba(196,175,160,.2); box-shadow: var(--shadow);
    margin-bottom: 10px;
  }
  .provider-card-top { padding: 16px; }
  .provider-card-bar {
    height: 3px;
    background: linear-gradient(90deg, var(--champagne), var(--gold));
  }
  .provider-card-footer {
    padding: 10px 16px; background: var(--cream);
    border-top: 1px solid rgba(196,175,160,.12);
    display: flex; justify-content: space-between; align-items: center;
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DESKTOP OVERRIDES ── */
  @media (min-width: 768px) {
    .sidebar { display: flex; }
    .bottom-nav { display: none; }
    .fab { right: 32px; bottom: 32px; }
    .main-content {
      margin-left: 240px;
      padding: 0 0 32px;
    }
    .page-top { padding: 28px 32px 0; }
    .scroll-area { padding: 20px 32px; }
    .page-title-mobile { font-size: 32px; }

    /* Desktop sidebar styles */
    .sidebar-header { padding: 28px 20px 20px; border-bottom: 1px solid rgba(255,255,255,.1); }
    .sidebar-brand { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 400; color: var(--champagne); letter-spacing: .5px; line-height: 1.3; }
    .sidebar-date { font-size: 10px; color: rgba(255,255,255,.4); margin-top: 6px; }
    .sidebar-nav { padding: 12px 0; flex: 1; overflow-y: auto; }
    .sidebar-section-label { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.3); padding: 12px 18px 6px; font-weight: 500; }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 18px; cursor: pointer; font-size: 13px;
      color: #D6CCC6; border-left: 2px solid transparent;
      transition: all .2s; border: none; background: none; width: 100%; text-align: left;
    }
    .sidebar-item:hover { color: white; background: rgba(255,255,255,.07); }
    .sidebar-item.active { color: var(--champagne); background: rgba(212,184,150,.13); border-left-color: var(--champagne); font-weight: 500; }
    .sidebar-bro { padding: 16px 20px; font-size: 10px; color: rgba(255,255,255,.2); font-style: italic; border-top: 1px solid rgba(255,255,255,.06); margin-top: auto; }
  }

  @media (min-width: 1024px) {
    .scroll-area { padding: 24px 40px; max-width: 860px; }
  }

  /* iOS safe area */
  @supports (padding: max(0px)) {
    .bottom-nav { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
    .sheet { padding-bottom: max(24px, env(safe-area-inset-bottom)); }
  }

  /* Prevent text selection on tap */
  .bottom-nav-item, .list-item, .check-row, .sheet-action, .fab, .accordion-header {
    -webkit-user-select: none; user-select: none;
  }
`

export default function GlobalStyles() {
  return <style>{css}</style>
}
