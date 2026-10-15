// ==== DEBUG OVERLAY ====
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
        const line = document.createElement('div');
        line.textContent = t;
        line.style.color = c || '#0f0';
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    }

    console.log = (...a) => { addLine('> ' + a.join(' ')); origLog(...a); };
    console.warn = (...a) => { addLine('~ ' + a.join(' '), '#ff5'); origWarn(...a); };
    console.error = (...a) => { addLine('! ' + a.join(' '), '#f55'); origErr(...a); };

    window.addEventListener('error', e => addLine('💥 ' + e.message + ' @ ' + e.filename + ':' + e.lineno, '#f55'));
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
            if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
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
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
