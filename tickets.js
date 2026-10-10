// ==== ТИКЕТЫ ====

const topicChips = document.querySelectorAll('#ticket-topic-chips .chip');
const topicInput = document.getElementById('topic-input');
const ticketMessage = document.getElementById('ticket-message');
const ticketSubmit = document.getElementById('ticket-submit');
const charCounter = document.getElementById('char-counter');

if (topicChips.length) {
    topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
            topicChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            if (topicInput) topicInput.value = chip.dataset.value;
            validateTicket();
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });
}

if (ticketMessage) {
    ticketMessage.addEventListener('input', () => {
        if (charCounter) charCounter.textContent = ticketMessage.value.length + ' / 800';
        validateTicket();
    });
}

function validateTicket() {
    if (!topicInput || !ticketMessage || !ticketSubmit) return;
    const ok = topicInput.value && ticketMessage.value.trim().length >= 10;
    ticketSubmit.disabled = !ok;
}

const ticketForm = document.getElementById('ticket-form');
if (ticketForm) {
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!tgUser) return;
        ticketSubmit.disabled = true;
        ticketSubmit.textContent = '⏳ Отправка...';
        try {
            await apiPost('/api/ticket', {
                user_id: tgUser.id,
                username: tgUser.username || '',
                first_name: tgUser.first_name || '',
                topic: topicInput.value,
                message: ticketMessage.value.trim()
            });
            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            showToast('✅ Тикет отправлен');
            topicChips.forEach(c => c.classList.remove('active'));
            topicInput.value = '';
            ticketMessage.value = '';
            if (charCounter) charCounter.textContent = '0 / 800';
            validateTicket();
            await loadMyTickets();
        } catch (err) {
            console.error(err);
            showToast('⚠ Ошибка отправки');
        } finally {
            ticketSubmit.textContent = '📨 Отправить обращение';
            validateTicket();
        }
    });
}

async function loadMyTickets() {
    if (!tgUser) return;
    try {
        const tickets = await apiGet('/api/tickets/my?user_id=' + tgUser.id);
        renderMyTickets(tickets);
    } catch (e) {
        console.error(e);
    }
}

function renderMyTickets(tickets) {
    const container = document.getElementById('my-tickets-list');
    if (!container) return;
    container.innerHTML = '';
    if (tickets.length === 0) {
        container.innerHTML = '<div class="tickets-empty">У тебя пока нет обращений</div>';
        return;
    }
    tickets.forEach(t => {
        const card = document.createElement('div');
        card.className = 'ticket-card ' + (t.status === 'replied' ? 'replied' : 'new');
        const replyBlock = t.admin_reply
            ? '<div class="ticket-reply-block">' +
                  '<div class="ticket-reply-label">💬 ОТВЕТ АДМИНА</div>' +
                  '<div class="ticket-reply-text">' + escapeHtml(t.admin_reply) + '</div>' +
              '</div>'
            : '';
        card.innerHTML =
            '<div class="ticket-top">' +
                '<div class="ticket-topic">' + escapeHtml(t.topic) + '</div>' +
                '<div class="ticket-status ' + (t.status === 'replied' ? 'replied' : 'new') + '">' +
                    (t.status === 'replied' ? 'Отвечен' : 'Новый') +
                '</div>' +
            '</div>' +
            '<div class="ticket-meta">#' + t.id + ' · ' + (t.created_at || '') + '</div>' +
            '<div class="ticket-message">' + escapeHtml(t.message) + '</div>' +
            replyBlock;
        container.appendChild(card);
    });
}

async function loadAdminTickets() {
    if (!isAdmin || !tgUser) return;
    try {
        const tickets = await apiGet('/api/tickets/all?admin_id=' + tgUser.id);
        renderAdminTickets(tickets);
    } catch (e) {
        console.error(e);
    }
}

function renderAdminTickets(tickets) {
    const container = document.getElementById('admin-tickets-list');
    if (!container) return;
    container.innerHTML = '';
    if (tickets.length === 0) {
        container.innerHTML = '<div class="tickets-empty">Тикетов нет</div>';
        return;
    }
    tickets.forEach(t => {
        const card = document.createElement('div');
        card.className = 'ticket-card ' + (t.status === 'replied' ? 'replied' : 'new');
        const replyBlock = t.admin_reply
            ? '<div class="ticket-reply-block">' +
                  '<div class="ticket-reply-label">💬 ТВОЙ ОТВЕТ</div>' +
                  '<div class="ticket-reply-text">' + escapeHtml(t.admin_reply) + '</div>' +
              '</div>'
            : '<form class="ticket-reply-form" data-ticket-id="' + t.id + '">' +
                  '<textarea class="ticket-reply-input" rows="2" placeholder="Напиши ответ..." maxlength="500"></textarea>' +
                  '<button type="submit" class="ticket-reply-btn">📨 Ответить</button>' +
              '</form>';
        const sender = t.first_name || t.username || ('ID ' + t.user_id);
        card.innerHTML =
            '<div class="ticket-top">' +
                '<div class="ticket-topic">' + escapeHtml(t.topic) + '</div>' +
                '<div class="ticket-status ' + (t.status === 'replied' ? 'replied' : 'new') + '">' +
                    (t.status === 'replied' ? 'Отвечен' : 'Новый') +
                '</div>' +
            '</div>' +
            '<div class="ticket-meta">#' + t.id + ' · от ' + escapeHtml(sender) + ' · ' + (t.created_at || '') + '</div>' +
            '<div class="ticket-message">' + escapeHtml(t.message) + '</div>' +
            replyBlock;
        container.appendChild(card);
    });
    container.querySelectorAll('.ticket-reply-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ticketId = parseInt(form.dataset.ticketId);
            const input = form.querySelector('.ticket-reply-input');
            const reply = input.value.trim();
            if (reply.length < 2) {
                showToast('⚠ Слишком короткий ответ');
                return;
            }
            const btn = form.querySelector('.ticket-reply-btn');
            btn.disabled = true;
            btn.textContent = '⏳...';
            try {
                await apiPost('/api/ticket/reply', {
                    admin_id: tgUser.id,
                    ticket_id: ticketId,
                    reply: reply
                });
                showToast('✅ Ответ отправлен');
                await loadAdminTickets();
            } catch (err) {
                console.error(err);
                showToast('⚠ Ошибка');
                btn.disabled = false;
                btn.textContent = '📨 Ответить';
            }
        });
    });
}

function onTicketTabOpen() {
    if (isAdmin) {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) adminPanel.style.display = '';
        const myBlock = document.getElementById('my-tickets-block');
        if (myBlock) myBlock.style.display = 'none';
        const intro = document.getElementById('ticket-intro');
        if (intro) intro.textContent = 'Здесь ты видишь все тикеты игроков и можешь отвечать на них.';
        const form = document.getElementById('ticket-form');
        if (form) form.style.display = 'none';
        loadAdminTickets();
    } else {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) adminPanel.style.display = 'none';
        loadMyTickets();
    }
}
