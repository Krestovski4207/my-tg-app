// ==== ТУРНИРЫ — МИНИМАЛЬНАЯ ВЕРСИЯ ====
console.log('=== TOURNAMENTS.JS LOADED ===');

function openTournamentsModal() {
    console.log('=== openTournamentsModal вызван ===');
    const modal = document.getElementById('tournament-modal');
    if (!modal) {
        console.error('Модалка #tournament-modal НЕ НАЙДЕНА');
        return;
    }
    modal.classList.add('active');
    console.log('=== класс active добавлен ===');

    const body = document.getElementById('tn-body');
    if (body) {
        body.innerHTML = '<div class="tn-empty"><div style="text-align:center;padding:60px 20px;color:#8b7fb8;">Турниры скоро появятся</div></div>';
    }
}

function closeTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

function tnInitHandlers() {
    console.log('=== tnInitHandlers вызван ===');

    const openBtn = document.getElementById('btn-open-tournaments');
    if (openBtn) {
        openBtn.addEventListener('click', openTournamentsModal);
        console.log('=== Обработчик на кнопку навешан ===');
    } else {
        console.warn('=== Кнопка #btn-open-tournaments НЕ НАЙДЕНА ===');
    }

    const closeBtn = document.getElementById('tn-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTournamentsModal);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tnInitHandlers);
} else {
    tnInitHandlers();
}

window.tnInitHandlers = tnInitHandlers;
console.log('=== TOURNAMENTS.JS DONE ===');
