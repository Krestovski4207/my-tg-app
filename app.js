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
    elo: 1247,
    kills: 342,
    deaths: 259,
    wins: 42,
    losses: 18,
    top_place: 7,
    coins: 1250,
    kd_by_map: {
        Sandstone: { kills: 120, deaths: 83 },
        Province:  { kills: 74,  deaths: 66 },
        Rust:      { kills: 98,  deaths: 55 },
        Prison:    { kills: 23,  deaths: 26 },
        Hanami:    { kills: 27,  deaths: 29 }
    },
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

    // Ник
    document.getElementById('profile-nick').textContent = p.nick;

    // ELO бейдж в шапке
    document.getElementById('header-elo').textContent = p.elo;

    // Карточки метрик
    document.getElementById('card-kd').textContent = totalKD.toFixed(2);
    document.getElementById('card-winrate').textContent = winrate + '%';
    document.getElementById('card-matches').textContent = matches;
    document.getElementById('card-kills').textContent = p.kills;
    document.getElementById('card-deaths').textContent = p.deaths;
    document.getElementById('card-coins').textContent = p.coins.toLocaleString('ru-RU');

    // W / L / место в топе
    document.getElementById('wl-wins').textContent = p.wins;
    document.getElementById('wl-losses').textContent = p.losses;
    document.getElementById('wl-top').textContent = '#' + p.top_place;

    // Карты
    renderKdMaps(p.kd_by_map);
    renderWrMaps(p.wr_by_map);
}

// ==== КД ПО КАРТАМ ====
function renderKdMaps(kdMap) {
    const container = document.getElementById('kd-maps-list');
    container.innerHTML = '';

    const entries = Object.entries(kdMap);
    if (entries.length === 0) {
        container.innerHTML = '<div class="map-empty">Нет данных</div>';
        return;
    }

    const maxKd = Math.max(...entries.map(([, v]) => v.kills / Math.max(v.deaths, 1)));
    const scaleMax = Math.max(maxKd, 2);

    entries.forEach(([map, stats]) => {
        const kd = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
        const percentOfMax = Math.min((kd / scaleMax) * 100, 100);

        const row = document.createElement('div');
        row.className = 'map-row';
        row.innerHTML =
