export const BrewTypeEnum = {
    Acerglyn: 'Acerglyn',
    Beer: 'Beer',
    Cider: 'Cider',
    Kombucha: 'Kombucha',
    Mead: 'Mead',
    Melomel: 'Melomel',
    Metheglin: 'Metheglin',
    Sake: 'Sake',
    Wine: 'Wine',
    Vinegar: 'Vinegar',
    Other: 'Other'
};

export const BrewTypeConfiguration = {
    [BrewTypeEnum.Acerglyn]: {
        id: 1,
        key: BrewTypeEnum.Acerglyn,
        name: 'Acerglyn',
        icon: '🍁',
        description: 'Brewed maply syrup & honey',
        color:'#c31553' //'#d7265d' // pink
    },
    [BrewTypeEnum.Beer]: {
        id: 1,
        key: BrewTypeEnum.Beer,
        name: 'Beer',
        icon: '🍺',
        description: 'Fermented drink made from grains, typically barley',
        color: '#DB810A' // amber
    },
    [BrewTypeEnum.Cider]: {
        id: 2,
        key: BrewTypeEnum.Cider,
        name: 'Cider',
        icon: '🍏',
        description: 'Fermented apple juice',
        color: '#84CC16' // lime
    },
    [BrewTypeEnum.Kombucha]: {
        id: 3,
        key: BrewTypeEnum.Kombucha,
        name: 'Kombucha',
        icon: '🫖', //teapot
        description: 'Fermented tea with SCOBY',
        color: '#fa673a' // orange
    },
    [BrewTypeEnum.Mead]: {
        id: 4,
        key: BrewTypeEnum.Mead,
        name: 'Mead',
        icon: '🍯',
        description: 'Fermented honey beverage',
        color: '#EAB308' // yellow 
    },
    [BrewTypeEnum.Metheglin]: {
        id: 4,
        key: BrewTypeEnum.Metheglin,
        name: 'Metheglin',
        icon: '🌿',
        description: 'Fermented herbs & honey',
        color: '#7ba25b' // green
    },
    [BrewTypeEnum.Melomel]: {
        id: 4,
        key: BrewTypeEnum.Melomel,
        name: 'Melomel',
        icon: '🍹',
        description: 'Fermented fruit & honey',
        color: '#FFCFDF' // light pink
    },
    [BrewTypeEnum.Sake]: {
        id: 5,
        key: BrewTypeEnum.Sake,
        name: 'Sake',
        icon: '🍶',
        description: 'Japanese rice wine',
        color: '#3994f2' // blue
    },
    [BrewTypeEnum.Wine]: {
        id: 6,
        key: BrewTypeEnum.Wine,
        name: 'Wine',
        icon: '🍷',
        description: 'Fermented grape juice',
        color:  '#de239b' //'#9f65b5' magenta
    },
    [BrewTypeEnum.Vinegar]: {
        id: 7,
        key: BrewTypeEnum.Vinegar,
        name: 'Vinegar',
        icon: '🏺',
        description: 'Anything fermented + Acetobacter',
        color: '#904194' //purple
    },
    [BrewTypeEnum.Other]: {
        id: 7,
        key: BrewTypeEnum.Other,
        name: 'Other',
        icon: '🧪',
        description: 'Other fermented beverages',
        color: '#267f6b' // teal
    },
};

export const getAllBrewTypes = () => {
    return Object.values(BrewTypeConfiguration);
};

export const getAllBrewTypeKeys = () => {
    return Object.keys(BrewTypeConfiguration);
};

export const getBrewTypeColor = (type) => {
    const config = getBrewTypeConfig(type);
    return config.color;
};

export const getBrewTypeConfig = (type) => {
    return BrewTypeConfiguration[type] || BrewTypeConfiguration[BrewTypeEnum.Other];
};

export const getBrewTypeIcon = (type) => {
    const config = getBrewTypeConfig(type);
    return config.icon;
};

export const getBrewTypeName = (type) => {
    const config = getBrewTypeConfig(type);
    return config.name;
};

const BrewTypes = getAllBrewTypes();

export default BrewTypes;