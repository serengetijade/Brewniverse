# Brewniverse: Brew Logging & Recipe Companion
![Banner](https://github.com/serengetijade/Brewniverse/blob/master/media/FeatureGraphic-1024x500.png?raw=true)

Brewniverse is a feature-rich brewing logbook and recipe management app crafted for homebrewers and craft beverage enthusiasts. Log every detail of your brew from start to bottle, manage recipes, set alerts, calculate ABV, and analyze fermentation with rich data visualizations. 

---
<div style="display:inline-flex">    
    <img alt="Dashboard" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/Dashboard.jpg" width="25%">
    <img alt="Brew Logs" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/BrewLogs.jpg" width="25%">
    <img alt="Grid View" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/BrewLogsDetails.jpg" width="25%">
</div>

## Features Implemented
- **Stats & Visualizations**
    - See calculated stats for each log: estimated current ABV, final ABV, fermentation progress, and benchmarks.
    - Visual charts for gravity readings, sugar use, and alcohol conversion.
    - Track ratings and journal statistics per batch.
    - Dynamically sort lists based on search criteria or provided filters.
<details>
  <summary>📸 Stats Screenshots (Click to Expand)</summary>
  <br>
  <p>
    <img alt="Edit Gravity Chart" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/EditGravityChart.jpg" width="25%">
    <img alt="Details Abv Converstion" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/DetailsAbvConversion.jpg" width="25%">
    <img alt="Details Sugar Consumption" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/DetailsSugarConsumption.jpg" width="25%">
  </p>
</details>

- **Brew Log Management**
    - Record detailed logs for every batch: from ingredients, timings, and additions to ABV tracking and fermentation milestones.
    - Robust gravity & alcohol tracking – chart, predict, and visualize fermentation and ABV over time.
    - Auto calculate 1/3 break
    - Add activities for every stage: pitching yeast, racking, bottling, stabilization, and more.
    - Import recipe ingredients directly into logs.
    - Add custom ingredients to suit any style or experiment.
    - Change the order of ingredients with click and drag design.
    - Jump to a linked recipe for instructions, or create your own to do list.
    - Record step feeding or additions, then automatically calculate new ABV %, volume, gravity.
    - Collapsible sections for easy mobile reading.
    - Status badges (Fermenting, Secondary, Bottled, Archived) for quick status updates.
    - Journal entries per batch, to record your tasting notes.
<details>
  <summary>📸 Brew Log Screenshots (Click to Expand)</summary>
  <br>
  <p>
    <img alt="Basic Details" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/EditBasicDetails.jpg" width="25%">
    <img alt="Edit Nutrient Schedule" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/EditNutrientSchedule.jpg" width="25%">    
    <img alt="Activity Timeline" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/DetailsActivityTimeline.jpg" width="25%">
  </p>
</details>

- **Recipes**
    - Manage a personalized recipe book for your brews.
    - Primary/secondary ingredients, detailed instructions, notes, and difficulty grading.
    - Rate recipes for personal ranking and reference.
    - See which brew logs are using each recipe.
<details>
  <summary>📸 Recipe Screenshots (Click to Expand)</summary>
  <br>
  <p>
    <img alt="Recipe Instructions" src="https://raw.githubusercontent.com/serengetijade/Brewniverse/refs/heads/master/media/RecipeInstructions.jpg" width="25%">    
  </p>
</details>

- **Alerts**
    - Set reminders for crucial brew events (nutrient additions, racking, stabilization, bottling, etc).
    - Active/archived alert workflows ensure you never miss a fermentation task.
    - Link alerts to specific batches or keep them general.

- **Brewing Calculators**
    - Alcohol By Volume (ABV), dilution/alcohol blending, sugar/chaptalization calculator,
    - Brix / Specific Gravity converter
    - All calculators accessible in a unified toolbox.

- **Modern UI/UX**
    - Fast, clean design built with React, Vite, and Lucide icons.
    - Persistent state, smooth navigation flows, and touch-friendly components.

- **Data Handling**
    - In-browser state, no server/backend required for your logs (portable, private, fast startup).

- **Data Storage & Export**
    - Uses a flexible StorageService that detects the optimal storage backend (Capacitor Filesystem, localStorage, or in-memory fallback).
    - All brew log, recipe, and alert data can be exported as a backup JSON file or imported to restore data or migrate to another device.
    - Safe, simple data export and import via mobile share or browser download, without server dependencies.

---
# Technologies Used

- **Frontend**: React 19, Vite, Lucide Icons
- **Visualization**: recharts
- **Mobile-ready**: Capacitor for PWA/mobile deployment

## Project Setup

Initialize, install dependencies, and run in development:

```bash
npm install
npm run dev
```
---
# Code Summary
Brewniverse employs a class-based model organization. Core objects such as BrewLog, Activity, Ingredient, Recipe, and more are defined as classes in the models directory (`src/models/`). This ensures each log, recipe, and activity is typed, validated, and can serialize/deserialize to/from JSON for persistence.

Key logic for manipulating these objects—including field validation, updating, and relationship management (e.g. linking Activities to BrewLogs or Recipes)—is implemented as methods within each class. Mutation and retrieval operations are organized into the components themselves, keeping stateful logic close to UI concerns and enabling rapid, interactive updates. This structure is similar in responsibility separation to MVC, but with logic centralized in classes and React components rather than controllers and views.

## Brew Logs
- Basic Info: Name, type, created date, description, rating, linked recipe
- View the list as detailed cards or a quick simplified version
- Ingredients: Primary and secondary, with units and custom ordering
- Activities: All actions/events logged with date, type, and notes
- Gravity Readings: A specific activity type with additional functionality. Dynamic calculations for ABV, OG, FG, 1/3 break, step feeds
- Additions: Volume/sugar/flavor/back-sweetening events, with automatic impact on volumes and gravity
- Journal: Tasting notes and observations
- Archival: Retain finished, bottled, or split-off batches.

### Activity Component and ActivityList Component
The Activity and ActivityList components are foundational for modular event tracking within each Brew Log.

- **ActivityList** handles all activities (tasks, readings, additions, racking, notes, etc.) of a given type ("topic") for a BrewLog, enabling add/remove, auto-sorting, and rendering.
- **Activity** encapsulates the logic and state handling for a single event, such as a gravity reading, nutrient addition, or rack date. Each Activity can trigger creation/deletion of an associated alert, supports granular state changes (with onChange handlers), and cascades updates when changing time- or value-sensitive fields (like gravity, abv, or addition amount).

All mutations are managed via methods (e.g., `addActivity`, `updateActivity`, `deleteActivity`) exported from the Activity component itself, which operate directly on BrewLog data. This modular approach allows for complex relationships (like triggering gravity or ABV recalculations) to be handled at the point of change.

### Tracking Gravity and ABV
Record multiple gravity readings. Each entry (and change) auto-calculates brew log values. Changes to the Starting Volume also trigger recalculations.

- Original Gravity
- 1/3 Break Gravity (for nutrient timing)
- Final Gravity
- Current ABV

```jsx
export const getGravityAbvVolumeData = (currentInputs, gravityActivities, initialVolume = 1) => {
    const parsedAbv = parseFloat(currentInputs?.addedAbv);
    const parsedAddedGravity = parseFloat(currentInputs?.addedGravity);
    const parsedVolume = parseFloat(currentInputs?.addedVolume);
    const parsedGravityReading = parseFloat(currentInputs?.description);

    const addedAbv = isNaN(parsedAbv) ? 0 : parsedAbv;
    const addedGravity = isNaN(parsedAddedGravity) ? 0 : parsedAddedGravity;
    const addedVolume = isNaN(parsedVolume) ? 0 : parsedVolume;
    const gravityReading = isNaN(parsedGravityReading) ? 0 : parsedGravityReading;

    const previousGravityActivity = getPreviousActivity(currentInputs.id, gravityActivities);

    let startingAbv = previousGravityActivity ?
        parseFloat(previousGravityActivity?.abv ?? getCurrentAbv(gravityActivities)) ?? 0
        : 0;

    let startingVolume = parseFloat(previousGravityActivity?.volume ?? initialVolume);

    // VOLUME
    const volumeResult = startingVolume + addedVolume;
    if (volumeResult < 0) {
        volumeResult = 0; // Volume cannot be negative
    };

    // GRAVITY - Calculate the weighted average current gravity
    const previousFinalVolume = parseFloat(previousGravityActivity?.volume ?? initialVolume);
    const previousGravity = parseFloat(previousGravityActivity?.description ?? 0);

    let gravityResult = gravityReading;
    if (0 < addedVolume && 0 < volumeResult) { // Handle additions
        let totalGravity = (previousGravity * previousFinalVolume) + (addedGravity * addedVolume);
        gravityResult = totalGravity / volumeResult;
    }

    // ABV - Calculate weighted average ABV or from gravity drop
    let abvResult = startingAbv;
    if (0 < addedVolume && 0 <= addedAbv) {
        const totalAlcohol = (startingAbv * startingVolume) + (addedAbv * addedVolume);
        abvResult = totalAlcohol / volumeResult;
    }
    else if (addedVolume < 0 || (addedVolume === 0 && addedAbv === 0)) {
        const gravityDrop = previousGravity - gravityResult;
        const abvFromGravityDrop = 0 < gravityDrop ? gravityDrop * 131.25 : 0;
        abvResult += abvFromGravityDrop;
    }

    return {
        startingAbv: startingAbv?.toFixed(2) || 0,
        startingGravity: previousGravity.toFixed(3) || 1.000,
        startingVolume: startingVolume?.toFixed(3) || 0,

        addedAbv: addedAbv?.toFixed(2) || 0,
        addedGravity: addedGravity?.toFixed(3) || 0,
        addedVolume: addedVolume?.toFixed(3) || 0,

        abv: abvResult?.toFixed(2) || 0,
        gravity: gravityResult?.toFixed(3) || 1.000,
        volume: volumeResult?.toFixed(3)
    };
};
```
Gravity values are graphed and summarized in charts for quick fermentation analysis. Whenever a gravity reading is updated, it recalculates all following actvity records and updates abv and gravity accordingly.
```jsx
function updateGravityActivities(prevData, id, field, value) {
    const thisActivity = prevData.activity.find(x => String(x.id) === String(id));

    if (thisActivity?.topic == ActivityTopicEnum.Gravity && field == "description") {
        let gravityActivities = getGravityActivities(prevData.activity);

        var currentInputs = {
            addedAbv: thisActivity.abv,
            addedGravity: thisActivity.addedGravity,
            addedVolume: thisActivity.addedVolume,
            date: thisActivity.date,
            description: thisActivity.description,
            id: thisActivity.id
        }

        currentInputs[field] = value;

        const updatedActivities = UpdateAllGravityActivity(
            thisActivity,
            currentInputs,
            gravityActivities,
            parseFloat(prevData.volume)
        )

        // Update all gravity activities with the recalculated values
        const updatedActivityArray = prevData.activity.map(item => {
            const updatedActivity = updatedActivities.find(ua => ua.id === item.id);
            return updatedActivity ? updatedActivity : item;
        });

        return {
            ...prevData,
            activity: updatedActivityArray,
            currentAbv: getCurrentAbv(updatedActivities)
        };
    }

    // Return null if not a gravity update, so caller knows to handle it differently
    return null;
}
```

### Record Additions and auto-calculate Brew Log data
Gravity readings are not the only thing that influence final ABV% and final gravity. Additions (such as fermentable sugars) or dilutions with a solution (such as juice) will affect those values. Additions are an activity with specific properties used to recalculate those figures.
```jsx
function updateAdditionActivities(prevData, id, field, value) {
    const thisActivity = prevData.activity.find(x => String(x.id) === String(id));

    if (thisActivity?.topic == ActivityTopicEnum.Addition) {
        let updatedActivities = prevData.activity.map(item => {
            if (item.id === id) {
                const updated = { ...item };
                updated[field] = value;

                if (updated.addedAbv === undefined) updated.addedAbv = 0;
                if (updated.addedVolume === undefined) updated.addedVolume = 0;
                if (updated.addedGravity === undefined) updated.addedGravity = 0;

                return updated;
            }
            return item;
        });

        const updatedAddition = updatedActivities.find(x => x.id === id);

        const linkedGravityActivities = updatedActivities.filter(
            activity => activity.additionActivityId === id && activity.topic === ActivityTopicEnum.Gravity
        );

        // Check if we have the required fields to create/update a gravity activity
        const hasRequiredFields = parseFloat(updatedAddition.addedVolume) > 0
            && parseFloat(updatedAddition.addedAbv) >= 0
            && parseFloat(updatedAddition.addedGravity) > 0;

        let gravityActivities = getGravityActivities(updatedActivities);

        if (hasRequiredFields && linkedGravityActivities.length === 0) {
            // Create new gravity activity linked to this addition

            const newGravityActivity = new ActivityModel({
                date: getDate(updatedAddition.date) ?? getDate(),
                name: getTopicDisplayName(ActivityTopicEnum.Gravity),
                topic: ActivityTopicEnum.Gravity,
                brewLogId: updatedAddition.brewLogId,
                additionActivityId: id,
                addedAbv: parseFloat(updatedAddition.addedAbv) || 0,
                addedVolume: parseFloat(updatedAddition.addedVolume) || 0,
                addedGravity: parseFloat(updatedAddition.addedGravity) || 0
            });

            const currentInputs = {
                addedAbv: parseFloat(updatedAddition.addedAbv) || 0,
                addedGravity: parseFloat(updatedAddition.addedGravity) || 0,
                addedVolume: parseFloat(updatedAddition.addedVolume) || 0,
                date: updatedAddition.date,
                id: newGravityActivity.id
            };

            const calculatedGravity = UpdateGravityActivity(
                newGravityActivity,
                currentInputs,
                gravityActivities,
                parseFloat(prevData.volume) || 0
            );

            updatedActivities.push(calculatedGravity.toJSON());
            gravityActivities = getGravityActivities(updatedActivities);

            return {
                ...prevData,
                activity: updatedActivities,
                currentAbv: getCurrentAbv(gravityActivities)
            };
        }
        else if (linkedGravityActivities.length > 0) {
            const linkedGravity = linkedGravityActivities[0];

            const gravityActivityToUpdate = gravityActivities.find(g => g.id === linkedGravity.id);

            if (gravityActivityToUpdate) {
                const currentInputs = {
                    addedAbv: updatedAddition.addedAbv,
                    addedGravity: updatedAddition.addedGravity,
                    addedVolume: updatedAddition.addedVolume,
                    date: updatedAddition.date,
                    description: linkedGravity.description,
                    id: linkedGravity.id
                };

                const recalculatedGravities = UpdateAllGravityActivity(
                    gravityActivityToUpdate,
                    currentInputs,
                    gravityActivities,
                    parseFloat(prevData.volume) || 0
                );

                updatedActivities = updatedActivities.map(item => {
                    const recalculated = recalculatedGravities.find(rg => rg.id === item.id);
                    return recalculated ? recalculated : item;
                });

                gravityActivities = getGravityActivities(updatedActivities);
            }

            return {
                ...prevData,
                activity: updatedActivities,
                currentAbv: getCurrentAbv(gravityActivities)
            };
        }

        return {
            ...prevData,
            activity: updatedActivities
        };
    }

    return null;
}

```

### Import Ingredients From a Recipe

Use the 'Import Ingredients' button in the Brew Log form to pull in ingredients directly from any saved recipe. Ingredients are given unique ids so that they can be customized from the recipe.

```jsx
    const importIngredientsFromRecipe = () => {
        if (!formState.recipeId) {
            alert('Please select a recipe to import ingredients from.');
            return;
        }

        const recipe = state.recipes.find(r => r.id === formState.recipeId);
        if (!recipe) {
            alert('Selected recipe not found.');
            return;
        }

        const copyWithNewIds = (items = []) => {
            return items.map(item => ({
                id: generateId(),
                name: item.name || '',
                amount: item.amount || '',
                unit: item.unit || 'oz',
                order: item.order !== undefined ? item.order : 0
            }));
        };

        const primary = copyWithNewIds(recipe.ingredientsPrimary);
        const secondary = copyWithNewIds(recipe.ingredientsSecondary);

        updateFormDataCallback(prev => ({
            ...prev,
            ingredientsPrimary: [...prev.ingredientsPrimary, ...primary],
            ingredientsSecondary: [...prev.ingredientsSecondary, ...secondary]
        }));
    };
```

### Activities, Journal & Archiving

Each Brew Log supports:
- Full activity timeline: yeast additions, nutrient schedules, acids/bases, racking, bottling, and custom entries.
- Journal section: tasting notes, feedback, and reflections for each batch.
- Archive feature: mark finished brews to keep your history tidy with just one click.

## Recipes

- Store your favorite recipes with detailed instructions, difficulty grading, and estimated ABV.
- Monitor all batches made from a given recipe.

## Alerts

- Schedule events linked to your logs.
- Alerts visible on the Alerts page and highlighted on Brew Logs for quick reference.
- Alerts trigger push notifications to the user.

## Calculators

Navigate to the Calculators section for a full suite:

- ABV Calculator: OG/FG → ABV in one click
- ABV Dilution Calculator: Find resulting ABV after blending
- Chaptalization (Sugar) Calculator: Plan sugar additions for target strength
- Brix↔SG Converter: Convert refractometer/Brix readings

---
