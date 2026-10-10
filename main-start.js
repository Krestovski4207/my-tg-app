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
loadProfile();
loadTop();
