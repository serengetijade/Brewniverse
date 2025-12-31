import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageService from '../utils/StorageService';
import NotificationService from '../utils/NotificationService';

// Initial state
const initialState = {
    brewLogs: [],
    recipes: [],
    alerts: [],
    alertGroups: [],
    instructions: [],
    journalEntries: [],
    recipeProgress: {},
    settings: {
        theme: 'default',
        disableNotifications: false,
    },
};

// Action types
export const ActionTypes = {
    // BrewLogs
    addBrewLog: 'addBrewLog',
    updateBrewLog: 'updateBrewLog',
    deleteBrewLog: 'deleteBrewLog',

    // Recipes
    addRecipe: 'addRecipe',
    updateRecipe: 'updateRecipe',
    deleteRecipe: 'deleteRecipe',
    toggleRecipeStep: 'toggleRecipeStep',
    resetRecipeProgress: 'resetRecipeProgress',

    // Alerts
    addAlert: 'addAlert',
    updateAlert: 'updateAlert',
    deleteAlert: 'deleteAlert',
    addAlertGroup: 'addAlertGroup',
    updateAlertGroup: 'updateAlertGroup',
    deleteAlertGroup: 'deleteAlertGroup',

    // Instructions
    addInstruction: 'addInstruction',
    updateInstruction: 'updateInstruction',
    deleteInstruction: 'deleteInstruction',
    cloneInstruction: 'cloneInstruction',

    // Journal Entries
    addJournalEntry: 'addJournalEntry',
    updateJournalEntry: 'updateJournalEntry',
    deleteJournalEntry: 'deleteJournalEntry',

    // Settings
    updateSettings: 'updateSettings',

    // Data persistence
    loadData: 'loadData',
};

// Reducer function
function appReducer(state, action) {
    switch (action.type) {
        case ActionTypes.addBrewLog:
            return {
                ...state,
                brewLogs: [...state.brewLogs, { ...action.payload, id: action.payload.id || Date.now().toString() }],
            };

        case ActionTypes.updateBrewLog:
            return {
                ...state,
                brewLogs: state.brewLogs.map(log =>
                    log.id === action.payload.id ? { ...log, ...action.payload } : log
                ),
            };

        case ActionTypes.deleteBrewLog:
            // Cascade delete
            return {
                ...state,
                brewLogs: state.brewLogs.filter(log => log.id !== action.payload),
                alerts: state.alerts.filter(alert => alert.brewLogId !== action.payload),
                //journalEntries: state.journalEntries.filter(entry => entry.brewLogId !== action.payload),
            };

        case ActionTypes.addRecipe:
            return {
                ...state,
                recipes: [...state.recipes, { ...action.payload, id: action.payload.id || Date.now().toString() }],
            };

        case ActionTypes.updateRecipe:
            return {
                ...state,
                recipes: state.recipes.map(recipe =>
                    recipe.id === action.payload.id ? { ...recipe, ...action.payload } : recipe
                ),
            };

        case ActionTypes.deleteRecipe:
            // Also clean up recipe progress when recipe is deleted
            const { [action.payload]: _, ...remainingProgress } = state.recipeProgress;
            return {
                ...state,
                recipes: state.recipes.filter(recipe => recipe.id !== action.payload),
                recipeProgress: remainingProgress,
            };

        case ActionTypes.toggleRecipeStep:
            const { recipeId, stepIndex } = action.payload;
            const currentProgress = state.recipeProgress[recipeId] || { completedSteps: [] };
            const completedSteps = currentProgress.completedSteps.includes(stepIndex)
                ? currentProgress.completedSteps.filter(step => step !== stepIndex)
                : [...currentProgress.completedSteps, stepIndex];

            return {
                ...state,
                recipeProgress: {
                    ...state.recipeProgress,
                    [recipeId]: { completedSteps },
                },
            };

        case ActionTypes.resetRecipeProgress:
            return {
                ...state,
                recipeProgress: {
                    ...state.recipeProgress,
                    [action.payload]: { completedSteps: [] },
                },
            };

        case ActionTypes.addAlert:
            {
                const newAlert = { ...action.payload, id: action.payload.id || Date.now().toString() };
                // Schedule notification for the new alert
                NotificationService.scheduleAlert(newAlert, state.settings).catch(err => 
                    console.error('Error scheduling notification:', err)
                );
                return {
                    ...state,
                    alerts: [...state.alerts, newAlert],
                };
            }

        case ActionTypes.updateAlert:
            {
                const updatedAlert = action.payload;
                // Cancel old notification and schedule new one
                NotificationService.cancelAlert(updatedAlert.id).catch(err =>
                    console.error('Error cancelling notification:', err)
                );
                if (!updatedAlert.isCompleted) {
                    NotificationService.scheduleAlert(updatedAlert, state.settings).catch(err =>
                        console.error('Error scheduling notification:', err)
                    );
                }
                return {
                    ...state,
                    alerts: state.alerts.map(alert =>
                        alert.id === action.payload.id ? { ...alert, ...action.payload } : alert
                    ),
                };
            }

        case ActionTypes.deleteAlert:
            {
                // When deleting an alert, find the alert to get its activityId, then remove alertId from that specific activity
                const alertToDelete = state.alerts.find(alert => alert.id === action.payload);

                // Cancel the notification
                if (alertToDelete) {
                    NotificationService.cancelAlert(alertToDelete.id).catch(err =>
                        console.error('Error cancelling notification:', err)
                    );
                }

                const updatedBrewLogs = alertToDelete && alertToDelete.activityId
                    ? state.brewLogs.map(brewLog => ({
                        ...brewLog,
                        activity: brewLog.activity ? brewLog.activity.map(activity =>
                            activity.id === alertToDelete.activityId ? { ...activity, alertId: null } : activity
                        ) : []
                    }))
                    : state.brewLogs.map(brewLog => ({
                        ...brewLog,
                        activity: brewLog.activity ? brewLog.activity.map(activity =>
                            activity.alertId === action.payload ? { ...activity, alertId: null } : activity
                        ) : []
                    }));

                return {
                    ...state,
                    alerts: state.alerts.filter(alert => alert.id !== action.payload),
                    brewLogs: updatedBrewLogs,
                };
            }

        case ActionTypes.addAlertGroup:
            return {
                ...state,
                alertGroups: [...state.alertGroups, { ...action.payload, id: action.payload.id || Date.now().toString() }],
            };

        case ActionTypes.updateAlertGroup:
            return {
                ...state,
                alertGroups: state.alertGroups.map(group =>
                    group.id === action.payload.id ? { ...group, ...action.payload } : group
                ),
            };

        case ActionTypes.deleteAlertGroup:
            return {
                ...state,
                alertGroups: state.alertGroups.filter(group => group.id !== action.payload),
            };

        case ActionTypes.addInstruction:
            return {
                ...state,
                instructions: [...state.instructions, { ...action.payload, id: action.payload.id || Date.now().toString() }],
            };

        case ActionTypes.updateInstruction:
            return {
                ...state,
                instructions: state.instructions.map(instruction =>
                    instruction.id === action.payload.id ? { ...instruction, ...action.payload } : instruction
                ),
            };

        case ActionTypes.deleteInstruction:
            return {
                ...state,
                instructions: state.instructions.filter(instruction => instruction.id !== action.payload),
            };

        case ActionTypes.cloneInstruction:
            const originalInstruction = state.instructions.find(inst => inst.id === action.payload.id);
            if (originalInstruction) {
                const clonedInstruction = {
                    ...originalInstruction,
                    id: generateId(),
                    name: action.payload.newName,
                };
                return {
                    ...state,
                    instructions: [...state.instructions, clonedInstruction],
                };
            }
            return state;

        case ActionTypes.addJournalEntry:
            return {
                ...state,
                journalEntries: [...state.journalEntries, { ...action.payload, id: action.payload.id || Date.now().toString() }],
            };

        case ActionTypes.updateJournalEntry:
            return {
                ...state,
                journalEntries: state.journalEntries.map(entry =>
                    entry.id === action.payload.id ? { ...entry, ...action.payload } : entry
                ),
            };

        case ActionTypes.deleteJournalEntry:
            return {
                ...state,
                journalEntries: state.journalEntries.filter(entry => entry.id !== action.payload),
            };

        case ActionTypes.updateSettings:
            {
                const newSettings = { ...state.settings, ...action.payload };
                
                // If notifications were toggled, reschedule or cancel all
                if ('disableNotifications' in action.payload) {
                    if (action.payload.disableNotifications) {
                        // Cancel all notifications
                        NotificationService.cancelAllAlerts().catch(err =>
                            console.error('Error cancelling all notifications:', err)
                        );
                    } else {
                        // Reschedule all alerts
                        NotificationService.rescheduleAllAlerts(state.alerts, newSettings).catch(err =>
                            console.error('Error rescheduling alerts:', err)
                        );
                    }
                }
                
                return {
                    ...state,
                    settings: newSettings,
                };
            }

        case ActionTypes.loadData:
            return {
                ...state,
                ...action.payload,
                // Ensure arrays are never null/undefined
                brewLogs: action.payload.brewLogs || [],
                recipes: action.payload.recipes || [],
                alerts: action.payload.alerts || [],
                journalEntries: action.payload.journalEntries || [],
            };

        default:
            return state;
    }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [isDataLoaded, setIsDataLoaded] = React.useState(false);

    // Initialize notifications on mount
    useEffect(() => {
        const initNotifications = async () => {
            try {
                await NotificationService.initialize();
            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        initNotifications();
    }, []);

    // Load data from storage on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const savedData = await StorageService.loadData();
                if (savedData) {
                    dispatch({ type: ActionTypes.loadData, payload: savedData });
                } 
                else {
                    console.log('No saved data found, using initial state');
                }
            } 
            catch (error) {
                console.error('Error loading saved data:', error);
            } 
            finally {
                setIsDataLoaded(true);
            }
        };

        loadInitialData();
    }, []);

    // Reschedule notifications when alerts or settings change
    useEffect(() => {
        if (state.alerts.length > 0) {
            NotificationService.rescheduleAllAlerts(state.alerts, state.settings).catch(err =>
                console.error('Error rescheduling alerts on load:', err)
            );
        }
    }, [state.alerts.length > 0]); // Only trigger on initial load

    // Save data to storage whenever state changes (but only AFTER initial load completes)
    useEffect(() => {
        if (!isDataLoaded) {
            return;
        }

        const saveData = async () => {
            try {
                await StorageService.saveData(state);
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };

        saveData();
    }, [state, isDataLoaded]);

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

// Helpers
export function getDate(date) {
    const today = date ? new Date(date) : new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hour = String(today.getHours()).padStart(2, '0');
    const minute = String(today.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
};

export function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 7);
}