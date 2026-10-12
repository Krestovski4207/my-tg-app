// ==== ДИАГНОСТИЧЕСКАЯ ПАНЕЛЬ (временно) ====
(function () {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:999999',
        'background:rgba(0,0,0,0.92)', 'color:#0f0', 'font-family:monospace',
        'font-size:11px', 'line-height:1.4', 'padding:8px', 'max-height:45vh',
        'overflow:auto', 'white-space:pre-wrap', 'word-break:break-all',
        'pointer-events:none', 'border-bottom:2px solid #0f0'
    ].join(';');
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body) document.body.appendChild(panel);
    });
    if (document.body) document.body.appendChild(panel);

    const origLog = console.log;
    const origErr = console.error;
    const origWarn = console.warn;

    function addLine(text, color) {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.color = color || '#0f0';
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    }

    console.log = function (...args) {
        addLine('> ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), '#0f0');
        origLog.apply(console, args);
    };
    console.error = function (...args) {
        addLine('! ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), '#f55');
        origErr.apply(console, args);
    };
    console.warn = function (...args) {
        addLine('~ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), '#ff5');
        origWarn.apply(console, args);
    };

    window.addEventListener('error', (e) => {
        addLine('💥 ' + e.message + ' @ ' + (e.filename || '?') + ':' + (e.lineno || '?'), '#f55');
    });
    window.addEventListener('unhandledrejection', (e) => {
        addLine('💥 Promise: ' + (e.reason?.message || e.reason), '#f55');
    });
})();

// ==== BOOT ====
function boot() {
    console.log('=== BOOT START ===');
    console.log('loadProfile:', typeof loadProfile);
    console.log('loadTop:', typeof loadTop);
    console.log('loadClan:', typeof loadClan);
    console.log('loadProfileClan:', typeof loadProfileClan);
    console.log('apiGet:', typeof apiGet);
    console.log('tgUser:', tgUser?.id);
    console.log('API_URL:', API_URL);

    if (typeof loadProfile === 'function') loadProfile();
    else console.error('loadProfile НЕ функция!');

    if (typeof loadTop === 'function') loadTop();
    else console.error('loadTop НЕ функция!');

    const adminTab = document.querySelector('.admin-tab');
    if (adminTab && isAdmin) adminTab.style.display = '';

    // ==== Кнопка "Открыть клан" ====
    const btnOpenClan = document.getElementById('btn-open-clan');
    console.log('btn-open-clan найден?', !!btnOpenClan);
    if (btnOpenClan) {
        btnOpenClan.addEventListener('click', () => {
            console.log('🖱️ КЛИК по кнопке клана');
            console.log('loadClan тип:', typeof loadClan);

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const clanTab = document.querySelector('.tab-btn[data-tab="clan"]');
            console.log('clanTab найден?', !!clanTab);
            if (clanTab) clanTab.classList.add('active');

            const clanContent = document.getElementById('tab-clan');
            console.log('tab-clan найден?', !!clanContent);
            if (clanContent) clanContent.classList.add('active');

            if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

            if (typeof loadClan === 'function') {
                console.log('✅ Вызываю loadClan()');
                loadClan();
            } else {
                console.error('loadClan НЕ функция — clan.js не загрузился!');
            }
        });
        console.log('✓ handler attached');
    } else {
        console.error('btn-open-clan НЕ найден в DOM!');
    }

    const loader = document.getElementById('app-loader');
    if (loader) setTimeout(() => loader.classList.add('hidden'), 400);
}

// ==== Переключение вкладок ====
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

// ==== Старт ====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
