
const ADMIN_API_KEY = 'lumafaceit_secret_e8jd90jd19dd7dk';

async function adminGet(path) {
    const fullUrl = (typeof API_URL !== 'undefined' ? API_URL : '') + path;
    const res = await fetch(fullUrl, {
        headers: { 'X-API-Key': ADMIN_API_KEY }
    });
    return res.json();
}

async function adminPost(path, body) {
    const fullUrl = (typeof API_URL !== 'undefined' ? API_URL : '') + path;
    const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': ADMIN_API_KEY
        },
        body: JSON.stringify(body || {})
    });
    return res.json();
}

// ==== АДМИН-ПАНЕЛЬ ====
let adminStats = null;

async function checkAdminAccess() {
    if (!tgUser) return false;
    try {
        const res = await adminGet('/api/admin/check?tg_id=' + tgUser.id);
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
        adminStats = await adminGet('/api/admin/stats?tg_id=' + tgUser.id);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }
    container.innerHTML = `
        <div class="section-head centered"><div class="section-title">${svg('key', 16)} Админ-панель</div></div>
        <div class="admin-stats">
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.users}</div><div class="admin-stat-label">${svg('users', 12)} Игроков</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.matches}</div><div class="admin-stat-label">${svg('target', 12)} Матчей</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.clans}</div><div class="admin-stat-label">${svg('shield', 12)} Кланов</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.tickets}</div><div class="admin-stat-label">${svg('ticket', 12)} Тикетов</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.active_24h}</div><div class="admin-stat-label">${svg('fire', 12)} Активных 24ч</div></div>
        </div>
        <div class="section-head centered"><div class="section-title">${svg('grid', 14)} Разделы</div></div>
        <div class="admin-grid">
            <button class="admin-tile" data-action="users">${svg('users', 28)}<span>Игроки</span></button>
            <button class="admin-tile" data-action="clans">${svg('shield', 28)}<span>Кланы</span></button>
            <button class="admin-tile" data-action="tournaments">${svg('trophy', 28)}<span>Турниры</span></button>
            <button class="admin-tile" data-action="chats">${svg('chat', 28)}<span>Чаты</span></button>
            <button class="admin-tile" data-action="tickets">${svg('ticket', 28)}<span>Тикеты</span></button>
            <button class="admin-tile" data-action="logs">${svg('doc', 28)}<span>Логи</span></button>
            <button class="admin-tile" data-action="promos">${svg('gift', 28)}<span>Промокоды</span></button>
            <button class="admin-tile" data-action="seasons">${svg('calendar', 28)}<span>Сезоны</span></button>
            <button class="admin-tile" data-action="achievements">${svg('star', 28)}<span>Достижения</span></button>
            <button class="admin-tile" data-action="admins">${svg('crown', 28)}<span>Админы</span></button>
        </div>
    `;
    container.querySelectorAll('.admin-tile').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'users') showAdminUsers();
            else if (action === 'clans') showAdminClans();
            else if (action === 'tournaments' && typeof showAdminTournaments === 'function') showAdminTournaments();
            else if (action === 'chats') showAdminChats();
            else if (action === 'tickets') showAdminTickets();
            else if (action === 'logs') showAdminLogs();
            else if (action === 'promos') showAdminPromos();
            else if (action === 'seasons') showAdminSeasons();
            else if (action === 'achievements' && typeof showAdminAchievements === 'function') showAdminAchievements();
            else if (action === 'tags') showAdminTags();
            else if (action === 'admins') showAdminAdmins();
        });
    });
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
    if (u.is_banned) html += `<span class="adm-flag ban">${svg('ban', 12)}</span>`;
    if (u.is_verified) html += `<span class="adm-flag ok">${svg('check', 12)}</span>`;
    if (u.is_vip) html += `<span class="adm-flag vip">${svg('star', 12)}</span>`;
    if (u.is_pro) html += `<span class="adm-flag pro">${svg('crown', 12)}</span>`;
    return html;
}

async function doAdminUserSearch(q) {
    const container = document.getElementById('admin-user-results');
    if (!container) return;
    if (!q) { container.innerHTML = '<div class="map-empty">Введи запрос</div>'; return; }
    container.innerHTML = '<div class="map-empty">Поиск...</div>';
    try {
        const users = await adminGet('/api/admin/user/search?tg_id=' + tgUser.id + '&q=' + encodeURIComponent(q));
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
    try { u = await adminGet('/api/admin/user/get?tg_id=' + tgUser.id + '&target_id=' + userId); }
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
            <div class="admin-section-title">${svg('coins', 14)} Коины</div>
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
            <div class="admin-section-title">${svg('target', 14)} ELO</div>
            <div class="admin-row"><div class="admin-value" id="admin-elo-value">${u.elo}</div></div>
            <div class="admin-row"><input type="number" class="admin-input" id="admin-elo-input" placeholder="Новое ELO" value="${u.elo}"><button class="admin-btn primary" id="admin-elo-set">${svg('target', 14)} Установить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('check', 14)} Статусы</div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_verified ? 'active' : ''}" data-flag="verified">${svg('check', 14)} Галочка</button><button class="admin-btn flag-btn ${u.is_vip ? 'active' : ''}" data-flag="vip">${svg('star', 14)} VIP</button></div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_pro ? 'active' : ''}" data-flag="pro">${svg('crown', 14)} PRO</button><button class="admin-btn flag-btn ${u.is_media ? 'active' : ''}" data-flag="media">${svg('camera', 14)} Media</button></div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_gal ? 'active' : ''}" data-flag="gal">${svg('diamond', 14)} GAL</button><button class="admin-btn flag-btn ${u.is_banned ? 'active danger' : ''}" data-flag="banned">${svg('ban', 14)} Бан</button></div>
        </div>
    `;
    document.getElementById('admin-user-back').addEventListener('click', showAdminUsers);
    container.querySelectorAll('[data-coins]').forEach(btn => btn.addEventListener('click', () => adminGiveCoins(userId, parseInt(btn.dataset.coins))));
    document.getElementById('admin-coins-custom').addEventListener('click', () => {
        const v = document.getElementById('admin-coins-input').value.trim();
        if (!v) return showToast('Введи число');
        adminGiveCoins(userId, parseInt(v));
    });
    document.getElementById('admin-elo-set').addEventListener('click', () => {
        const v = document.getElementById('admin-elo-input').value.trim();
        if (!v) return showToast('Введи ELO');
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
        const res = await adminPost('/api/admin/user/give_coins', { admin_id: tgUser.id, target_id: targetId, amount });
        if (res.error) return showToast(res.error);
        const el = document.getElementById('admin-coins-value');
        if (el) el.textContent = res.coins;
        showToast((amount >= 0 ? '+' : '') + amount);
    } catch (e) { showToast('Ошибка'); }
}

async function adminSetElo(targetId, elo) {
    try {
        const res = await adminPost('/api/admin/user/set_elo', { admin_id: tgUser.id, target_id: targetId, elo });
        if (res.error) return showToast(res.error);
        const el = document.getElementById('admin-elo-value');
        if (el) el.textContent = elo;
        showToast('ELO: ' + elo);
    } catch (e) { showToast('Ошибка'); }
}

async function adminSetFlag(targetId, flag, value) {
    try {
        const res = await adminPost('/api/admin/user/set_flag', { admin_id: tgUser.id, target_id: targetId, flag, value: value ? 1 : 0 });
        if (res.error) return showToast(res.error);
        showToast((value ? 'Включено: ' : 'Отключено: ') + flag);
        const btn = document.querySelector(`.flag-btn[data-flag="${flag}"]`);
        if (btn) {
            btn.classList.toggle('active', value);
            if (flag === 'banned' && value) btn.classList.add('danger');
            else if (flag === 'banned') btn.classList.remove('danger');
        }
    } catch (e) { showToast('Ошибка'); }
}

// ==== КЛАНЫ ====
async function showAdminClans() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const clans = await adminGet('/api/admin/clans/list?tg_id=' + tgUser.id);
        if (!clans || clans.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('shield', 16)} Кланы</div><div style="width:60px;"></div></div><div class="map-empty">Кланов нет</div>`;
            document.getElementById('admin-back').addEventListener('click', loadAdminHome);
            return;
        }
        let html = '';
        clans.forEach(c => {
            html += `<div class="admin-user-card" data-clan-id="${c.clan_id}"><div class="admin-user-info"><div class="admin-user-nick">${svg('shield', 14)} [${escapeHtml(c.tag)}] ${escapeHtml(c.name)}</div><div class="admin-user-sub">${c.members_count} участников · Лидер: ${escapeHtml(c.creator_nick || '—')}</div></div></div>`;
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
    try { data = await adminGet('/api/admin/clan/get?tg_id=' + tgUser.id + '&clan_id=' + clanId); }
    catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; return; }
    const c = data.clan;
    const members = data.members || [];
    let mHtml = '';
    members.forEach(m => {
        const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : 'Участник');
        const roleIcon = m.role === 'leader' ? svg('crown', 12) : (m.role === 'co_leader' ? svg('star', 12) : svg('users', 12));
        mHtml += `<div class="admin-user-card" data-uid="${m.user_id}"><div class="admin-user-info"><div class="admin-user-nick">${roleIcon} ${escapeHtml(m.nickname)}</div><div class="admin-user-sub">${roleText} · ELO ${m.elo}</div></div></div>`;
    });
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-clan-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('edit', 16)} Редактирование</div><div style="width:60px;"></div></div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('shield', 14)} Основное</div>
            <div class="admin-row"><input type="text" class="admin-input" id="adm-clan-name" placeholder="Название" value="${escapeHtml(c.name)}" maxlength="24"></div>
            <div class="admin-row"><input type="text" class="admin-input" id="adm-clan-tag" placeholder="Тег" value="${escapeHtml(c.tag)}" maxlength="5"></div>
            <div class="admin-row"><textarea class="admin-input" id="adm-clan-desc" placeholder="Описание" rows="2" maxlength="150" style="resize:none;">${escapeHtml(c.description || '')}</textarea></div>
            <div class="admin-row"><button class="admin-btn primary" id="adm-clan-save">${svg('save', 14)} Сохранить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('crown', 14)} Лидер</div>
            <div class="admin-row"><input type="number" class="admin-input" id="adm-clan-new-leader" placeholder="ID нового лидера"><button class="admin-btn primary" id="adm-clan-leader-btn">${svg('crown', 14)} Назначить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('alert', 14)} Действия</div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-clan-clear-chat">${svg('broom', 14)} Очистить чат</button></div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-clan-delete">${svg('trash', 14)} Удалить клан</button></div>
        </div>
        <div class="section-head centered"><div class="section-title">${svg('users', 14)} Состав (${members.length})</div></div>
        <div>${mHtml}</div>
    `;
    document.getElementById('admin-clan-back').addEventListener('click', showAdminClans);
    document.getElementById('adm-clan-save').addEventListener('click', async () => {
        const name = document.getElementById('adm-clan-name').value.trim();
        const tag = document.getElementById('adm-clan-tag').value.trim();
        const description = document.getElementById('adm-clan-desc').value.trim();
        try {
            const res = await adminPost('/api/admin/clan/edit', { admin_id: tgUser.id, clan_id: clanId, name, tag, description });
            if (res.error) return showToast(res.error);
            showToast('Сохранено');
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-clan-leader-btn').addEventListener('click', async () => {
        const v = document.getElementById('adm-clan-new-leader').value.trim();
        if (!v) return showToast('Введи ID');
        try {
            const res = await adminPost('/api/admin/clan/set_leader', { admin_id: tgUser.id, clan_id: clanId, new_leader_id: parseInt(v) });
            if (res.error) return showToast(res.error);
            showToast('Лидер обновлён');
            showAdminClanEdit(clanId);
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-clan-clear-chat').addEventListener('click', async () => {
        if (!confirm('Удалить все сообщения клана?')) return;
        try {
            const res = await adminPost('/api/admin/clan/clear_chat', { admin_id: tgUser.id, clan_id: clanId });
            if (res.error) return showToast(res.error);
            showToast('Очищено');
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-clan-delete').addEventListener('click', async () => {
        if (!confirm('Удалить клан?') || !confirm('Точно?')) return;
        try {
            const res = await adminPost('/api/admin/clan/delete', { admin_id: tgUser.id, clan_id: clanId });
            if (res.error) return showToast(res.error);
            showToast('Удалено');
            showAdminClans();
        } catch (e) { showToast('Ошибка'); }
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
            <div class="admin-section-title">${svg('chat', 14)} Глобальный чат</div>
            <div class="admin-row"><button class="admin-btn" id="adm-gchat-view">${svg('eye', 14)} Открыть</button></div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-gchat-24">${svg('broom', 14)} За 24 часа</button><button class="admin-btn danger" id="adm-gchat-all">${svg('trash', 14)} Очистить всё</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('shield', 14)} Чаты кланов</div>
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
        const res = await adminPost('/api/admin/chat/global/clear', { admin_id: tgUser.id, mode });
        if (res.error) return showToast(res.error);
        showToast('Удалено: ' + res.deleted);
    } catch (e) { showToast('Ошибка'); }
}

async function adminClearClanChats(mode) {
    try {
        const res = await adminPost('/api/admin/chat/clans/clear', { admin_id: tgUser.id, mode });
        if (res.error) return showToast(res.error);
        showToast('Удалено: ' + res.deleted);
    } catch (e) { showToast('Ошибка'); }
}

async function showAdminGlobalChatView() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const msgs = await adminGet('/api/admin/chat/global?tg_id=' + tgUser.id + '&limit=100');
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
        const res = await adminPost('/api/admin/chat/global/delete', { admin_id: tgUser.id, message_id: mid });
        if (res.error) return showToast(res.error);
        showToast('Удалено');
        showAdminGlobalChatView();
    } catch (e) { showToast('Ошибка'); }
}

// ==== ТИКЕТЫ ====
async function showAdminTickets() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const tickets = await adminGet('/api/admin/tickets/list?tg_id=' + tgUser.id + '&status=all');
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
        const list = await adminGet('/api/admin/tickets/list?tg_id=' + tgUser.id + '&status=all');
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
        if (!v) return showToast('Напиши ответ');
        try {
            const res = await adminPost('/api/admin/ticket/reply', { admin_id: tgUser.id, ticket_id: t.id, reply: v });
            if (res.error) return showToast(res.error);
            showToast('Отправлено');
            showAdminTickets();
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-tk-delete').addEventListener('click', async () => {
        if (!confirm('Удалить тикет?')) return;
        try {
            const res = await adminPost('/api/admin/ticket/delete', { admin_id: tgUser.id, ticket_id: t.id });
            if (res.error) return showToast(res.error);
            showToast('Удалено');
            showAdminTickets();
        } catch (e) { showToast('Ошибка'); }
    });
}

// ==== ЛОГИ ====
async function showAdminLogs() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const logs = await adminGet('/api/admin/logs?tg_id=' + tgUser.id + '&limit=100');
        let listHtml = '';
        if (!logs || logs.length === 0) {
            listHtml = '<div class="map-empty">Логов пока нет</div>';
        } else {
            logs.forEach(l => {
                const time = (l.created_at || '').substring(5, 16);
                const target = l.target_id ? ` → ID ${l.target_id}` : '';
                listHtml += `<div class="admin-log-item"><div class="admin-log-head"><span class="admin-log-action">${escapeHtml(l.action)}</span><span class="admin-log-time">${time}</span></div><div class="admin-log-body">${escapeHtml(l.admin_nick || 'ID ' + l.admin_id)}${target}</div>${l.details ? `<div class="admin-log-details">${escapeHtml(l.details)}</div>` : ''}</div>`;
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
                const res = await adminPost('/api/admin/logs/clear', { admin_id: tgUser.id });
                if (res.error) return showToast(res.error);
                showToast('Удалено: ' + res.deleted);
                showAdminLogs();
            } catch (e) { showToast('Ошибка'); }
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

// ==== ПРОМОКОДЫ ====
async function showAdminPromos() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const promos = await adminGet('/api/admin/promos/list?tg_id=' + tgUser.id);
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
                <div class="admin-section-title">${svg('plus', 14)} Создать</div>
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
            if (!code) return showToast('Введи код');
            if (!reward_value) return showToast('Введи значение');
            try {
                const res = await adminPost('/api/admin/promo/create', { admin_id: tgUser.id, code, reward_type, reward_value: parseInt(reward_value), max_uses: parseInt(max_uses) });
                if (res.error) return showToast(res.error);
                showToast('Создан');
                showAdminPromos();
            } catch (e) { showToast('Ошибка'); }
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
            const res = await adminPost('/api/admin/promo/toggle', { admin_id: tgUser.id, promo_id: promoId });
            if (res.error) return showToast(res.error);
            showToast(res.is_active ? 'Включён' : 'Выключен');
            showAdminPromos();
        } catch (e) { showToast('Ошибка'); }
    } else if (action === '2') {
        if (!confirm('Удалить промокод?')) return;
        try {
            const res = await adminPost('/api/admin/promo/delete', { admin_id: tgUser.id, promo_id: promoId });
            if (res.error) return showToast(res.error);
            showToast('Удалён');
            showAdminPromos();
        } catch (e) { showToast('Ошибка'); }
    }
}

// ==== СЕЗОНЫ ====
async function showAdminSeasons() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const seasons = await adminGet('/api/admin/seasons/list?tg_id=' + tgUser.id);
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
                listHtml += `<div class="admin-season-card ${cls}" data-sid="${s.id}"><div class="admin-season-head"><div class="admin-season-name">${svg('calendar', 14)} ${escapeHtml(s.name)}</div><div class="admin-season-status">${statusText}</div></div><div class="admin-season-meta">${start} → ${end} · ${s.players_count || 0} участников</div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('calendar', 16)} Сезоны (${seasons ? seasons.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">${svg('plus', 14)} Создать новый сезон</div>
                <div class="admin-row"><input type="text" class="admin-input" id="adm-season-name" placeholder="Название (Сезон 2)" maxlength="40"><button class="admin-btn primary" id="adm-season-create">${svg('plus', 14)} Создать</button></div>
                <div style="font-size:11px;color:#9187b8;padding:6px 2px;">Текущий активный сезон будет завершён.</div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-season-create').addEventListener('click', async () => {
            const name = document.getElementById('adm-season-name').value.trim();
            if (!name) return showToast('Введи название');
            if (!confirm('Создать новый сезон? Текущий будет завершён.')) return;
            try {
                const res = await adminPost('/api/admin/season/create', { admin_id: tgUser.id, name });
                if (res.error) return showToast(res.error);
                showToast('Создан');
                showAdminSeasons();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('.admin-season-card[data-sid]').forEach(el => el.addEventListener('click', () => showAdminSeasonDetail(parseInt(el.dataset.sid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminSeasonDetail(seasonId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const seasons = await adminGet('/api/admin/seasons/list?tg_id=' + tgUser.id);
        const s = (seasons || []).find(x => x.id === seasonId);
        if (!s) throw new Error('not found');
        const stats = await adminGet('/api/admin/season/stats?tg_id=' + tgUser.id + '&season_id=' + seasonId + '&limit=50');
        const isActive = s.is_active;
        let statsHtml = '';
        if (!stats || stats.length === 0) {
            statsHtml = '<div class="map-empty">Нет данных за сезон</div>';
        } else {
            stats.forEach((p, i) => {
                let medal = '#' + (i + 1);
                if (i === 0) medal = '1st';
                else if (i === 1) medal = '2nd';
                else if (i === 2) medal = '3rd';
                statsHtml += `<div class="admin-user-card" data-uid="${p.user_id}"><div class="admin-user-avatar">${medal}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(p.nickname || '—')}</div><div class="admin-user-sub">ELO ${p.elo} · ${p.wins || 0}W / ${p.losses || 0}L</div></div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-season-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('calendar', 16)} ${escapeHtml(s.name)}</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">Информация</div>
                <div class="admin-row"><div class="admin-value" style="font-size:14px;">${isActive ? 'Активен' : 'Завершён'}</div></div>
                <div class="admin-user-sub" style="padding:6px 2px;">Начат: ${(s.start_date || '').substring(0, 16)}<br>${s.end_date ? 'Закончен: ' + (s.end_date || '').substring(0, 16) : 'Не завершён'}<br>Участников: ${s.players_count || 0}</div>
            </div>
            <div class="admin-section">
                <div class="admin-section-title">${svg('target', 14)} Действия</div>
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
                const res = await adminPost('/api/admin/season/end', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast(res.error);
                showToast('Завершён');
                showAdminSeasonDetail(seasonId);
            } catch (e) { showToast('Ошибка'); }
        });
        const actBtn = document.getElementById('adm-season-activate');
        if (actBtn) actBtn.addEventListener('click', async () => {
            if (!confirm('Активировать этот сезон? Текущий будет завершён.')) return;
            try {
                const res = await adminPost('/api/admin/season/activate', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast(res.error);
                showToast('Активирован');
                showAdminSeasonDetail(seasonId);
            } catch (e) { showToast('Ошибка'); }
        });
        document.getElementById('adm-season-delete').addEventListener('click', async () => {
            if (!confirm('Удалить сезон?') || !confirm('Точно?')) return;
            try {
                const res = await adminPost('/api/admin/season/delete', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast(res.error);
                showToast('Удалён');
                showAdminSeasons();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('[data-uid]').forEach(el => el.addEventListener('click', () => showAdminUserEdit(parseInt(el.dataset.uid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

// ==== АДМИНЫ ====
async function showAdminAdmins() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const list = await adminGet('/api/admin/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!list || list.length === 0) {
            listHtml = '<div class="map-empty">Админов нет</div>';
        } else {
            list.forEach(a => {
                const av = a.avatar_url ? 'style="background-image:url(' + a.avatar_url + ')"' : '';
                const at = a.avatar_url ? '' : (a.nickname || '?').charAt(0).toUpperCase();
                const superMark = a.is_super ? ` ${svg('crown', 12)} SUPER` : '';
                const removeBtn = a.is_super ? '' : `<button class="admin-btn danger" data-remove="${a.user_id}" style="flex:0 0 auto;padding:8px 12px;font-size:12px;">${svg('close', 14)}</button>`;
                listHtml += `<div class="admin-user-card" style="cursor:default;"><div class="admin-user-avatar" ${av}>${at}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(a.nickname || 'ID ' + a.user_id)}${superMark}</div><div class="admin-user-sub">ID: ${a.user_id}</div></div>${removeBtn}</div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button><div class="section-title">${svg('crown', 16)} Админы (${list ? list.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">${svg('plus', 14)} Выдать админку</div>
                <div class="admin-row"><input type="number" class="admin-input" id="adm-new-admin-id" placeholder="Telegram ID игрока"><button class="admin-btn primary" id="adm-add-admin">${svg('crown', 14)} Выдать</button></div>
                <div style="font-size:11px;color:#9187b8;padding:6px 2px;">ID можно узнать из профиля игрока.</div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-add-admin').addEventListener('click', async () => {
            const v = document.getElementById('adm-new-admin-id').value.trim();
            if (!v) return showToast('Введи ID');
            if (!confirm('Выдать админку игроку ' + v + '?')) return;
            try {
                const res = await adminPost('/api/admin/add', { tg_id: tgUser.id, target_id: parseInt(v) });
                if (res.error) return showToast(res.error);
                showToast('Админка выдана');
                showAdminAdmins();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = parseInt(btn.dataset.remove);
                if (!confirm('Забрать админку у ' + targetId + '?')) return;
                try {
                    const res = await adminPost('/api/admin/remove', { tg_id: tgUser.id, target_id: targetId });
                    if (res.error) return showToast(res.error);
                    showToast('Админка забрана');
                    showAdminAdmins();
                } catch (e) { showToast('Ошибка'); }
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// Алиас для main-start.js
async function loadAdmin() {
    return loadAdminHome();
}


// ==== Экспорт в window ====
window.loadAdminHome = loadAdminHome;
window.initAdmin = initAdmin;
window.checkAdminAccess = checkAdminAccess;


// ================== ТЕГИ (админка) ==================
async function showAdminTags() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-back">${svg('back', 14)} Назад</button>
            <div class="section-title">${svg('ticket', 16)} Теги</div>
            <button class="section-btn" id="admin-tags-create" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);color:#c084fc;">+ Создать</button>
        </div>
        <div id="admin-tags-list"><div class="map-empty">Загрузка...</div></div>
    `;

    document.getElementById('admin-back').addEventListener('click', loadAdminHome);
    document.getElementById('admin-tags-create').addEventListener('click', showAdminTagCreate);

    await loadAdminTagsList();
}

async function loadAdminTagsList() {
    const container = document.getElementById('admin-tags-list');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const tags = await adminGet('/api/admin/tags/list');
        if (!tags || tags.length === 0) {
            container.innerHTML = '<div class="map-empty">Тегов пока нет</div>';
            return;
        }

        container.innerHTML = tags.map(t => {
            // Иконка
            const iconName = t.icon || 'star';
            const icon = (window.ICONS && window.ICONS[iconName]) ? window.ICONS[iconName] : (window.ICONS?.star || '');

            // Плашка — превью
            const bg = t.bg_color || (t.color + '22');
            const tc = t.text_color || t.color || '#fff';
            const bc = t.border_color || t.color || 'rgba(255,255,255,0.2)';
            const isOutline = t.style === 'outline';
            const previewStyle = isOutline
                ? `background:transparent;color:${tc};border:1.5px solid ${bc};`
                : `background:${bg};color:${tc};border:1.5px solid ${bc};`;

            return `
                <div class="admin-tag-card" data-tag-id="${t.id}" style="
                    background: linear-gradient(160deg, #150a20 0%, #0f0618 100%);
                    border: 1px solid rgba(168,85,247,0.2);
                    border-radius: 14px;
                    padding: 14px;
                    margin-bottom: 10px;
                ">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <span class="user-badge-custom" style="${previewStyle}">
                            <span class="user-badge-custom-icon">${icon}</span>
                            <span class="user-badge-custom-text">${escapeHtml(t.name)}</span>
                        </span>
                        <span style="color:#8a7a9b;font-size:11px;margin-left:auto;">${t.users_count || 0} юзеров</span>
                    </div>
                    <div style="color:#8a7a9b;font-size:12px;margin-bottom:8px;">${escapeHtml(t.description || t.code)}</div>
                    <div style="display:flex;gap:6px;">
                        <button class="admin-tag-grant" data-tag-id="${t.id}" style="flex:1;padding:8px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:8px;color:#4ade80;font-weight:700;cursor:pointer;font-size:12px;">Выдать</button>
                        <button class="admin-tag-delete" data-tag-id="${t.id}" style="flex:1;padding:8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:8px;color:#ef4444;font-weight:700;cursor:pointer;font-size:12px;">Удалить</button>
                    </div>
                </div>
            `;
        }).join('');

        // Обработчики
        container.querySelectorAll('.admin-tag-grant').forEach(btn => {
            btn.addEventListener('click', () => showAdminTagGrant(parseInt(btn.dataset.tagId)));
        });
        container.querySelectorAll('.admin-tag-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.tagId);
                if (confirm('Удалить тег у всех пользователей?')) {
                    adminPost('/api/admin/tags/delete', { tag_id: id }).then(() => loadAdminTagsList());
                }
            });
        });

    } catch (e) {
        console.error('[ADMIN TAGS]', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// Форма создания тега
function showAdminTagCreate() {
    const container = document.getElementById('admin-tags-list');
    if (!container) return;

    const icons = ['crown','star','shield','check','fire','trophy','gift','key','diamond','target','bolt','medal','users','chat','ticket','doc','ban','flag','eye','gamepad'];
    const styles = ['solid', 'outline', 'gradient'];

    container.innerHTML = `
        <div style="background:linear-gradient(160deg,#150a20,#0f0618);border:1px solid rgba(168,85,247,0.3);border-radius:14px;padding:16px;">
            <div style="color:#fff;font-weight:800;font-size:14px;margin-bottom:14px;">Новый тег</div>

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">CODE (латиница, только a-z, 0-9, _)</label>
            <input id="tag-new-code" placeholder="premium" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">НАЗВАНИЕ (текст на плашке)</label>
            <input id="tag-new-name" placeholder="PREMIUM" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">ИКОНКА</label>
            <select id="tag-new-icon" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">
                ${icons.map(i => `<option value="${i}">${i}</option>`).join('')}
            </select>

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">СТИЛЬ</label>
            <select id="tag-new-style" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">
                ${styles.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">ЦВЕТ ФОНА (или gradient CSS)</label>
            <input id="tag-new-bg" placeholder="linear-gradient(135deg, #FFD700, #b8860b)" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">ЦВЕТ ТЕКСТА</label>
            <input id="tag-new-text" placeholder="#ffffff" value="#ffffff" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">ЦВЕТ ОБВОДКИ</label>
            <input id="tag-new-border" placeholder="#FFD700" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">

            <label style="color:#8a7a9b;font-size:11px;display:block;margin-bottom:4px;">ОПИСАНИЕ (для админки)</label>
            <input id="tag-new-desc" placeholder="Элитный игрок" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:14px;box-sizing:border-box;">

            <div style="display:flex;gap:8px;">
                <button id="tag-create-submit" style="flex:2;padding:12px;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;border-radius:10px;color:#fff;font-weight:800;cursor:pointer;">Создать</button>
                <button id="tag-create-cancel" style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#8a7a9b;font-weight:700;cursor:pointer;">Отмена</button>
            </div>
        </div>
    `;

    document.getElementById('tag-create-cancel').addEventListener('click', loadAdminTagsList);
    document.getElementById('tag-create-submit').addEventListener('click', async () => {
        const data = {
            code: document.getElementById('tag-new-code').value.trim().toLowerCase(),
            name: document.getElementById('tag-new-name').value.trim(),
            icon: document.getElementById('tag-new-icon').value,
            style: document.getElementById('tag-new-style').value,
            bg_color: document.getElementById('tag-new-bg').value.trim() || null,
            text_color: document.getElementById('tag-new-text').value.trim() || '#ffffff',
            border_color: document.getElementById('tag-new-border').value.trim() || null,
            description: document.getElementById('tag-new-desc').value.trim() || null,
            color: document.getElementById('tag-new-border').value.trim() || '#a855f7'
        };

        if (!data.code || !data.name) {
            alert('CODE и НАЗВАНИЕ обязательны');
            return;
        }

        try {
            const res = await adminPost('/api/admin/tags/create', data);
            if (res.error) {
                alert('Ошибка: ' + res.error);
                return;
            }
            alert('✓ Тег создан');
            loadAdminTagsList();
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    });
}

// Выдача тега юзеру
function showAdminTagGrant(tagId) {
    const container = document.getElementById('admin-tags-list');
    if (!container) return;

    container.innerHTML = `
        <div style="background:linear-gradient(160deg,#150a20,#0f0618);border:1px solid rgba(168,85,247,0.3);border-radius:14px;padding:16px;">
            <div style="color:#fff;font-weight:800;font-size:14px;margin-bottom:14px;">Выдать тег (ID: ${tagId})</div>
            <input id="tag-grant-user" placeholder="ID игрока" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(168,85,247,0.3);border-radius:8px;color:#fff;margin-bottom:10px;box-sizing:border-box;">
            <div style="display:flex;gap:8px;">
                <button id="tag-grant-submit" style="flex:2;padding:12px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:10px;color:#fff;font-weight:800;cursor:pointer;">Выдать</button>
                <button id="tag-grant-cancel" style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#8a7a9b;font-weight:700;cursor:pointer;">Отмена</button>
            </div>
        </div>
    `;

    document.getElementById('tag-grant-cancel').addEventListener('click', loadAdminTagsList);
    document.getElementById('tag-grant-submit').addEventListener('click', async () => {
        const userId = parseInt(document.getElementById('tag-grant-user').value.trim());
        if (!userId) { alert('Введи ID игрока'); return; }

        try {
            const res = await adminPost('/api/admin/tags/grant', { user_id: userId, tag_id: tagId });
            if (res.error) { alert('Ошибка: ' + res.error); return; }
            alert('✓ Тег выдан');
            loadAdminTagsList();
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    });
}

window.showAdminTags = showAdminTags;
