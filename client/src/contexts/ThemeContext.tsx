import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  darkMode: boolean; // For compatibility with existing components
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Check if user has previously set a preference, otherwise use system
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system')) {
      return savedTheme as ThemeMode;
    }
    return 'system';
  });

  // Determine if dark mode should be active based on theme mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      return true;
    } else if (savedTheme === 'light') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update dark mode when system preference changes (only matters in system mode)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        setDarkMode(e.matches);
      }
    };
    
    // Set initial value
    if (themeMode === 'system') {
      setDarkMode(mediaQuery.matches);
    }
    
    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [themeMode]);

  // Update themeMode when darkMode changes via toggle
  useEffect(() => {
    if (themeMode !== 'system') {
      setThemeMode(darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  // Update the class on the html element whenever dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', themeMode);
  }, [darkMode, themeMode]);

  const toggleDarkMode = () => {
    // If in system mode, switch to explicit light/dark mode
    if (themeMode === 'system') {
      const newMode = darkMode ? 'light' : 'dark';
      setThemeMode(newMode);
      setDarkMode(!darkMode);
    } else {
      // Toggle between light and dark
      setDarkMode(!darkMode);
    }
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (mode === 'system') {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setDarkMode(mode === 'dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        darkMode,
        setThemeMode: handleSetThemeMode,
        toggleDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 