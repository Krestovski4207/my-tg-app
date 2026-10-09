// ==== Telegram WebApp ====
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0618');
    tg.setBackgroundColor('#0f0618');
}

const ADMIN_ID = 6999358439;
const API_URL = "https://pole-innovation-zum-prospects.trycloudflare.com";
const API_KEY = "lumafaceit_secret_e8jd90jd19dd7dk";

async function apiGet(path) {
    const r = await fetch(API_URL + path);
    if (!r.ok) throw new Error("API error " + r.status);
    return r.json();
}

async function apiPost(path, body) {
    const r = await fetch(API_URL + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        },
        body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error("API error " + r.status);
    return r.json();
}

let tgUser = null;
if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    tgUser = tg.initDataUnsafe.user;
}

const isAdmin = tgUser !== null && Number(tgUser.id) === ADMIN_ID;
console.log('TG USER:', tgUser, 'IS ADMIN:', isAdmin);

// ==== ВКЛАДКИ ====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
    });
});

// ==== ПРОФИЛЬ ====
async function loadProfile() {
    if (!tgUser) return;
    try {
        const p = await apiGet('/api/profile?tg_id=' + tgUser.id);
        renderProfile(p);
    } catch (e) {
        console.error('Ошибка профиля:', e);
        showToast('⚠ Ошибка загрузки профиля');
    }
}

function renderProfile(p) {
    const avatarEl = document.getElementById('user-avatar');
    if (p.avatar_url) {
        avatarEl.style.backgroundImage = `url(${p.avatar_url})`;
        avatarEl.textContent = '';
    } else {
        avatarEl.textContent = (p.nickname || '?').charAt(0).toUpperCase();
    }

    document.getElementById('user-name').textContent = p.nickname || '—';
    document.getElementById('user-id').textContent = 'ID: ' + p.player_id;

    const badge = document.getElementById('user-badge');
    badge.style.display = isAdmin ? '' : 'none';

    document.getElementById('lvl-num').textContent = p.level || 1;
    document.getElementById('elo-value').textContent = p.elo || 0;

    const levelStep = 200;
    const current = (p.elo || 0) % levelStep;
    const progress = (current / levelStep) * 100;
    document.getElementById('elo-progress').style.width = progress + '%';
    document.getElementById('progress-label').textContent =
        `${levelStep - current} ELO до следующего уровня`;

    document.getElementById('stat-win').textContent = p.wins || 0;
    document.getElementById('stat-lose').textContent = p.losses || 0;
    document.getElementById('stat-kd').textContent = (p.kd || 0).toFixed(2);
    document.getElementById('stat-avg').textContent = '0.0';
    document.getElementById('stat-game').textContent = p.matches_count || 0;
    document.getElementById('stat-wr').textContent = (p.winrate || 0) + '%';
    document.getElementById('likes-count').textContent = p.likes || 0;
    document.getElementById('pop-count').textContent = (p.likes || 0) - (p.dislikes || 0);

    renderChart(p.elo || 0, p.ratingHistory || []);
    renderMatches(p.matches || []);
}

// ==== ГРАФИК ====
let chartInstance = null;
function renderChart(currentElo, history) {
    document.getElementById('chart-elo').textContent = currentElo;
    if (!history || history.length === 0) history = [{ date: 'now', value: currentElo }];

    const first = history[0]?.value || currentElo;
    const last = history[history.length - 1]?.value || currentElo;
    const delta = last - first;

    const deltaEl = document.getElementById('chart-delta');
    deltaEl.textContent = (delta >= 0 ? '+' : '') + delta;
    deltaEl.style.color = delta >= 0 ? '#22ff88' : '#ff4d5e';

    const ctx = document.getElementById('ratingChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 140);
    gradient.addColorStop(0, 'rgba(34, 255, 136, 0.35)');
    gradient.addColorStop(1, 'rgba(34, 255, 136, 0)');

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [{
                data: history.map(h => h.value),
                borderColor: '#22ff88',
                backgroundColor: gradient,
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#5a5276', font: { size: 10 } } },
                y: { grid: { color: 'rgba(168, 85, 247, 0.08)' }, ticks: { color: '#5a5276', font: { size: 10 } } }
            }
        }
    });
}

// ==== МАТЧИ ====
function renderMatches(matches) {
    const container = document.getElementById('matches-list');
    container.innerHTML = '';
    if (matches.length === 0) {
        container.innerHTML = '<div class="map-empty">Нет матчей</div>';
        return;
    }
    matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'match-item';
        item.innerHTML = `
            <div class="match-preview">${m.icon || '🎯'}</div>
            <div class="match-info">
                <div class="match-result ${m.result}">
                    <span class="match-result-dot"></span>
                    <span>${m.result === 'win' ? 'Победа' : 'Поражение'}</span>
                </div>
                <div class="match-map">${m.map}</div>
            </div>
            <div class="match-score ${m.result}">${m.score}</div>
        `;
        container.appendChild(item);
    });
}

document.getElementById('all-matches-btn').addEventListener('click', () => {
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
});

// ==== ТОП ====
let topCache = [];

async function loadTop(filter = '') {
    try {
        const top = await apiGet('/api/top?limit=50');
        topCache = top;
        renderTop(filter);
    } catch (e) {
        console.error('Ошибка топа:', e);
        document.getElementById('top-list').innerHTML =
            '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function renderTop(filter = '') {
    const container = document.getElementById('top-list');
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
        item.className = `top-item rank-${rank <= 3 ? rank : 'rest'}`;

        let medal = rank;
        if (rank === 1) medal = '🥇';
        if (rank === 2) medal = '🥈';
        if (rank === 3) medal = '🥉';

        item.innerHTML = `
            <div class="top-rank">${medal}</div>
            <div class="top-avatar">${player.nick.charAt(0).toUpperCase()}</div>
            <div class="top-info">
                <div class="top-nick">${player.nick}</div>
                <div class="top-sub">${player.wins} побед</div>
            </div>
            <div class="top-elo">${player.elo}</div>
        `;

        item.addEventListener('click', () => openModal(player.user_id));
        container.appendChild(item);
    });
}

document.getElementById('search-input').addEventListener('input', (e) => {
    renderTop(e.target.value);
});

// ==== МОДАЛКА ====
const modalOverlay = document.getElementById('modal-overlay');
let currentTargetId = null;
let currentVote = null;

async function openModal(userId) {
    try {
        const player = await apiGet('/api/profile?tg_id=' + userId);
        currentTargetId = userId;

        document.getElementById('modal-avatar').textContent = (player.nickname || '?').charAt(0).toUpperCase();
        document.getElementById('modal-name').textContent = player.nickname;
        document.getElementById('modal-game-id').textContent = 'ID: ' + player.player_id;
        document.getElementById('modal-elo').textContent = player.elo;
        document.getElementById('modal-win').textContent = player.wins || 0;
        document.getElementById('modal-lose').textContent = player.losses || 0;
        document.getElementById('modal-kd').textContent = (player.kd || 0).toFixed(2);
        document.getElementById('modal-wr').textContent = (player.winrate || 0) + '%';
        document.getElementById('vote-likes').textContent = player.likes || 0;
        document.getElementById('vote-dislikes').textContent = player.dislikes || 0;

        // Проверка: голосовал ли ты уже? (упрощённо — сбрасываем)
        currentVote = null;
        document.getElementById('vote-like').classList.remove('active');
        document.getElementById('vote-dislike').classList.remove('active');

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

document.getElementById('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ==== ЛАЙК / ДИЗЛАЙК ====
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

document.getElementById('vote-like').addEventListener('click', () => sendVote('like'));
document.getElementById('vote-dislike').addEventListener('click', () => sendVote('dislike'));

// ==== ТИКЕТЫ ====
const topicChips = document.querySelectorAll('#ticket-topic-chips .chip');
const topicInput = document.getElementById('topic-input');
const ticketMessage = document.getElementById('ticket-message');
const ticketSubmit = document.getElementById('ticket-submit');
const charCounter = document.getElementById('char-counter');

topicChips.forEach(chip => {
    chip.addEventListener('click', () => {
        topicChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        topicInput.value = chip.dataset.value;
        validateTicket();
        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
    });
});

ticketMessage.addEventListener('input', () => {
    charCounter.textContent = `${ticketMessage.value.length} / 800`;
    validateTicket();
});

function validateTicket() {
    const ok = topicInput.value && ticketMessage.value.trim().length >= 10;
    ticketSubmit.disabled = !ok;
}

document.getElementById('ticket-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!tgUser) {
        showToast('⚠ Открой через Telegram');
        return;
    }

    ticketSubmit.disabled = true;
    ticketSubmit.textContent = '⏳ Отправка...';

    try {
        await apiPost('/api/ticket', {
            user_id: tgUser.id,
            username: tgUser.username || '',
            first_name: tgUser.first_name || '',
            topic: topicInput.value,
            message: ticketMessage.value.trim()
        });

        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        showToast('✅ Тикет отправлен');

        topicChips.forEach(c => c.classList.remove('active'));
        topicInput.value = '';
        ticketMessage.value = '';
        charCounter.textContent = '0 / 800';
        validateTicket();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка отправки');
    } finally {
        ticketSubmit.textContent = '📨 Отправить обращение';
        validateTicket();
    }
});

// ==== ТОСТ ====
let toastTimeout;
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==== СТАРТ ====
loadProfile();
loadTop();
