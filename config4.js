// ==== Telegram ====
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f0618');
    tg.setBackgroundColor('#0f0618');
}

// ==== Настройки ====
const ADMIN_ID = 6999358439;
const API_URL = "https://independently-font-contract-urw.trycloudflare.com";
window.API_URL = API_URL;

// MULTI-GAME: ?game= из URL (для deep link из бота)
window.__gameFromUrl = (function() {
    try {
        const g = new URLSearchParams(window.location.search).get('game');
        if (g && ['standleo','classic','rise','fade'].includes(g)) return g;
    } catch(e) {}
    return null;
})();

const API_KEY = "lumafaceit_secret_e8jd90jd19dd7dk";

// ==== Пользователь ====
let tgUser = null;
if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    tgUser = tg.initDataUnsafe.user;
}
// Дублируем в window для доступа из других скриптов
window.tgUser = tgUser;
console.log('[CONFIG] tgUser initialized:', tgUser ? tgUser.id : 'null');
const isAdmin = tgUser !== null && Number(tgUser.id) === Number(ADMIN_ID);

// ==== API ====
async function apiGet(path) {
    const r = await fetch(API_URL + path);
    if (!r.ok) throw new Error("API error " + r.status);
    return r.json();
}

async function apiPost(path, body) {
    const r = await fetch(API_URL + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        },
        body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error("API error " + r.status);
    return r.json();
}

// ==== Экранирование ====
function escapeHtml(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==== Тост ====
let toastTimeout;
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==== Логи ====
console.log('CONFIG OK');
console.log('tgUser:', tgUser);
console.log('isAdmin:', isAdmin);
