
// ==== РЕНДЕР БЕЙДЖЕЙ (ТЕГОВ) ====
function renderTopBadges(tags) {
    if (!tags || !tags.length) return '';
    return '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">' +
        tags.map(t => {
            const bg = t.bg_color || 'rgba(168,85,247,0.2)';
            const color = t.text_color || t.color || '#fff';
            const border = t.border_color || t.color || 'rgba(255,255,255,0.2)';
            return `<span style="display:inline-flex;align-items:center;gap:2px;padding:2px 6px;border-radius:6px;font-size:9px;font-weight:800;background:${bg};color:${color};border:1px solid ${border};white-space:nowrap;">${t.name || ''}</span>`;
        }).join('') +
    '</div>';
}

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
// ================== ГЕКСАГОН УРОВНЯ (для топа) ==================
function levelColor(level) {
    if (level >= 10) return '#ef4444';      // красный (элита)
    if (level >= 8) return '#ffd700';       // золото
    if (level >= 6) return '#c084fc';       // фиолет (epic)
    if (level >= 4) return '#5fa8d3';       // голубой (rare)
    return '#b8b8b8';                        // серый (common)
}

function levelHexSvg(level, size) {
    const s = size || 44;
    const color = levelColor(level);
    const id = 'lh' + Math.random().toString(36).slice(2, 7);
    return '<svg viewBox="0 0 64 64" style="width:' + s + 'px;height:' + s + 'px;display:block;filter:drop-shadow(0 0 6px ' + color + '55);">' +
        '<defs>' +
            '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0%" stop-color="#1a1025"/>' +
                '<stop offset="100%" stop-color="#0f0618"/>' +
            '</linearGradient>' +
        '</defs>' +
        // Внешний гексагон (обводка)
        '<path d="M32 2 L58 17 L58 47 L32 62 L6 47 L6 17 Z" fill="' + color + '" opacity="0.9"/>' +
        // Внутренний (фон)
        '<path d="M32 7 L53 19 L53 45 L32 57 L11 45 L11 19 Z" fill="url(#' + id + ')"/>' +
        // Тонкая внутренняя обводка
        '<path d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z" fill="none" stroke="' + color + '" stroke-width="0.6" opacity="0.5"/>' +
        // Цифра
        '<text x="32" y="39" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff">' + level + '</text>' +
    '</svg>';
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
    const podiumEl = document.getElementById('top-podium');
    const listEl = document.getElementById('top-list');
    if (!podiumEl || !listEl) return;

    const q = filter.trim().toLowerCase();
    const filtered = q ? topCache.filter(p => p.nick.toLowerCase().includes(q)) : topCache;

    if (filtered.length === 0) {
        podiumEl.innerHTML = '';
        listEl.innerHTML = '<div class="map-empty">Никого не найдено</div>';
        return;
    }

    // ==== ПОДИУМ (топ-3) ====
    const top3 = filtered.slice(0, 3);
    if (top3.length > 0) {
        const order = [];
        if (top3[1]) order.push({ player: top3[1], rank: 2 });
        if (top3[0]) order.push({ player: top3[0], rank: 1 });
        if (top3[2]) order.push({ player: top3[2], rank: 3 });

        podiumEl.innerHTML = order.map(({player, rank}) => {
            const level = levelFromElo(player.elo);
            const avatarStyle = player.avatar ? `background-image:url('${player.avatar}')` : '';
            const avatarText = player.avatar ? '' : player.nick.charAt(0).toUpperCase();
            const btype = player.banner_custom_type;
            const bannerUrl = player.banner_url ? API_URL + player.banner_url : null;

            let bannerHtml = '';
            if (bannerUrl && (btype === 'webm' || btype === 'mp4')) {
                bannerHtml = `<video class="podium-video-bg" src="${bannerUrl}" autoplay loop muted playsinline></video>`;
            } else if (bannerUrl && btype === 'gif') {
                bannerHtml = `<img class="podium-video-bg" src="${bannerUrl}" alt="">`;
            } else if (bannerUrl) {
                bannerHtml = `<div class="podium-video-bg" style="background-image:url('${bannerUrl}');background-size:cover;background-position:center;"></div>`;
            }

            const clanTag = player.clan_tag ? `<span class="podium-clan">[${player.clan_tag}]</span> ` : '';
            const verified = player.is_verified ? verifySvg('gold') : '';
            const crown = rank === 1 ? '<div class="podium-crown"><svg viewBox="0 0 24 24" fill="#ffd700" stroke="#b8860b" stroke-width="1" stroke-linejoin="round" style="width:32px;height:32px;"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg></div>' : '';

            return `
                <div class="podium-card rank-${rank}" data-user-id="${player.user_id}">
                    ${bannerHtml}
                    <div class="podium-gradient"></div>
                    ${crown}
                    <div class="podium-avatar-wrap">
                        <div class="podium-avatar" style="${avatarStyle}">${avatarText}</div>
                        ${player.avatar_frame ? `<img src="${API_URL}/api/frame_file/${player.avatar_frame}" style="position:absolute;top:-17.5%;left:-17.5%;width:135%;height:135%;pointer-events:none;z-index:10;object-fit:contain;">` : ''}
                        <div class="podium-level" style="position:absolute;bottom:-6px;right:-6px;z-index:20;">${levelHexSvg(level, 28)}</div>
                    </div>
                    <div class="podium-info">
                        <div class="podium-nick">${clanTag}${player.nick} ${verified}</div>
                        <div class="podium-elo">${player.elo}</div>
                        ${renderTopBadges(player.tags)}
                    </div>
                    <div class="podium-rank-num">${rank}</div>
                </div>
            `;
        }).join('');

        podiumEl.querySelectorAll('.podium-card').forEach(card => {
            card.addEventListener('click', () => {
                if (window.haptic) window.haptic('light');
                openUserProfile(Number(card.dataset.userId));
            });
        });
    }

    // ==== СПИСОК 4+ ====
    const rest = filtered.slice(3);
    if (rest.length === 0) { listEl.innerHTML = ''; return; }

    listEl.innerHTML = rest.map((player, i) => {
        const rank = i + 4;
        const level = levelFromElo(player.elo);
        const avatarStyle = player.avatar ? `background-image:url('${player.avatar}')` : '';
        const avatarText = player.avatar ? '' : player.nick.charAt(0).toUpperCase();
        const clanTag = player.clan_tag ? `<span class="row-clan">[${player.clan_tag}]</span> ` : '';
        const verified = player.is_verified ? verifySvg('gold') : '';
        const totalMatches = (player.wins || 0) + (player.losses || 0);
        const winPct = totalMatches > 0 ? Math.round((player.wins || 0) * 100 / totalMatches) : 100;
        const statLine = `${totalMatches || player.wins} матчей · ${winPct}% побед`;

        // Баннер
        const btype = player.banner_custom_type;
        const bannerUrl = player.banner_url ? API_URL + player.banner_url : null;
        let bannerHtml = '';
        if (bannerUrl && (btype === 'webm' || btype === 'mp4')) {
            bannerHtml = `<video class="row-video-bg" src="${bannerUrl}" autoplay loop muted playsinline></video>`;
        } else if (bannerUrl && btype === 'gif') {
            bannerHtml = `<img class="row-video-bg" src="${bannerUrl}" alt="">`;
        } else if (bannerUrl) {
            bannerHtml = `<div class="row-video-bg" style="background-image:url('${bannerUrl}');background-size:cover;background-position:center;"></div>`;
        }

        return `
            <div class="row-item" data-user-id="${player.user_id}">
                ${bannerHtml}
                <div class="row-gradient"></div>
                <div class="row-rank">${rank}</div>
                <div class="row-avatar-wrap">
                    <div class="row-avatar" style="${avatarStyle}">${avatarText}</div>
                    ${player.avatar_frame ? `<img src="${API_URL}/api/frame_file/${player.avatar_frame}" style="position:absolute;top:-17.5%;left:-17.5%;width:135%;height:135%;pointer-events:none;z-index:10;object-fit:contain;">` : ''}
                    <div class="row-level" style="position:absolute;bottom:-4px;right:-4px;z-index:20;">${levelHexSvg(level, 24)}</div>
                </div>
                <div class="row-info">
                    <div class="row-nick">${clanTag}${player.nick} ${verified}</div>
                    <div class="row-sub">${statLine}</div>
                    ${renderTopBadges(player.tags)}
                </div>
                <div class="row-elo">${player.elo}</div>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.row-item').forEach(row => {
        row.addEventListener('click', () => {
            if (window.haptic) window.haptic('light');
            openUserProfile(Number(row.dataset.userId));
        });
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
            nameEl.innerHTML = escapeHtml(player.nickname) + ' ' + verifySvg('gold');
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

    // Статистика — Winrate / K/D
    const wr = Number(p.winrate) || 0;
    const kd = Number(p.kd) || 0;
    const games = Number(p.matches_count) || 0;
    const wins = Number(p.wins) || 0;
    const losses = Number(p.losses) || 0;

    set('u-stat-game', games);
    set('u-stat-win', wins);
    set('u-stat-lose', losses);
    set('u-stat-wr', wr.toFixed(1) + '%');
    set('u-stat-kd', kd.toFixed(2));

    // Winrate bar + подпись
    const wrBar = document.getElementById('u-stat-wr-bar');
    if (wrBar) wrBar.style.width = Math.min(wr, 100) + '%';
    const wrSub = document.getElementById('u-stat-wr-sub');
    if (wrSub) {
        if (wr < 30) { wrSub.textContent = 'Низкий'; wrSub.className = 'all-stat-sub low'; }
        else if (wr < 60) { wrSub.textContent = 'Средний'; wrSub.className = 'all-stat-sub mid'; }
        else { wrSub.textContent = 'Высокий'; wrSub.className = 'all-stat-sub high'; }
    }

    // K/D bar + подпись
    const kdBar = document.getElementById('u-stat-kd-bar');
    if (kdBar) kdBar.style.width = Math.min((kd / 2.5) * 100, 100) + '%';
    const kdSub = document.getElementById('u-stat-kd-sub');
    if (kdSub) {
        if (kd < 1.0) { kdSub.textContent = 'Низкий'; kdSub.className = 'all-stat-sub low'; }
        else if (kd < 2.0) { kdSub.textContent = 'Средний'; kdSub.className = 'all-stat-sub mid'; }
        else { kdSub.textContent = 'Высокий'; kdSub.className = 'all-stat-sub high'; }
    }
    set('u-likes-count', p.likes || 0);
    set('u-pop-count', (p.likes || 0) - (p.dislikes || 0));

    // Иконки для карточек "Оценка" и "Популярность"
    if (typeof P_ICONS !== 'undefined') {
        const uLikesEl = document.getElementById('u-likes-count');
        if (uLikesEl && uLikesEl.parentElement) {
            const ic = uLikesEl.parentElement.querySelector('.mini-icon');
            if (ic) ic.innerHTML = '<span style="display:inline-flex;width:26px;height:26px;color:#c084fc;filter:drop-shadow(0 0 6px rgba(192,132,252,0.6));">' + P_ICONS.thumbUp + '</span>';
        }
        const uPopEl = document.getElementById('u-pop-count');
        if (uPopEl && uPopEl.parentElement) {
            const ic = uPopEl.parentElement.querySelector('.mini-icon');
            if (ic) ic.innerHTML = '<span style="display:inline-flex;width:26px;height:26px;color:#c084fc;filter:drop-shadow(0 0 6px rgba(192,132,252,0.6));">' + P_ICONS.fire + '</span>';
        }
    }

    // Клан
    const uClanEl = document.getElementById('u-user-clan');
    if (uClanEl) {
        if (p.clan && p.clan.tag) {
            uClanEl.innerHTML = '<span class="clan-badge-u">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;vertical-align:-1px;margin-right:4px;"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>' +
                '[' + (p.clan.tag || '') + '] ' + (p.clan.name || '') +
                '</span>';
            uClanEl.style.display = 'block';
        } else {
            uClanEl.innerHTML = '';
            uClanEl.style.display = 'none';
        }
    }
    // Кнопки голосования
    const uVoteLikes = document.getElementById('u-vote-likes');
    if (uVoteLikes) uVoteLikes.textContent = p.likes || 0;
    const uVoteDislikes = document.getElementById('u-vote-dislikes');
    if (uVoteDislikes) uVoteDislikes.textContent = p.dislikes || 0;
    // Запоминаем id для голосования
    window._uProfileUserId = p.user_id;

    // Баннер (с поддержкой видео/gif) — в карточке + в фоне tab-user
    const card = document.querySelector('#tab-user .user-card');
    const bgEl = document.getElementById('u-profile-bg');
    
    if (bgEl) bgEl.querySelectorAll('video, img').forEach(el => el.remove());
    if (card) card.querySelectorAll('.u-banner-video').forEach(el => el.remove());
    
    if (card) {
        if (p.banner_url) {
            const fullBannerUrl = (typeof API_URL !== 'undefined' ? API_URL : '') + p.banner_url;
            const btype = p.banner_custom_type;
            
            if (btype === 'webm' || btype === 'mp4') {
                card.classList.remove('has-banner');
                card.style.removeProperty('--banner-url');
                const video = document.createElement('video');
                video.className = 'u-banner-video';
                video.src = fullBannerUrl;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.setAttribute('playsinline', '');
                card.insertBefore(video, card.firstChild);
            } else if (btype === 'gif') {
                card.classList.remove('has-banner');
                card.style.removeProperty('--banner-url');
                const img = document.createElement('img');
                img.className = 'u-banner-video';
                img.src = fullBannerUrl;
                img.alt = '';
                card.insertBefore(img, card.firstChild);
            } else {
                card.style.setProperty('--banner-url', 'url("' + fullBannerUrl + '")');
                card.classList.add('has-banner');
            }
        } else {
            card.classList.remove('has-banner');
            card.style.removeProperty('--banner-url');
        }
    }

    // Дублируем видео в фоне tab-user
    if (bgEl && p.banner_url) {
        const fullBannerUrl = (typeof API_URL !== 'undefined' ? API_URL : '') + p.banner_url;
        const btype = p.banner_custom_type;
        if (btype === 'webm' || btype === 'mp4') {
            const v = document.createElement('video');
            v.src = fullBannerUrl;
            v.autoplay = true;
            v.loop = true;
            v.muted = true;
            v.playsInline = true;
            v.setAttribute('playsinline', '');
            bgEl.appendChild(v);
        } else if (btype === 'gif') {
            const i = document.createElement('img');
            i.src = fullBannerUrl;
            bgEl.appendChild(i);
        } else {
            bgEl.style.backgroundImage = 'url(' + fullBannerUrl + ')';
            bgEl.style.backgroundSize = 'cover';
            bgEl.style.backgroundPosition = 'center';
        }
    }

    // КРИТИЧНО: снять is-loading, чтобы показать данные
    if (card) card.classList.remove('is-loading');

    // Теги игрока
    if (typeof window.loadUserTags === 'function') {
        window.loadUserTags(p.user_id, 'u-user-tags-row');
    }

    // Профильный трек (с задержкой)
    [0, 500, 2000].forEach(delay => {
        setTimeout(() => {
            if (typeof window.renderProfileMusic === 'function') {
                window.renderProfileMusic(p.user_id, 'u-profile-music-container', true);
            }
        }, delay);
    });

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
    if (!history || history.length < 1) {
        console.log('[CHART] нет данных');
        return;
    }
    // Нормализуем: принимаем {value} или {elo}
    const values = history.map(h => (h && (h.value !== undefined ? h.value : h.elo)) || 0);
    if (canvas._chart) { try { canvas._chart.destroy(); } catch(e){} }
    const ctx = canvas.getContext('2d');
    canvas._chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.map((_, i) => i + 1),
            datasets: [{
                data: values,
                borderColor: 'rgb(192,132,252)',
                backgroundColor: 'rgba(192,132,252,0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: values.length === 1 ? 6 : 2
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


// ============ ГОЛОСОВАНИЕ В ЧУЖОМ ПРОФИЛЕ ============
async function _uSendVote(voteType) {
    const targetId = window._uProfileUserId;
    if (!targetId) { showToast('Ошибка: не выбран игрок'); return; }
    if (!tgUser || !tgUser.id) { showToast('Открой в Telegram'); return; }
    if (Number(tgUser.id) === Number(targetId)) { showToast('Нельзя голосовать за себя'); return; }
    try {
        const res = await apiPost('/api/vote', { voter_id: tgUser.id, target_id: targetId, vote: voteType });
        if (res && res.ok !== false) {
            showToast(voteType === 'like' ? '👍 Лайк' : '👎 Дизлайк');
            // Обновить профиль
            const player = await apiGet('/api/user/' + targetId);
            if (player) {
                const l = document.getElementById('u-vote-likes');
                if (l) l.textContent = player.likes || 0;
                const d = document.getElementById('u-vote-dislikes');
                if (d) d.textContent = player.dislikes || 0;
            }
        } else {
            showToast('Ошибка голосования');
        }
    } catch (e) {
        console.error('vote error:', e);
        showToast('Ошибка: ' + (e.message || e));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const likeBtn = document.getElementById('u-vote-like');
        if (likeBtn && !likeBtn._bound) {
            likeBtn._bound = true;
            likeBtn.addEventListener('click', () => _uSendVote('like'));
        }
        const disBtn = document.getElementById('u-vote-dislike');
        if (disBtn && !disBtn._bound) {
            disBtn._bound = true;
            disBtn.addEventListener('click', () => _uSendVote('dislike'));
        }
    }, 1000);
});
