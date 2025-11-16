export const getGravityActivities = (activities, gravityTopic = 'gravity') => {
    if (!Array.isArray(activities)) return [];

    return activities
        .filter(event => event.topic === gravityTopic)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getGravityOriginal = (gravityActivities) => {
    return gravityActivities.length > 0 ? gravityActivities[0].description : '';
};

export const getGravityFinal = (gravityActivities) => {
    if (gravityActivities.length <= 1) return '';
    const latestGravity = gravityActivities[gravityActivities.length - 1];
    return latestGravity && latestGravity.description ? latestGravity.description : '';
};

export const getGravity13Break = (gravityActivities) => {
    if (gravityActivities.length < 1) return '';
    const originalGravity = getGravityOriginal(gravityActivities);
    if (!originalGravity) return '';

    const result = ((parseFloat(originalGravity - 1) * 2 / 3) + 1).toFixed(3);
    return result;
};

export const getGravityDrop = (gravityActivities) => {
    if (gravityActivities.length < 2) return '';
    
    let totalDrop = 0;
    
    for (let i = 0; i < gravityActivities.length - 1; i++) {
        const currentGravity = parseFloat(gravityActivities[i].description);
        const nextGravity = parseFloat(gravityActivities[i + 1].description);
        
        // If gravity decreased (fermentation occurred), add the drop
        if (currentGravity > nextGravity) {
            totalDrop += (currentGravity - nextGravity);
        }
        // If gravity increased (step feeding), we don't subtract from the drop
    }
    
    return totalDrop.toFixed(3);
};

export const getCurrentAbv = (gravityActivities) => {
    if (gravityActivities.length < 1) return '';
    
    let totalAbv = 0;
    
    for (let i = 0; i < gravityActivities.length - 1; i++) {
        const currentGravity = parseFloat(gravityActivities[i].description);
        const nextGravity = parseFloat(gravityActivities[i + 1].description);
        
        // If gravity decreased (fermentation occurred), add the ABV produced
        if (currentGravity > nextGravity) {
            totalAbv += (currentGravity - nextGravity) * 131.25;
        }
        // If gravity increased (step feeding), we don't add to ABV
    }
    
    return totalAbv.toFixed(2);
};

export const getPotentialAbv = (gravityActivities) => {
    if (gravityActivities.length < 1) return '';
    const originalGravity = parseFloat(gravityActivities[0].description);
    if (!originalGravity) return '';

    const result = ((originalGravity - 1) * 131.25).toFixed(2);
    return result;
};

export const calculateAllGravityValues = (gravityActivities) => {
    return {
        gravityOriginal: getGravityOriginal(gravityActivities),
        gravityFinal: getGravityFinal(gravityActivities),
        gravity13Break: getGravity13Break(gravityActivities),
        currentAbv: getCurrentAbv(gravityActivities),
        potentialAbv: getPotentialAbv(gravityActivities)
    };
};

export const formatGravityDataForChart = (gravityActivities) => {
    if (!gravityActivities || gravityActivities.length === 0) {
        return [];
    }

    return gravityActivities
        .filter(activity => activity.description && !isNaN(parseFloat(activity.description)))
        .map(activity => {
            const date = new Date(activity.date);
            return {
                date: date,
                timestamp: date.getTime(),
                gravity: parseFloat(activity.description),
                dateLabel: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                })
            };
        })
        .sort((a, b) => a.timestamp - b.timestamp);
};