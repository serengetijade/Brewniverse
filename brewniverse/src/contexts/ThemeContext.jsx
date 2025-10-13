import React, { createContext, useContext } from 'react';

//ToDo: remove any unused variables
// Theme definitions
export const themes = {
  default: {
    name: 'Brewniverse Purple',
    colors: {
      primary: '#170e3f',
      secondary: '#310B78',
      accent: '#6E1593',
      highlight: '#8D17A2',
      background: '#ffffff',
      cardBackground: '#ffffff',
      text: '#170e3f',
      textLight: '#6E1593',
      surface: '#f8f9fa',
      border: '#e9ecef',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    },
  },
  dark: {
    name: 'Dark Mode',
    colors: {
      primary: '#8D17A2',
      secondary: '#6E1593',
      accent: '#310B78',
      highlight: '#170e3f',
      background: '#1a1a1a',
      cardBackground: '#2d2d2d',
      text: '#ffffff',
      textLight: '#cccccc',
      surface: '#2d2d2d',
      border: '#404040',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    },
  },
  merlot: {
    name: 'Merlot',
    colors: {
      primary: '#662222',
      secondary: '#842A3B',
      accent: '#f1927d',
      highlight: '#FF4C8B',
      background: '#DA6C6C',
      cardBackground: '#f5d5d5',
      text: '#3E0703',
      textLight: '#3E0703',
      surface: '#A3485A',
      border: '#3E0703',
      success: '#a7c253',
      warning: '#FF2632',
      error: '#db4c46',
      info: '#ee9581',
    },
  },
  amber: {
    name: 'Amber Ale',
    colors: {
      primary: '#8b4513',
      secondary: '#a0522d',
      accent: '#cd853f',
      highlight: '#daa520',
      background: '#FFFDE7',
      cardBackground: '#ffffff',
      text: '#8b4513',
      textLight: '#a0522d',
      surface: '#EED899',
      border: '#f5e6d3',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    },
  },
  forest: {
    name: 'Forest Green',
    colors: {
      primary: '#5D8736',
      secondary: '#809D3C',
      accent: '#F4FFC3',
      highlight: '#D2E3C8',
      background: '#A9C46C',
      cardBackground: '#D2E3C8',
      text: '#5A4200',
      textLight: '#2d5a3d',
      surface: '#809D3C',
      border: '#4F6F52',
      success: '#28a745',
      warning: '#7ec88e',
      error: '#dc3545',
      info: '#7ec88e',
    },
  },
  ocean: {
    name: 'Ocean Blue',
    colors: {
      primary: '#003049',
      secondary: '#0077b6',
      accent: '#0096c7',
      highlight: '#00b4d8',
      background: '#C4FFF1',
      cardBackground: '#ffffff',
      text: '#003049',
      textLight: '#0077b6',
      surface: '#80CBC4',
      border: '#e3f2fd',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = React.useState(() => {
    // Load theme from localStorage or default
    const savedData = localStorage.getItem('brewniverse-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return parsedData.settings?.theme || 'default';
      } catch (error) {
        return 'default';
      }
    }
    return 'default';
  });
  
  const theme = themes[currentTheme] || themes.default;

  // Apply CSS custom properties to the root element
  React.useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  const switchTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, currentTheme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

