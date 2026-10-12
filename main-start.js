// ==== ОБРАБОТЧИКИ ВКЛАДОК ====
document.querySelectorAll('.tab-btn:not(.tab-btn-play)').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabEl = document.getElementById('tab-' + tabName);
        if (tabEl) tabEl.classList.add('active');
        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();

        if (tabName === 'ticket' && typeof onTicketTabOpen === 'function') onTicketTabOpen();
        if (tabName === 'top' && typeof loadTop === 'function') loadTop();
        if (tabName === 'messages' && typeof loadDialogs === 'function') {
            if (typeof globalChatActive !== 'undefined' && !globalChatActive) loadDialogs();
        }
        if (tabName === 'profile' && typeof loadProfile === 'function') loadProfile();
        if (tabName === 'admin' && typeof loadAdminHome === 'function') loadAdminHome();
        if (tabName !== 'messages' && typeof stopChatPolling === 'function') stopChatPolling();
        if (tabName !== 'clan' && typeof stopClanChatPolling === 'function') stopClanChatPolling();
        if (tabName !== 'messages' && typeof stopDialogPolling === 'function') stopDialogPolling();
    });
});

const btnOpenClan = document.getElementById('btn-open-clan');
if (btnOpenClan) {
    btnOpenClan.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const clanContent = document.getElementById('tab-clan');
        if (clanContent) clanContent.classList.add('active');
        if (typeof loadClan === 'function') loadClan();
    });
}

function showDebugOverlay(lines) {
    let el = document.getElementById('debug-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'debug-overlay';
        el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.85);color:#0f0;font-family:monospace;font-size:11px;padding:10px;z-index:99999;white-space:pre-wrap;max-height:40vh;overflow:auto;';
        document.body.appendChild(el);
    }
    el.textContent = lines.join('\n');
}

async function boot() {
    const loader = document.getElementById('app-loader');
    const log = [];
    log.push('=== BOOT START ===');
    log.push('loadProfile: ' + typeof loadProfile);
    log.push('loadTop: ' + typeof loadTop);
    log.push('apiGet: ' + typeof apiGet);
    log.push('tgUser: ' + (typeof tgUser !== 'undefined' && tgUser ? JSON.stringify(tgUser.id) : 'undefined'));
    log.push('API_URL: ' + (typeof API_URL !== 'undefined' ? API_URL : 'undefined'));
    showDebugOverlay(log);

    try {
        if (typeof loadProfile === 'function') {
            log.push('→ Вызываю loadProfile...');
            showDebugOverlay(log);
            await loadProfile();
            log.push('→ loadProfile OK');
        } else {
            log.push('⚠ loadProfile НЕ функция!');
        }
    } catch (e) {
        log.push('❌ Ошибка loadProfile: ' + e.message);
    }
    showDebugOverlay(log);

    try {
        if (typeof loadTop === 'function') await loadTop();
    } catch (e) {
        log.push('❌ Ошибка loadTop: ' + e.message);
    }
    showDebugOverlay(log);

    if (typeof initAdmin === 'function') {
        try { await initAdmin(); } catch (e) { log.push('Ошибка админки: ' + e.message); }
    }
    if (typeof updateUnreadBadges === 'function') {
        updateUnreadBadges();
        setInterval(updateUnreadBadges, 10000);
    }
    setTimeout(() => {
        if (loader) loader.classList.add('hidden');
    }, 400);
}

boot();
