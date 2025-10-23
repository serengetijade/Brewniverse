import { generateId } from '../contexts/AppContext';

class Ingredient {
  constructor(data = {}) {
    this.amount = data.amount || '';
    this.id = data.id || generateId();
    this.name = data.name || '';
    this.unit = data.unit || 'oz';
  }

  static fromJSON(json) {
    return new Ingredient(json);
  }

  toJSON() {
    return {
      amount: this.amount,
      id: this.id,
      name: this.name,
      unit: this.unit,
    };
  }

  validate() {
    const errors = [];
    if (!this.name || this.name.trim() === '') errors.push('Ingredient name is required');
    return { isValid: errors.length === 0, errors };
  }

  getDisplayText() {
    if (this.name && this.amount && this.unit) {
      return `${this.name} - ${this.amount} ${this.unit}`;
    }
    if (this.name) {
      return this.name;
    }
    return 'New ingredient';
  }

  hasAmount() {
    return Boolean(this.amount);
  }
}

export default Ingredient;

