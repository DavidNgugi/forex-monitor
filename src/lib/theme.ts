export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    modal: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    muted: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Button colors
  button: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    danger: string;
    dangerHover: string;
  };
  
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
    accent: string;
  };
  
  // Chart colors
  chart: {
    up: string;
    down: string;
    neutral: string;
    grid: string;
  };
  
  // Gradient colors
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const themes: Record<Theme, ThemeColors> = {
  light: {
    background: {
      primary: 'bg-gray-50',
      secondary: 'bg-white',
      tertiary: 'bg-gray-100',
      card: 'bg-white',
      modal: 'bg-white',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      tertiary: 'text-gray-500',
      accent: 'text-blue-600',
      muted: 'text-gray-400',
    },
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      accent: 'border-blue-200',
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      secondaryHover: 'hover:bg-gray-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      dangerHover: 'hover:bg-red-700',
    },
    status: {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600',
      accent: 'text-blue-600',
    },
    chart: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-gray-500',
      grid: 'text-gray-200',
    },
    gradient: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-gray-500 to-gray-600',
      accent: 'from-green-500 to-green-600',
    },
  },
  
  dark: {
    background: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      tertiary: 'bg-gray-700',
      card: 'bg-gray-800',
      modal: 'bg-gray-800',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-200',
      tertiary: 'text-gray-400',
      accent: 'text-cyan-400',
      muted: 'text-gray-500',
    },
    border: {
      primary: 'border-gray-600',
      secondary: 'border-gray-500',
      accent: 'border-cyan-500',
    },
    button: {
      primary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      primaryHover: 'hover:bg-cyan-700',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
      secondaryHover: 'hover:bg-gray-600',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      dangerHover: 'hover:bg-red-700',
    },
    status: {
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-cyan-400',
      accent: 'text-cyan-400',
    },
    chart: {
      up: 'text-green-400',
      down: 'text-red-400',
      neutral: 'text-gray-400',
      grid: 'text-gray-700',
    },
    gradient: {
      primary: 'from-cyan-500 to-cyan-600',
      secondary: 'from-gray-500 to-gray-600',
      accent: 'from-green-500 to-green-600',
    },
  },
  
  blue: {
    background: {
      primary: 'bg-blue-50',
      secondary: 'bg-white',
      tertiary: 'bg-blue-100',
      card: 'bg-white',
      modal: 'bg-white',
    },
    text: {
      primary: 'text-blue-900',
      secondary: 'text-blue-800',
      tertiary: 'text-blue-600',
      accent: 'text-blue-600',
      muted: 'text-blue-400',
    },
    border: {
      primary: 'border-blue-200',
      secondary: 'border-blue-300',
      accent: 'border-blue-400',
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
      secondaryHover: 'hover:bg-blue-200',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      dangerHover: 'hover:bg-red-700',
    },
    status: {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600',
      accent: 'text-blue-600',
    },
    chart: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-blue-500',
      grid: 'text-blue-200',
    },
    gradient: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-blue-400 to-blue-500',
      accent: 'from-green-500 to-green-600',
    },
  },
  
  green: {
    background: {
      primary: 'bg-green-50',
      secondary: 'bg-white',
      tertiary: 'bg-green-100',
      card: 'bg-white',
      modal: 'bg-white',
    },
    text: {
      primary: 'text-green-900',
      secondary: 'text-green-800',
      tertiary: 'text-green-600',
      accent: 'text-green-600',
      muted: 'text-green-400',
    },
    border: {
      primary: 'border-green-200',
      secondary: 'border-green-300',
      accent: 'border-green-400',
    },
    button: {
      primary: 'bg-green-600 hover:bg-green-700 text-white',
      primaryHover: 'hover:bg-green-700',
      secondary: 'bg-green-100 hover:bg-green-200 text-green-700',
      secondaryHover: 'hover:bg-green-200',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      dangerHover: 'hover:bg-red-700',
    },
    status: {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-green-600',
      accent: 'text-green-600',
    },
    chart: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-green-500',
      grid: 'text-green-200',
    },
    gradient: {
      primary: 'from-green-500 to-green-600',
      secondary: 'from-green-400 to-green-500',
      accent: 'from-blue-500 to-blue-600',
    },
  },
  
  purple: {
    background: {
      primary: 'bg-purple-50',
      secondary: 'bg-white',
      tertiary: 'bg-purple-100',
      card: 'bg-white',
      modal: 'bg-white',
    },
    text: {
      primary: 'text-purple-900',
      secondary: 'text-purple-800',
      tertiary: 'text-purple-600',
      accent: 'text-purple-600',
      muted: 'text-purple-400',
    },
    border: {
      primary: 'border-purple-200',
      secondary: 'border-purple-300',
      accent: 'border-purple-400',
    },
    button: {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      primaryHover: 'hover:bg-purple-700',
      secondary: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
      secondaryHover: 'hover:bg-purple-200',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      dangerHover: 'hover:bg-red-700',
    },
    status: {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-purple-600',
      accent: 'text-purple-600',
    },
    chart: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-purple-500',
      grid: 'text-purple-200',
    },
    gradient: {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'from-purple-400 to-purple-500',
      accent: 'from-pink-500 to-pink-600',
    },
  },
  
  orange: {
    background: {
      primary: 'bg-orange-50',
      secondary: 'bg-white',
      tertiary: 'bg-orange-100',
      card: 'bg-white',
      modal: 'bg-white',
    },
    text: {
      primary: 'text-orange-900',
      secondary: 'text-orange-800',
      tertiary: 'text-orange-600',
      accent: 'text-orange-600',
      muted: 'text-orange-400',
    },
    border: {
      primary: 'border-orange-200',
      secondary: 'border-orange-300',
      accent: 'border-orange-400',
    },
    button: {
      primary: 'bg-orange-600 hover:bg-orange-700 text-white',
      primaryHover: 'hover:bg-orange-700',
      secondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
      secondaryHover: 'hover:bg-orange-200',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      dangerHover: 'hover:bg-red-700',
    },
    status: {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-orange-600',
      accent: 'text-orange-600',
    },
    chart: {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-orange-500',
      grid: 'text-orange-200',
    },
    gradient: {
      primary: 'from-orange-500 to-orange-600',
      secondary: 'from-orange-400 to-orange-500',
      accent: 'from-red-500 to-red-600',
    },
  },
};

export const getThemeColors = (theme: Theme): ThemeColors => {
  return themes[theme];
}; 