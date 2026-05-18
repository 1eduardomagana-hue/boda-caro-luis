const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box; margin: 0; padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :root {
    --cream: #FAF8F5;
    --beige: #F0EBE3;
    --sand: #E8DDD1;
    --taupe: #C4AFA0;
    --champagne: #D4B896;
    --gold: #B8975A;
    --warm: #8B7D72;
    --dark: #5C4D44;
    --text: #3D2E27;
    --light: #8B7D72;
    --white: #FFFFFF;
    --green: #7A9E7E;
    --amber: #C9934A;
    --red: #B85C5C;

    /* iOS safe areas */
    --sat: env(safe-area-inset-top, 0px);
    --sar: env(safe-area-inset-right, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
    --sal: env(safe-area-inset-left, 0px);

    --nav-h: 56px;
    --r: 16px;
    --r-sm: 12px;
    --r-xs: 8px;
  }

  html {
    -webkit-text-size-adjust: 100%;
    height: -webkit-fill-available;
  }

  body {
    background: var(--cream);
    font-family: 'Jost', sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  /* ── MOBILE LAYOUT ───────────────────────── */
  .mobile-root {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--cream);
  }

  .mobile-screen {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(var(--nav-h) + var(--sab) + 8px);
  }

  /* ── BOTTOM NAV ─────────────────────────── */
  .bnav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 1000;
    height: calc(var(--nav-h) + var(--sab));
    padding-bottom: var(--sab);
    background: rgba(250, 248, 245, 0.94);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    border-top: 0.5px solid rgba(196, 175, 160, 0.3);
    display: flex;
    align-items: stretch;
  }

  .bnav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 4px;
    min-height: 44px;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }

  .bnav-item:active { opacity: 0.7; }

  .bnav-icon {
    font-size: 22px;
    line-height: 1;
    transition: transform 0.15s ease;
  }

  .bnav-item.active .bnav-icon {
    transform: scale(1.1);
  }

  .bnav-label {
    font-size: 10px;
    font-family: 'Jost', sans-serif;
    font-weight: 500;
    color: var(--warm);
    letter-spacing: 0.2px;
    transition: color 0.15s;
  }

  .bnav-item.active .bnav-label {
    color: var(--dark);
    font-weight: 600;
  }

  .bnav-active-dot {
    position: absolute;
    top: 6px;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--gold);
  }

  /* ── DESKTOP LAYOUT ─────────────────────── */
  .desktop-root {
    display: flex;
    min-height: 100vh;
  }

  .desktop-sidebar {
    width: 232px;
    min-width: 232px;
    background: var(--dark);
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .desktop-main {
    margin-left: 232px;
    flex: 1;
    min-height: 100vh;
  }

  .sidebar-header {
    padding: 28px 20px 20px;
    border-bottom: 0.5px solid rgba(255,255,255,0.1);
  }

  .sidebar-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 400;
    color: var(--champagne);
    letter-spacing: 0.5px;
    line-height: 1.2;
  }

  .sidebar-meta {
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    margin-top: 5px;
    letter-spacing: 0.3px;
  }

  .sidebar-nav { padding: 8px 0; flex: 1; }

  .sidebar-section-label {
    font-size: 9px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    padding: 14px 18px 5px;
    font-weight: 500;
  }

  .sidebar-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 18px;
    background: none;
    border: none;
    border-left: 2px solid transparent;
    cursor: pointer;
    font-size: 13px;
    color: rgba(255,255,255,0.65);
    font-family: 'Jost', sans-serif;
    font-weight: 400;
    text-align: left;
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
  }

  .sidebar-btn:hover { color: white; background: rgba(255,255,255,0.06); }
  .sidebar-btn.active {
    color: var(--champagne);
    background: rgba(212,184,150,0.12);
    border-left-color: var(--champagne);
    font-weight: 500;
  }

  .sidebar-bro {
    padding: 16px 20px;
    font-size: 10px;
    color: rgba(255,255,255,0.18);
    font-style: italic;
    border-top: 0.5px solid rgba(255,255,255,0.07);
  }

  /* ── PAGE CHROME ─────────────────────────── */
  .page-header {
    padding: 16px 20px 0;
    padding-top: calc(16px + var(--sat));
    background: rgba(250,248,245,0.94);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .page-header-inner {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 12px;
    border-bottom: 0.5px solid rgba(196,175,160,0.2);
  }

  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 400;
    color: var(--dark);
    letter-spacing: -0.3px;
    line-height: 1;
  }

  .page-subtitle {
    font-size: 12px;
    color: var(--light);
    margin-top: 3px;
    font-weight: 300;
  }

  /* Desktop page header */
  .desktop-page-header {
    padding: 32px 36px 0;
    margin-bottom: 24px;
  }

  .desktop-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 400;
    color: var(--dark);
    letter-spacing: -0.3px;
  }

  /* ── SCROLL CONTENT ──────────────────────── */
  .content {
    padding: 16px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .desktop-content {
    padding: 0 36px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
  }

  /* ── CARDS ───────────────────────────────── */
  .card {
    background: var(--white);
    border-radius: var(--r);
    border: 0.5px solid rgba(196,175,160,0.22);
    box-shadow: 0 1px 8px rgba(92,77,68,0.06), 0 0 0 0.5px rgba(196,175,160,0.1);
    overflow: hidden;
  }

  .card-body { padding: 16px; }

  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 500;
    color: var(--dark);
    margin-bottom: 12px;
  }

  /* ── COUNTDOWN ───────────────────────────── */
  .countdown-card {
    background: linear-gradient(145deg, var(--dark) 0%, #3D2E27 100%);
    border-radius: var(--r);
    padding: 22px 20px 18px;
  }

  .countdown-eyebrow {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 4px;
  }

  .countdown-venue {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    color: var(--champagne);
    font-weight: 300;
    margin-bottom: 18px;
  }

  .countdown-nums {
    display: flex;
    gap: 0;
    align-items: flex-end;
  }

  .countdown-unit {
    flex: 1;
    text-align: center;
    position: relative;
  }

  .countdown-unit + .countdown-unit::before {
    content: '';
    position: absolute;
    left: 0; top: 8px; bottom: 12px;
    width: 0.5px;
    background: rgba(255,255,255,0.1);
  }

  .countdown-n {
    font-family: 'Cormorant Garamond', serif;
    font-size: 46px;
    font-weight: 300;
    color: white;
    line-height: 1;
    display: block;
    letter-spacing: -1px;
  }

  .countdown-l {
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-top: 4px;
    display: block;
  }

  .countdown-bro {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 0.5px solid rgba(255,255,255,0.07);
    font-size: 10px;
    color: rgba(255,255,255,0.18);
    font-style: italic;
    text-align: right;
  }

  /* ── STAT ROW ────────────────────────────── */
  .stat-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
    margin: 0 -16px;
    padding: 0 16px 2px;
  }
  .stat-scroll::-webkit-scrollbar { display: none; }

  .stat-chip {
    background: var(--white);
    border-radius: 14px;
    border: 0.5px solid rgba(196,175,160,0.22);
    box-shadow: 0 1px 6px rgba(92,77,68,0.06);
    padding: 13px 16px 11px;
    min-width: 100px;
    flex-shrink: 0;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s;
  }
  .stat-chip:active { transform: scale(0.97); }

  .stat-chip-l {
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--taupe);
    font-weight: 500;
  }

  .stat-chip-v {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 400;
    color: var(--dark);
    line-height: 1.1;
    margin: 2px 0 1px;
  }

  .stat-chip-s {
    font-size: 10px;
    color: var(--light);
  }

  /* ── PROGRESS ────────────────────────────── */
  .prog-outer {
    background: rgba(196,175,160,0.2);
    border-radius: 99px;
    height: 4px;
    overflow: hidden;
  }

  .prog-inner {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--champagne), var(--gold));
    transition: width 0.6s ease;
  }

  /* ── SECTION LABEL ───────────────────────── */
  .sec-label {
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--taupe);
    font-weight: 500;
  }

  .sec-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sec-action {
    font-size: 13px;
    color: var(--gold);
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    padding: 4px 0;
    touch-action: manipulation;
  }

  /* ── LIST ROWS ───────────────────────────── */
  .list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border-bottom: 0.5px solid rgba(196,175,160,0.15);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
  }
  .list-row:last-child { border-bottom: none; }
  .list-row:active { background: var(--beige); }

  .list-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .list-title { font-size: 14px; font-weight: 500; color: var(--dark); }
  .list-sub { font-size: 12px; color: var(--light); margin-top: 1px; }
  .list-right { margin-left: auto; text-align: right; flex-shrink: 0; }
  .list-value { font-size: 14px; font-weight: 500; color: var(--dark); }
  .list-meta { font-size: 11px; color: var(--light); margin-top: 2px; }

  /* ── CHECK ───────────────────────────────── */
  .check-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 0.5px solid rgba(196,175,160,0.12);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  .check-row:last-child { border-bottom: none; }
  .check-row:active { background: var(--beige); }

  .check-box {
    width: 22px; height: 22px;
    border-radius: 7px;
    border: 1.5px solid rgba(196,175,160,0.5);
    flex-shrink: 0;
    margin-top: 1px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    background: var(--white);
  }
  .check-box.done {
    background: var(--champagne);
    border-color: var(--gold);
  }

  .check-text { font-size: 14px; line-height: 1.45; color: var(--text); }
  .check-text.done { text-decoration: line-through; color: var(--taupe); }

  /* ── BADGES ──────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .bg-green { background: #EEF5EF; color: #4A7A50; }
  .bg-amber { background: #FDF3E8; color: #A06B25; }
  .bg-red { background: #FAEAEA; color: #8B3232; }
  .bg-gray { background: var(--beige); color: var(--warm); }
  .bg-dark { background: var(--dark); color: var(--champagne); }

  /* ── SHEET DRAWER ────────────────────────── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    z-index: 500;
    animation: fadeIn 0.2s ease;
  }

  .sheet {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: var(--white);
    border-radius: 20px 20px 0 0;
    z-index: 501;
    padding: 0 0 calc(20px + var(--sab));
    max-height: 92dvh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);
    overscroll-behavior: contain;
  }

  .sheet-handle-wrap {
    padding: 12px 0 4px;
    display: flex; justify-content: center;
    position: sticky; top: 0;
    background: var(--white);
    z-index: 1;
  }

  .sheet-handle {
    width: 36px; height: 4px;
    border-radius: 99px;
    background: rgba(196,175,160,0.4);
  }

  .sheet-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    color: var(--dark);
    text-align: center;
    padding: 8px 20px 16px;
    font-weight: 400;
  }

  .sheet-body { padding: 0 16px; }

  .sheet-action-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--cream);
    cursor: pointer;
    border: none;
    width: 100%;
    text-align: left;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.1s;
    margin-bottom: 8px;
  }
  .sheet-action-row:active { background: var(--beige); }

  .sheet-action-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .sheet-action-label {
    font-size: 16px;
    font-weight: 500;
    color: var(--dark);
  }

  .sheet-action-sub {
    font-size: 12px;
    color: var(--light);
    margin-top: 1px;
  }

  /* ── FAB ─────────────────────────────────── */
  .fab {
    position: fixed;
    right: 20px;
    bottom: calc(var(--nav-h) + var(--sab) + 14px);
    z-index: 200;
    width: 52px; height: 52px;
    border-radius: 16px;
    background: var(--dark);
    color: var(--champagne);
    font-size: 26px;
    line-height: 1;
    display: flex; align-items: center; justify-content: center;
    border: none;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 4px 20px rgba(92,77,68,0.3), 0 1px 4px rgba(92,77,68,0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    -webkit-user-select: none; user-select: none;
  }
  .fab:active {
    transform: scale(0.9);
    box-shadow: 0 2px 10px rgba(92,77,68,0.2);
  }

  /* ── INPUTS ──────────────────────────────── */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--taupe);
    font-weight: 500;
  }

  .inp {
    background: var(--cream);
    border: 1.5px solid rgba(196,175,160,0.4);
    border-radius: var(--r-sm);
    padding: 13px 14px;
    font-family: 'Jost', sans-serif;
    font-size: 16px;
    color: var(--text);
    outline: none;
    width: 100%;
    resize: vertical;
    -webkit-appearance: none;
    transition: border-color 0.2s;
  }
  .inp:focus { border-color: var(--champagne); background: var(--white); }
  .inp::placeholder { color: rgba(196,175,160,0.8); }

  /* ── BUTTONS ─────────────────────────────── */
  .btn {
    width: 100%;
    background: var(--dark);
    color: white;
    border: none;
    padding: 14px;
    border-radius: var(--r-sm);
    font-family: 'Jost', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 0.15s;
    letter-spacing: 0.3px;
  }
  .btn:active { opacity: 0.8; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-ghost {
    width: 100%;
    background: transparent;
    color: var(--dark);
    border: 1.5px solid rgba(196,175,160,0.4);
    padding: 13px;
    border-radius: var(--r-sm);
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    cursor: pointer;
    touch-action: manipulation;
    transition: background 0.15s;
  }
  .btn-ghost:active { background: var(--beige); }

  .btn-icon-sm {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: var(--beige);
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    color: var(--warm);
    touch-action: manipulation;
    transition: background 0.1s;
    flex-shrink: 0;
  }
  .btn-icon-sm:active { background: var(--sand); }

  /* ── FORM STACK ──────────────────────────── */
  .form-stack { display: flex; flex-direction: column; gap: 12px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* ── EMPTY STATE ─────────────────────────── */
  .empty {
    text-align: center;
    padding: 52px 24px;
  }
  .empty-icon { font-size: 40px; margin-bottom: 14px; }
  .empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    color: var(--dark);
    margin-bottom: 8px;
  }
  .empty-sub {
    font-size: 14px;
    color: var(--light);
    line-height: 1.6;
    max-width: 260px;
    margin: 0 auto 24px;
    font-weight: 300;
  }

  /* ── PROVIDER CARD ───────────────────────── */
  .prov-card {
    background: var(--white);
    border-radius: var(--r);
    border: 0.5px solid rgba(196,175,160,0.22);
    box-shadow: 0 1px 8px rgba(92,77,68,0.06);
    overflow: hidden;
    transition: transform 0.1s;
  }
  .prov-card:active { transform: scale(0.99); }

  .prov-bar {
    height: 3px;
    background: linear-gradient(90deg, var(--champagne), var(--gold));
  }

  .prov-footer {
    padding: 10px 16px;
    background: var(--cream);
    border-top: 0.5px solid rgba(196,175,160,0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  /* ── TIMELINE ────────────────────────────── */
  .tl-row {
    display: flex;
    gap: 14px;
    padding-bottom: 22px;
  }

  .tl-spine {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3px;
  }

  .tl-dot {
    width: 11px; height: 11px;
    border-radius: 50%;
    background: var(--champagne);
    border: 2px solid var(--gold);
    flex-shrink: 0;
  }
  .tl-dot.past { background: var(--sand); border-color: rgba(196,175,160,0.5); }
  .tl-dot.key { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,90,0.2); }
  .tl-dot.urgent { background: var(--red); border-color: var(--red); }

  .tl-line {
    width: 1px;
    flex: 1;
    background: rgba(196,175,160,0.25);
    margin-top: 4px;
    min-height: 20px;
  }

  .tl-date {
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--taupe);
    margin-bottom: 3px;
  }

  .tl-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--dark);
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .tl-desc { font-size: 13px; color: var(--light); line-height: 1.5; }

  /* ── WEEK ────────────────────────────────── */
  .week-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px;
    margin: 0 -16px;
    padding: 2px 16px 6px;
  }
  .week-scroll::-webkit-scrollbar { display: none; }

  .week-day {
    min-width: 136px;
    background: var(--white);
    border-radius: 14px;
    border: 0.5px solid rgba(196,175,160,0.22);
    padding: 12px;
    flex-shrink: 0;
  }

  .week-day-name {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--taupe);
    margin-bottom: 2px;
  }

  .week-day-date {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    color: var(--dark);
    font-weight: 500;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 0.5px solid rgba(196,175,160,0.2);
  }

  .week-task {
    font-size: 12px;
    color: var(--text);
    padding: 4px 0;
    border-bottom: 0.5px solid rgba(196,175,160,0.1);
    line-height: 1.4;
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }
  .week-task:last-child { border-bottom: none; }
  .week-dot { color: var(--champagne); flex-shrink: 0; margin-top: 1px; font-size: 8px; }

  /* ── ANIMATIONS ──────────────────────────── */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── SPINNER ─────────────────────────────── */
  .spinner-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 14px;
  }

  .spinner {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 2.5px solid rgba(196,175,160,0.3);
    border-top-color: var(--gold);
    animation: spin 0.85s linear infinite;
  }

  .spinner-label {
    font-size: 13px;
    color: var(--light);
    font-weight: 300;
  }
`

export default function GlobalStyles() {
  return <style>{css}</style>
}
