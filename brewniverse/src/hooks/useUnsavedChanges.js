import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationContext } from '../contexts/NavigationContext';

export function useUnsavedChanges(currentState, initialState, isEditing, shouldBlock = true) {
    const initialStateRef = useRef(initialState);
    const navigate = useNavigate();
    const location = useLocation();
    const navigationBlockedRef = useRef(false);
    const { setNavigationCheck, clearNavigationCheck } = useNavigationContext();

    useEffect(() => {
        initialStateRef.current = initialState;
    }, [initialState]);

    const hasUnsavedChanges = useCallback(() => {
        if (isEditing) {
            return false;
        }

        const current = typeof currentState.toJSON === 'function' 
            ? currentState.toJSON() 
            : currentState;
        const initial = typeof initialStateRef.current.toJSON === 'function'
            ? initialStateRef.current.toJSON()
            : initialStateRef.current;

        return JSON.stringify(current) !== JSON.stringify(initial);
    }, [currentState, isEditing]);

    // Prevent page refresh/close and browser back button
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (shouldBlock && hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        // Handle browser back/forward button
        const handlePopState = (e) => {
            if (shouldBlock && hasUnsavedChanges() && !navigationBlockedRef.current) {
                const confirmLeave = window.confirm(
                    'You have unsaved changes. Are you sure you want to leave without saving?'
                );

                if (!confirmLeave) {
                    // Push current state back to prevent navigation
                    window.history.pushState(null, '', location.pathname + location.search);
                }
            }
        };

        window.history.pushState(null, '', location.pathname + location.search);

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges, shouldBlock, location]);

    const resetInitialState = useCallback((newState) => {
        initialStateRef.current = newState;
    }, []);

    const checkBeforeNavigate = useCallback((path) => {
        if (!shouldBlock || !hasUnsavedChanges()) {
            navigate(path);
            return true;
        }

        const confirmLeave = window.confirm(
            'You have unsaved changes. Are you sure you want to leave without saving?'
        );

        if (confirmLeave) {
            navigationBlockedRef.current = true;
            navigate(path);
            setTimeout(() => {
                navigationBlockedRef.current = false;
            }, 100);
            return true;
        }

        return false;
    }, [hasUnsavedChanges, navigate, shouldBlock]);

    useEffect(() => {
        if (shouldBlock && hasUnsavedChanges()) {
            setNavigationCheck(checkBeforeNavigate);
        } else {
            clearNavigationCheck();
        }

        return () => {
            clearNavigationCheck();
        };
    }, [shouldBlock, hasUnsavedChanges, checkBeforeNavigate, setNavigationCheck, clearNavigationCheck]);

    return {
        hasUnsavedChanges: hasUnsavedChanges(),
        resetInitialState,
        checkBeforeNavigate,
    };
}