import React, { createContext, useContext, useRef } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
    const navigationCheckRef = useRef(null);

    const setNavigationCheck = (checkFn) => {
        navigationCheckRef.current = checkFn;
    };

    const clearNavigationCheck = () => {
        navigationCheckRef.current = null;
    };

    const safeNavigate = (pathOrCallback, navigateFn) => {
        if (navigationCheckRef.current) {
            // If there's a check function, call it with the path or callback
            if (typeof pathOrCallback === 'function') {
                // For navigate(-1) or other callback-style navigation
                const confirmLeave = window.confirm(
                    'You have unsaved changes. Are you sure you want to leave without saving?'
                );
                if (confirmLeave) {
                    pathOrCallback();
                }
            } else {
                // For regular path navigation
                navigationCheckRef.current(pathOrCallback);
            }
        } else {
            // No check function, navigate directly
            if (typeof pathOrCallback === 'function') {
                pathOrCallback();
            } else {
                navigateFn(pathOrCallback);
            }
        }
    };

    return (
        <NavigationContext.Provider value={{ setNavigationCheck, clearNavigationCheck, navigate: safeNavigate }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigationContext() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationContext must be used within NavigationProvider');
    }
    return context;
}