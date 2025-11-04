export const Validation = {
    InputMaxLength: 200,

    TextareaMaxLength: 1000,

    NumberMin: 0,

    // EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // PHONE_REGEX: /^\d{10}$/,
};


export const validatePositiveNumber = (value, currentValue = '') => {
    if (value === '') {
        return '';
    }

    // Convert to number and ensure it's positive
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= Validation.NumberMin) {
        return value;
    }

    return currentValue;
};

export default Validation;