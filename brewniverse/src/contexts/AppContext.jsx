import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  brewLogs: [],
  recipes: [],
  alerts: [],
  alertGroups: [],
  instructions: [],
  settings: {
    theme: 'default',
    defaultView: 'dashboard',
  },
};

// Action types
export const ActionTypes = {
  // BrewLogs
  ADD_BREW_LOG: 'ADD_BREW_LOG',
  UPDATE_BREW_LOG: 'UPDATE_BREW_LOG',
  DELETE_BREW_LOG: 'DELETE_BREW_LOG',
  
  // Recipes
  ADD_RECIPE: 'ADD_RECIPE',
  UPDATE_RECIPE: 'UPDATE_RECIPE',
  DELETE_RECIPE: 'DELETE_RECIPE',
  
  // Alerts
  ADD_ALERT: 'ADD_ALERT',
  UPDATE_ALERT: 'UPDATE_ALERT',
  DELETE_ALERT: 'DELETE_ALERT',
  ADD_ALERT_GROUP: 'ADD_ALERT_GROUP',
  UPDATE_ALERT_GROUP: 'UPDATE_ALERT_GROUP',
  DELETE_ALERT_GROUP: 'DELETE_ALERT_GROUP',
  
  // Instructions
  ADD_INSTRUCTION: 'ADD_INSTRUCTION',
  UPDATE_INSTRUCTION: 'UPDATE_INSTRUCTION',
  DELETE_INSTRUCTION: 'DELETE_INSTRUCTION',
  CLONE_INSTRUCTION: 'CLONE_INSTRUCTION',
  
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Data persistence
  LOAD_DATA: 'LOAD_DATA',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_BREW_LOG:
      return {
        ...state,
        brewLogs: [...state.brewLogs, { ...action.payload, id: action.payload.id || Date.now().toString() }],
      };
    
    case ActionTypes.UPDATE_BREW_LOG:
      return {
        ...state,
        brewLogs: state.brewLogs.map(log => 
          log.id === action.payload.id ? { ...log, ...action.payload } : log
        ),
      };
    
    case ActionTypes.DELETE_BREW_LOG:
      return {
        ...state,
        brewLogs: state.brewLogs.filter(log => log.id !== action.payload),
      };
    
    case ActionTypes.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, { ...action.payload, id: action.payload.id || Date.now().toString() }],
      };
    
    case ActionTypes.UPDATE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.map(recipe => 
          recipe.id === action.payload.id ? { ...recipe, ...action.payload } : recipe
        ),
      };
    
    case ActionTypes.DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.payload),
      };
    
    case ActionTypes.ADD_ALERT:
      return {
        ...state,
        alerts: [...state.alerts, { ...action.payload, id: action.payload.id || Date.now().toString() }],
      };
    
    case ActionTypes.UPDATE_ALERT:
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload.id ? { ...alert, ...action.payload } : alert
        ),
      };
    
    case ActionTypes.DELETE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
      };
    
    case ActionTypes.ADD_ALERT_GROUP:
      return {
        ...state,
        alertGroups: [...state.alertGroups, { ...action.payload, id: action.payload.id || Date.now().toString() }],
      };
    
    case ActionTypes.UPDATE_ALERT_GROUP:
      return {
        ...state,
        alertGroups: state.alertGroups.map(group => 
          group.id === action.payload.id ? { ...group, ...action.payload } : group
        ),
      };
    
    case ActionTypes.DELETE_ALERT_GROUP:
      return {
        ...state,
        alertGroups: state.alertGroups.filter(group => group.id !== action.payload),
      };
    
    case ActionTypes.ADD_INSTRUCTION:
      return {
        ...state,
        instructions: [...state.instructions, { ...action.payload, id: action.payload.id || Date.now().toString() }],
      };
    
    case ActionTypes.UPDATE_INSTRUCTION:
      return {
        ...state,
        instructions: state.instructions.map(instruction => 
          instruction.id === action.payload.id ? { ...instruction, ...action.payload } : instruction
        ),
      };
    
    case ActionTypes.DELETE_INSTRUCTION:
      return {
        ...state,
        instructions: state.instructions.filter(instruction => instruction.id !== action.payload),
      };
    
    case ActionTypes.CLONE_INSTRUCTION:
      const originalInstruction = state.instructions.find(inst => inst.id === action.payload.id);
      if (originalInstruction) {
        const clonedInstruction = {
          ...originalInstruction,
          id: Date.now().toString(),
          name: action.payload.newName,
        };
        return {
          ...state,
          instructions: [...state.instructions, clonedInstruction],
        };
      }
      return state;
    
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case ActionTypes.LOAD_DATA:
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('brewniverse-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ActionTypes.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('brewniverse-data', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

