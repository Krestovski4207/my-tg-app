// ==== РЕНДЕР SVG-ИКОНОК В РАЗДЕЛЕ "ЕЩЁ" ====
(function() {
    'use strict';

    function renderMoreIcons() {
        const nodes = document.querySelectorAll('[data-icon]');
        if (!nodes.length) return;
        if (!window.ICONS) {
            console.warn('[MORE-ICONS] ICONS не загружены');
            return;
        }
        nodes.forEach(el => {
            if (el.dataset.iconDone === '1') return;
            const name = el.dataset.icon;
            const svg = window.ICONS[name];
            if (svg) {
                el.innerHTML = svg;
                el.dataset.iconDone = '1';
            } else {
                console.warn('[MORE-ICONS] нет иконки:', name);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', renderMoreIcons);

    // На случай если DOMContentLoaded уже прошёл
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        setTimeout(renderMoreIcons, 100);
    }

    // Экспорт — если нужно вызвать вручную
    window.renderMoreIcons = renderMoreIcons;
})();
