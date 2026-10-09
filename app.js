// ==== Telegram WebApp ====
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0618');
    tg.setBackgroundColor('#0f0618');
}

// ==== ID администратора ====
const ADMIN_ID = 6999358439;

// ==== Достаём пользователя ====
let tgUser = null;
if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    tgUser = tg.initDataUnsafe.user;
}

// ==== Явная проверка админа ====
const isAdmin = tgUser !== null && Number(tgUser.id) === ADMIN_ID;

console.log('TG USER:', tgUser);
console.log('IS ADMIN:', isAdmin, '(expected:', ADMIN_ID + ')');

// ==== ЗАГЛУШКИ ====
const MOCK = {
    name: tgUser?.first_name || 'Гость',
    avatar: tgUser?.photo_url || null,
    userId: tgUser?.id || '—',
    isAdmin: isAdmin,
    level: 3,
    elo: 300,
    eloNextLevel: 400,
    eloPrevLevel: 200,
    win: 5,
    lose: 6,
    kd: 0.00,
    avg: 0.0,
    game: 11,
    likes: 0,
    popularity: 0,
    ratingHistory: [
        { date: '25 Sep', value: 280 },
        { date: '26 Sep', value: 290 },
        { date: '27 Sep', value: 285 },
        { date: '28 Sep', value: 295 },
        { date: '29 Sep', value: 300 },
        { date: '30 Sep', value: 298 },
        { date: '1 Oct',  value: 300 }
    ],
    matches: [
        { result: 'win',  map: 'Province', score: '13:8',  icon: '🏔' },
        { result: 'lose', map: 'Rust',     score: '7:13',  icon: '🏭' },
        { result: 'win',  map: 'Sandstone', score: '13:10', icon: '🏜' }
    ],
    lobbies: [
        { mode: '5x5', map: 'Sandstone', author: 'Destro', slots: '7/10' },
        { mode: '3x3', map: 'Province',  author: 'ShadowStrike', slots: '4/6' },
        { mode: '1x1', map: 'Rust',      author: 'PhantomX', slots: '1/2' }
    ]
};

const PLAYERS = {
    'ShadowStrike': { gameId: 100234, elo: 2187, win: 156, lose: 42, kd: 1.85, likes: 234, dislikes: 12 },
    'PhantomX':     { gameId: 100235, elo: 2043, win: 142, lose: 38, kd: 1.72, likes: 187, dislikes: 8 },
    'NeonBlade':    { gameId: 100236, elo: 1988, win: 130, lose: 45, kd: 1.61, likes: 156, dislikes: 15 },
    'VioletStorm':  { gameId: 100237, elo: 1876, win: 118, lose: 52, kd: 1.54, likes: 132, dislikes: 20 },
    'DarkPulse':    { gameId: 100238, elo: 1754, win: 105, lose: 60, kd: 1.42, likes: 98,  dislikes: 18 },
    'AceHunter':    { gameId: 100239, elo: 1689, win: 98,  lose: 55, kd: 1.35, likes: 87,  dislikes: 14 },
    'ZenithWolf':   { gameId: 100240, elo: 1543, win: 87,  lose: 62, kd: 1.28, likes: 65,  dislikes: 22 },
    'CrystalFang':  { gameId: 100241, elo: 1421, win: 76,  lose: 58, kd: 1.15, likes: 54,  dislikes: 19 },
    'NightRaven':   { gameId: 100242, elo: 1367, win: 68,  lose: 55, kd: 1.05, likes: 43,  dislikes: 25 },
    'IronViper':    { gameId: 100243, elo: 1245, win: 55,  lose: 48, kd: 0.95, likes: 32,  dislikes: 21 }
};

const MOCK_TOP = [
    { nick: 'ShadowStrike', elo: 2187, wins: 156 },
    { nick: 'PhantomX',     elo: 2043, wins: 142 },
    { nick: 'NeonBlade',    elo: 1988, wins: 130 },
    { nick: 'VioletStorm',  elo: 1876, wins: 118 },
    { nick: 'DarkPulse',    elo: 1754, wins: 105 },
    { nick: 'AceHunter',    elo: 1689, wins: 98  },
    { nick: 'ZenithWolf',   elo: 1543, wins: 87  },
    { nick: 'CrystalFang',  elo: 1421, wins: 76  },
    { nick: 'NightRaven',   elo: 1367, wins: 68  },
    { nick: 'IronViper',    elo: 1245, wins: 55  }
];

let currentPlayerNick = null;
let currentVote = null;

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

// ==== ЧИПЫ ====
function setupChips(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    if (!container) return;
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            input.value = chip.dataset.value;
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });
}
setupChips('mode-chips', 'mode-input');
setupChips('map-chips', 'map-input');

// ==== USER CARD ====
function renderUser() {
    const avatarEl = document.getElementById('user-avatar');
    if (MOCK.avatar) {
        avatarEl.style.backgroundImage = `url(${MOCK.avatar})`;
        avatarEl.textContent = '';
    } else {
        avatarEl.textContent = MOCK.name.charAt(0).toUpperCase();
    }

    document.getElementById('user-name').textContent = MOCK.name;
    document.getElementById('user-id').textContent = 'ID: ' + MOCK.userId;

    const badge = document.getElementById('user-badge');
    if (MOCK.isAdmin) {
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }

    document.getElementById('lvl-num').textContent = MOCK.level;
    document.getElementById('elo-value').textContent = MOCK.elo;

    const range = MOCK.eloNextLevel - MOCK.eloPrevLevel;
    const progress = ((MOCK.elo - MOCK.eloPrevLevel) / range) * 100;
    document.getElementById('elo-progress').style.width =
        Math.max(0, Math.min(100, progress)) + '%';

    const remaining = MOCK.eloNextLevel - MOCK.elo;
    document.getElementById('progress-label').textContent =
        `${remaining} ELO до следующего уровня`;
}

// ==== СТАТИСТИКА ====
function renderStats() {
    document.getElementById('stat-win').textContent = MOCK.win;
    document.getElementById('stat-lose').textContent = MOCK.lose;
    document.getElementById('stat-kd').textContent = MOCK.kd.toFixed(2);
    document.getElementById('stat-avg').textContent = MOCK.avg.toFixed(1);
    document.getElementById('stat-game').textContent = MOCK.game;

    const total = MOCK.win + MOCK.lose;
    const wr = total > 0 ? Math.round((MOCK.win / total) * 100) : 0;
    document.getElementById('stat-wr').textContent = wr + '%';

    document.getElementById('likes-count').textContent = MOCK.likes;
    document.getElementById('pop-count').textContent = MOCK.popularity;
}

// ==== ГРАФИК ====
let chartInstance = null;
function renderChart() {
    document.getElementById('chart-elo').textContent = MOCK.elo;

    const history = MOCK.ratingHistory;
    const first = history[0]?.value || 0;
    const last = history[history.length - 1]?.value || 0;
    const delta = last - first;

    const deltaEl = document.getElementById('chart-delta');
    deltaEl.textContent = (delta >= 0 ? '+' : '') + delta;
    deltaEl.style.color = delta >= 0 ? '#22ff88' : '#ff4d5e';
    deltaEl.style.background = delta >= 0
        ? 'rgba(34, 255, 136, 0.1)' : 'rgba(255, 77, 94, 0.1)';
    deltaEl.style.borderColor = delta >= 0
        ? 'rgba(34, 255, 136, 0.3)' : 'rgba(255, 77, 94, 0.3)';

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
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#22ff88',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(30, 15, 50, 0.95)',
                    borderColor: 'rgba(34, 255, 136, 0.5)',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#22ff88',
                    padding: 10,
                    displayColors: false,
                    callbacks: { label: (ctx) => `${ctx.parsed.y} ELO` }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: {
                        color: '#5a5276',
                        font: { size: 10, weight: '600' },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 5
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(168, 85, 247, 0.08)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#5a5276',
                        font: { size: 10, weight: '600' },
                        maxTicksLimit: 4
                    }
                }
            }
        }
    });
}

// ==== МАТЧИ ====
function renderMatches() {
    const container = document.getElementById('matches-list');
    container.innerHTML = '';

    MOCK.matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'match-item';
        item.innerHTML = `
            <div class="match-preview">${m.icon}</div>
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
    console.log('Открыть все матчи');
});

// ==== ЛОББИ ====
function renderLobbies() {
    const container = document.getElementById('lobby-list');
    container.innerHTML = '';

    MOCK.lobbies.forEach(l => {
        const item = document.createElement('div');
        item.className = 'lobby-item';
        item.innerHTML = `
            <div class="lobby-mode">${l.mode}</div>
            <div class="lobby-info">
                <div class="lobby-map">${l.map}</div>
                <div class="lobby-author">создал: ${l.author}</div>
            </div>
            <div class="lobby-slots">${l.slots}</div>
        `;
        container.appendChild(item);
    });
}

// ==== ФОРМА ЛОББИ ====
document.getElementById('lobby-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const lobbyData = {
        mode: formData.get('mode'),
        map: formData.get('map')
    };

    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'create_lobby',
            ...lobbyData
        }));
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } else {
        console.log('Лобби:', lobbyData);
        showToast('✅ Лобби создано (тест)');
    }
});

// ==== ТОП ====
function renderTop(filter = '') {
    const container = document.getElementById('top-list');
    container.innerHTML = '';

    const q = filter.trim().toLowerCase();
    const filtered = q
        ? MOCK_TOP.filter(p => p.nick.toLowerCase().includes(q))
        : MOCK_TOP;

    if (filtered.length === 0) {
        container.innerHTML = '<div class="map-empty">Никого не найдено</div>';
        return;
    }

    filtered.forEach((player) => {
        const rank = MOCK_TOP.indexOf(player) + 1;
        const item = document.createElement('div');
        item.className = `top-item rank-${rank <= 3 ? rank : 'rest'}`;
        item.dataset.nick = player.nick;

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

        item.addEventListener('click', () => openModal(player.nick));
        container.appendChild(item);
    });
}

document.getElementById('search-input').addEventListener('input', (e) => {
    renderTop(e.target.value);
});

// ==== МОДАЛКА ====
const modalOverlay = document.getElementById('modal-overlay');

function openModal(nick) {
    const player = PLAYERS[nick];
    if (!player) return;

    currentPlayerNick = nick;
    currentVote = null;

    document.getElementById('modal-avatar').textContent = nick.charAt(0).toUpperCase();
    document.getElementById('modal-name').textContent = nick;
    document.getElementById('modal-game-id').textContent = 'ID: ' + (player.gameId || '—');
    document.getElementById('modal-elo').textContent = player.elo;
    document.getElementById('modal-win').textContent = player.win;
    document.getElementById('modal-lose').textContent = player.lose;
    document.getElementById('modal-kd').textContent = player.kd.toFixed(2);

    const total = player.win + player.lose;
    const wr = total > 0 ? Math.round((player.win / total) * 100) : 0;
    document.getElementById('modal-wr').textContent = wr + '%';

    document.getElementById('vote-likes').textContent = player.likes;
    document.getElementById('vote-dislikes').textContent = player.dislikes;

    document.getElementById('vote-like').classList.remove('active');
    document.getElementById('vote-dislike').classList.remove('active');

    modalOverlay.classList.add('active');

    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    currentPlayerNick = null;
    currentVote = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ==== ЛАЙК / ДИЗЛАЙК ====
document.getElementById('vote-like').addEventListener('click', () => {
    if (!currentPlayerNick) return;
    const player = PLAYERS[currentPlayerNick];
    const likeBtn = document.getElementById('vote-like');
    const dislikeBtn = document.getElementById('vote-dislike');

    if (currentVote === 'like') {
        player.likes--;
        currentVote = null;
        likeBtn.classList.remove('active');
    } else {
        if (currentVote === 'dislike') {
            player.dislikes--;
            dislikeBtn.classList.remove('active');
        }
        player.likes++;
        currentVote = 'like';
        likeBtn.classList.add('active');
    }

    document.getElementById('vote-likes').textContent = player.likes;
    document.getElementById('vote-dislikes').textContent = player.dislikes;

    sendVote(currentPlayerNick, currentVote);

    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
});

document.getElementById('vote-dislike').addEventListener('click', () => {
    if (!currentPlayerNick) return;
    const player = PLAYERS[currentPlayerNick];
    const likeBtn = document.getElementById('vote-like');
    const dislikeBtn = document.getElementById('vote-dislike');

    if (currentVote === 'dislike') {
        player.dislikes--;
        currentVote = null;
        dislikeBtn.classList.remove('active');
    } else {
        if (currentVote === 'like') {
            player.likes--;
            likeBtn.classList.remove('active');
        }
        player.dislikes++;
        currentVote = 'dislike';
        dislikeBtn.classList.add('active');
    }

    document.getElementById('vote-likes').textContent = player.likes;
    document.getElementById('vote-dislikes').textContent = player.dislikes;

    sendVote(currentPlayerNick, currentVote);

    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
});

function sendVote(nick, vote) {
    const payload = { action: 'vote', target: nick, vote: vote };
    if (tg) {
        console.log('Vote:', payload);
    } else {
        console.log('Vote (тест):', payload);
    }
}

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
renderUser();
renderStats();
renderChart();
renderMatches();
renderLobbies();
renderTop();
