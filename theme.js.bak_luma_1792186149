// ==== СМЕНА ТЕМЫ ====
console.log('=== theme.js loaded ===');

const THEMES = ['purple', 'blue', 'green', 'red', 'gold'];
let currentTheme = 'purple';

// Применить тему локально
function applyTheme(theme, animate = true) {
    if (!THEMES.includes(theme)) theme = 'purple';
    
    const html = document.documentElement;
    
    if (animate) {
        // Плавное переключение
        html.style.transition = 'none';
        document.body.style.transition = 'none';
    }
    
    html.setAttribute('data-theme', theme);
    currentTheme = theme;
    
    if (animate) {
        // Вернуть анимацию через микротаск
        requestAnimationFrame(() => {
            setTimeout(() => {
                html.style.transition = '';
                document.body.style.transition = '';
            }, 10);
        });
    }
    
    // Обновить активную тему в UI
    updateThemeUI(theme);
    
    // Обновить мета-цвет Telegram
    if (tg && tg.setHeaderColor) {
        try {
            const colors = {
                purple: '#0f0618',
                blue: '#060f1f',
                green: '#06140a',
                red: '#1a0606',
                gold: '#150f02'
            };
            tg.setHeaderColor(colors[theme] || '#0f0618');
            tg.setBackgroundColor(colors[theme] || '#0f0618');
        } catch (e) {}
    }
}

// Сохранить тему в БД + применить
async function setTheme(theme) {
    if (!THEMES.includes(theme)) return;
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    
    // Мгновенно применяем визуально
    applyTheme(theme);
    
    // Сохраняем в БД
    if (tgUser) {
        try {
            await apiPost('/api/user/settings/theme', { tg_id: tgUser.id, theme: theme });
        } catch (e) {
            console.error('Ошибка сохранения темы:', e);
        }
    }
}

// Обновить выделение активного цвета
function updateThemeUI(theme) {
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
        if (btn.dataset.themeBtn === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Загрузить тему из БД
async function loadThemeFromServer() {
    if (!tgUser) return;
    try {
        const s = await apiGet('/api/user/settings?tg_id=' + tgUser.id);
        if (s && s.theme) {
            applyTheme(s.theme, false);
        }
    } catch (e) {
        console.error('Ошибка загрузки темы:', e);
    }
}

// Автозагрузка при старте
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadThemeFromServer, 500);
    });
} else {
    setTimeout(loadThemeFromServer, 500);
}

window.setTheme = setTheme;
window.applyTheme = applyTheme;

console.log('=== theme.js DONE ===');
