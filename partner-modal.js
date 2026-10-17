(function() {
    window.openPartnerModal = function() {
        let m = document.getElementById('partner-modal');
        if (!m) {
            m = document.createElement('div');
            m.id = 'partner-modal';
            m.className = 'partner-modal-overlay';
            m.innerHTML = `
                <div class="partner-modal">
                    <h3>🤝 Партнёрка</h3>
                    <p>Сотрудничество, реклама, предложения.<br><br>
                    Напиши нам: <b>@extrophobia</b></p>
                    <button class="partner-modal-btn" onclick="window.open('https://t.me/extrophobia', '_blank')">Написать @extrophobia</button>
                    <button class="partner-modal-close" onclick="this.closest('.partner-modal-overlay').classList.remove('active')">Закрыть</button>
                </div>
            `;
            document.body.appendChild(m);
            m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
        }
        m.classList.add('active');
    };
})();
