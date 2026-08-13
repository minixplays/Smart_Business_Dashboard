/**
 * theme.js
 * Handles loading, persisting, and toggling the dark theme across all dashboard tools.
 *
 * FIX: When this script runs inside <head>, document.body is null.
 *      We apply 'dark-mode' to document.documentElement (<html>) immediately
 *      to prevent FOUC, then sync to document.body once DOM is ready.
 *      All CSS selectors use both `html.dark-mode` and `body.dark-mode` so
 *      either target works depending on parse stage.
 */
(function () {
  'use strict';

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
      // Silent fail — localStorage may be blocked in private mode
    }
  }

  /**
   * Apply theme to both <html> and <body>.
   * <html> is always safe; <body> may be null during head execution.
   */
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      if (document.body) document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      if (document.body) document.body.classList.remove('dark-mode');
    }
  }

  function loadTheme() {
    const saved = getThemeFromStorage();
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  function toggleTheme() {
    // Check both sources — documentElement is always reliable
    const isDark = document.documentElement.classList.contains('dark-mode');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    saveThemeToStorage(next);
  }

  // Expose to global scope for HTML onclick attributes
  window.loadTheme  = loadTheme;
  window.toggleTheme = toggleTheme;

  // ─── Immediate: apply to <html> right now to prevent FOUC ───────────────
  loadTheme();

  // ─── Sync to <body> once DOM is parsed (body was null during head exec) ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      const saved = getThemeFromStorage();
      applyTheme(saved === 'dark' ? 'dark' : 'light');
    });
  }
})();
