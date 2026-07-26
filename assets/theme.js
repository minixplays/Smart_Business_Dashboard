// theme.js
// Handles loading, persisting, and toggling the dark theme across all dashboard tools.

function getThemeFromStorage() {
    try {
        return localStorage.getItem('theme');
    } catch (e) {
        return null;
    }
}

function saveThemeToStorage(theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {
        console.warn('localStorage not accessible:', e);
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function loadTheme() {
    const saved = getThemeFromStorage();
    if (saved === 'dark') {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        document.body.classList.remove('dark-mode');
        saveThemeToStorage('light');
    } else {
        document.body.classList.add('dark-mode');
        saveThemeToStorage('dark');
    }
}

// Execute immediately to prevent FOUC (Flash of Unstyled Content)
loadTheme();
