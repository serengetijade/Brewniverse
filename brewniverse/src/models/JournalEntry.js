import { generateId, getDate } from '../contexts/AppContext';

class JournalEntry {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.abv = data.abv || '';
        this.brand = data.brand || '';
        this.brewLogId = data.brewLogId || '';
        this.brewType = data.brewType || 'Beer';
        this.date = data.date || getDate();
        this.name = data.name || '';
        this.notes = data.notes || '';
        this.rating = data.rating || 0;
        this.style = data.style || '';
        this.venue = data.venue || '';
    }

    static fromJSON(json) {
        return new JournalEntry(json);
    }

    toJSON() {
        return {
            id: this.id,
            abv: this.abv,
            brand: this.brand,
            brewLogId: this.brewLogId,
            brewType: this.brewType,
            date: this.date,
            name: this.name,
            notes: this.notes,
            rating: this.rating,
            style: this.style,
            venue: this.venue,
        };
    }

    validate() {
        const errors = [];
        if (!this.name || this.name.trim() === '') errors.push('Name is required');
        if (!this.date) errors.push('Date is required');
        return { isValid: errors.length === 0, errors };
    }

    hasBrewLog() {
        return Boolean(this.brewLogId);
    }
}

export default JournalEntry;

