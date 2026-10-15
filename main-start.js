// ==== DEBUG OVERLAY (filtered) ====
(function() {
    const panel = document.createElement('div');
    panel.id = 'tn-debug';
    panel.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:rgba(0,0,0,0.92);color:#0f0;font-family:monospace;font-size:11px;padding:8px;max-height:40vh;overflow:auto;white-space:pre-wrap;pointer-events:none;';
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(panel));
    if (document.body) document.body.appendChild(panel);

    const origLog = console.log;
    const origWarn = console.warn;
    const origErr = console.error;

    function addLine(t, c) {
        // Фильтруем спам Telegram
        if (t.indexOf('[Telegram.WebView]') !== -1) return;
        if (t.indexOf('receiveEvent') !== -1) return;
        if (t.indexOf('viewport_changed') !== -1) return;
        if (t.indexOf('postEvent') !== -1) return;
        const line = document.createElement('div');
        line.textContent = t;
        line.style.color = c || '#0f0';
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    }

    console.log = (...a) => { addLine('> ' + a.join(' ')); origLog(...a); };
    console.warn = (...a) => { addLine('~ ' + a.join(' '), '#ff5'); origWarn(...a); };
    console.error = (...a) => { addLine('! ' + a.join(' '), '#f55'); origErr(...a); };

    window.addEventListener('error', e => addLine('💥 ' + e.message + ' @ ' + (e.filename || '?') + ':' + (e.lineno || '?'), '#f55'));

    // Явные проверки на старте
    setTimeout(() => {
        addLine('--- CHECKS ---', '#ff5');
        addLine('typeof boot: ' + typeof boot);
        addLine('typeof tnInitHandlers: ' + typeof tnInitHandlers);
        addLine('typeof openTournamentsModal: ' + typeof openTournamentsModal);
        addLine('typeof loadProfile: ' + typeof loadProfile);
        addLine('typeof loadClan: ' + typeof loadClan);
        addLine('typeof initAdmin: ' + typeof initAdmin);
        addLine('btn-open-tournaments exists: ' + !!document.getElementById('btn-open-tournaments'));
        addLine('btn-open-clan exists: ' + !!document.getElementById('btn-open-clan'));
        addLine('--- END CHECKS ---', '#ff5');
    }, 500);
})();

// ==== BOOT ====
function boot() {
    console.log('[BOOT] start');

    if (typeof loadProfile === 'function') loadProfile();
    if (typeof loadTop === 'function') loadTop();
    if (typeof initAdmin === 'function') initAdmin();

    if (typeof tnInitHandlers === 'function') {
        console.log('[BOOT] calling tnInitHandlers');
        setTimeout(tnInitHandlers, 100);
    } else {
        console.error('[BOOT] tnInitHandlers NOT function: ' + typeof tnInitHandlers);
    }

    const adminTab = document.querySelector('.admin-tab');
    if (adminTab && isAdmin) adminTab.style.display = '';

    const btnOpenClan = document.getElementById('btn-open-clan');
    if (btnOpenClan) {
        btnOpenClan.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const clanTab = document.querySelector('.tab-btn[data-tab="clan"]');
            if (clanTab) clanTab.classList.add('active');
            const clanContent = document.getElementById('tab-clan');
            if (clanContent) clanContent.classList.add('active');
            if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
            if (typeof loadClan === 'function') loadClan();
        });
    }

    console.log('[BOOT] done');

    const loader = document.getElementById('app-loader');
    if (loader) setTimeout(() => loader.classList.add('hidden'), 400);
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (!tab) return;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const content = document.getElementById('tab-' + tab);
        if (content) content.classList.add('active');
        if (tab === 'top' && typeof loadTop === 'function') loadTop();
        if (tab === 'clan' && typeof loadClan === 'function') loadClan();
        if (tab === 'messages' && typeof loadDialogs === 'function') loadDialogs();
        if (tab === 'ticket' && typeof loadMyTickets === 'function') loadMyTickets();
        if (tab === 'admin' && typeof loadAdmin === 'function') loadAdmin();
        if (tab === 'play' && typeof openPlayModal === 'function') openPlayModal();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
