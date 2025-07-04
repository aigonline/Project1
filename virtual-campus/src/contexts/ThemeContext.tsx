import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const defaultContext: ThemeContextType = {
  theme: 'system',
  isDarkMode: false,
  setTheme: () => {},
  toggleTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Get saved theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as ThemeMode || 'system';
    setThemeState(savedTheme);

    // Apply theme on initial load
    applyTheme(savedTheme);
  }, []);

  // Handle system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        updateDocumentClass(e.matches);
      };

      // Initial check
      setIsDarkMode(mediaQuery.matches);
      updateDocumentClass(mediaQuery.matches);

      // Add listener for changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const updateDocumentClass = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const applyTheme = (newTheme: ThemeMode) => {
    if (newTheme === 'dark') {
      setIsDarkMode(true);
      updateDocumentClass(true);
    } else if (newTheme === 'light') {
      setIsDarkMode(false);
      updateDocumentClass(false);
    } else {
      // System theme
      const isDarkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDarkPreferred);
      updateDocumentClass(isDarkPreferred);
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(isDarkMode ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};