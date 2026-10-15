// ==== ИКОНКИ (общий файл) ====
console.log('=== icons.js loaded ===');

window.ICONS = {};

// ==== ОБЩИЕ ====
ICONS.back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
ICONS.close = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M18 6L6 18M6 6l12 12"/></svg>';
ICONS.plus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 5v14M5 12h14"/></svg>';
ICONS.check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M5 12.5l5 5 9-11"/></svg>';
ICONS.send = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>';
ICONS.search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>';
ICONS.edit = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
ICONS.trash = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
ICONS.save = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>';
ICONS.refresh = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>';
ICONS.play = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M6 4l14 8-14 8z"/></svg>';
ICONS.stop = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

// ==== ПРОФИЛЬ ====
ICONS.flag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22V15"/></svg>';
ICONS.shield = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>';
ICONS.thumbUp = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
ICONS.fire = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
ICONS.gamepad = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>';

// ==== КЛАНЫ ====
ICONS.crown = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg>';
ICONS.star = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/></svg>';
ICONS.door = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/><path d="M10 17l-5-5 5-5"/><path d="M16 12H5"/></svg>';
ICONS.mail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
ICONS.chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg>';
ICONS.inbox = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>';

// ==== АДМИНКА ====
ICONS.users = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/><circle cx="18" cy="9" r="2.5"/><path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/></svg>';
ICONS.ticket = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/><path d="M13 5v2M13 11v2M13 17v2"/></svg>';
ICONS.doc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>';
ICONS.gift = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 5v2M13 11v2M13 17v2"/></svg>';
ICONS.calendar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
ICONS.camera = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
ICONS.diamond = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>';
ICONS.ban = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="12" cy="12" r="10"/><path d="M4 4l16 16"/></svg>';
ICONS.coins = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88l.7.71-2.82 2.82"/></svg>';
ICONS.target = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
ICONS.alert = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 2l10 18H2z"/><path d="M12 9v6M12 18h.01"/></svg>';
ICONS.broom = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M19 3l-6 6M14 8l-9 9 3 3 9-9z"/><path d="M17 11l-3 3M15 13l-3 3"/></svg>';
ICONS.eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
ICONS.money = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>';
ICONS.key = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>';
ICONS.bell = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
ICONS.palette = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="8" cy="16" r="1.5"/></svg>';

// ==== ТУРНИРЫ ====
ICONS.trophy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0z"/><path d="M9 21h6"/><path d="M12 16v5"/></svg>';
ICONS.map = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M1 6l8-4 6 4 8-4v18l-8 4-6-4-8 4z"/><path d="M9 2v20M15 4v20"/></svg>';
ICONS.scroll = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>';
ICONS.upload = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>';
ICONS.grid = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
ICONS.history = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>';
ICONS.zoomIn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>';
ICONS.zoomOut = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>';
ICONS.reset = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/></svg>';

// ==== УРОВНИ (гексагоны) ====
ICONS.level1 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#5a5a5a" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#5a5a5a" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">1</text></svg>';
ICONS.level2 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#7a7a7a" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#7a7a7a" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">2</text></svg>';
ICONS.level3 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#9a9a9a" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#9a9a9a" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">3</text></svg>';
ICONS.level4 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#4aa8e0" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#4aa8e0" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">4</text></svg>';
ICONS.level5 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#22c55e" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">5</text></svg>';
ICONS.level6 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#3b82f6" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">6</text></svg>';
ICONS.level7 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#a855f7" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#a855f7" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">7</text></svg>';
ICONS.level8 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#f97316" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#f97316" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">8</text></svg>';
ICONS.level9 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#ea580c" stroke-width="3"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#ea580c" stroke-width="1" opacity="0.5"/><text x="50" y="64" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">9</text></svg>';
ICONS.level10 = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" fill="rgba(15,6,24,0.9)" stroke="#dc2626" stroke-width="3.5"/><path d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z" fill="none" stroke="#dc2626" stroke-width="1.2" opacity="0.6"/><text x="50" y="62" text-anchor="middle" font-size="36" font-weight="800" fill="#fff" font-family="Arial,sans-serif">10</text></svg>';


// ==== ГАЛОЧКИ ВЕРИФИКАЦИИ (Faceit-style 8-star) ====
function _mkVerify(color1, color2, stroke) {
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">'
        + '<defs>'
        + '<linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">'
        + '<stop offset="0%" stop-color="' + color1 + '"/>'
        + '<stop offset="100%" stop-color="' + color2 + '"/>'
        + '</linearGradient>'
        + '</defs>'
        + '<path d="M12 1.5 L14.2 5.2 L18.5 4.5 L18.2 8.8 L22 10.5 L19 13.5 L21 17.5 L16.8 17.8 L15.5 21.8 L12 19.5 L8.5 21.8 L7.2 17.8 L3 17.5 L5 13.5 L2 10.5 L5.8 8.8 L5.5 4.5 L9.8 5.2 Z" fill="url(#gv)" stroke="' + stroke + '" stroke-width="0.8" stroke-linejoin="round"/>'
        + '<path d="M12 3.5 L13.8 6.6 L17.3 6 L17 9.6 L20 11 L17.6 13.5 L19.2 16.7 L15.8 17 L14.8 20.3 L12 18.4 L9.2 20.3 L8.2 17 L4.8 16.7 L6.4 13.5 L4 11 L7 9.6 L6.7 6 L10.2 6.6 Z" fill="none" stroke="' + color1 + '" stroke-width="0.5" opacity="0.6" stroke-linejoin="round"/>'
        + '<path d="M8.5 12 L11 14.5 L15.8 9.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>';
}

ICONS.checkGreen = _mkVerify('#5ee89e', '#16a34a', '#0a3d20');
ICONS.checkGold = _mkVerify('#fde047', '#ca8a04', '#5a3506');
ICONS.checkOrange = _mkVerify('#fbbf24', '#ea580c', '#5a2006');

let _verifyCounter = 0;
window.verifySvg = function(type) {
    const t = type || 'green';
    const name = 'check' + (t === 'gold' ? 'Gold' : (t === 'orange' ? 'Orange' : 'Green'));
    let icon = ICONS[name] || ICONS.checkGreen;
    _verifyCounter++;
    const uid = 'v' + _verifyCounter;
    icon = icon.replace(/id="gv"/g, 'id="gv' + uid + '"').replace(/url\(#gv\)/g, 'url(#gv' + uid + ')');
    return '<span class="verify-badge verify-' + t + '">' + icon + '</span>';
};

// ==== ФУНКЦИЯ-ОБЁРТКА ====
window.svg = function(name, size) {
    const s = size || 16;
    const icon = ICONS[name] || '';
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + s + 'px;height:' + s + 'px;vertical-align:middle;">' + icon + '</span>';
};

// Хелпер для уровней
window.levelSvg = function(level, size) {
    const s = size || 60;
    const lv = Math.min(Math.max(parseInt(level) || 1, 1), 10);
    const icon = ICONS['level' + lv] || ICONS.level1;
    return '<span class="level-icon" data-level="' + lv + '" style="display:inline-flex;align-items:center;justify-content:center;width:' + s + 'px;height:' + s + 'px;">' + icon + '</span>';
};

// Алиасы для совместимости
window.tSvg = window.svg;
window.pSvg = window.svg;
window.cSvg = window.svg;

console.log('=== icons.js DONE ===');х
