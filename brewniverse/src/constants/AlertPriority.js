export const AlertPriority = {
    low: {
        value: 'low',
        label: 'Low',
        color: '#28a745'
    },
    medium: {
        value: 'medium',
        label: 'Medium',
        color: '#ffc107' 
    },
    high: {
        value: 'high',
        label: 'High',
        color: '#fd7e14'
    },
    urgent: {
        value: 'urgent',
        label: 'Urgent',
        color: '#dc3545' 
    }
};

export const getPriorityConfig = (priority) => {
    return AlertPriority[priority] || AlertPriority.low;
};
