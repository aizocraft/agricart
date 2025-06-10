// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('color-scheme', 'light');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Theme colors configuration
  const themeColors = {
    light: {
      primary: 'from-green-600 to-emerald-600',
      primaryHover: 'from-green-700 to-emerald-700',
      text: 'text-gray-800',
      lightText: 'text-gray-600',
      bg: 'bg-white',
      secondaryBg: 'bg-gray-50',
      border: 'border-gray-200',
      card: 'bg-white',
      glass: 'bg-white/90 backdrop-blur-sm',
      avatar: 'from-green-100 to-emerald-100 text-green-700'
    },
    dark: {
      primary: 'from-emerald-500 to-teal-500',
      primaryHover: 'from-emerald-600 to-teal-600',
      text: 'text-gray-100',
      lightText: 'text-gray-300',
      bg: 'bg-gray-900',
      secondaryBg: 'bg-gray-800',
      border: 'border-gray-700',
      card: 'bg-gray-800',
      glass: 'bg-gray-900/90 backdrop-blur-sm',
      avatar: 'from-emerald-900 to-teal-900 text-emerald-300'
    }
  };

  const currentTheme = darkMode ? themeColors.dark : themeColors.light;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}