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
        const clanTag = player.clan_tag ? '<span class="top-clan-tag">[' + player.clan_tag + ']</span>' : '';

        item.innerHTML =
            '<div class="top-rank">' + medal + '</div>' +
            '<div class="top-avatar" ' + avatarStyle + '>' + avatarText + '</div>' +
            '<div class="top-info">' +
                '<div class="top-nick"><span class="top-nick-name">' + player.nick + '</span>' + clanTag + '</div>' +
                '<div class="top-sub">' + player.wins + ' побед</div>' +
            '</div>' +
            '<div class="top-elo">' + player.elo + '</div>';

        item.addEventListener('click', () => openModal(player.user_id));
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

        document.getElementById('modal-name').textContent = player.nickname;
        document.getElementById('modal-game-id').textContent = 'ID: ' + player.player_id;

        const clanEl = document.getElementById('modal-clan');
        if (clanEl) {
            try {
                const cr = await apiGet('/api/clan/by_user?tg_id=' + userId);
                if (cr.clan) {
                    clanEl.className = 'modal-clan member';
                    clanEl.innerHTML = '🛡 [' + escapeHtml(cr.clan.tag) + '] ' + escapeHtml(cr.clan.name);
                    clanEl.onclick = () => {
                        if (typeof viewClan === 'function') {
                            switchTab('clan');
                            setTimeout(() => viewClan(cr.clan.clan_id), 100);
                        }
                    };
                } else {
                    clanEl.className = 'modal-clan free';
                    clanEl.textContent = '🏳 Свободный агент';
                    clanEl.onclick = null;
                }
            } catch (e) {
                clanEl.className = 'modal-clan free';
                clanEl.textContent = '🏳 Свободный агент';
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

        // Кнопка "Написать"
        const writeBtn = document.getElementById('modal-write-btn');
        if (writeBtn) {
            if (Number(userId) === Number(tgUser.id)) {
                writeBtn.style.display = 'none';
            } else {
                writeBtn.style.display = 'block';
                writeBtn.onclick = () => {
                    if (typeof openPrivateChat === 'function') openPrivateChat(userId);
                };
            }
        }

        modalOverlay.classList.add('active');
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка профиля');
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
        showToast('⚠ Нельзя голосовать за себя');
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
        showToast('⚠ Ошибка голосования');
    }
}

const voteLikeBtn = document.getElementById('vote-like');
if (voteLikeBtn) voteLikeBtn.addEventListener('click', () => sendVote('like'));

const voteDislikeBtn = document.getElementById('vote-dislike');
if (voteDislikeBtn) voteDislikeBtn.addEventListener('click', () => sendVote('dislike'));
