// ==== КЛАНЫ ====
let myClanCache = null;
let clanViewMode = 'my'; // 'my' | 'list' | 'create' | 'view'

async function loadClan() {
    const container = document.getElementById('clan-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    if (!tgUser) {
        container.innerHTML = '<div class="map-empty">Открой через Telegram</div>';
        return;
    }

    try {
        const res = await apiGet('/api/clan/my?tg_id=' + tgUser.id);
        myClanCache = res.clan ? res : null;
        if (res.clan) {
            renderMyClan(res);
        } else {
            renderNoClan();
        }
    } catch (e) {
        console.error('Ошибка клана:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// ==== ЕСЛИ НЕТ КЛАНА ====
function renderNoClan() {
    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="clan-empty">
            <div class="clan-empty-icon">🛡</div>
            <div class="clan-empty-title">Ты пока не в клане</div>
            <div class="clan-empty-text">
                Клан — это команда игроков с общим тегом и составом.<br>
                Вступи в существующий или создай свой.
            </div>
            <button class="btn-primary" id="clan-find-btn">🔍 Найти клан</button>
            <button class="btn-secondary" id="clan-create-btn">➕ Создать клан за 3500 🪙</button>
        </div>
    `;
    document.getElementById('clan-find-btn').addEventListener('click', showClanList);
    document.getElementById('clan-create-btn').addEventListener('click', showClanCreate);
}

// ==== МОЙ КЛАН ====
function renderMyClan(data) {
    const container = document.getElementById('clan-content');
    const c = data.clan;
    const members = data.members || [];

    const isLeader = c.role === 'leader';
    const isCoLeader = c.role === 'co_leader';
    const canKick = isLeader || isCoLeader;

    let membersHtml = '';
    members.forEach(m => {
        const roleIcon = m.role === 'leader' ? '👑' : (m.role === 'co_leader' ? '⭐' : '');
        const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : '');
        const canKickThis = canKick && m.user_id !== tgUser.id && m.role !== 'leader' &&
                            !(isCoLeader && m.role === 'co_leader');

        membersHtml += `
            <div class="clan-member">
                <div class="clan-member-avatar" ${m.avatar_url ? 'style="background-image:url(' + m.avatar_url + ')"' : ''}>
                    ${m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase()}
                </div>
                <div class="clan-member-info">
                    <div class="clan-member-nick">
                        ${roleIcon} ${escapeHtml(m.nickname)}
                    </div>
                    <div class="clan-member-role">${roleText}</div>
                </div>
                <div class="clan-member-elo">${m.elo}</div>
                ${canKickThis ? `<button class="clan-kick-btn" data-uid="${m.user_id}">✕</button>` : ''}
            </div>
        `;
    });

    container.innerHTML = `
        <div class="clan-card">
            <div class="clan-header">
                <div class="clan-logo">🛡</div>
                <div class="clan-name">${escapeHtml(c.name)}</div>
                <div class="clan-tag">[${escapeHtml(c.tag)}]</div>
            </div>
            <div class="clan-meta">
                <div class="clan-meta-item">
                    <span class="clan-meta-label">Участников</span>
                    <span class="clan-meta-value">${c.members_count}</span>
                </div>
                <div class="clan-meta-item">
                    <span class="clan-meta-label">Роль</span>
                    <span class="clan-meta-value">${isLeader ? 'Лидер' : (isCoLeader ? 'Солидер' : 'Участник')}</span>
                </div>
            </div>
            ${c.description ? `<div class="clan-description">${escapeHtml(c.description)}</div>` : ''}
            <button class="btn-secondary clan-leave-btn" id="clan-leave-btn">
                ${isLeader ? '👑 Покинуть (передать солидеру)' : '🚪 Покинуть клан'}
            </button>
        </div>
        <div class="section-head centered">
            <div class="section-title">Состав</div>
        </div>
        <div class="clan-members">${membersHtml}</div>
    `;

    document.getElementById('clan-leave-btn').addEventListener('click', clanLeave);
    container.querySelectorAll('.clan-kick-btn').forEach(btn => {
        btn.addEventListener('click', () => clanKick(parseInt(btn.dataset.uid)));
    });
}

// ==== СПИСОК КЛАНОВ ====
async function showClanList() {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const clans = await apiGet('/api/clan/list?limit=50');

        if (!clans || clans.length === 0) {
            container.innerHTML = `
                <div class="clan-empty">
                    <div class="clan-empty-icon">🛡</div>
                    <div class="clan-empty-title">Кланов пока нет</div>
                    <div class="clan-empty-text">Будь первым — создай свой клан!</div>
                    <button class="btn-primary" id="clan-create-btn">➕ Создать клан</button>
                    <button class="btn-secondary" id="clan-back-btn">← Назад</button>
                </div>
            `;
            document.getElementById('clan-create-btn').addEventListener('click', showClanCreate);
            document.getElementById('clan-back-btn').addEventListener('click', loadClan);
            return;
        }

        let listHtml = '';
        clans.forEach((c, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            listHtml += `
                <div class="clan-list-item" data-clan-id="${c.clan_id}">
                    <div class="clan-list-rank">${medal}</div>
                    <div class="clan-list-logo">🛡</div>
                    <div class="clan-list-info">
                        <div class="clan-list-name">[${escapeHtml(c.tag)}] ${escapeHtml(c.name)}</div>
                        <div class="clan-list-sub">${c.members_count} участников · Лидер: ${escapeHtml(c.creator_nick || '—')}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="section-head centered"><div class="section-title">Топ кланов</div></div>
            <div class="clan-list">${listHtml}</div>
            <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">← Назад</button>
        `;

        document.getElementById('clan-back-btn').addEventListener('click', loadClan);
        container.querySelectorAll('.clan-list-item').forEach(item => {
            item.addEventListener('click', () => viewClan(parseInt(item.dataset.clanId)));
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// ==== ПРОСМОТР ЧУЖОГО КЛАНА ====
async function viewClan(clanId) {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const data = await apiGet('/api/clan/info?clan_id=' + clanId);
        const c = data.clan;
        const members = data.members || [];

        let membersHtml = '';
        members.forEach(m => {
            const roleIcon = m.role === 'leader' ? '👑' : (m.role === 'co_leader' ? '⭐' : '');
            const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : '');
            membersHtml += `
                <div class="clan-member">
                    <div class="clan-member-avatar" ${m.avatar_url ? 'style="background-image:url(' + m.avatar_url + ')"' : ''}>
                        ${m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div class="clan-member-info">
                        <div class="clan-member-nick">${roleIcon} ${escapeHtml(m.nickname)}</div>
                        <div class="clan-member-role">${roleText}</div>
                    </div>
                    <div class="clan-member-elo">${m.elo}</div>
                </div>
            `;
        });

        const amIMember = myClanCache && myClanCache.clan && myClanCache.clan.clan_id === clanId;
        const joinBtn = (!amIMember && (!myClanCache || !myClanCache.clan))
            ? '<button class="btn-primary" id="clan-join-btn">➕ Вступить</button>'
            : '';

        container.innerHTML = `
            <div class="clan-card">
                <div class="clan-header">
                    <div class="clan-logo">🛡</div>
                    <div class="clan-name">${escapeHtml(c.name)}</div>
                    <div class="clan-tag">[${escapeHtml(c.tag)}]</div>
                </div>
                <div class="clan-meta">
                    <div class="clan-meta-item">
                        <span class="clan-meta-label">Участников</span>
                        <span class="clan-meta-value">${c.members_count}</span>
                    </div>
                </div>
                ${c.description ? `<div class="clan-description">${escapeHtml(c.description)}</div>` : ''}
                ${joinBtn}
            </div>
            <div class="section-head centered"><div class="section-title">Состав</div></div>
            <div class="clan-members">${membersHtml}</div>
            <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">← Назад</button>
        `;

        document.getElementById('clan-back-btn').addEventListener('click', showClanList);
        const jb = document.getElementById('clan-join-btn');
        if (jb) jb.addEventListener('click', () => clanJoin(clanId));
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// ==== СОЗДАНИЕ КЛАНА ====
function showClanCreate() {
    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="section-head centered"><div class="section-title">Создать клан</div></div>
        <div class="card wide-card">
            <div class="clan-cost">Стоимость: <b>3500 🪙</b></div>
            <div class="form-group">
                <label class="form-label">Название (3-24)</label>
                <input type="text" class="form-input" id="clan-name-input" maxlength="24" placeholder="LUMA ESPORTS">
            </div>
            <div class="form-group">
                <label class="form-label">Тег (2-4, латиница)</label>
                <input type="text" class="form-input" id="clan-tag-input" maxlength="4" placeholder="LME" style="text-transform:uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">Описание (до 150)</label>
                <textarea class="form-input" id="clan-desc-input" rows="3" maxlength="150" placeholder="Сбор сильнейших игроков..."></textarea>
            </div>
            <button class="btn-primary" id="clan-create-submit">➕ Создать клан</button>
            <button class="btn-secondary" id="clan-back-btn">← Назад</button>
        </div>
    `;
    document.getElementById('clan-back-btn').addEventListener('click', loadClan);
    document.getElementById('clan-create-submit').addEventListener('click', clanCreate);
}

async function clanCreate() {
    const name = document.getElementById('clan-name-input').value.trim();
    const tag = document.getElementById('clan-tag-input').value.trim().toUpperCase();
    const description = document.getElementById('clan-desc-input').value.trim();

    if (name.length < 3 || name.length > 24) return showToast('⚠ Название: 3-24 символа');
    if (tag.length < 2 || tag.length > 4) return showToast('⚠ Тег: 2-4 символа');
    if (!/^[A-Z0-9]+$/.test(tag)) return showToast('⚠ Тег: только латиница и цифры');

    const btn = document.getElementById('clan-create-submit');
    btn.disabled = true;
    btn.textContent = '⏳ Создание...';

    try {
        const res = await apiPost('/api/clan/create', {
            creator_id: tgUser.id,
            name: name,
            tag: tag,
            description: description
        });
        if (res.error) {
            showToast('⚠ ' + res.error);
            btn.disabled = false;
            btn.textContent = '➕ Создать клан';
            return;
        }
        showToast('✅ Клан создан!');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
        btn.disabled = false;
        btn.textContent = '➕ Создать клан';
    }
}

// ==== ВСТУПИТЬ ====
async function clanJoin(clanId) {
    try {
        const res = await apiPost('/api/clan/join', {
            clan_id: clanId,
            user_id: tgUser.id
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('✅ Ты в клане!');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

// ==== ПОКИНУТЬ ====
async function clanLeave() {
    if (!confirm('Точно покинуть клан?')) return;
    try {
        const res = await apiPost('/api/clan/leave', { user_id: tgUser.id });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('🚪 Ты покинул клан');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

// ==== КИКНУТЬ ====
async function clanKick(targetId) {
    if (!confirm('Кикнуть игрока?')) return;
    try {
        const res = await apiPost('/api/clan/kick', {
            user_id: tgUser.id,
            target_id: targetId
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('✅ Игрок кикнут');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
// clan.js не грузит сразу — он вызовется через main-start.js при переключении на вкладку
