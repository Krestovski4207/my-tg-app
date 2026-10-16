// ================== ANIMATION UTILITIES ==================
(function() {
    'use strict';

    // Плавный count-up числа
    function animateNumber(el, from, to, duration) {
        if (!el) return;
        duration = duration || 800;
        const start = performance.now();
        const diff = to - from;
        const decimals = (String(to).split('.')[1] || '').length;
        
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = from + diff * eased;
            el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = decimals > 0 ? Number(to).toFixed(decimals) : to;
        }
        requestAnimationFrame(tick);
    }

    // Анимировать все элементы с [data-count]
    function animateCounters(root) {
        root = root || document;
        root.querySelectorAll('[data-count-to]').forEach(el => {
            const to = parseFloat(el.dataset.countTo);
            if (isNaN(to)) return;
            if (el._animated) return;
            el._animated = true;
            const from = parseFloat(el.dataset.countFrom || '0');
            animateNumber(el, from, to, 900);
        });
    }

    // Прогресс-бар с анимацией
    function animateProgress(el, toPercent, duration) {
        if (!el) return;
        duration = duration || 700;
        el.style.transition = `width ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        requestAnimationFrame(() => {
            el.style.width = toPercent + '%';
        });
    }

    // Стаггер появления (для достижений, списков)
    function staggerReveal(container, selector, delay) {
        if (!container) return;
        delay = delay || 60;
        const items = container.querySelectorAll(selector);
        items.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(12px) scale(0.9)';
            setTimeout(() => {
                el.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) scale(1)';
            }, i * delay);
        });
    }

    // Публикуем глобально
    window.animateNumber = animateNumber;
    window.animateCounters = animateCounters;
    window.animateProgress = animateProgress;
    window.staggerReveal = staggerReveal;

    // Автоматически — при загрузке
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => animateCounters(), 300);
    });
})();
