// ==== Telegram WebApp ====
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#1a0b2e');
    tg.setBackgroundColor('#1a0b2e');
}

const tgUser = tg?.initDataUnsafe?.user || null;

// ==== ЗАГЛУШКИ (потом заменим на реальные данные из бота) ====
const MOCK_PROFILE = {
    nick: tgUser?.first_name || 'Гость',
    avatar: tgUser?.photo_url || null,
    rank: 'Золото II',
    elo: 1247,
    kills: 342,          // убийства за всё время
    deaths: 259,         // смерти за всё время
    wins: 42,
    losses: 18,
    top_place: 7,        // место в топе
    coins: 1250,         // монеты

    // КД по картам: [kills, deaths] — считаем K/D из них
    // Если по карте игрок не играл — просто не включаем её сюда
    kd_by_map: {
        Sandstone: { kills: 120, deaths: 83 },
        Province:  { kills: 74,  deaths: 66 },
        Rust:      { kills: 98,  deaths: 55 },
        Prison:    { kills: 23,  deaths: 26 },
        Hanami:    { kills: 27,  deaths: 29 }
    },

    // Винрейт по картам: только те, где играл
    wr_by_map: {
        Sandstone: 68,
        Province:  55,
        Rust:      72,
        Prison:    38,
        Hanami:    51
    }
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

// ==== ЧИПЫ ====
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

// ==== ПРОФИЛЬ ====
function loadProfile() {
    const p = MOCK_PROFILE;
    const matches = p.wins + p.losses;
    const winrate = matches > 0 ? Math.round((p.wins / matches) * 100) : 0;
    const totalKD = p.deaths > 0 ? (p.kills / p.deaths) : p.kills;

    // Аватар
    const avatarEl = document.getElementById('profile-avatar');
    if (p.avatar) {
        avatarEl.style.backgroundImage = `url(${p.avatar})`;
        avatarEl.textContent = '';
    } else {
        avatarEl.textContent = p.nick.charAt(0).toUpperCase();
    }

    // Ник, ранг
    document.getElementById('profile-nick').textContent = p.nick;
    document.getElementById('profile-rank').textContent = p.rank;

    // Верхняя мета: ELO • КД • У • С
    document.getElementById('meta-elo').textContent = p.elo;
    document.getElementById('meta-kd').textContent = totalKD.toFixed(2);
    document.getElementById('meta-kills').textContent = p.kills;
    document.getElementById('meta-deaths').textContent = p.deaths;

    // Круг винрейта
    document.getElementById('winrate-percent').textContent = winrate + '%';
    const circle = document.getElementById('winrate-circle');
    const radius = 42;
    const circumference = 2 * Math.PI * radius; // ≈ 263.89
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - winrate / 100);

    // W/L
    document.getElementById('wl-wins').textContent = p.wins;
    document.getElementById('wl-losses').textContent = p.losses;

    // Место в топе и монеты
    document.getElementById('info-rank').textContent = '#' + p.top_place;
    document.getElementById('info-coins').textContent = p.coins.toLocaleString('ru-RU');

    // КД по картам
    renderKdMaps(p.kd_by_map);

    // Винрейт по картам
    renderWrMaps(p.wr_by_map);
}

// ==== КД ПО КАРТАМ (цифра + процент) ====
function renderKdMaps(kdMap) {
    const container = document.getElementById('kd-maps-list');
    container.innerHTML = '';

    const entries = Object.entries(kdMap);
    if (entries.length === 0) {
        container.innerHTML = '<div class="map-empty">Нет данных</div>';
        return;
    }

    // Максимум КД для нормализации полоски
    const maxKd = Math.max(...entries.map(([, v]) => v.kills / Math.max(v.deaths, 1)));
    const scaleMax = Math.max(maxKd, 2); // чтобы полоски не были слишком длинными

    entries.forEach(([map, stats]) => {
        const kd = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
        const percentOfMax = Math.min((kd / scaleMax) * 100, 100);

        const row = document.createElement('div');
        row.className = 'map-row';
        row.innerHTML = `
            <div class="map-name">${map}</div>
            <div class="map-bar">
                <div class="map-bar-fill" style="width: ${percentOfMax}%"></div>
            </div>
            <div class="map-value">${kd.toFixed(2)}</div>
        `;
        container.appendChild(row);
    });
}

// ==== ВИНРЕЙТ ПО КАРТАМ (только те, где играл) ====
function renderWrMaps(wrMap) {
    const container = document.getElementById('wr-maps-list');
    container.innerHTML = '';

    const entries = Object.entries(wrMap);
    if (entries.length === 0) {
        container.innerHTML = '<div class="map-empty">Нет данных</div>';
        return;
    }

    entries.forEach(([map, wr]) => {
        let cls = '';
        if (wr >= 60) cls = 'win';
        else if (wr < 45) cls = 'lose';

        const row = document.createElement('div');
        row.className = 'map-row';
        row.innerHTML = `
            <div class="map-name">${map}</div>
            <div class="map-bar">
                <div class="map-bar-fill ${cls}" style="width: ${wr}%"></div>
            </div>
            <div class="map-value">${wr}%</div>
        `;
        container.appendChild(row);
    });
}

// ==== ТОП ====
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

// ==== ОТПРАВКА ЛОББИ ====
document.getElementById('lobby-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const lobbyData = {
        mode: formData.get('mode'),
        map: formData.get('map'),
        comment: formData.get('comment')?.trim() || ''
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

// ==== ТОСТ ====
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==== СТАРТ ====
loadProfile();
loadTop();
