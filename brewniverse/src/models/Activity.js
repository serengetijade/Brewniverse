import { generateId, getDate } from '../contexts/AppContext';
import { getTopicDisplayName } from '../constants/ActivityTopics';

class Activity {
    constructor(data = {}) {
        this.alertId = data.alertId || null;
        this.brewLogId = data.brewLogId || '';
        this.date = data.date || getDate();
        this.description = data.description || ''; //gravity
        this.id = data.id || generateId();
        this.name = data.name || '';
        this.topic = data.topic || 'Other';

        // Optional fields for gravity readings with ABV/volume tracking
        this.addedAbv = data.addedAbv !== undefined ? data.addedAbv : 0;
        this.addedVolume = data.addedVolume !== undefined ? data.addedVolume : 0;
        this.addedGravity = data.addedGravity !== undefined ? data.addedGravity : 0;

        this.abv = data.abv !== undefined ? data.abv : undefined;
        this.volume = data.volume !== undefined ? data.volume : undefined;

        this.additionActivityId = data.additionActivityId || null;
    }

    static fromJSON(json) {
        return new Activity(json);
    }

    toJSON() {
        const json = {
            alertId: this.alertId,
            brewLogId: this.brewLogId,
            date: this.date,
            description: this.description,
            id: this.id,
            name: this.name,
            topic: this.topic,
        };

        // Include ABV/Volume tracking properties if they exist
        if (this.addedAbv !== undefined) json.addedAbv = this.addedAbv;
        if (this.addedVolume !== undefined) json.addedVolume = this.addedVolume;
        if (this.addedGravity!== undefined) json.addedGravity = this.addedGravity;
        if (this.abv !== undefined) json.abv = this.abv;
        if (this.volume !== undefined) json.volume = this.volume;
        if (this.additionActivityId) json.additionActivityId = this.additionActivityId;
        
        return json;
    }

    validate() {
        const errors = [];
        if (!this.date) errors.push('Activity date is required');
        if (!this.topic) errors.push('Activity topic is required');
        return { isValid: errors.length === 0, errors };
    }

    hasAlert() {
        return Boolean(this.alertId);
    }

    isInFuture() {
        const activityDate = new Date(this.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return activityDate > today;
    }

    getDisplayName() {
        return this.name || getTopicDisplayName(this.topic);
    }
}

export default Activity;