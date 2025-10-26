import { generateId, getDate } from '../contexts/AppContext';
import { getCurrentAbv, getGravity13Break, getGravityFinal, getGravityOriginal, getPotentialAbv } from '../utils/gravityCalculations';

class BrewLog {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.acids = data.acids || '';
        this.activity = data.activity || [];
        this.bases = data.bases || '';
        this.currentAbv = data.currentAbv || '';
        this.dateBottled = data.dateBottled || '';
        this.dateCreated = data.dateCreated || getDate();
        this.description = data.description || '';
        this.gravity13Break = data.gravity13Break || '';
        this.gravityFinal = data.gravityFinal || '';
        this.gravityOriginal = data.gravityOriginal || '';
        this.ingredientsPrimary = data.ingredientsPrimary || [];
        this.ingredientsSecondary = data.ingredientsSecondary || [];
        this.name = data.name || '';
        this.notes = data.notes || '';
        this.nutrients = data.nutrients || '';
        this.pecticEnzyme = data.pecticEnzyme || '';
        this.potentialAbv = data.potentialAbv || '';
        this.rating = data.rating || 0;
        this.recipeId = data.recipeId || '';
        this.tannins = data.tannins || '';
        this.type = data.type || 'Mead';
        this.volume = data.volume || '';
        this.yeast = data.yeast || '';
    }

    static fromJSON(json) {
        return new BrewLog(json);
    }

    toJSON() {
        return {
            acids: this.acids,
            activity: this.activity,
            bases: this.bases,
            currentAbv: this.getCurrentAbv(),
            dateBottled: this.dateBottled,
            dateCreated: this.dateCreated,
            dateStabilized: this.dateStabilized,
            description: this.description,
            gravity13Break: this.getGravity13Break(),
            gravityFinal: this.getGravityFinal(),
            gravityOriginal: this.getGravityOriginal(),
            id: this.id,
            ingredientsPrimary: this.ingredientsPrimary,
            ingredientsSecondary: this.ingredientsSecondary,
            name: this.name,
            notes: this.notes,
            nutrients: this.nutrients,
            pecticEnzyme: this.pecticEnzyme,
            potentialAbv: this.getPotentialAbv(),
            rating: this.rating,
            recipeId: this.recipeId,
            stabilize: this.stabilize,
            tannins: this.tannins,
            type: this.type,
            volume: this.volume,
            yeast: this.yeast,
        };
    }

    validate() {
        const errors = [];
        if (!this.name || this.name.trim() === '') errors.push('Brew log name is required');
        if (!this.type) errors.push('Brew type is required');
        if (!this.dateCreated) errors.push('Date created is required');
        return { isValid: errors.length === 0, errors };
    }

    getGravityOriginal() {
        return getGravityOriginal(this.activity);
    }

    getGravityFinal() {
        return getGravityFinal(this.activity);
    }

    getGravity13Break() {
        return getGravity13Break(this.activity);
    }

    getCurrentAbv() {
        return getCurrentAbv(this.activity);
    }

    getPotentialAbv() {
        return getPotentialAbv(this.activity);
    }

    hasRecipe() {
        return Boolean(this.recipeId);
    }

    isBottled() {
        return Boolean(this.dateBottled);
    }

    isStabilized() {
        return Boolean(this.dateStabilized);
    }

    getStatus() {
        if (this.isBottled()) return 'Bottled';
        if (this.isStabilized()) return 'Stabilized';
        return 'Fermenting';
    }

    getTotalIngredientCount() {
        return this.ingredientsPrimary.length + this.ingredientsSecondary.length;
    }

    getAllIngredients() {
        return [...this.ingredientsPrimary, ...this.ingredientsSecondary];
    }

    getActivityCount() {
        return this.activity.length;
    }
}

export default BrewLog;