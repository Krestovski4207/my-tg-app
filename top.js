// Уровень из ELO (как в database.py)
function levelFromElo(elo) {
    if (!elo) elo = 0;
    if (elo <= 500) return 1;
    if (elo <= 750) return 2;
    if (elo <= 900) return 3;
    if (elo <= 1050) return 4;
    if (elo <= 1200) return 5;
    if (elo <= 1300) return 6;
    if (elo <= 1530) return 7;
    if (elo <= 1750) return 8;
    if (elo <= 2000) return 9;
    return 10;
}

// ==== SVG-ИКОНКИ ДЛЯ ТОПА ====
const T_ICONS = {
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22V15"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>'
};

function tSvg(name, size) {
    const s = size || 16;
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;vertical-align:middle;">${T_ICONS[name] || ''}</span>`;
}

// ==== ТОП ====
let topCache = [];

async function loadTop(filter) {
    if (filter === undefined) filter = '';
    try {
        const top = await apiGet('/api/top?limit=50');
        topCache = top;
        renderTop(filter);
    } catch (e) {
        console.error('Ошибка топа:', e);
    }
}

function renderTop(filter) {
    if (filter === undefined) filter = '';
    const container = document.getElementById('top-list');
    if (!container) return;
    container.innerHTML = '';

    const q = filter.trim().toLowerCase();
    const filtered = q ? topCache.filter(p => p.nick.toLowerCase().includes(q)) : topCache;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="map-empty">Никого не найдено</div>';
        return;
    }

    filtered.forEach((player) => {
        const rank = topCache.indexOf(player) + 1;
        const item = document.createElement('div');
        item.className = 'top-item rank-' + (rank <= 3 ? rank : 'rest');

        if (player.banner_url) {
            item.classList.add('has-banner');
            item.style.setProperty('--banner-url', 'url(' + API_URL + player.banner_url + ')');
        }

        let medal = rank;
        if (rank === 1) medal = '🥇';
        if (rank === 2) medal = '🥈';
        if (rank === 3) medal = '🥉';

        const avatarStyle = player.avatar ? 'style="background-image:url(' + player.avatar + ')"' : '';
        const avatarText = player.avatar ? '' : player.nick.charAt(0).toUpperCase();
        const clanTag = player.clan_tag ? '<span class="top-clan-tag">' + svg('shield', 10) + ' ' + player.clan_tag + '</span>' : '';
        const verified = player.is_verified ? verifySvg('green') : '';

        item.innerHTML =
            '<div class="top-rank">' + medal + '</div>' +
            '<div class="avatar-with-level"><div class="top-avatar" ' + avatarStyle + '>' + avatarText + '</div><div class="level-badge-avatar">' + levelSvg(levelFromElo(player.elo), 24) + '</div></div>' +
            '<div class="top-info">' +
                '<div class="top-nick"><span class="top-nick-name">' + player.nick + '</span>' + verified + clanTag + '</div>' +
                '<div class="top-sub">' + player.wins + ' побед</div>' +
            '</div>' +
            '<div class="top-elo">' + player.elo + '</div>';

        item.addEventListener('click', () => openUserProfile(player.user_id));
        container.appendChild(item);
    });
}

const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderTop(e.target.value);
    });
}

// ==== МОДАЛКА ====
const modalOverlay = document.getElementById('modal-overlay');
let currentTargetId = null;
let currentVote = null;

async function openModal(userId) {
    try {
        const player = await apiGet('/api/profile?tg_id=' + userId);
        currentTargetId = userId;

        const modalAvatarEl = document.getElementById('modal-avatar');
        if (player.avatar_url) {
            modalAvatarEl.style.backgroundImage = 'url(' + player.avatar_url + ')';
            modalAvatarEl.textContent = '';
        } else {
            modalAvatarEl.style.backgroundImage = '';
            modalAvatarEl.textContent = (player.nickname || '?').charAt(0).toUpperCase();
        }

        const nameEl = document.getElementById('modal-name');
        const isAdmin = Number(player.user_id) === Number(ADMIN_ID);
        if (isAdmin) {
            nameEl.innerHTML = escapeHtml(player.nickname) + ' ' + verifySvg('green');
        } else {
            nameEl.textContent = player.nickname;
        }

        document.getElementById('modal-game-id').textContent = 'ID: ' + player.player_id;

        renderUserAchievementsInModal(userId);
            const clanEl = document.getElementById('modal-clan');
        if (clanEl) {
            try {
                const cr = await apiGet('/api/clan/by_user?tg_id=' + userId);
                if (cr.clan) {
                    clanEl.className = 'modal-clan member';
                    clanEl.innerHTML = svg('shield', 12) + '<span>[' + escapeHtml(cr.clan.tag) + '] ' + escapeHtml(cr.clan.name) + '</span>';
                    clanEl.onclick = () => {
                        document.getElementById('modal-overlay').classList.remove('active');
                        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        const clanTab = document.querySelector('.tab-btn[data-tab="clan"]');
                        if (clanTab) clanTab.classList.add('active');
                        const clanContent = document.getElementById('tab-clan');
                        if (clanContent) clanContent.classList.add('active');
                        if (typeof viewClan === 'function') viewClan(cr.clan.clan_id);
                    };
                } else {
                    clanEl.className = 'modal-clan free';
                    clanEl.innerHTML = svg('flag', 12) + '<span>Свободный агент</span>';
                    clanEl.onclick = null;
                }
            } catch (e) {
                clanEl.className = 'modal-clan free';
                clanEl.innerHTML = svg('flag', 12) + '<span>Свободный агент</span>';
            }
        }

        document.getElementById('modal-elo').textContent = player.elo;
        document.getElementById('modal-win').textContent = player.wins || 0;
        document.getElementById('modal-lose').textContent = player.losses || 0;
        document.getElementById('modal-kd').textContent = (player.kd || 0).toFixed(2);
        document.getElementById('modal-wr').textContent = (player.winrate || 0) + '%';
        document.getElementById('vote-likes').textContent = player.likes || 0;
        document.getElementById('vote-dislikes').textContent = player.dislikes || 0;

        currentVote = null;
        document.getElementById('vote-like').classList.remove('active');
        document.getElementById('vote-dislike').classList.remove('active');

        const writeBtn = document.getElementById('modal-write-btn');
        if (writeBtn) {
            if (Number(userId) === Number(tgUser.id)) {
                writeBtn.style.display = 'none';
            } else {
                writeBtn.style.display = 'flex';
                writeBtn.innerHTML = 'Написать сообщение';
                writeBtn.onclick = () => {
                    if (typeof openPrivateChat === 'function') {
                        openPrivateChat(userId);
                    } else {
                        showToast('Чат не готов');
                    }
                };
            }
        }

        modalOverlay.classList.add('active');
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } catch (e) {
        console.error(e);
        showToast('Ошибка профиля');
    }
}

function closeModal() {
    modalOverlay.classList.remove('active');
    currentTargetId = null;
    currentVote = null;
}

const modalCloseBtn = document.getElementById('modal-close');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// ==== ГОЛОСА ====
async function sendVote(vote) {
    if (!tgUser || !currentTargetId) return;
    if (currentTargetId === tgUser.id) {
        showToast('Нельзя голосовать за себя');
        return;
    }
    const newVote = currentVote === vote ? null : vote;
    try {
        const res = await apiPost('/api/vote', {
            voter_id: tgUser.id,
            target_id: currentTargetId,
            vote: newVote
        });
        currentVote = newVote;
        document.getElementById('vote-likes').textContent = res.likes;
        document.getElementById('vote-dislikes').textContent = res.dislikes;
        document.getElementById('vote-like').classList.toggle('active', currentVote === 'like');
        document.getElementById('vote-dislike').classList.toggle('active', currentVote === 'dislike');
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } catch (e) {
        console.error(e);
        showToast('Ошибка голосования');
    }
}

const voteLikeBtn = document.getElementById('vote-like');
if (voteLikeBtn) voteLikeBtn.addEventListener('click', () => sendVote('like'));

const voteDislikeBtn = document.getElementById('vote-dislike');
if (voteDislikeBtn) voteDislikeBtn.addEventListener('click', () => sendVote('dislike'));


// ============ ОТКРЫТИЕ ЧУЖОГО ПРОФИЛЯ (полноценный экран) ============
async function openUserProfile(userId) {
    try {
        // Загружаем данные игрока
        const player = await apiGet('/api/user/' + userId);
        if (!player) {
            showToast('Игрок не найден');
            return;
        }

        // Заполняем все u-* элементы
        renderUserProfile(player);

        // Прячем все вкладки и показываем tab-user
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const userTab = document.getElementById('tab-user');
        if (userTab) userTab.classList.add('active');

        // Убираем active со всех кнопок таббара
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        // Активируем режим user-view
        document.body.classList.add('user-view');

        // Telegram BackButton
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.BackButton) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(closeUserProfile);
        }

        // Скролл вверх
        window.scrollTo(0, 0);

        // Загружаем достижения
        if (typeof loadAndRenderAchievements === 'function') {
            loadAndRenderAchievements(userId, 'u-');
        }

        // Загружаем матчи
        if (player.matches && typeof renderMatches === 'function') {
            // renderMatches работает с id="matches-list", для чужого — отдельная
            renderUserMatches(player.matches);
        }

        // Рисуем график ELO
        if (typeof renderChart === 'function') {
            // Свой график привязан к canvas chart-elo, для чужого — отдельный canvas
            renderUserChart(player.elo || 0, player.ratingHistory || []);
        }

    } catch (e) {
        console.error('openUserProfile error:', e);
        showToast('Ошибка загрузки профиля');
    }
}

function closeUserProfile() {
    document.body.classList.remove('user-view');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Возвращаемся на вкладку Топ
    const topTab = document.getElementById('tab-top');
    if (topTab) topTab.classList.add('active');
    const topBtn = document.querySelector('.tab-btn[data-tab="top"]');
    if (topBtn) topBtn.classList.add('active');

    // Скрываем Telegram BackButton
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.BackButton) {
        window.Telegram.WebApp.BackButton.hide();
    }
}

function renderUserProfile(p) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    // Аватар
    const avEl = document.getElementById('u-user-avatar');
    if (avEl) {
        if (p.avatar_url) {
            avEl.style.backgroundImage = 'url("' + p.avatar_url + '")';
            avEl.style.backgroundSize = 'cover';
            avEl.style.backgroundPosition = 'center';
            avEl.textContent = '';
            avEl.classList.add('has-photo');
        } else {
            avEl.style.backgroundImage = 'none';
            avEl.classList.remove('has-photo');
            avEl.textContent = (p.nickname || '?').charAt(0).toUpperCase();
        }
    }

    // Ник / ID
    set('u-user-name', p.nickname || '—');
    set('u-user-id', 'ID: ' + (p.player_id || '—'));

    // Badge
    const badge = document.getElementById('u-user-badge');
    if (badge) {
        if (p.is_admin) {
            badge.innerHTML = (typeof verifySvg === 'function') ? verifySvg('gold') : '👑';
            badge.className = 'user-badge admin-svg';
        } else {
            badge.innerHTML = '<span style="display:inline-flex;width:14px;height:14px;">' + (P_ICONS.gamepad || '') + '</span> Игрок';
            badge.className = 'user-badge player';
        }
    }

    // ELO + уровень
    set('u-elo-value', p.elo || 0);
    set('u-lvl-num', p.level || 1);
    set('u-lvl-num-text', p.level || 1);

    // Гексагон уровня
    const diamond = document.querySelector('#tab-user .mini-lvl-diamond');
    if (diamond && typeof levelSvg === 'function') {
        const lvl = Math.min(Math.max(p.level || 1, 1), 10);
        diamond.innerHTML = levelSvg(lvl, 100);
        diamond.setAttribute('data-level', lvl);
    }

    // Прогресс ELO
    const levelStep = 200;
    const current = (p.elo || 0) % levelStep;
    const eloMin = Math.floor((p.elo || 0) / levelStep) * levelStep;
    set('u-elo-min', eloMin);
    const prog = document.getElementById('u-elo-progress');
    if (prog) prog.style.width = ((current / levelStep) * 100) + '%';
    set('u-progress-label', (p.level >= 10) ? 'Максимум' : ((levelStep - current) + ' ELO до следующего'));

    // Статистика
    set('u-stat-win', p.wins || 0);
    set('u-stat-lose', p.losses || 0);
    set('u-stat-kd', (p.kd || 0).toFixed(2));
    set('u-stat-avg', '0.0');
    set('u-stat-game', p.matches_count || 0);
    set('u-stat-wr', (p.winrate || 0) + '%');
    set('u-likes-count', p.likes || 0);
    set('u-pop-count', (p.likes || 0) - (p.dislikes || 0));

    // Баннер
    const card = document.querySelector('#tab-user .user-card');
    if (card && p.banner_url) {
        const fullBannerUrl = (typeof API_URL !== 'undefined' ? API_URL : '') + p.banner_url;
        card.style.setProperty('--banner-url', 'url("' + fullBannerUrl + '")');
        card.classList.add('has-banner');
    } else if (card) {
        card.classList.remove('has-banner');
        card.style.removeProperty('--banner-url');
    }

    // КРИТИЧНО: снять is-loading, чтобы показать данные
    if (card) card.classList.remove('is-loading');

    // Заголовок графика ELO
    const chartElo = document.getElementById('u-chart-elo');
    if (chartElo) chartElo.textContent = p.elo || 0;
}

function renderUserMatches(matches) {
    const container = document.getElementById('u-matches-list');
    if (!container) return;
    if (!matches || !matches.length) {
        container.innerHTML = '<div class="map-empty">Матчей нет</div>';
        return;
    }
    container.innerHTML = '';
    matches.forEach(m => {
        const eloChange = m.elo_change || 0;
        const eloText = (eloChange >= 0 ? '+' : '') + eloChange;
        const result = m.result === 'win' ? 'Победа' : 'Поражение';
        const item = document.createElement('div');
        item.className = 'match-row ' + (m.result || '');
        item.innerHTML =
            '<div class="match-row-left">' +
                '<div class="match-row-result ' + (m.result || '') + '">' + result + '</div>' +
                '<div class="match-row-map">' + (m.map || '—') + ' · ' + (m.mode || '—') + '</div>' +
                '<div class="match-row-score">' + (m.score || '0:0') + '</div>' +
            '</div>' +
            '<div class="match-row-right">' +
                '<div class="match-elo-change ' + (m.result || '') + '">' + eloText + ' ELO</div>' +
                '<div class="match-row-date">' + (m.date || '') + '</div>' +
            '</div>';
        item.addEventListener('click', () => openMatchModal(m.match_id));
        container.appendChild(item);
    });
}

function renderUserChart(currentElo, history) {
    const canvas = document.getElementById('u-ratingChart');
    if (!canvas || typeof Chart === 'undefined') return;
    // Уничтожаем старый
    if (canvas._chart) canvas._chart.destroy();
    const ctx = canvas.getContext('2d');
    canvas._chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map((_, i) => i + 1),
            datasets: [{
                data: history.map(h => h.elo || 0),
                borderColor: 'rgb(192,132,252)',
                backgroundColor: 'rgba(192,132,252,0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

// Кнопка "Назад" в кастомном хедере
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('user-back-btn');
    if (backBtn) backBtn.addEventListener('click', closeUserProfile);
});
