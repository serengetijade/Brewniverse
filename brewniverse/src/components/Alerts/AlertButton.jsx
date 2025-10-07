import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';

function AlertButton({ activity, brewLogId, onAlertCreated }) {
    const { dispatch } = useApp();
    const navigate = useNavigate();

    const isDateInFuture = (dateString) => {
        const activityDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return activityDate > today;
    };

    const handleAlertButtonClick = () => {
        const activityDate = new Date(activity.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (activityDate <= today) {
            return;
        }

        if (activity.alertId) {
            const confirmNavigate = window.confirm(
                'This activity already has an alert. Would you like to go to that alert?\n\nClick OK to navigate to the alert, or Cancel to stay here.'
            );
            
            if (confirmNavigate) {
                navigate(`/alerts/${activity.alertId}`);
            }
        }
        else {
            const newAlertId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
            
            const newAlert = {
                id: newAlertId,
                name: activity.name,
                description: activity.description || '',
                date: new Date(activity.date).toISOString(),
                brewLogId: brewLogId || '',
                topic: activity.topic,
                alertGroupId: '',
                isRecurring: false,
                recurringType: 'daily',
                recurringInterval: 1,
                endDate: '',
                isCompleted: false,
                priority: 'medium'
            };

            // Dispatch to create alert
            dispatch({
                type: ActionTypes.ADD_ALERT,
                payload: newAlert
            });

            // Notify parent component to update activity with alertId
            if (onAlertCreated) {
                onAlertCreated(activity.id, newAlertId);
            }
        }
    };

    if (!isDateInFuture(activity.date)) {
        return null;
    }

    return (
        <Button
            type="button"
            variant={activity.alertId ? "primary" : "ghost"}
            size="small"
            onClick={handleAlertButtonClick}
            title={activity.alertId ? "Alert exists - click to view" : "Create alert for this activity"}
        >
            {activity.alertId ? <Bell size={16} /> : <BellOff size={16} />}
        </Button>
    );
}

export default AlertButton;