// ==== ДОСТИЖЕНИЯ ====
console.log('=== achievements.js loaded ===');

let achievementsCache = [];
let achievementCatalogCache = [];

// SVG-медальоны по редкости
function achSvg(rarity, iconName) {
    const colors = {
        common:    { c1: '#b8b8b8', c2: '#7a7a7a', stroke: '#3a3a3a', glow: 'rgba(150,150,150,0.5)' },
        rare:      { c1: '#5fa8d3', c2: '#3b82f6', stroke: '#0f2d5a', glow: 'rgba(59,130,246,0.7)' },
        epic:      { c1: '#c084fc', c2: '#a855f7', stroke: '#3b0764', glow: 'rgba(168,85,247,0.7)' },
        legendary: { c1: '#fde047', c2: '#eab308', stroke: '#5a3506', glow: 'rgba(234,179,8,0.8)' }
    };
    const col = colors[rarity] || colors.common;

    // Мелкая SVG-иконка внутри медальона
    const iconPaths = {
        medal:  '<circle cx="12" cy="10" r="5"/><path d="M7 15l-1 6 6-3 6 3-1-6"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
        trophy: '<path d="M6 4h12v7a6 6 0 0 1-12 0z"/><path d="M6 4H4v3a3 3 0 0 0 3 3"/><path d="M18 4h2v3a3 3 0 0 1-3 3"/><path d="M10 17h4"/><path d="M12 13v4"/>',
        bolt:   '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
        fire:   '<path d="M12 22a7 7 0 0 0 7-7c0-3-2-5-3-7-1 2-3 3-3 3 0-3-2-6-2-6s-1 2-3 5c-1 2-3 3-3 6a7 7 0 0 0 7 7z"/>',
        crown:  '<path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/>',
        diamond:'<path d="M6 3h12l4 6-10 12L2 9z"/>',
        shield: '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>',
        star:   '<path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/>'
    };
    const inner = iconPaths[iconName] || iconPaths.star;

    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">'
        + '<defs><linearGradient id="ach_' + Math.random().toString(36).slice(2,8) + '" x1="0" y1="0" x2="0" y2="1">'
        + '<stop offset="0%" stop-color="' + col.c1 + '"/>'
        + '<stop offset="100%" stop-color="' + col.c2 + '"/>'
        + '</linearGradient></defs>'
        // Внешний медальон
        + '<path d="M12 1.5 L14.2 5.2 L18.5 4.5 L18.2 8.8 L22 10.5 L19 13.5 L21 17.5 L16.8 17.8 L15.5 21.8 L12 19.5 L8.5 21.8 L7.2 17.8 L3 17.5 L5 13.5 L2 10.5 L5.8 8.8 L5.5 4.5 L9.8 5.2 Z" '
        + 'fill="url(#ach_grad)" stroke="' + col.stroke + '" stroke-width="0.8" stroke-linejoin="round" '
        + 'style="fill:url(#ach_grad);"/>'
        // Внутренний круг
        + '<circle cx="12" cy="12" r="7.5" fill="rgba(15,6,24,0.55)" stroke="' + col.c1 + '" stroke-width="0.8"/>'
        // Внутренняя иконка
        + '<g transform="translate(6,6) scale(0.5)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + inner
        + '</g>'
        + '</svg>';
}

// Иконка по коду достижения
function achievementIcon(code, rarity) {
    const map = {
        first_win: 'medal',
        first_tournament: 'target',
        streak_5: 'bolt',
        streak_10: 'fire',
        veteran: 'shield',
        elo_2000: 'diamond',
        top_1: 'crown',
        tournament_winner: 'trophy',
        tournament_master: 'trophy',
        vip: 'star'
    };
    return achSvg(rarity || 'common', map[code] || 'star');
}

// ============ ЗАГРУЗКА ============
async function loadAchievements(userId) {
    try {
        const list = await apiGet('/api/achievements/user?tg_id=' + userId);
        achievementsCache = list || [];
        return achievementsCache;
    } catch (e) {
        console.error('Ошибка загрузки достижений:', e);
        return [];
    }
}

async function loadAchievementCatalog() {
    if (achievementCatalogCache.length > 0) return achievementCatalogCache;
    try {
        const list = await apiGet('/api/achievements/catalog');
        achievementCatalogCache = list || [];
        return achievementCatalogCache;
    } catch (e) {
        console.error('Ошибка загрузки каталога:', e);
        return [];
    }
}

// ============ РЕНДЕР СЕКЦИИ В ПРОФИЛЕ ============
function renderAchievementsSection(achievements) {
    if (!achievements || achievements.length === 0) {
        return '<div class="ach-empty-section">Пока нет достижений</div>';
    }

    let html = '<div class="ach-row">';
    const MAX_SHOW = 6;
    const shown = achievements.slice(0, MAX_SHOW);

    shown.forEach((a, i) => {
        html += '<div class="ach-mini" style="animation-delay:' + (i * 60) + 'ms;">';
        html += '<div class="ach-mini-icon rarity-' + a.rarity + '">' + achievementIcon(a.code, a.rarity) + '</div>';
        html += '</div>';
    });

    if (achievements.length > MAX_SHOW) {
        html += '<div class="ach-mini ach-more">+' + (achievements.length - MAX_SHOW) + '</div>';
    }
    html += '</div>';

    if (achievements.length > 6) {
        html += '<button class="ach-open-btn" onclick="openAchievementsModal()">Все достижения →</button>';
    } else {
        html += '<button class="ach-open-btn" onclick="openAchievementsModal()">Все достижения →</button>';
    }

    return html;
}

// ============ МОДАЛКА ВСЕХ ДОСТИЖЕНИЙ ============
async function openAchievementsModal() {
    const userId = tgUser ? tgUser.id : null;
    if (!userId) return;

    let modal = document.getElementById('ach-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ach-modal';
        modal.className = 'ach-modal-overlay';
        modal.innerHTML = `
            <div class="ach-modal">
                <div class="ach-modal-header">
                    <button class="ach-modal-back" onclick="closeAchievementsModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div class="ach-modal-title">МОИ ДОСТИЖЕНИЯ</div>
                    <div class="ach-modal-count" id="ach-modal-count"></div>
                </div>
                <div class="ach-modal-body" id="ach-modal-body">
                    <div class="tn-loading">Загрузка...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

    const body = document.getElementById('ach-modal-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    const list = await loadAchievements(userId);
    const catalog = await loadAchievementCatalog();

    document.getElementById('ach-modal-count').textContent = list.length + '/' + catalog.length;

    if (list.length === 0) {
        body.innerHTML = '<div class="ach-empty">Пока нет достижений</div>';
        return;
    }

    let html = '';
    list.forEach((a, i) => {
        const date = (a.granted_at || '').substring(0, 10);
        html += '<div class="ach-item rarity-' + a.rarity + '" style="animation-delay:' + (i * 50) + 'ms;">';
        html += '<div class="ach-item-icon">' + achievementIcon(a.code, a.rarity) + '</div>';
        html += '<div class="ach-item-info">';
        html += '<div class="ach-item-name">' + escapeHtml(a.name) + '</div>';
        html += '<div class="ach-item-desc">' + escapeHtml(a.description || '') + '</div>';
        html += '<div class="ach-item-rarity rarity-label-' + a.rarity + '">' + a.rarity.toUpperCase() + '</div>';
        html += '</div>';
        html += '<div class="ach-item-date">' + date + '</div>';
        html += '</div>';
    });

    body.innerHTML = html;
}

function closeAchievementsModal() {
    const modal = document.getElementById('ach-modal');
    if (modal) modal.classList.remove('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

// ============ В МОДАЛКЕ ЧУЖОГО ПРОФИЛЯ ============
async function renderUserAchievementsInModal(userId) {
    const container = document.getElementById('modal-achievements');
    if (!container) return;

    container.innerHTML = '<div style="font-size:11px;color:#8b7fb8;padding:4px 0;">Загрузка...</div>';

    const list = await loadAchievements(userId);
    if (!list || list.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="ach-modal-row">';
    list.slice(0, 6).forEach((a, i) => {
        html += '<div class="ach-mini rarity-' + a.rarity + '" style="animation-delay:' + (i * 60) + 'ms;" title="' + escapeHtml(a.name) + '">';
        html += '<div class="ach-mini-icon rarity-' + a.rarity + '">' + achievementIcon(a.code, a.rarity) + '</div>';
        html += '</div>';
    });
    if (list.length > 6) {
        html += '<div class="ach-mini ach-more">+' + (list.length - 6) + '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
}

console.log('=== achievements.js DONE ===');


// ============ iOS-БАННЕР УВЕДОМЛЕНИЯ ============
function showAchievementBanner(name, description, rarity) {
    // Удалим старый если есть
    const old = document.getElementById('ach-banner');
    if (old) old.remove();

    const banner = document.createElement('div');
    banner.id = 'ach-banner';
    banner.className = 'ach-banner rarity-' + rarity;
    banner.innerHTML = `
        <div class="ach-banner-icon rarity-${rarity}">${achievementIcon('', rarity)}</div>
        <div class="ach-banner-text">
            <div class="ach-banner-label">НОВОЕ ДОСТИЖЕНИЕ</div>
            <div class="ach-banner-name">${escapeHtml(name)}</div>
            <div class="ach-banner-desc">${escapeHtml(description || '')}</div>
        </div>
    `;
    document.body.appendChild(banner);

    // Показываем
    setTimeout(() => banner.classList.add('show'), 50);

    // Вибрация
    if (tg && tg.HapticFeedback) {
        try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
    }

    // Скрываем через 4 секунды
    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 400);
    }, 4000);
}

// Поллинг уведомлений
let _achPollingTimer = null;
let _achSeenIds = new Set();

async function _achPollNotifications() {
    if (!tgUser) return;
    try {
        const list = await apiGet('/api/achievements/notifications?tg_id=' + tgUser.id);
        if (!list || list.length === 0) return;
        // Показываем по одному с задержкой
        for (let i = 0; i < list.length; i++) {
            const n = list[i];
            if (_achSeenIds.has(n.id)) continue;
            _achSeenIds.add(n.id);
            setTimeout(() => {
                showAchievementBanner(n.name, n.description, n.rarity);
            }, i * 1200);
        }
    } catch (e) {
        // тихо
    }
}

function startAchievementsPolling() {
    if (_achPollingTimer) return;
    _achPollNotifications(); // первый запуск
    _achPollingTimer = setInterval(_achPollNotifications, 5000);
}

// Авто-запуск если есть tgUser
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof tgUser !== 'undefined' && tgUser) {
            setTimeout(startAchievementsPolling, 2000);
        }
    });
} else {
    if (typeof tgUser !== 'undefined' && tgUser) {
        setTimeout(startAchievementsPolling, 2000);
    }
}
