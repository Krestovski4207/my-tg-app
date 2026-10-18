// ================== ВКЛАДКА «ЕЩЁ» ==================
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const moreTab = document.getElementById('tab-more');
        if (!moreTab) return;

        // Обработчики на все .more-item
        moreTab.querySelectorAll('.more-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (!action) return;

                // Haptic
                if (window.haptic) window.haptic('light');

                switch (action) {
                    case 'settings':
                        document.getElementById('btn-settings')?.click();
                        break;

                    case 'music':
                        if (typeof window.openMusicModal === 'function') window.openMusicModal();
                        break;

                    case 'tickets':
                        switchTab('ticket');
                        break;

                    case 'clans':
                        switchTab('clan');
                        if (typeof window.loadClan === 'function') {
                            window.loadClan();
                        } else if (typeof loadClan === 'function') {
                            loadClan();
                        } else {
                            console.warn('[CLAN] loadClan не определена');
                        }
                        break;

                    case 'tournaments':
                        if (typeof window.openTournaments === 'function') window.openTournaments();
                        else if (typeof window.openTournamentModal === 'function') window.openTournamentModal();
                        else showToast('Открыть турниры');
                        break;

                    case 'achievements':
                        if (window.tgUser?.id && typeof window.loadAndRenderAchievements === 'function') {
                            showToast('Все достижения в профиле');
                            switchTab('profile');
                        }
                        break;

                    case 'season-info':
                        showToast('О сезоне — скоро');
                        break;

                    case 'rules':
                        showRulesModal();
                        break;

                    case 'admin-panel':
                        openAdminPasswordModal();
                        break;

                    case 'partner':
                        if (window.openPartnerModal) {
                            window.openPartnerModal();
                        } else {
                            window.open('https://t.me/extrophobia', '_blank');
                        }
                        break;
                }
            });
        });

        function switchTab(name) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            const tab = document.getElementById('tab-' + name);
            if (tab) tab.classList.add('active');
            const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
            if (btn) btn.classList.add('active');
        }

        function showRulesModal() {
            const rules = `
                <div class="rules-content">
                    <h3>📄 Правила Luma Faceit</h3>
                    <p><b>1. Общие положения</b><br>Играй честно, уважай соперников.</p>
                    <p><b>2. Запрещено</b><br>• Читы и стороннее ПО<br>• Тимминг<br>• Оскорбления</p>
                    <p><b>3. Матчи</b><br>• 5v5 / 2x2 / 1x1<br>• BO1 / BO3<br>• Скрины обязательно</p>
                    <p><b>4. Наказания</b><br>• Предупреждение<br>• Временный бан<br>• Постоянный бан</p>
                </div>
            `;
            openModal('Правила Luma Faceit', rules);
        }

        function openAdminPasswordModal() {
            // Проверка сохранённой сессии
            if (sessionStorage.getItem('luma_admin_access') === '1') {
                openAdminPanel();
                return;
            }

            const content = `
                <div class="password-modal">
                    <div class="password-icon">🔒</div>
                    <p>Введи пароль для доступа к админ-панели:</p>
                    <input type="password" id="admin-password-input" class="password-input" placeholder="Пароль" autocomplete="off">
                    <div class="password-error" id="admin-password-error" style="display:none;">❌ Неверный пароль</div>
                    <button class="password-submit" id="admin-password-submit">Войти</button>
                </div>
            `;
            openModal('Вход в админ-панель', content);

            setTimeout(() => {
                const inp = document.getElementById('admin-password-input');
                const btn = document.getElementById('admin-password-submit');
                const err = document.getElementById('admin-password-error');

                const submit = async () => {
                    const pass = inp.value.trim();
                    if (!pass) return;
                    try {
                        console.log('Отправка пароля:', pass);
                        const res = await apiPost('/api/admin/verify', { password: pass });
                        console.log('Ответ:', res);
                        alert('Ответ API: ' + JSON.stringify(res));
                        if (res && res.ok) {
                            sessionStorage.setItem('luma_admin_access', '1');
                            closeModal();
                            setTimeout(openAdminPanel, 200);
                        } else {
                            alert('Ошибка: ' + JSON.stringify(res));
                            err.style.display = 'block';
                            if (window.haptic) window.haptic('error');
                        }
                    } catch (e) {
                        alert('Исключение: ' + e.message);
                        err.style.display = 'block';
                    }
                };

                btn?.addEventListener('click', submit);
                inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
                inp?.focus();
            }, 100);
        }

        function openAdminPanel() {
            switchTab('admin');
            if (typeof window.loadAdminHome === 'function') {
                window.loadAdminHome();
            } else if (typeof loadAdminHome === 'function') {
                loadAdminHome();
            } else {
                console.warn('[ADMIN] loadAdminHome не определена');
            }
        }

        function openModal(title, content) {
            let overlay = document.getElementById('more-modal-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'more-modal-overlay';
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal more-modal">
                        <button class="modal-close" id="more-modal-close">✕</button>
                        <div class="more-modal-title" id="more-modal-title"></div>
                        <div class="more-modal-content" id="more-modal-content"></div>
                    </div>
                `;
                document.body.appendChild(overlay);

                document.getElementById('more-modal-close').addEventListener('click', closeModal);
                overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
            }

            document.getElementById('more-modal-title').textContent = title;
            document.getElementById('more-modal-content').innerHTML = content;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            const overlay = document.getElementById('more-modal-overlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        window.openMoreModal = openModal;
        window.closeMoreModal = closeModal;
    });
})();
