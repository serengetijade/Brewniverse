import { generateId, getDate } from '../contexts/AppContext';

class Recipe {
  constructor(data = {}) {
    this.dateCreated = data.dateCreated || getDate();
    this.description = data.description || '';
    this.difficulty = data.difficulty || 'Beginner';
    this.estimatedABV = data.estimatedABV || '';
    this.id = data.id || generateId();
    this.ingredientsPrimary = data.ingredientsPrimary || [];
    this.ingredientsSecondary = data.ingredientsSecondary || [];
    this.instructions = data.instructions || [''];
    this.name = data.name || '';
    this.notes = data.notes || '';
    this.rating = data.rating || 0;
    this.type = data.type || 'Mead';
    this.volume = data.volume || '';
  }

  static fromJSON(json) {
    return new Recipe(json);
  }

  toJSON() {
    return {
      dateCreated: this.dateCreated,
      description: this.description,
      difficulty: this.difficulty,
      estimatedABV: this.estimatedABV,
      id: this.id,
      ingredientsPrimary: this.ingredientsPrimary,
      ingredientsSecondary: this.ingredientsSecondary,
      instructions: this.instructions,
      name: this.name,
      notes: this.notes,
      rating: this.rating,
      type: this.type,
      volume: this.volume,
    };
  }

  validate() {
    const errors = [];
    if (!this.name || this.name.trim() === '') errors.push('Recipe name is required');
    if (!this.type) errors.push('Recipe type is required');
    if (!this.dateCreated) errors.push('Date created is required');
    return { isValid: errors.length === 0, errors };
  }

  getTotalIngredientCount() {
    return this.ingredientsPrimary.length + this.ingredientsSecondary.length;
  }

  hasIngredients() {
    return this.getTotalIngredientCount() > 0;
  }

  getAllIngredients() {
    return [...this.ingredientsPrimary, ...this.ingredientsSecondary];
  }

  clone(newName) {
    const clonedData = { ...this.toJSON() };
    clonedData.name = newName || `${this.name} (Copy)`;
    clonedData.dateCreated = getDate();
    delete clonedData.id;
    return new Recipe(clonedData);
  }
}

export default Recipe;

