// ==== Telegram WebApp ====
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#1a0b2e');
    tg.setBackgroundColor('#1a0b2e');
}

// ==== Данные пользователя (из Telegram) ====
const tgUser = tg?.initDataUnsafe?.user || null;

// ==== ЗАГЛУШКИ (потом заменим на реальные данные из бота) ====
const MOCK_PROFILE = {
    nick: tgUser?.first_name || 'Гость',
    avatar: tgUser?.photo_url || null,
    elo: 1247,
    rank: 'Золото II',
    wins: 42,
    losses: 18,
    matches: 60
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

// ==== ЧИПЫ (режим / карта) ====
function setupChips(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);

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

// ==== ЗАГРУЗКА ПРОФИЛЯ ====
function loadProfile() {
    const p = MOCK_PROFILE;
    const winrate = p.matches > 0 ? Math.round((p.wins / p.matches) * 100) : 0;

    const avatarEl = document.getElementById('profile-avatar');
    if (p.avatar) {
        avatarEl.style.backgroundImage = `url(${p.avatar})`;
        avatarEl.textContent = '';
    } else {
        avatarEl.textContent = p.nick.charAt(0).toUpperCase();
    }

    document.getElementById('profile-nick').textContent = p.nick;
    document.getElementById('profile-elo').textContent = p.elo;
    document.getElementById('profile-rank').textContent = p.rank;
    document.getElementById('stat-wins').textContent = p.wins;
    document.getElementById('stat-losses').textContent = p.losses;
    document.getElementById('stat-winrate').textContent = winrate + '%';
    document.getElementById('stat-matches').textContent = p.matches;
}

// ==== ЗАГРУЗКА ТОПА ====
function loadTop() {
    const container = document.getElementById('top-list');
    container.innerHTML = '';

    MOCK_TOP.forEach((player, index) => {
        const rank = index + 1;
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

        container.appendChild(item);
    });
}

// ==== ОТПРАВКА ФОРМЫ ЛОББИ ====
document.getElementById('lobby-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const lobbyData = {
        mode: formData.get('mode'),
        map: formData.get('map'),
        comment: formData.get('comment')?.trim() || ''
    };

    // Отправка боту через Telegram WebApp
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'create_lobby',
            ...lobbyData
        }));

        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } else {
        // Для теста в браузере
        console.log('Лобби:', lobbyData);
        showToast('✅ Лобби создано (тест)');
    }
});

// ==== ТОСТ ====
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
loadProfile();
loadTop();

// Скрываем горизонтальный скролл при свайпах
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });
