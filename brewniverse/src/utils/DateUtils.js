export const calculateDaysSince = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const getDaysSinceAsDescription = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 365) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    else {
        const diffYears = (diffDays / 365).toFixed(2);
        return `${diffYears} years ago`;
    }
};