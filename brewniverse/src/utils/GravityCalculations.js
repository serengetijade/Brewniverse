export const getGravityActivities = (activities, gravityTopic = 'gravity') => {
    if (!Array.isArray(activities)) return [];

    return activities
        .filter(event => event.topic === gravityTopic)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getGravityOriginal = (gravityActivities) => {
    return gravityActivities.length > 0 ? gravityActivities[0].description : '';
};

export const getPreviousActivity = (currentReadingId, gravityActivities = []) => {
    gravityActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    let previousReading = null;

    let currentIndex = -1;
    if (currentReadingId) {
        for (let i = 0; i < gravityActivities.length; i++) {
            if (gravityActivities[i].id === currentReadingId) {
                currentIndex = i;
                break;
            }
        }
    }

    if (currentIndex === 0) {
        return null;
    }
    if (currentIndex !== -1 && 0 <= currentIndex - 1) {
        previousReading = currentIndex > 0 ? gravityActivities[currentIndex - 1] : null;
    }
    else if (gravityActivities.length > 0) {
        previousReading = gravityActivities[gravityActivities.length - 1];
    }

    return previousReading;
}

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
    if (gravityActivities == null || gravityActivities?.length < 1) return '';

    // If the latest gravity activity has abv calculated, use that
    const latestGravity = gravityActivities[gravityActivities.length - 1];
    if (latestGravity && latestGravity.abv !== null && latestGravity.abv !== undefined) {
        return parseFloat(latestGravity.abv)?.toFixed(2) || 0;
    }

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

export const getGravityAbvVolumeData = (currentInputs, gravityActivities, initialVolume = 1) => {
    gravityActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

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

export const UpdateGravityActivityData = (activity, currentInputs, gravityActivities, initialVolume = 1) => {
    let data = getGravityAbvVolumeData(currentInputs, gravityActivities, initialVolume);

    activity.abv = data.abv;
    activity.addedAbv = data.addedAbv;
    activity.addedGravity = data.addedGravity;
    activity.addedVolume = data.addedVolume;
    activity.date = currentInputs.date;
    activity.description = data.gravity;
    activity.volume = data.volume;

    return activity;
}

export const UpdateAllGravityActivity = (activity, currentInputs, gravityActivities, initialVolume = 1) => {
    gravityActivities.sort((a, b) => new Date(a.date) - new Date(b.date)); 
    
    let activeActivity = UpdateGravityActivityData(activity, currentInputs, gravityActivities, initialVolume);

    let result = []

    for (let i = 0; i < gravityActivities.length; i++) {
        if (i < activeIndex) {
            continue;
        }

        if (i == activeIndex) {
            result.push(activeActivity);
            continue;
        }

        let item = gravityActivities[i];
        var updatedActivity = UpdateGravityActivityData(
            item,
            {
                addedAbv: item.addedAbv,
                addedGravity: item.addedGravity,
                addedVolume: item.addedVolume,
                description: item.description,
                date: item.date,
                id: item.id
            },
            result,
            item.volume - item.addedVolume
        )

        result.push(updatedActivity);
    };

    return result;
}