import React, { createContext, useContext, useState } from 'react';

// Create the BrewType context
const BrewTypeContext = createContext();

// Provider component
export const BrewTypeProvider = ({ children }) => {
  const [brewType, setBrewType] = useState(null);

  return (
    <BrewTypeContext.Provider value={{ brewType, setBrewType }}>
      {children}
    </BrewTypeContext.Provider>
  );
};

// Custom hook for consuming the context
export const useBrewType = () => {
  const context = useContext(BrewTypeContext);
  if (!context) {
    throw new Error('useBrewType must be used within a BrewTypeProvider');
  }
  return context;
};