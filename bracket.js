// ==== ЗУМ И PINCH-TO-ZOOM ДЛЯ СЕТКИ ====
let bracketZoom = {
    scale: 1,
    minScale: 0.3,
    maxScale: 3,
    translateX: 0,
    translateY: 0,
    initialDistance: 0,
    initialScale: 1,
    isPinching: false,
    isPanning: false,
    lastTouchX: 0,
    lastTouchY: 0,
    initialTranslateX: 0,
    initialTranslateY: 0
};

function initBracketZoom() {
    const wrap = document.getElementById('tn-bracket-wrap');
    const canvas = document.getElementById('tn-bracket-canvas');
    if (!wrap || !canvas) return;

    // Сброс
    bracketZoom.scale = 1;
    bracketZoom.translateX = 0;
    bracketZoom.translateY = 0;

    // Авто-подгон: если сетка шире wrap — уменьшаем чтобы влезла
    const canvasW = canvas.scrollWidth;
    const wrapW = wrap.clientWidth;
    if (canvasW > wrapW) {
        const autoScale = (wrapW - 20) / canvasW;
        bracketZoom.scale = Math.max(autoScale, 0.4);
    }

    applyBracketTransform();
    updateBracketZoomLabel();

    // Кнопки зума
    const zoomInBtn = document.getElementById('tn-zoom-in');
    const zoomOutBtn = document.getElementById('tn-zoom-out');
    const zoomResetBtn = document.getElementById('tn-zoom-reset');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => {
        bracketZoom.scale = Math.min(bracketZoom.scale * 1.3, bracketZoom.maxScale);
        applyBracketTransform();
        updateBracketZoomLabel();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });

    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
        bracketZoom.scale = Math.max(bracketZoom.scale / 1.3, bracketZoom.minScale);
        applyBracketTransform();
        updateBracketZoomLabel();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });

    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
        bracketZoom.scale = 1;
        bracketZoom.translateX = 0;
        bracketZoom.translateY = 0;
        applyBracketTransform();
        updateBracketZoomLabel();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });

    // Pinch-to-zoom
    wrap.addEventListener('touchstart', handleTouchStart, { passive: false });
    wrap.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrap.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Mouse wheel (для десктопа)
    wrap.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            bracketZoom.scale = Math.min(bracketZoom.scale * 1.1, bracketZoom.maxScale);
        } else {
            bracketZoom.scale = Math.max(bracketZoom.scale / 1.1, bracketZoom.minScale);
        }
        applyBracketTransform();
        updateBracketZoomLabel();
    }, { passive: false });
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Pinch start
        bracketZoom.isPinching = true;
        bracketZoom.initialDistance = getDistance(e.touches[0], e.touches[1]);
        bracketZoom.initialScale = bracketZoom.scale;
    } else if (e.touches.length === 1) {
        // Pan start
        bracketZoom.isPanning = true;
        bracketZoom.lastTouchX = e.touches[0].clientX;
        bracketZoom.lastTouchY = e.touches[0].clientY;
        bracketZoom.initialTranslateX = bracketZoom.translateX;
        bracketZoom.initialTranslateY = bracketZoom.translateY;
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 2 && bracketZoom.isPinching) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const ratio = dist / bracketZoom.initialDistance;
        let newScale = bracketZoom.initialScale * ratio;
        newScale = Math.max(bracketZoom.minScale, Math.min(bracketZoom.maxScale, newScale));
        bracketZoom.scale = newScale;
        applyBracketTransform();
        updateBracketZoomLabel();
    } else if (e.touches.length === 1 && bracketZoom.isPanning && bracketZoom.scale > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - bracketZoom.lastTouchX;
        const dy = e.touches[0].clientY - bracketZoom.lastTouchY;
        bracketZoom.translateX += dx;
        bracketZoom.translateY += dy;
        bracketZoom.lastTouchX = e.touches[0].clientX;
        bracketZoom.lastTouchY = e.touches[0].clientY;
        applyBracketTransform();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        bracketZoom.isPinching = false;
    }
    if (e.touches.length < 1) {
        bracketZoom.isPanning = false;
    }
}

function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function applyBracketTransform() {
    const canvas = document.getElementById('tn-bracket-canvas');
    if (!canvas) return;
    canvas.style.transform = 'translate(' + bracketZoom.translateX + 'px, ' + bracketZoom.translateY + 'px) scale(' + bracketZoom.scale + ')';
}

function updateBracketZoomLabel() {
    const label = document.getElementById('tn-zoom-level');
    if (label) {
        label.textContent = Math.round(bracketZoom.scale * 100) + '%';
    }
}
