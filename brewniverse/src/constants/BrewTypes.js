export const BrewTypeEnum = {
  Beer: 'Beer',
  Cider: 'Cider',
  Kombucha: 'Kombucha',
  Mead: 'Mead',
  Sake: 'Sake',
  Wine: 'Wine',
  Other: 'Other'
};

export const BrewTypeConfiguration = {
  [BrewTypeEnum.Beer]: {
    id: 1,
    key: BrewTypeEnum.Beer,
    name: 'Beer',
    icon: '🍺',
    description: 'Fermented beverage made from grains, typically barley',
    color: '#F59E0B' // amber
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
    color: '#22C55E' // green
  },
  [BrewTypeEnum.Mead]: {
    id: 4,
    key: BrewTypeEnum.Mead,
    name: 'Mead',
    icon: '🍯',
    description: 'Fermented honey beverage',
    color: '#EAB308' // yellow
  },
  [BrewTypeEnum.Sake]: {
    id: 5,
    key: BrewTypeEnum.Sake,
    name: 'Sake',
    icon: '🍶',
    description: 'Japanese rice wine',
    color: '#F3F4F6' // gray
  },
  [BrewTypeEnum.Wine]: {
    id: 6,
    key: BrewTypeEnum.Wine,
    name: 'Wine',
    icon: '🍷',
    description: 'Fermented grape juice',
    color: '#DC2626' // red
  },
  [BrewTypeEnum.Other]: {
    id: 7,
    key: BrewTypeEnum.Other,
    name: 'Other',
    icon: '🧪',
    description: 'Other fermented beverages',
    color: '#6B7280' // gray
  }
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