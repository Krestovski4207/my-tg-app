// ================== КОЛЕСО + ТУРНИРЫ ==================
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // === Колесо фортуны ===
        const btnWheel = document.getElementById('btn-wheel');
        if (btnWheel) {
            btnWheel.addEventListener('click', () => {
                if (window.haptic) window.haptic('light');
                if (typeof window.openWheel === 'function') {
                    window.openWheel();
                } else if (typeof openWheelModal === 'function') {
                    openWheelModal();
                }
            });
        }

        // === Турниры ===
        const btnTournaments = document.getElementById('btn-tournaments');
        if (btnTournaments) {
            btnTournaments.addEventListener('click', () => {
                if (window.haptic) window.haptic('light');
                // Если функция турниров есть — используем её
                if (typeof window.openTournaments === 'function') {
                    window.openTournaments();
                } else if (typeof window.openTournamentModal === 'function') {
                    window.openTournamentModal();
                } else {
                    openTournamentsModal();
                }
            });
        }
    });

    function openWheelModal() {
        const content = `
            <div class="wheel-modal-content">
                <div class="wheel-wheel">
                    <div class="wheel-svg-wrap">
                        <svg viewBox="0 0 100 100" class="wheel-svg">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="url(#grad1)" stroke-width="1"/>
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="var(--accent-1)"/>
                                    <stop offset="100%" stop-color="var(--accent-2)"/>
                                </linearGradient>
                            </defs>
                            <!-- Сектора -->
                            <path d="M50 50 L50 4 A46 46 0 0 1 96 50 Z" fill="#1a1a2e"/>
                            <path d="M50 50 L96 50 A46 46 0 0 1 50 96 Z" fill="#252542"/>
                            <path d="M50 50 L50 96 A46 46 0 0 1 4 50 Z" fill="#1a1a2e"/>
                            <path d="M50 50 L4 50 A46 46 0 0 1 50 4 Z" fill="#252542"/>
                            <!-- Центр -->
                            <circle cx="50" cy="50" r="10" fill="var(--accent-1)" opacity="0.3"/>
                            <circle cx="50" cy="50" r="6" fill="var(--accent-1)"/>
                        </svg>
                    </div>
                    <div class="wheel-pointer">▼</div>
                </div>
                <p class="wheel-hint">Крути раз в 24 часа и получай LM</p>
                <button class="wheel-spin-btn" id="wheel-spin-btn" disabled>
                    🔒 Скоро
                </button>
                <div class="wheel-prizes">
                    <div class="wheel-prize">🪙 10 LM</div>
                    <div class="wheel-prize">🪙 20 LM</div>
                    <div class="wheel-prize">🪙 50 LM</div>
                    <div class="wheel-prize">🎁 Скин</div>
                </div>
            </div>
        `;
        openProfileModal('🎡 Колесо фортуны', content);
    }


    function openProfileModal(title, content) {
        let overlay = document.getElementById('profile-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'profile-modal-overlay';
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal profile-modal">
                    <button class="modal-close" id="profile-modal-close">✕</button>
                    <div class="profile-modal-title" id="profile-modal-title"></div>
                    <div class="profile-modal-body" id="profile-modal-body"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('profile-modal-close').addEventListener('click', closeProfileModal);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProfileModal(); });
        }

        document.getElementById('profile-modal-title').textContent = title;
        document.getElementById('profile-modal-body').innerHTML = content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProfileModal() {
        const overlay = document.getElementById('profile-modal-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.openProfileModal = openProfileModal;
    window.closeProfileModal = closeProfileModal;
})();
