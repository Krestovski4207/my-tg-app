// ==== ОБРАБОТЧИКИ ВКЛАДОК ====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabEl = document.getElementById('tab-' + tabName);
        if (tabEl) tabEl.classList.add('active');
        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        if (tabName === 'ticket' && typeof onTicketTabOpen === 'function') {
            onTicketTabOpen();
        }
    });
});

// ==== СТАРТ ====
async function boot() {
    const loader = document.getElementById('app-loader');

    try {
        // Загружаем профиль и топ параллельно
        await Promise.all([
            typeof loadProfile === 'function' ? loadProfile() : Promise.resolve(),
            typeof loadTop === 'function' ? loadTop() : Promise.resolve()
        ]);
    } catch (e) {
        console.error('Ошибка загрузки:', e);
    }

    // Небольшая задержка, чтобы анимация не пропала мгновенно
    setTimeout(() => {
        if (loader) loader.classList.add('hidden');
    }, 400);
}

boot();
