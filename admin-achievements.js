// ==== АДМИНКА: ДОСТИЖЕНИЯ ====
console.log('=== admin-achievements.js loaded ===');

let aaCurrentUser = null;

async function showAdminAchievements() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="aa-back">${svg('back', 14)} Назад</button>
            <div class="section-title">${svg('star', 16)} Достижения</div>
            <div style="width:60px;"></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">${svg('search', 14)} Поиск игрока</div>
            <div class="admin-row">
                <input type="text" class="admin-input" id="aa-search" placeholder="Ник / ID / player_id" autocomplete="off">
            </div>
        </div>
        <div id="aa-results"><div class="map-empty">Введи ник или ID</div></div>
    `;

    document.getElementById('aa-back').addEventListener('click', loadAdminHome);

    const input = document.getElementById('aa-search');
    let timer = null;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => aaDoSearch(input.value.trim()), 300);
    });
    input.focus();
}

async function aaDoSearch(q) {
    const container = document.getElementById('aa-results');
    if (!container) return;

    if (!q) {
        container.innerHTML = '<div class="map-empty">Введи ник или ID</div>';
        return;
    }

    container.innerHTML = '<div class="map-empty">Поиск...</div>';

    try {
        const list = await apiGet('/api/admin/achievements/search?tg_id=' + tgUser.id + '&q=' + encodeURIComponent(q));

        if (!list || list.length === 0) {
            container.innerHTML = '<div class="map-empty">Никого не найдено</div>';
            return;
        }

        let html = '';
        list.forEach(u => {
            const av = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
            const at = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
            const verified = u.is_verified ? ' ' + verifySvg('green') : '';
            html += `<div class="admin-user-card" data-aa-user="${u.user_id}">
                <div class="admin-user-avatar" ${av}>${at}</div>
                <div class="admin-user-info">
                    <div class="admin-user-nick">${escapeHtml(u.nickname || '—')}${verified}</div>
                    <div class="admin-user-sub">ID: ${u.user_id} · ELO ${u.elo} · ${u.ach_count} достижений</div>
                </div>
            </div>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('[data-aa-user]').forEach(card => {
            card.addEventListener('click', () => {
                aaOpenUser(parseInt(card.dataset.aaUser));
            });
        });
    } catch (e) {
        console.error('Ошибка поиска:', e);
        container.innerHTML = '<div class="map-empty">Ошибка поиска</div>';
    }
}

async function aaOpenUser(userId) {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const data = await apiGet('/api/admin/achievements/user?tg_id=' + tgUser.id + '&target_id=' + userId);
        if (!data || data.error) {
            container.innerHTML = '<div class="map-empty">Ошибка</div>';
            return;
        }
        aaCurrentUser = data;
        aaRenderUser(data);
    } catch (e) {
        console.error('Ошибка:', e);
        container.innerHTML = '<div class="map-empty">Ошибка</div>';
    }
}

function aaRenderUser(data) {
    const container = document.getElementById('admin-content');
    const av = data.avatar_url ? 'style="background-image:url(' + data.avatar_url + ')"' : '';
    const at = data.avatar_url ? '' : (data.nickname || '?').charAt(0).toUpperCase();
    const verified = data.is_verified ? ' ' + verifySvg('green') : '';

    // Сортируем: сначала невыданные, потом выданные
    const catalog = data.achievements || [];
    const notGranted = catalog.filter(a => !a.granted);
    const granted = catalog.filter(a => a.granted);

    let notGrantedHtml = '';
    if (notGranted.length === 0) {
        notGrantedHtml = '<div class="map-empty" style="padding:20px;">Все достижения выданы</div>';
    } else {
        notGranted.forEach(a => {
            notGrantedHtml += `
                <div class="aa-item rarity-${a.rarity}">
                    <div class="aa-item-icon rarity-${a.rarity}">${achievementIcon(a.code, a.rarity)}</div>
                    <div class="aa-item-info">
                        <div class="aa-item-name">${escapeHtml(a.name)}</div>
                        <div class="aa-item-desc">${escapeHtml(a.description || '')}</div>
                        <div class="aa-item-rarity rarity-label-${a.rarity}">${a.rarity.toUpperCase()}</div>
                    </div>
                    <button class="aa-btn primary" data-grant="${a.code}">Выдать</button>
                </div>
            `;
        });
    }

    let grantedHtml = '';
    if (granted.length === 0) {
        grantedHtml = '<div class="map-empty" style="padding:20px;">Пока ничего не выдано</div>';
    } else {
        granted.forEach(a => {
            const date = (a.granted_at || '').substring(0, 10);
            grantedHtml += `
                <div class="aa-item rarity-${a.rarity}">
                    <div class="aa-item-icon rarity-${a.rarity}">${achievementIcon(a.code, a.rarity)}</div>
                    <div class="aa-item-info">
                        <div class="aa-item-name">${escapeHtml(a.name)}</div>
                        <div class="aa-item-desc">${escapeHtml(a.description || '')} · ${date}</div>
                    </div>
                    <button class="aa-btn danger" data-revoke="${a.code}">Забрать</button>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="aa-back2">${svg('back', 14)} Назад</button>
            <div class="section-title">${svg('star', 16)} Достижения игрока</div>
            <div style="width:60px;"></div>
        </div>

        <div class="aa-user-header">
            <div class="admin-user-avatar big" ${av}>${at}</div>
            <div class="admin-user-nick big">${escapeHtml(data.nickname || '—')}${verified}</div>
            <div class="admin-user-sub">ID: ${data.user_id} · ELO ${data.elo}</div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">${svg('plus', 14)} Выдать (${notGranted.length})</div>
            <div class="aa-list">${notGrantedHtml}</div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">${svg('check', 14)} Уже выдано (${granted.length})</div>
            <div class="aa-list">${grantedHtml}</div>
        </div>
    `;

    document.getElementById('aa-back2').addEventListener('click', showAdminAchievements);

    container.querySelectorAll('[data-grant]').forEach(btn => {
        btn.addEventListener('click', () => aaGrant(btn.dataset.grant));
    });
    container.querySelectorAll('[data-revoke]').forEach(btn => {
        btn.addEventListener('click', () => aaRevoke(btn.dataset.revoke));
    });
}

async function aaGrant(code) {
    if (!aaCurrentUser) return;
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

    try {
        const res = await apiPost('/api/admin/achievements/grant', {
            admin_id: tgUser.id,
            target_id: aaCurrentUser.user_id,
            code: code
        });

        if (res.error) {
            showToast(res.error);
            return;
        }

        showToast('Выдано!');
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        aaOpenUser(aaCurrentUser.user_id);
    } catch (e) {
        console.error('Ошибка выдачи:', e);
        showToast('Ошибка');
    }
}

async function aaRevoke(code) {
    if (!aaCurrentUser) return;
    if (!confirm('Забрать достижение?')) return;

    try {
        const res = await apiPost('/api/admin/achievements/revoke', {
            admin_id: tgUser.id,
            target_id: aaCurrentUser.user_id,
            code: code
        });

        if (res.error) {
            showToast(res.error);
            return;
        }

        showToast('Забрано');
        aaOpenUser(aaCurrentUser.user_id);
    } catch (e) {
        console.error('Ошибка:', e);
        showToast('Ошибка');
    }
}

console.log('=== admin-achievements.js DONE ===');
