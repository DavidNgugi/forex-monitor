import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { cn } from '../lib/utils';
import { Theme } from '../lib/theme';

const themes = [
  { value: 'light' as Theme, label: 'Light', icon: '☀️', color: 'text-yellow-500' },
  { value: 'dark' as Theme, label: 'Dark', icon: '🌙', color: 'text-slate-400' },
  { value: 'blue' as Theme, label: 'Blue', icon: '🔵', color: 'text-blue-500' },
  { value: 'green' as Theme, label: 'Green', icon: '🟢', color: 'text-green-500' },
  { value: 'purple' as Theme, label: 'Purple', icon: '🟣', color: 'text-purple-500' },
  { value: 'orange' as Theme, label: 'Orange', icon: '🟠', color: 'text-orange-500' },
];

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, colors } = useTheme();

  return (
    <div className="relative group">
      <button
        className={cn(
          "p-2 rounded-lg transition-all duration-200 hover:shadow-md",
          colors.background.secondary,
          colors.border.primary,
          "border"
        )}
        title="Change theme"
      >
        <Palette className={cn("w-5 h-5", colors.text.primary)} />
      </button>
      
      {/* Theme dropdown */}
      <div className={cn(
        "absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50",
        colors.background.primary,
        colors.border.primary
      )}>
        <div className="p-3">
          <div className={cn("text-xs font-medium mb-3 px-2", colors.text.secondary)}>Theme</div>
          <div className="space-y-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  theme === themeOption.value
                    ? cn(colors.background.tertiary, colors.text.accent)
                    : cn(colors.text.secondary, "hover:bg-opacity-10", colors.background.tertiary)
                )}
              >
                <span className={themeOption.color}>{themeOption.icon}</span>
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <div className={cn("ml-auto w-2 h-2 rounded-full", colors.status.info)} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle; 