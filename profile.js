async function loadProfile() {
    console.log('loadProfile вызвана');
    if (!tgUser) {
        console.log('tgUser пустой');
        return;
    }
    try {
        const p = await apiGet('/api/profile?tg_id=' + tgUser.id);
        console.log('Профиль получен:', p.nickname);
        document.getElementById('user-name').textContent = p.nickname || '—';
        document.getElementById('user-id').textContent = 'ID: ' + (p.player_id || '—');
        document.getElementById('lvl-num').textContent = p.level || 1;
        document.getElementById('lvl-num-text').textContent = p.level || 1;
        document.getElementById('elo-value').textContent = p.elo || 0;
        document.getElementById('stat-win').textContent = p.wins || 0;
        document.getElementById('stat-lose').textContent = p.losses || 0;
        document.getElementById('stat-kd').textContent = (p.kd || 0).toFixed(2);
        document.getElementById('stat-game').textContent = p.matches_count || 0;
        document.getElementById('stat-wr').textContent = (p.winrate || 0) + '%';
        document.getElementById('likes-count').textContent = p.likes || 0;
        document.getElementById('pop-count').textContent = (p.likes || 0) - (p.dislikes || 0);
        const card = document.querySelector('.user-card');
        if (card) card.classList.remove('is-loading');
    } catch (e) {
        console.error('Ошибка:', e);
    }
}

function renderProfile(p) {}
function loadProfileClan(id) {}
function renderChart() {}
function renderMatches() {}
function openMatchModal() {}
function closeMatchModal() {}
