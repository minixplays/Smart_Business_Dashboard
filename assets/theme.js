/**
 * theme.js
 * Handles loading, persisting, and toggling the dark theme across all dashboard tools.
 * Wraps internals in an IIFE to avoid polluting the global scope.
 * Exposes only the functions that HTML onclick attributes need.
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

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  function loadTheme() {
    const saved = getThemeFromStorage();
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    saveThemeToStorage(next);
  }

  // Expose to global scope for HTML onclick attributes
  window.loadTheme = loadTheme;
  window.toggleTheme = toggleTheme;

  // Execute immediately to prevent FOUC (Flash of Unstyled Content)
  loadTheme();
})();

