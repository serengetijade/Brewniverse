import { generateId, getDate } from '../contexts/AppContext';

class Alert {
    constructor(data = {}) {
        this.activityId = data.activityId || '';
        this.brewLogId = data.brewLogId || '';
        this.date = data.date || getDate();
        this.description = data.description || '';
        this.endDate = data.endDate || '';
        this.id = data.id || generateId();
        this.isCompleted = data.isCompleted || false;
        this.isRecurring = data.isRecurring || false;
        this.name = data.name || '';
        this.priority = data.priority || 'medium';
        this.recurringInterval = data.recurringInterval || 1;
        this.recurringType = data.recurringType || 'daily';
    }

    static fromJSON(json) {
        return new Alert(json);
    }

    toJSON() {
        return {
            activityId: this.activityId,
            brewLogId: this.brewLogId,
            date: this.date,
            description: this.description,
            endDate: this.endDate,
            id: this.id,
            isCompleted: this.isCompleted,
            isRecurring: this.isRecurring,
            name: this.name,
            priority: this.priority,
            recurringInterval: this.recurringInterval,
            recurringType: this.recurringType,
        };
    }

    validate() {
        const errors = [];
        if (!this.name || this.name.trim() === '') errors.push('Alert name is required');
        if (!this.date) errors.push('Alert date is required');
        return { isValid: errors.length === 0, errors };
    }

    isOverdue() {
        if (this.isCompleted) return false;
        return new Date(this.date) < new Date();
    }

    isDueToday() {
        const alertDate = new Date(this.date);
        const today = new Date();
        return alertDate.toDateString() === today.toDateString();
    }

    hasBrewLog() {
        return Boolean(this.brewLogId);
    }

    hasActivity() {
        return Boolean(this.activityId);
    }

    getPriorityLevel() {
        const priorities = { low: 1, medium: 2, high: 3, urgent: 4 };
        return priorities[this.priority] || 2;
    }
}

export default Alert;

