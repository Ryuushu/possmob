// src/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

// Default Light Theme
const defaultTheme = {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  primary: '#6200EE',
  secondary: '#03DAC5',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  // Optional: Function to toggle themes
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme.backgroundColor === '#FFFFFF'
        ? {
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
            primary: '#BB86FC',
            secondary: '#03DAC5',
          }
        : defaultTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
