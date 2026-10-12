// ==== АДМИН-ПАНЕЛЬ (SVG-иконки) ====
let adminStats = null;

// ==== SVG-ИКОНКИ ====
const ICONS = {
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/><circle cx="18" cy="9" r="2.5"/><path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/><path d="M13 5v2M13 11v2M13 17v2"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 5v2M13 11v2M13 17v2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M5 12.5l5 5 9-11"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>',
    ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><circle cx="12" cy="12" r="10"/><path d="M4 4l16 16"/></svg>',
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88l.7.71-2.82 2.82"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="8" cy="16" r="1.5"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M12 2l10 18H2z"/><path d="M12 9v6M12 18h.01"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    broom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M19 3l-6 6M14 8l-9 9 3 3 9-9z"/><path d="M17 11l-3 3M15 13l-3 3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M12 5v14M5 12h14"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M6 4l14 8-14 8z"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="adm-svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
};

function svg(name, size) {
    const s = size || 18;
    return `<span class="adm-icon" style="width:${s}px;height:${s}px;display:inline-flex;align-items:center;justify-content:center;">${ICONS[name] || ''}</span>`;
}

async function checkAdminAccess() {
    if (!tgUser) return false;
    try {
        const res = await apiGet('/api/admin/check?tg_id=' + tgUser.id);
        return res.is_admin === true;
    } catch (e) {
        return false;
    }
}

async function initAdmin() {
    const tryShow = async () => {
        const hasAccess = await checkAdminAccess();
        if (!hasAccess) return;
        const tab = document.querySelector('.tab-btn.admin-tab');
        if (tab) tab.style.display = 'flex';
    };
    await tryShow();
    setInterval(tryShow, 3000);
}

async function loadAdminHome() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        adminStats = await apiGet('/api/admin/stats?tg_id=' + tgUser.id);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }
    container.innerHTML = `
        <div class="section-head centered"><div class="section-title">${svg('key', 18)} Админ-панель</div></div>
        <div class="admin-stats">
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.users}</div><div class="admin-stat-label">Игроков</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.matches}</div><div class="admin-stat-label">Матчей</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.clans}</div><div class="admin-stat-label">Кланов</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.tickets}</div><div class="admin-stat-label">Тикетов</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.active_24h}</div><div class="admin-stat-label">Активных 24ч</div></div>
        </div>
        <div class="section-head centered"><div class="section-title">Разделы</div></div>
        <div class="admin-grid">
            <button class="admin-tile" data-action="users">${svg('users', 28)}<span>Игроки</span></button>
            <button class="admin-tile" data-action="clans">${svg('shield', 28)}<span>Кланы</span></button>
            <button class="admin-tile" data-action="chats">${svg('chat', 28)}<span>Чаты</span></button>
            <button class="admin-tile" data-action="tickets">${svg('ticket', 28)}<span>Тикеты</span></button>
            <button class="admin-tile" data-action="logs">${svg('doc', 28)}<span>Логи</span></button>
            <button class="admin-tile" data-action="promos">${svg('gift', 28)}<span>Промокоды</span></button>
            <button class="admin-tile" data-action="seasons">${svg('calendar', 28)}<span>Сезоны</span></button>
            <button class="admin-tile" data-action="admins">${svg('crown', 28)}<span>Админы</span></button>
        </div>
    `;
    container.querySelectorAll('.admin-tile').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'users') showAdminUsers();
            else if (action === 'clans') showAdminClans();
            else if (action === 'chats') showAdminChats();
            else if (action === 'tickets') showAdminTickets();
            else if (action === 'logs') showAdminLogs();
            else if (action === 'promos') showAdminPromos();
            else if (action === 'seasons') showAdminSeasons();
            else if (action === 'admins') showAdminAdmins();
        });
    });
}

// ==== АЛИАС для совместимости с main-start.js ====
async function loadAdmin() {
    return loadAdminHome();
}

// ==== ИГРОКИ ====
async function showAdminUsers() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('users', 16)} Игроки</div><div style="width:60px;"></div></div>
        <div class="search-wrap"><span class="search-icon">🔍</span><input type="text" class="search-input" id="admin-user-search" placeholder="Ник / ID / player_id..." autocomplete="off"></div>
        <div id="admin-user-results"><div class="map-empty">Введи запрос</div></div>
    `;
    document.getElementById('admin-back').addEventListener('click', loadAdminHome);
    const input = document.getElementById('admin-user-search');
    let t = null;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => doAdminUserSearch(input.value.trim()), 300); });
    input.focus();
}

function userFlags(u) {
    let html = '';
    if (u.is_banned) html += `<span class="adm-flag ban">${svg('ban', 14)}</span>`;
    if (u.is_verified) html += `<span class="adm-flag ok">${svg('check', 14)}</span>`;
    if (u.is_vip) html += `<span class="adm-flag vip">${svg('star', 14)}</span>`;
    if (u.is_pro) html += `<span class="adm-flag pro">${svg('crown', 14)}</span>`;
    return html;
}

async function doAdminUserSearch(q) {
    const container = document.getElementById('admin-user-results');
    if (!container) return;
    if (!q) { container.innerHTML = '<div class="map-empty">Введи запрос</div>'; return; }
    container.innerHTML = '<div class="map-empty">Поиск...</div>';
    try {
        const users = await apiGet('/api/admin/user/search?tg_id=' + tgUser.id + '&q=' + encodeURIComponent(q));
        if (!users || users.length === 0) { container.innerHTML = '<div class="map-empty">Никого не найдено</div>'; return; }
        let html = '';
        users.forEach(u => {
            const av = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
            const at = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
            html += `<div class="admin-user-card" data-uid="${u.user_id}"><div class="admin-user-avatar" ${av}>${at}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(u.nickname || '—')} ${userFlags(u)}</div><div class="admin-user-sub">ID: ${u.user_id} · ELO ${u.elo} · ${u.coins || 0}</div></div></div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll('.admin-user-card').forEach(c => c.addEventListener('click', () => showAdminUserEdit(parseInt(c.dataset.uid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка поиска</div>'; }
}

async function showAdminUserEdit(userId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    let u;
    try { u = await apiGet('/api/admin/user/get?tg_id=' + tgUser.id + '&target_id=' + userId); }
    catch (e) { container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>'; return; }
    const av = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
    const at = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-user-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('edit', 16)} Редактирование</div><div style="width:60px;"></div></div>
        <div class="admin-user-header">
            <div class="admin-user-avatar big" ${av}>${at}</div>
            <div class="admin-user-nick big">${escapeHtml(u.nickname || '—')}</div>
            <div class="admin-user-sub">ID: ${u.user_id} · ${escapeHtml(u.player_id || '—')}</div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('coins', 16)} Коины</div>
            <div class="admin-row"><div class="admin-value" id="admin-coins-value">${u.coins || 0}</div></div>
            <div class="admin-row">
                <button class="admin-btn" data-coins="100">+100</button>
                <button class="admin-btn" data-coins="1000">+1000</button>
                <button class="admin-btn" data-coins="10000">+10k</button>
                <button class="admin-btn danger" data-coins="-1000">-1000</button>
            </div>
            <div class="admin-row"><input type="number" class="admin-input" id="admin-coins-input" placeholder="Своё число"><button class="admin-btn primary" id="admin-coins-custom">${svg('coins', 14)} Выдать</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('target', 16)} ELO</div>
            <div class="admin-row"><div class="admin-value" id="admin-elo-value">${u.elo}</div></div>
            <div class="admin-row"><input type="number" class="admin-input" id="admin-elo-input" placeholder="Новое ELO" value="${u.elo}"><button class="admin-btn primary" id="admin-elo-set">${svg('target', 14)} Установить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('check', 16)} Статусы</div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_verified ? 'active' : ''}" data-flag="verified">${svg('check', 14)} Галочка</button><button class="admin-btn flag-btn ${u.is_vip ? 'active' : ''}" data-flag="vip">${svg('star', 14)} VIP</button></div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_pro ? 'active' : ''}" data-flag="pro">${svg('crown', 14)} PRO</button><button class="admin-btn flag-btn ${u.is_media ? 'active' : ''}" data-flag="media">${svg('camera', 14)} Media</button></div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_gal ? 'active' : ''}" data-flag="gal">${svg('diamond', 14)} GAL</button><button class="admin-btn flag-btn ${u.is_banned ? 'active danger' : ''}" data-flag="banned">${svg('ban', 14)} Бан</button></div>
        </div>
    `;
    document.getElementById('admin-user-back').addEventListener('click', showAdminUsers);
    container.querySelectorAll('[data-coins]').forEach(btn => btn.addEventListener('click', () => adminGiveCoins(userId, parseInt(btn.dataset.coins))));
    document.getElementById('admin-coins-custom').addEventListener('click', () => {
        const v = document.getElementById('admin-coins-input').value.trim();
        if (!v) return showToast('⚠ Введи число');
        adminGiveCoins(userId, parseInt(v));
    });
    document.getElementById('admin-elo-set').addEventListener('click', () => {
        const v = document.getElementById('admin-elo-input').value.trim();
        if (!v) return showToast('⚠ Введи ELO');
        adminSetElo(userId, parseInt(v));
    });
    container.querySelectorAll('.flag-btn').forEach(btn => btn.addEventListener('click', () => {
        const flag = btn.dataset.flag;
        const wasActive = btn.classList.contains('active');
        adminSetFlag(userId, flag, !wasActive);
    }));
}

async function adminGiveCoins(targetId, amount) {
    try {
        const res = await apiPost('/api/admin/user/give_coins', { admin_id: tgUser.id, target_id: targetId, amount });
        if (res.error) return showToast('⚠ ' + res.error);
        const el = document.getElementById('admin-coins-value');
        if (el) el.textContent = res.coins;
        showToast((amount >= 0 ? '+' : '') + amount);
    } catch (e) { showToast('⚠ Ошибка'); }
}

async function adminSetElo(targetId, elo) {
    try {
        const res = await apiPost('/api/admin/user/set_elo', { admin_id: tgUser.id, target_id: targetId, elo });
        if (res.error) return showToast('⚠ ' + res.error);
        const el = document.getElementById('admin-elo-value');
        if (el) el.textContent = elo;
        showToast('ELO: ' + elo);
    } catch (e) { showToast('⚠ Ошибка'); }
}

async function adminSetFlag(targetId, flag, value) {
    try {
        const res = await apiPost('/api/admin/user/set_flag', { admin_id: tgUser.id, target_id: targetId, flag, value: value ? 1 : 0 });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast((value ? 'Включено: ' : 'Отключено: ') + flag);
        const btn = document.querySelector(`.flag-btn[data-flag="${flag}"]`);
        if (btn) {
            btn.classList.toggle('active', value);
            if (flag === 'banned' && value) btn.classList.add('danger');
            else if (flag === 'banned') btn.classList.remove('danger');
        }
    } catch (e) { showToast('⚠ Ошибка'); }
}

// ==== КЛАНЫ ====
async function showAdminClans() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const clans = await apiGet('/api/admin/clans/list?tg_id=' + tgUser.id);
        if (!clans || clans.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('shield', 16)} Кланы</div><div style="width:60px;"></div></div><div class="map-empty">Кланов нет</div>`;
            document.getElementById('admin-back').addEventListener('click', loadAdminHome);
            return;
        }
        let html = '';
        clans.forEach(c => {
            html += `<div class="admin-user-card" data-clan-id="${c.clan_id}"><div class="admin-user-avatar">${svg('shield', 20)}</div><div class="admin-user-info"><div class="admin-user-nick">[${escapeHtml(c.tag)}] ${escapeHtml(c.name)}</div><div class="admin-user-sub">${c.members_count} участников · Лидер: ${escapeHtml(c.creator_nick || '—')}</div></div></div>`;
        });
        container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('shield', 16)} Кланы (${clans.length})</div><div style="width:60px;"></div></div><div>${html}</div>`;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        container.querySelectorAll('[data-clan-id]').forEach(c => c.addEventListener('click', () => showAdminClanEdit(parseInt(c.dataset.clanId))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminClanEdit(clanId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    let data;
    try { data = await apiGet('/api/admin/clan/get?tg_id=' + tgUser.id + '&clan_id=' + clanId); }
    catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; return; }
    const c = data.clan;
    const members = data.members || [];
    let mHtml = '';
    members.forEach(m => {
        const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : 'Участник');
        const roleIcon = m.role === 'leader' ? svg('crown', 12) : (m.role === 'co_leader' ? svg('star', 12) : '');
        mHtml += `<div class="admin-user-card" data-uid="${m.user_id}"><div class="admin-user-avatar">${m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase()}</div><div class="admin-user-info"><div class="admin-user-nick">${roleIcon} ${escapeHtml(m.nickname)}</div><div class="admin-user-sub">${roleText} · ELO ${m.elo}</div></div></div>`;
    });
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-clan-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('edit', 16)} Редактирование</div><div style="width:60px;"></div></div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('shield', 16)} Основное</div>
            <div class="admin-row"><input type="text" class="admin-input" id="adm-clan-name" placeholder="Название" value="${escapeHtml(c.name)}" maxlength="24"></div>
            <div class="admin-row"><input type="text" class="admin-input" id="adm-clan-tag" placeholder="Тег" value="${escapeHtml(c.tag)}" maxlength="5"></div>
            <div class="admin-row"><textarea class="admin-input" id="adm-clan-desc" placeholder="Описание" rows="2" maxlength="150" style="resize:none;">${escapeHtml(c.description || '')}</textarea></div>
            <div class="admin-row"><button class="admin-btn primary" id="adm-clan-save">${svg('save', 14)} Сохранить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('crown', 16)} Лидер</div>
            <div class="admin-row"><input type="number" class="admin-input" id="adm-clan-new-leader" placeholder="ID нового лидера"><button class="admin-btn primary" id="adm-clan-leader-btn">Назначить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('chat', 16)} Чат клана</div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-clan-clear-chat">${svg('broom', 14)} Очистить чат</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('trash', 16)} Удалить</div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-clan-delete">${svg('trash', 14)} Удалить клан</button></div>
        </div>
        <div class="section-head centered"><div class="section-title">Состав (${members.length})</div></div>
        <div>${mHtml}</div>
    `;
    document.getElementById('admin-clan-back').addEventListener('click', showAdminClans);
    document.getElementById('adm-clan-save').addEventListener('click', async () => {
        const name = document.getElementById('adm-clan-name').value.trim();
        const tag = document.getElementById('adm-clan-tag').value.trim();
        const description = document.getElementById('adm-clan-desc').value.trim();
        try {
            const res = await apiPost('/api/admin/clan/edit', { admin_id: tgUser.id, clan_id: clanId, name, tag, description });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Сохранено');
        } catch (e) { showToast('⚠ Ошибка'); }
    });
    document.getElementById('adm-clan-leader-btn').addEventListener('click', async () => {
        const v = document.getElementById('adm-clan-new-leader').value.trim();
        if (!v) return showToast('⚠ Введи ID');
        try {
            const res = await apiPost('/api/admin/clan/set_leader', { admin_id: tgUser.id, clan_id: clanId, new_leader_id: parseInt(v) });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Лидер обновлён');
            showAdminClanEdit(clanId);
        } catch (e) { showToast('⚠ Ошибка'); }
    });
    document.getElementById('adm-clan-clear-chat').addEventListener('click', async () => {
        if (!confirm('Удалить все сообщения клана?')) return;
        try {
            const res = await apiPost('/api/admin/clan/clear_chat', { admin_id: tgUser.id, clan_id: clanId });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Очищено');
        } catch (e) { showToast('⚠ Ошибка'); }
    });
    document.getElementById('adm-clan-delete').addEventListener('click', async () => {
        if (!confirm('Удалить клан?') || !confirm('Точно?')) return;
        try {
            const res = await apiPost('/api/admin/clan/delete', { admin_id: tgUser.id, clan_id: clanId });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Удалено');
            showAdminClans();
        } catch (e) { showToast('⚠ Ошибка'); }
    });
    container.querySelectorAll('[data-uid]').forEach(el => el.addEventListener('click', () => showAdminUserEdit(parseInt(el.dataset.uid))));
}

// ==== ЧАТЫ ====
async function showAdminChats() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('chat', 16)} Чаты</div><div style="width:60px;"></div></div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('chat', 16)} Глобальный чат</div>
            <div class="admin-row"><button class="admin-btn" id="adm-gchat-view">${svg('eye', 14)} Открыть</button></div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-gchat-24">${svg('broom', 14)} За 24 часа</button><button class="admin-btn danger" id="adm-gchat-all">${svg('trash', 14)} Очистить всё</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('shield', 16)} Чаты кланов</div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-cchat-24">${svg('broom', 14)} За 24 часа</button><button class="admin-btn danger" id="adm-cchat-all">${svg('trash', 14)} Очистить все</button></div>
        </div>
    `;
    document.getElementById('admin-back').addEventListener('click', loadAdminHome);
    document.getElementById('adm-gchat-view').addEventListener('click', showAdminGlobalChatView);
    document.getElementById('adm-gchat-24').addEventListener('click', async () => { if (confirm('Удалить за 24ч?')) adminClearGlobalChat('24h'); });
    document.getElementById('adm-gchat-all').addEventListener('click', async () => { if (confirm('Удалить всё?') && confirm('Точно?')) adminClearGlobalChat('all'); });
    document.getElementById('adm-cchat-24').addEventListener('click', async () => { if (confirm('Удалить за 24ч?')) adminClearClanChats('24h'); });
    document.getElementById('adm-cchat-all').addEventListener('click', async () => { if (confirm('Удалить всё?') && confirm('Точно?')) adminClearClanChats('all'); });
}

async function adminClearGlobalChat(mode) {
    try {
        const res = await apiPost('/api/admin/chat/global/clear', { admin_id: tgUser.id, mode });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('Удалено: ' + res.deleted);
    } catch (e) { showToast('⚠ Ошибка'); }
}

async function adminClearClanChats(mode) {
    try {
        const res = await apiPost('/api/admin/chat/clans/clear', { admin_id: tgUser.id, mode });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('Удалено: ' + res.deleted);
    } catch (e) { showToast('⚠ Ошибка'); }
}

async function showAdminGlobalChatView() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const msgs = await apiGet('/api/admin/chat/global?tg_id=' + tgUser.id + '&limit=100');
        if (!msgs || msgs.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('chat', 16)} Глобал</div><div style="width:60px;"></div></div><div class="map-empty">Нет</div>`;
            document.getElementById('admin-back').addEventListener('click', showAdminChats);
            return;
        }
        let html = '';
        msgs.forEach(m => {
            const time = (m.created_at || '').substring(5, 16);
            const cls = m.is_deleted ? 'chat-deleted' : '';
            html += `<div class="admin-msg ${cls}" data-mid="${m.id}"><div class="admin-msg-head"><b>${escapeHtml(m.nickname || '—')}</b><span class="admin-msg-time">${time}</span></div><div class="admin-msg-text">${escapeHtml(m.message)}</div>${m.is_deleted ? '<div class="admin-msg-del">удалено</div>' : ''}</div>`;
        });
        container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('chat', 16)} Глобал (${msgs.length})</div><div style="width:60px;"></div></div><div class="admin-msgs">${html}</div>`;
        document.getElementById('admin-back').addEventListener('click', showAdminChats);
        container.querySelectorAll('.admin-msg[data-mid]').forEach(el => {
            el.addEventListener('dblclick', () => adminDeleteGlobalMsg(parseInt(el.dataset.mid)));
            el.addEventListener('contextmenu', (e) => { e.preventDefault(); adminDeleteGlobalMsg(parseInt(el.dataset.mid)); });
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function adminDeleteGlobalMsg(mid) {
    if (!confirm('Удалить сообщение?')) return;
    try {
        const res = await apiPost('/api/admin/chat/global/delete', { admin_id: tgUser.id, message_id: mid });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('Удалено');
        showAdminGlobalChatView();
    } catch (e) { showToast('⚠ Ошибка'); }
}

// ==== ТИКЕТЫ ====
async function showAdminTickets() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const tickets = await apiGet('/api/admin/tickets/list?tg_id=' + tgUser.id + '&status=all');
        if (!tickets || tickets.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('ticket', 16)} Тикеты</div><div style="width:60px;"></div></div><div class="map-empty">Нет</div>`;
            document.getElementById('admin-back').addEventListener('click', loadAdminHome);
            return;
        }
        let html = '';
        tickets.forEach(t => {
            const statusCls = t.status === 'new' ? 'new' : 'replied';
            const statusText = t.status === 'new' ? 'НОВЫЙ' : 'ОТВЕЧЕН';
            const time = (t.created_at || '').substring(5, 16);
            html += `<div class="admin-ticket-card ${statusCls}" data-tid="${t.id}"><div class="admin-ticket-head"><div class="admin-ticket-topic">${escapeHtml(t.topic || '—')}</div><div class="admin-ticket-status ${statusCls}">${statusText}</div></div><div class="admin-ticket-meta">#${t.id} · ${escapeHtml(t.first_name || '—')} · ${time}</div><div class="admin-ticket-msg">${escapeHtml(t.message || '—')}</div>${t.admin_reply ? `<div class="admin-ticket-reply">${svg('edit', 12)} ${escapeHtml(t.admin_reply)}</div>` : ''}</div>`;
        });
        container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('ticket', 16)} Тикеты (${tickets.length})</div><div style="width:60px;"></div></div><div>${html}</div>`;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        container.querySelectorAll('[data-tid]').forEach(c => c.addEventListener('click', () => showAdminTicketReply(parseInt(c.dataset.tid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminTicketReply(ticketId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    let t;
    try {
        const list = await apiGet('/api/admin/tickets/list?tg_id=' + tgUser.id + '&status=all');
        t = (list || []).find(x => x.id === ticketId);
        if (!t) throw new Error('not found');
    } catch (e) { container.innerHTML = '<div class="map-empty">Не найден</div>'; return; }
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-back-tk">${svg('back', 14)} Назад</button><div class="section-title">${svg('ticket', 16)} #${t.id}</div><div style="width:60px;"></div></div>
        <div class="admin-section"><div class="admin-section-title">Тема</div><div class="admin-value" style="font-size:15px;">${escapeHtml(t.topic || '—')}</div></div>
        <div class="admin-section"><div class="admin-section-title">От</div><div class="admin-user-sub" style="font-size:12px;">${escapeHtml(t.first_name || '—')} · @${escapeHtml(t.username || '—')} · ID ${t.user_id}</div></div>
        <div class="admin-section"><div class="admin-section-title">Сообщение</div><div class="admin-ticket-msg">${escapeHtml(t.message || '—')}</div></div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('edit', 14)} Ответ</div>
            <textarea class="admin-input" id="adm-tk-reply" rows="4" maxlength="800" placeholder="Напиши ответ..." style="resize:none;">${escapeHtml(t.admin_reply || '')}</textarea>
            <div class="admin-row" style="margin-top:10px;">
                <button class="admin-btn primary" id="adm-tk-send">${svg('send', 14)} Отправить</button>
                <button class="admin-btn danger" id="adm-tk-delete">${svg('trash', 14)} Удалить</button>
            </div>
        </div>
    `;
    document.getElementById('admin-back-tk').addEventListener('click', showAdminTickets);
    document.getElementById('adm-tk-send').addEventListener('click', async () => {
        const v = document.getElementById('adm-tk-reply').value.trim();
        if (!v) return showToast('⚠ Напиши ответ');
        try {
            const res = await apiPost('/api/admin/ticket/reply', { admin_id: tgUser.id, ticket_id: t.id, reply: v });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Отправлено');
            showAdminTickets();
        } catch (e) { showToast('⚠ Ошибка'); }
    });
    document.getElementById('adm-tk-delete').addEventListener('click', async () => {
        if (!confirm('Удалить тикет?')) return;
        try {
            const res = await apiPost('/api/admin/ticket/delete', { admin_id: tgUser.id, ticket_id: t.id });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Удалено');
            showAdminTickets();
        } catch (e) { showToast('⚠ Ошибка'); }
    });
}

// ==== ЛОГИ ====
async function showAdminLogs() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const logs = await apiGet('/api/admin/logs?tg_id=' + tgUser.id + '&limit=100');
        let listHtml = '';
        if (!logs || logs.length === 0) {
            listHtml = '<div class="map-empty">Логов пока нет</div>';
        } else {
            logs.forEach(l => {
                const time = (l.created_at || '').substring(5, 16);
                const actionIcon = getLogIcon(l.action);
                const target = l.target_id ? ` → ID ${l.target_id}` : '';
                listHtml += `<div class="admin-log-item"><div class="admin-log-head"><span class="admin-log-action">${actionIcon} ${escapeHtml(l.action)}</span><span class="admin-log-time">${time}</span></div><div class="admin-log-body">${escapeHtml(l.admin_nick || 'ID ' + l.admin_id)}${target}</div>${l.details ? `<div class="admin-log-details">${escapeHtml(l.details)}</div>` : ''}</div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('doc', 16)} Логи (${logs ? logs.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-row" style="margin-bottom:14px;"><button class="admin-btn danger" id="adm-logs-clear">${svg('broom', 14)} Очистить логи</button></div>
            <div class="admin-msgs">${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-logs-clear').addEventListener('click', async () => {
            if (!confirm('Очистить все логи?')) return;
            try {
                const res = await apiPost('/api/admin/logs/clear', { admin_id: tgUser.id });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Удалено: ' + res.deleted);
                showAdminLogs();
            } catch (e) { showToast('⚠ Ошибка'); }
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

function getLogIcon(action) {
    if (!action) return svg('doc', 14);
    if (action.startsWith('give_coins')) return svg('coins', 14);
    if (action.startsWith('set_elo')) return svg('target', 14);
    if (action.startsWith('set_verified')) return svg('check', 14);
    if (action.startsWith('set_vip')) return svg('star', 14);
    if (action.startsWith('set_pro')) return svg('crown', 14);
    if (action.startsWith('set_media')) return svg('camera', 14);
    if (action.startsWith('set_gal')) return svg('diamond', 14);
    if (action.startsWith('set_banned')) return svg('ban', 14);
    if (action.startsWith('clan_')) return svg('shield', 14);
    if (action.startsWith('chat_')) return svg('chat', 14);
    if (action.startsWith('ticket_')) return svg('ticket', 14);
    if (action.startsWith('logs_')) return svg('doc', 14);
    if (action.startsWith('promo')) return svg('gift', 14);
    if (action.startsWith('season')) return svg('calendar', 14);
    if (action.startsWith('grant_admin')) return svg('crown', 14);
    if (action.startsWith('revoke_admin')) return svg('ban', 14);
    return svg('doc', 14);
}

// ==== ПРОМОКОДЫ ====
async function showAdminPromos() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const promos = await apiGet('/api/admin/promos/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!promos || promos.length === 0) {
            listHtml = '<div class="map-empty">Промокодов нет</div>';
        } else {
            promos.forEach(p => {
                const active = p.is_active ? 'active' : '';
                const statusText = p.is_active ? 'Активен' : 'Выключен';
                const rewardText = formatReward(p.reward_type, p.reward_value);
                listHtml += `<div class="admin-promo-card ${active}" data-pid="${p.id}"><div class="admin-promo-head"><div class="admin-promo-code">${escapeHtml(p.code)}</div><div class="admin-promo-status">${statusText}</div></div><div class="admin-promo-meta">${rewardText} · Использован: ${p.uses || 0}/${p.max_uses || '∞'}</div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('gift', 16)} Промокоды (${promos ? promos.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">${svg('plus', 16)} Создать</div>
                <div class="admin-row"><input type="text" class="admin-input" id="adm-promo-code" placeholder="КОД" maxlength="20" style="text-transform:uppercase;"></div>
                <div class="admin-row">
                    <select class="admin-input" id="adm-promo-type">
                        <option value="coins">Коины</option>
                        <option value="vip">VIP</option>
                        <option value="elo">ELO</option>
                    </select>
                    <input type="number" class="admin-input" id="adm-promo-value" placeholder="Значение">
                </div>
                <div class="admin-row">
                    <input type="number" class="admin-input" id="adm-promo-uses" placeholder="Макс. использований" value="1">
                    <button class="admin-btn primary" id="adm-promo-create">${svg('plus', 14)} Создать</button>
                </div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-promo-create').addEventListener('click', async () => {
            const code = document.getElementById('adm-promo-code').value.trim().toUpperCase();
            const reward_type = document.getElementById('adm-promo-type').value;
            const reward_value = document.getElementById('adm-promo-value').value.trim();
            const max_uses = document.getElementById('adm-promo-uses').value.trim() || '1';
            if (!code) return showToast('⚠ Введи код');
            if (!reward_value) return showToast('⚠ Введи значение');
            try {
                const res = await apiPost('/api/admin/promo/create', { admin_id: tgUser.id, code, reward_type, reward_value: parseInt(reward_value), max_uses: parseInt(max_uses) });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Создан');
                showAdminPromos();
            } catch (e) { showToast('⚠ Ошибка'); }
        });
        container.querySelectorAll('.admin-promo-card[data-pid]').forEach(el => {
            el.addEventListener('click', () => showAdminPromoActions(parseInt(el.dataset.pid)));
            el.addEventListener('contextmenu', (e) => { e.preventDefault(); showAdminPromoActions(parseInt(el.dataset.pid)); });
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

function formatReward(type, value) {
    if (type === 'coins') return value + ' коинов';
    if (type === 'vip') return 'VIP на ' + value + ' дн.';
    if (type === 'elo') return '+' + value + ' ELO';
    return type + ' = ' + value;
}

async function showAdminPromoActions(promoId) {
    const action = prompt('Что сделать?\n1 = Вкл/выкл\n2 = Удалить');
    if (!action) return;
    if (action === '1') {
        try {
            const res = await apiPost('/api/admin/promo/toggle', { admin_id: tgUser.id, promo_id: promoId });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast(res.is_active ? 'Включён' : 'Выключен');
            showAdminPromos();
        } catch (e) { showToast('⚠ Ошибка'); }
    } else if (action === '2') {
        if (!confirm('Удалить промокод?')) return;
        try {
            const res = await apiPost('/api/admin/promo/delete', { admin_id: tgUser.id, promo_id: promoId });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('Удалён');
            showAdminPromos();
        } catch (e) { showToast('⚠ Ошибка'); }
    }
}

// ==== СЕЗОНЫ ====
async function showAdminSeasons() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const seasons = await apiGet('/api/admin/seasons/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!seasons || seasons.length === 0) {
            listHtml = '<div class="map-empty">Сезонов нет</div>';
        } else {
            seasons.forEach(s => {
                const isActive = s.is_active;
                const cls = isActive ? 'active' : '';
                const statusText = isActive ? 'Активен' : 'Завершён';
                const start = (s.start_date || '').substring(0, 16);
                const end = s.end_date ? (s.end_date || '').substring(0, 16) : '—';
                listHtml += `<div class="admin-season-card ${cls}" data-sid="${s.id}"><div class="admin-season-head"><div class="admin-season-name">${escapeHtml(s.name)}</div><div class="admin-season-status">${statusText}</div></div><div class="admin-season-meta">${start} → ${end} · ${s.players_count || 0} участников</div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('calendar', 16)} Сезоны (${seasons ? seasons.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">${svg('plus', 16)} Создать новый сезон</div>
                <div class="admin-row"><input type="text" class="admin-input" id="adm-season-name" placeholder="Название (Сезон 2)" maxlength="40"><button class="admin-btn primary" id="adm-season-create">${svg('plus', 14)} Создать</button></div>
                <div style="font-size:11px;color:#9187b8;padding:6px 2px;">Текущий активный сезон будет завершён.</div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-season-create').addEventListener('click', async () => {
            const name = document.getElementById('adm-season-name').value.trim();
            if (!name) return showToast('⚠ Введи название');
            if (!confirm('Создать новый сезон? Текущий будет завершён.')) return;
            try {
                const res = await apiPost('/api/admin/season/create', { admin_id: tgUser.id, name });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Создан');
                showAdminSeasons();
            } catch (e) { showToast('⚠ Ошибка'); }
        });
        container.querySelectorAll('.admin-season-card[data-sid]').forEach(el => el.addEventListener('click', () => showAdminSeasonDetail(parseInt(el.dataset.sid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminSeasonDetail(seasonId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const seasons = await apiGet('/api/admin/seasons/list?tg_id=' + tgUser.id);
        const s = (seasons || []).find(x => x.id === seasonId);
        if (!s) throw new Error('not found');
        const stats = await apiGet('/api/admin/season/stats?tg_id=' + tgUser.id + '&season_id=' + seasonId + '&limit=50');
        const isActive = s.is_active;
        let statsHtml = '';
        if (!stats || stats.length === 0) {
            statsHtml = '<div class="map-empty">Нет данных за сезон</div>';
        } else {
            stats.forEach((p, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
                statsHtml += `<div class="admin-user-card" data-uid="${p.user_id}"><div class="admin-user-avatar">${medal}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(p.nickname || '—')}</div><div class="admin-user-sub">ELO ${p.elo} · ${p.wins || 0}W / ${p.losses || 0}L</div></div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-season-back">${svg('back', 14)} Назад</button><div class="section-title">${escapeHtml(s.name)}</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">Информация</div>
                <div class="admin-row"><div class="admin-value" style="font-size:14px;">${isActive ? 'Активен' : 'Завершён'}</div></div>
                <div class="admin-user-sub" style="padding:6px 2px;">Начат: ${(s.start_date || '').substring(0, 16)}<br>${s.end_date ? 'Закончен: ' + (s.end_date || '').substring(0, 16) : 'Не завершён'}<br>Участников: ${s.players_count || 0}</div>
            </div>
            <div class="admin-section">
                <div class="admin-section-title">Действия</div>
                ${isActive ? `<div class="admin-row"><button class="admin-btn danger" id="adm-season-end">${svg('stop', 14)} Завершить сезон</button></div>` : `<div class="admin-row"><button class="admin-btn primary" id="adm-season-activate">${svg('play', 14)} Сделать активным</button></div>`}
                <div class="admin-row"><button class="admin-btn danger" id="adm-season-delete">${svg('trash', 14)} Удалить сезон</button></div>
            </div>
            <div class="section-head centered"><div class="section-title">Топ игроков (${stats ? stats.length : 0})</div></div>
            <div>${statsHtml}</div>
        `;
        document.getElementById('admin-season-back').addEventListener('click', showAdminSeasons);
        const endBtn = document.getElementById('adm-season-end');
        if (endBtn) endBtn.addEventListener('click', async () => {
            if (!confirm('Завершить сезон?')) return;
            try {
                const res = await apiPost('/api/admin/season/end', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Завершён');
                showAdminSeasonDetail(seasonId);
            } catch (e) { showToast('⚠ Ошибка'); }
        });
        const actBtn = document.getElementById('adm-season-activate');
        if (actBtn) actBtn.addEventListener('click', async () => {
            if (!confirm('Активировать этот сезон? Текущий будет завершён.')) return;
            try {
                const res = await apiPost('/api/admin/season/activate', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Активирован');
                showAdminSeasonDetail(seasonId);
            } catch (e) { showToast('⚠ Ошибка'); }
        });
        document.getElementById('adm-season-delete').addEventListener('click', async () => {
            if (!confirm('Удалить сезон?') || !confirm('Точно?')) return;
            try {
                const res = await apiPost('/api/admin/season/delete', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Удалён');
                showAdminSeasons();
            } catch (e) { showToast('⚠ Ошибка'); }
        });
        container.querySelectorAll('[data-uid]').forEach(el => el.addEventListener('click', () => showAdminUserEdit(parseInt(el.dataset.uid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

// ==== УПРАВЛЕНИЕ АДМИНАМИ ====
async function showAdminAdmins() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const list = await apiGet('/api/admin/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!list || list.length === 0) {
            listHtml = '<div class="map-empty">Админов нет</div>';
        } else {
            list.forEach(a => {
                const av = a.avatar_url ? 'style="background-image:url(' + a.avatar_url + ')"' : '';
                const at = a.avatar_url ? '' : (a.nickname || '?').charAt(0).toUpperCase();
                const superMark = a.is_super ? ` <span style="color:#fbbf24;">${svg('crown', 12)} SUPER</span>` : '';
                const removeBtn = a.is_super ? '' : `<button class="admin-btn danger" data-remove="${a.user_id}" style="flex:0 0 auto;padding:8px 12px;font-size:12px;">${svg('close', 14)}</button>`;
                listHtml += `<div class="admin-user-card" style="cursor:default;"><div class="admin-user-avatar" ${av}>${at}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(a.nickname || 'ID ' + a.user_id)}${superMark}</div><div class="admin-user-sub">ID: ${a.user_id}</div></div>${removeBtn}</div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('crown', 16)} Админы (${list ? list.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">${svg('plus', 16)} Выдать админку</div>
                <div class="admin-row"><input type="number" class="admin-input" id="adm-new-admin-id" placeholder="Telegram ID игрока"><button class="admin-btn primary" id="adm-add-admin">${svg('crown', 14)} Выдать</button></div>
                <div style="font-size:11px;color:#9187b8;padding:6px 2px;">ID можно узнать из профиля игрока (в модалке в топе).</div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-add-admin').addEventListener('click', async () => {
            const v = document.getElementById('adm-new-admin-id').value.trim();
            if (!v) return showToast('⚠ Введи ID');
            if (!confirm('Выдать админку игроку ' + v + '?')) return;
            try {
                const res = await apiPost('/api/admin/add', { tg_id: tgUser.id, target_id: parseInt(v) });
                if (res.error) return showToast('⚠ ' + res.error);
                showToast('Админка выдана');
                showAdminAdmins();
            } catch (e) { showToast('⚠ Ошибка'); }
        });
        container.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = parseInt(btn.dataset.remove);
                if (!confirm('Забрать админку у ' + targetId + '?')) return;
                try {
                    const res = await apiPost('/api/admin/remove', { tg_id: tgUser.id, target_id: targetId });
                    if (res.error) return showToast('⚠ ' + res.error);
                    showToast('Админка забрана');
                    showAdminAdmins();
                } catch (e) { showToast('⚠ Ошибка'); }
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}
