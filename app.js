// ==== Telegram WebApp ====
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0618');
    tg.setBackgroundColor('#0f0618');
}

const tgUser = tg?.initDataUnsafe?.user || null;

// ==== ЗАГЛУШКИ (потом заменим на реальные из бота) ====
const MOCK = {
    name: tgUser?.first_name || 'Destro',
    avatar: tgUser?.photo_url || null,
    userId: tgUser?.id || '—',
    isAdmin: true,
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
    clan: null,
    // История рейтинга: {дата, значение}
    ratingHistory: [
        { date: '25 Sep', value: 280 },
        { date: '26 Sep', value: 290 },
        { date: '27 Sep', value: 285 },
        { date: '28 Sep', value: 295 },
        { date: '29 Sep', value: 300 },
        { date: '30 Sep', value: 298 },
        { date: '1 Oct',  value: 300 }
    ],
    // Последние матчи
    matches: [
        { result: 'win',  map: 'Province', score: '13:8', icon: '🏔' },
        { result: 'lose', map: 'Rust',     score: '7:13', icon: '🏭' },
        { result: 'win',  map: 'Sandstone', score: '13:10', icon: '🏜' }
    ]
};

// ==== ВКЛАДКИ ====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
    });
});

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

    // Бейдж админа
    const badge = document.getElementById('user-badge');
    if (!MOCK.isAdmin) badge.style.display = 'none';

    // Уровень и ELO
    document.getElementById('lvl-num').textContent = MOCK.level;
    document.getElementById('elo-value').textContent = MOCK.elo;

    // Прогресс
    const range = MOCK.eloNextLevel - MOCK.eloPrevLevel;
    const progress = ((MOCK.elo - MOCK.eloPrevLevel) / range) * 100;
    document.getElementById('elo-progress').style.width =
        Math.max(0, Math.min(100, progress)) + '%';

    const remaining = MOCK.eloNextLevel - MOCK.elo;
    document.getElementById('progress-label').textContent =
        `${remaining} ELO до следующего уровня`;
}

// ==== CLAN ====
function renderClan() {
    if (MOCK.clan) {
        document.getElementById('clan-status').textContent = 'В клане';
        document.getElementById('clan-name').textContent = MOCK.clan.name;
        document.getElementById('clan-desc').textContent =
            `${MOCK.clan.members} участников • ${MOCK.clan.points} очков`;
        document.querySelector('.clan-icon').textContent = MOCK.clan.icon || '⚔';
    }
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
}

// ==== ОЦЕНКА / ПОПУЛЯРНОСТЬ ====
function renderMiniStats() {
    document.getElementById('likes-count').textContent = MOCK.likes;
    document.getElementById('pop-count').textContent = MOCK.popularity;
}

// ==== ГРАФИК РЕЙТИНГА ====
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

    // Градиент для заливки под линией
    const gradient = ctx.createLinearGradient(0, 0, 0, 140);
    gradient.addColorStop(0, 'rgba(34, 255, 136, 0.35)');
    gradient.addColorStop(1, 'rgba(34, 255, 136, 0)');

    new Chart(ctx, {
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
            interaction: {
                intersect: false,
                mode: 'index'
            },
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
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y} ELO`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
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

// ==== ПОСЛЕДНИЕ МАТЧИ ====
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

// ==== КНОПКА ВСЕ МАТЧИ ====
document.getElementById('all-matches-btn').addEventListener('click', () => {
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    // TODO: открыть полную историю матчей
    console.log('Открыть все матчи');
});

// ==== СТАРТ ====
renderUser();
renderClan();
renderStats();
renderMiniStats();
renderChart();
renderMatches();
