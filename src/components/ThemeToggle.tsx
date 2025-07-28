import React from 'react';
import { Palette, Sun, Moon, Droplets, Leaf, Sparkles, Flame } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { Theme } from '../lib/theme';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, colors } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, color: 'text-yellow-500' },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, color: 'text-slate-400' },
    { value: 'blue', label: 'Blue', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-500' },
    { value: 'green', label: 'Green', icon: <Leaf className="w-4 h-4" />, color: 'text-green-500' },
    { value: 'purple', label: 'Purple', icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-500' },
    { value: 'orange', label: 'Orange', icon: <Flame className="w-4 h-4" />, color: 'text-orange-500' },
  ];

  return (
    <div className="relative group">
      <button
        className={`p-2 rounded-lg ${colors.background.secondary} ${colors.border.primary} border transition-all duration-200 hover:shadow-md`}
        title="Change theme"
      >
        <Palette className={`w-5 h-5 ${colors.text.primary}`} />
      </button>
      
      {/* Theme dropdown */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 px-2">Theme</div>
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                theme === themeOption.value
                  ? `${colors.background.tertiary} ${colors.text.accent}`
                  : `hover:${colors.background.tertiary} ${colors.text.secondary}`
              }`}
            >
              <span className={themeOption.color}>{themeOption.icon}</span>
              <span>{themeOption.label}</span>
              {theme === themeOption.value && (
                <div className={`ml-auto w-2 h-2 rounded-full ${colors.status.info}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle; 