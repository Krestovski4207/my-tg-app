// ================== UX ENHANCEMENTS ==================
(function() {
    'use strict';

    // ---------- VIBRATION ----------
    const tg = window.Telegram?.WebApp;
    function haptic(type) {
        if (!tg || !tg.HapticFeedback) return;
        try {
            if (type === 'light')  tg.HapticFeedback.impactOccurred('light');
            else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
            else if (type === 'heavy')  tg.HapticFeedback.impactOccurred('heavy');
            else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
            else if (type === 'warning') tg.HapticFeedback.notificationOccurred('warning');
            else if (type === 'error')   tg.HapticFeedback.notificationOccurred('error');
        } catch (e) {}
    }
    window.haptic = haptic;

    // Автоматически — на все клики по кнопкам
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, .tab-btn, .card, .top-item, .match-row, .music-item, .stat-card');
        if (btn) haptic('light');
    }, true);

    // ---------- PARALLAX HEADER ----------
    let lastScroll = 0;
    function setupHeaderParallax() {
        const header = document.querySelector('.header');
        const content = document.querySelector('.content');
        if (!header || !content) return;

        content.addEventListener('scroll', () => {
            const scrollY = content.scrollTop;
            const delta = scrollY - lastScroll;
            lastScroll = scrollY;

            if (scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ---------- SCREEN RIPPLE ----------
    function screenRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'screen-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    }

    document.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        if (t) screenRipple(t.clientX, t.clientY);
    }, { passive: true });

    // ---------- AUTO-ATTACH HAPTIC TO BUTTONS ----------
    function attachHaptics() {
        document.querySelectorAll('[data-haptic]').forEach(el => {
            if (el._hapticAttached) return;
            el._hapticAttached = true;
            el.addEventListener('click', () => haptic(el.dataset.haptic || 'medium'));
        });
    }

    // ---------- INIT ----------
    document.addEventListener('DOMContentLoaded', () => {
        setupHeaderParallax();
        attachHaptics();
        setInterval(attachHaptics, 1500);
    });
})();
