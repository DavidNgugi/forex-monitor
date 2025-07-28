import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeColors, getThemeColors } from './theme';

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('forex-theme') as Theme;
      if (savedTheme && ['light', 'dark', 'blue', 'green', 'purple', 'orange'].includes(savedTheme)) {
        return savedTheme;
      }
    }
    return 'light';
  });

  const colors = getThemeColors(theme);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('forex-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'blue', 'green', 'purple', 'orange'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Apply theme to document body
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'blue', 'green', 'purple', 'orange');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Apply theme colors to CSS custom properties
    const colors = getThemeColors(theme);
    Object.entries(colors).forEach(([category, colorObj]) => {
      Object.entries(colorObj as Record<string, string>).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${category}-${key}`, value);
      });
    });
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 