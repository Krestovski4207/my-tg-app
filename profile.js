// ==== ПРОФИЛЬ ====
async function loadProfile() {
    const card = document.querySelector('.user-card');
    if (card) card.classList.add('is-loading');

    if (!tgUser) {
        if (card) card.classList.remove('is-loading');
        return;
    }
    try {
        const p = await apiGet('/api/profile?tg_id=' + tgUser.id);
        renderProfile(p);
    } catch (e) {
        console.error('Ошибка профиля:', e);
    } finally {
        if (card) card.classList.remove('is-loading');
    }
}

function renderProfile(p) {
    const avatarEl = document.getElementById('user-avatar');

    // Приоритет: 1) avatar_url из БД, 2) photo_url из Telegram (только для себя), 3) буква ника
    let avatarSrc = p.avatar_url;

    if (!avatarSrc && tgUser && Number(tgUser.id) === Number(p.user_id)) {
        if (tgUser.photo_url) {
            avatarSrc = tgUser.photo_url;
        }
    }

    if (avatarSrc) {
        avatarEl.style.backgroundImage = 'url(' + avatarSrc + ')';
        avatarEl.textContent = '';
        avatarEl.classList.add('has-photo');
    } else {
        avatarEl.style.backgroundImage = 'none';
        avatarEl.classList.remove('has-photo');
        avatarEl.textContent = (p.nickname || '?').charAt(0).toUpperCase();
    }

    document.getElementById('user-name').textContent = p.nickname || '—';
    document.getElementById('user-id').textContent = 'ID: ' + p.player_id;

    // ==== БЕЙДЖ АДМИН — только у этого пользователя ====
    const badge = document.getElementById('user-badge');
    const isThisUserAdmin = (Number(p.user_id) === Number(ADMIN_ID));
    badge.style.display = isThisUserAdmin ? '' : 'none';

    document.getElementById('lvl-num').textContent = p.level || 1;
    document.getElementById('elo-value').textContent = p.elo || 0;

    const levelStep = 200;
    const current = (p.elo || 0) % levelStep;
    document.getElementById('elo-progress').style.width = ((current / levelStep) * 100) + '%';
    document.getElementById('progress-label').textContent =
        (levelStep - current) + ' ELO до следующего уровня';

    document.getElementById('stat-win').textContent = p.wins || 0;
    document.getElementById('stat-lose').textContent = p.losses || 0;
    document.getElementById('stat-kd').textContent = (p.kd || 0).toFixed(2);
    document.getElementById('stat-avg').textContent = '0.0';
    document.getElementById('stat-game').textContent = p.matches_count || 0;
    document.getElementById('stat-wr').textContent = (p.winrate || 0) + '%';
    document.getElementById('likes-count').textContent = p.likes || 0;
    document.getElementById('pop-count').textContent = (p.likes || 0) - (p.dislikes || 0);

    // ==== БАННЕР ====
    const card = document.querySelector('.user-card');
    if (card) {
        if (p.banner_url) {
            const fullBannerUrl = API_URL + p.banner_url;
            card.style.setProperty('--banner-url', 'url(' + fullBannerUrl + ')');
            card.classList.add('has-banner');
        } else {
            card.classList.remove('has-banner');
            card.style.removeProperty('--banner-url');
        }
    }

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
                pointRadius: 0
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
    if (!container) return;
    container.innerHTML = '';
    if (matches.length === 0) {
        container.innerHTML = '<div class="map-empty">Нет матчей</div>';
        return;
    }
    matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'match-item';
        item.innerHTML =
            '<div class="match-preview">' + (m.icon || '🎯') + '</div>' +
            '<div class="match-info">' +
                '<div class="match-result ' + m.result + '">' +
                    '<span class="match-result-dot"></span>' +
                    '<span>' + (m.result === 'win' ? 'Победа' : 'Поражение') + '</span>' +
                '</div>' +
                '<div class="match-map">' + m.map + '</div>' +
            '</div>' +
            '<div class="match-score ' + m.result + '">' + m.score + '</div>';
        container.appendChild(item);
    });
}

const allMatchesBtn = document.getElementById('all-matches-btn');
if (allMatchesBtn) {
    allMatchesBtn.addEventListener('click', () => {
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
}
