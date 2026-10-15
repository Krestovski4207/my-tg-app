// ==== ERROR OVERLAY ====
(function() {
    const panel = document.createElement('div');
    panel.id = 'tn-debug';
    panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:999999;background:rgba(0,0,0,0.95);color:#0f0;font-family:monospace;font-size:11px;padding:8px;max-height:50vh;overflow:auto;white-space:pre-wrap;';
    if (document.body) {
        document.body.appendChild(panel);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(panel));
    }

    function addLine(t, c) {
        if (t.indexOf('[Telegram.WebView]') !== -1) return;
        if (t.indexOf('receiveEvent') !== -1) return;
        if (t.indexOf('viewport_changed') !== -1) return;
        if (t.indexOf('postEvent') !== -1) return;
        const line = document.createElement('div');
        line.textContent = t;
        line.style.color = c || '#0f0';
        panel.appendChild(line);
    }

    const origErr = console.error;
    const origWarn = console.warn;
    console.error = function() {
        const msg = Array.from(arguments).join(' ');
        addLine('! ' + msg, '#f55');
        origErr.apply(console, arguments);
    };
    console.warn = function() {
        const msg = Array.from(arguments).join(' ');
        addLine('~ ' + msg, '#ff5');
        origWarn.apply(console, arguments);
    };

    window.addEventListener('error', function(e) {
        addLine('💥 ' + e.message + ' @ ' + (e.filename || '?') + ':' + (e.lineno || '?'), '#f55');
    });

    // Тест через 1 секунду
    setTimeout(function() {
        addLine('--- TEST ---', '#0ff');
        addLine('openTournamentsModal: ' + typeof openTournamentsModal, '#0ff');
        addLine('tnInitHandlers: ' + typeof tnInitHandlers, '#0ff');
        addLine('btn-open-tournaments: ' + (document.getElementById('btn-open-tournaments') ? 'ЕСТЬ' : 'НЕТ'), '#0ff');
        addLine('tournament-modal: ' + (document.getElementById('tournament-modal') ? 'ЕСТЬ' : 'НЕТ'), '#0ff');
    }, 1500);
})();

// ==== BOOT ====
function boot() {
    if (typeof loadProfile === 'function') loadProfile();
    if (typeof loadTop === 'function') loadTop();
    if (typeof initAdmin === 'function') initAdmin();
    if (typeof tnInitHandlers === 'function') {
        setTimeout(tnInitHandlers, 100);
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
            if (typeof loadClan === 'function') loadClan();
        });
    }

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
    });
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
