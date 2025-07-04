// pages/_app.tsx
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Toast from '../components/common/Toast';
import '../styles/globals.css';

// Import FontAwesome
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false; // Tell Font Awesome to skip adding CSS automatically

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize theme based on saved preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const followSystem = localStorage.getItem('followSystemTheme') !== 'false';
    
    if (followSystem) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Listen for system theme changes
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeMediaQuery.addEventListener('change', e => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
      
      return () => {
        darkModeMediaQuery.removeEventListener('change', () => {});
      };
    } else if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply text size if saved
    const textSize = localStorage.getItem('textSize');
    if (textSize) {
      document.documentElement.style.fontSize = `${textSize}%`;
    }
    
    // Apply accessibility settings
    if (localStorage.getItem('reduceMotion') === 'true') {
      document.documentElement.classList.add('reduce-motion');
    }
    
    if (localStorage.getItem('highContrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
    
    if (localStorage.getItem('dyslexicFont') === 'true') {
      document.documentElement.classList.add('dyslexic-font');
      
      // Load dyslexic font if needed
      if (!document.getElementById('dyslexicFontStylesheet')) {
        const link = document.createElement('link');
        link.id = 'dyslexicFontStylesheet';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/dist/opendyslexic/opendyslexic.css';
        document.head.appendChild(link);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
        <ToastProvider>
            <Component {...pageProps} />
            <Toast />
        </ToastProvider>
         </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;