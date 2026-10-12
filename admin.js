// ==== АДМИН-ПАНЕЛЬ ====
let adminStats = null;

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
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) return;

    const tab = document.querySelector('.tab-btn.admin-tab');
    if (tab) tab.style.display = 'flex';

    loadAdminHome();
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
        <div class="section-head centered">
            <div class="section-title">⚙️ Админ-панель</div>
        </div>

        <div class="admin-stats">
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.users}</div>
                <div class="admin-stat-label">Игроков</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.matches}</div>
                <div class="admin-stat-label">Матчей</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.clans}</div>
                <div class="admin-stat-label">Кланов</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.tickets}</div>
                <div class="admin-stat-label">Тикетов</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.active_24h}</div>
                <div class="admin-stat-label">Активных 24ч</div>
            </div>
        </div>

        <div class="section-head centered">
            <div class="section-title">Разделы</div>
        </div>

        <div class="admin-grid">
            <button class="admin-tile" data-action="users">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="8" r="4"/>
                    <path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/>
                    <circle cx="18" cy="9" r="2.5"/>
                    <path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/>
                </svg>
                <span>Игроки</span>
            </button>

            <button class="admin-tile" data-action="clans">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>
                </svg>
                <span>Кланы</span>
            </button>

            <button class="admin-tile" data-action="chats">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>
                </svg>
                <span>Чаты</span>
            </button>

            <button class="admin-tile" data-action="tickets">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/>
                    <path d="M13 5v2M13 11v2M13 17v2"/>
                </svg>
                <span>Тикеты</span>
            </button>

            <button class="admin-tile" data-action="logs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                    <path d="M8 13h8M8 17h8M8 9h2"/>
                </svg>
                <span>Логи</span>
            </button>

            <button class="admin-tile" data-action="broadcast">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                <span>Рассылка</span>
            </button>

            <button class="admin-tile" data-action="promos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4z"/>
                    <path d="M13 5v2M13 11v2M13 17v2"/>
                </svg>
                <span>Промокоды</span>
            </button>

            <button class="admin-tile" data-action="seasons">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <span>Сезоны</span>
            </button>
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
            else if (action === 'broadcast') showAdminBroadcast();
            else if (action === 'promos') showAdminPromos();
            else if (action === 'seasons') showAdminSeasons();
            else showToast('⚠ Раздел в разработке');
        });
    });
}

// ==== ИГРОКИ ====
async function showAdminUsers() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-back">← Назад</button>
            <div class="section-title">👥 Игроки</div>
            <div style="width:60px;"></div>
        </div>
        <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="admin-user-search" placeholder="Ник / ID / player_id..." autocomplete="off">
        </div>
        <div id="admin-user-results">
            <div class="map-empty">Введи запрос</div>
        </div>
    `;

    document.getElementById('admin-back').addEventListener('click', loadAdminHome);

    const input = document.getElementById('admin-user-search');
    let searchTimer = null;
    input.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => doAdminUserSearch(input.value.trim()), 300);
    });
    input.focus();
}

async function doAdminUserSearch(q) {
    const container = document.getElementById('admin-user-results');
    if (!container) return;

    if (!q) {
        container.innerHTML = '<div class="map-empty">Введи запрос</div>';
        return;
    }

    container.innerHTML = '<div class="map-empty">Поиск...</div>';

    try {
        const users = await apiGet('/api/admin/user/search?tg_id=' + tgUser.id + '&q=' + encodeURIComponent(q));
        if (!users || users.length === 0) {
            container.innerHTML = '<div class="map-empty">Никого не найдено</div>';
            return;
        }

        let html = '';
        users.forEach(u => {
            const avatarStyle = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
            const avatarText = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
            const flags = [];
            if (u.is_banned) flags.push('🚫');
            if (u.is_verified) flags.push('✅');
            if (u.is_vip) flags.push('⭐');
            if (u.is_pro) flags.push('👑');

            html += `
                <div class="admin-user-card" data-uid="${u.user_id}">
                    <div class="admin-user-avatar" ${avatarStyle}>${avatarText}</div>
                    <div class="admin-user-info">
                        <div class="admin-user-nick">${escapeHtml(u.nickname || '—')} ${flags.join(' ')}</div>
                        <div class="admin-user-sub">ID: ${u.user_id} · ELO ${u.elo} · ${u.coins || 0} 🪙</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.admin-user-card').forEach(card => {
            card.addEventListener('click', () => showAdminUserEdit(parseInt(card.dataset.uid)));
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка поиска</div>';
    }
}

async function showAdminUserEdit(userId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    let u;
    try {
        u = await apiGet('/api/admin/user/get?tg_id=' + tgUser.id + '&target_id=' + userId);
    } catch (e) {
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }

    const avatarStyle = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
    const avatarText = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-user-back">← Назад</button>
            <div class="section-title">Редактирование</div>
            <div style="width:60px;"></div>
        </div>

        <div class="admin-user-header">
            <div class="admin-user-avatar big" ${avatarStyle}>${avatarText}</div>
            <div class="admin-user-nick big">${escapeHtml(u.nickname || '—')}</div>
            <div class="admin-user-sub">ID: ${u.user_id} · ${escapeHtml(u.player_id || '—')}</div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">💰 Коины</div>
            <div class="admin-row">
                <div class="admin-value" id="admin-coins-value">${u.coins || 0}</div>
            </div>
            <div class="admin-row">
                <button class="admin-btn" data-coins="100">+100</button>
                <button class="admin-btn" data-coins="1000">+1000</button>
                <button class="admin-btn" data-coins="10000">+10k</button>
                <button class="admin-btn danger" data-coins="-1000">-1000</button>
            </div>
            <div class="admin-row">
                <input type="number" class="admin-input" id="admin-coins-input" placeholder="Своё число">
                <button class="admin-btn primary" id="admin-coins-custom">💰 Выдать</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🎯 ELO</div>
            <div class="admin-row">
                <div class="admin-value" id="admin-elo-value">${u.elo}</div>
            </div>
            <div class="admin-row">
                <input type="number" class="admin-input" id="admin-elo-input" placeholder="Новое ELO" value="${u.elo}">
                <button class="admin-btn primary" id="admin-elo-set">🎯 Установить</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🏅 Статусы</div>
            <div class="admin-row">
                <button class="admin-btn flag-btn ${u.is_verified ? 'active' : ''}" data-flag="verified">✅ Галочка</button>
                <button class="admin-btn flag-btn ${u.is_vip ? 'active' : ''}" data-flag="vip">⭐ VIP</button>
            </div>
            <div class="admin-row">
                <button class="admin-btn flag-btn ${u.is_pro ? 'active' : ''}" data-flag="pro">👑 PRO</button>
                <button class="admin-btn flag-btn ${u.is_media ? 'active' : ''}" data-flag="media">📸 Media</button>
            </div>
            <div class="admin-row">
                <button class="admin-btn flag-btn ${u.is_gal ? 'active' : ''}" data-flag="gal">💎 GAL</button>
                <button class="admin-btn flag-btn ${u.is_banned ? 'active danger' : ''}" data-flag="banned">🚫 Бан</button>
            </div>
        </div>
    `;

    document.getElementById('admin-user-back').addEventListener('click', showAdminUsers);

    container.querySelectorAll('[data-coins]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const amount = parseInt(btn.dataset.coins);
            await adminGiveCoins(userId, amount);
        });
    });

    document.getElementById('admin-coins-custom').addEventListener('click', async () => {
        const v = document.getElementById('admin-coins-input').value.trim();
        if (!v) return showToast('⚠ Введи число');
        await adminGiveCoins(userId, parseInt(v));
    });

    document.getElementById('admin-elo-set').addEventListener('click', async () => {
        const v = document.getElementById('admin-elo-input').value.trim();
        if (!v) return showToast('⚠ Введи ELO');
        await adminSetElo(userId, parseInt(v));
    });

    container.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const flag = btn.dataset.flag;
            const wasActive = btn.classList.contains('active');
            await adminSetFlag(userId, flag, !wasActive);
        });
    });
}

async function adminGiveCoins(targetId, amount) {
    try {
        const res = await apiPost('/api/admin/user/give_coins', {
            admin_id: tgUser.id,
            target_id: targetId,
            amount: amount
        });
        if (res.error) return showToast('⚠ ' + res.error);
        const el = document.getElementById('admin-coins-value');
        if (el) el.textContent = res.coins;
        showToast((amount >= 0 ? '+' : '') + amount + ' 🪙');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function adminSetElo(targetId, elo) {
    try {
        const res = await apiPost('/api/admin/user/set_elo', {
            admin_id: tgUser.id,
            target_id: targetId,
            elo: elo
        });
        if (res.error) return showToast('⚠ ' + res.error);
        const el = document.getElementById('admin-elo-value');
        if (el) el.textContent = elo;
        showToast('✅ ELO: ' + elo);
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function adminSetFlag(targetId, flag, value) {
    try {
        const res = await apiPost('/api/admin/user/set_flag', {
            admin_id: tgUser.id,
            target_id: targetId,
            flag: flag,
            value: value ? 1 : 0
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast((value ? '✅ Включено: ' : '❌ Отключено: ') + flag);
        // Обновить кнопку
        const btn = document.querySelector(`.flag-btn[data-flag="${flag}"]`);
        if (btn) {
            btn.classList.toggle('active', value);
            if (flag === 'banned' && value) btn.classList.add('danger');
            else if (flag === 'banned') btn.classList.remove('danger');
        }
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

// ==== Заглушки остальных разделов ====
function showAdminClans() { showToast('⚠ Раздел «Кланы» — в разработке'); }
function showAdminChats() { showToast('⚠ Раздел «Чаты» — в разработке'); }
function showAdminTickets() { showToast('⚠ Раздел «Тикеты» — в разработке'); }
function showAdminLogs() { showToast('⚠ Раздел «Логи» — в разработке'); }
function showAdminBroadcast() { showToast('⚠ Раздел «Рассылка» — в разработке'); }
function showAdminPromos() { showToast('⚠ Раздел «Промокоды» — в разработке'); }
function showAdminSeasons() { showToast('⚠ Раздел «Сезоны» — в разработке'); }
