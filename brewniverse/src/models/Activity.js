import { generateId, getDate } from '../contexts/AppContext';
import { getTopicDisplayName } from '../constants/ActivityTopics';

class Activity {
  constructor(data = {}) {
    this.alertId = data.alertId || null;
    this.brewLogId = data.brewLogId || '';
    this.date = data.date || getDate();
    this.description = data.description || '';
    this.id = data.id || generateId();
    this.name = data.name || '';
    this.topic = data.topic || 'Other';
  }

  static fromJSON(json) {
    return new Activity(json);
  }

  toJSON() {
    return {
      alertId: this.alertId,
      brewLogId: this.brewLogId,
      date: this.date,
      description: this.description,
      id: this.id,
      name: this.name,
      topic: this.topic,
    };
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

