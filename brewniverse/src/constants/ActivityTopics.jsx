import {
  Scale,
  Sparkles,
  Pill,
  TestTubeDiagonal,
  FlaskConical,
  FlaskRound,
  Leaf,
  Activity as ActivityIcon,
  BottleWine,
  PlayCircle,
  MoveVertical,
  Shield,
} from 'lucide-react';

export const ActivityTopicEnum = {
  Acid: 'acid',
  Base: 'base',
  DateBottled: 'datebottled',
  DateCreated: 'datecreated',
  DateRacked: 'dateracked',
  DateStabilized: 'datestabilized',
  Gravity: 'gravity',
  Nutrient: 'nutrient',
  PecticEnzyme: 'pecticenzyme',
  PH: 'ph',
  Tannin: 'tannin',
  Yeast: 'yeast',
  Other: 'other'
};

export const ActivityTopicConfiguration = {
  [ActivityTopicEnum.Gravity]: {
    key: ActivityTopicEnum.Gravity,
    color: '#3b82f6', // blue-500
    description: 'Specific gravity measurements for tracking fermentation progress',
    displayName: 'Gravity Reading',
    displayName_Alert: 'Take Gravity Reading',
    icon: Scale,
    label: 'Gravity'
  },
  [ActivityTopicEnum.Yeast]: {
    key: ActivityTopicEnum.Yeast,
    color: '#8b5cf6', // violet-500
    description: 'Yeast pitching and additions',
    displayName: 'Yeast Added',
    displayName_Alert: 'Add Yeast',
    icon: Sparkles,
    label: 'Yeast'
  },
  [ActivityTopicEnum.Nutrient]: {
    key: ActivityTopicEnum.Nutrient,
    color: '#10b981', // emerald-500
    description: 'Yeast nutrient additions',
    displayName: 'Nutrients Added',
    displayName_Alert: 'Add Nutrients',
    icon: Pill,
    label: 'Nutrients'
  },
  [ActivityTopicEnum.PecticEnzyme]: {
    key: ActivityTopicEnum.PecticEnzyme,
    color: '#a855f7', // purple-500
    description: 'Pectic enzyme additions for clarity',
    displayName: 'Pectic Enzyme Added',
    displayName_Alert: 'Add Pectic Enzyme',
    icon: TestTubeDiagonal,
    label: 'Pectic Enzyme'
  },
  [ActivityTopicEnum.Acid]: {
    key: ActivityTopicEnum.Acid,
    color: '#eab308', // yellow-500
    description: 'Acid additions for pH adjustment',
    displayName: 'Acid Added',
    displayName_Alert: 'Add Acid',
    icon: FlaskConical,
    label: 'Acids'
  },
  [ActivityTopicEnum.Base]: {
    key: ActivityTopicEnum.Base,
    color: '#06b6d4', // cyan-500
    description: 'Base additions for pH adjustment',
    displayName: 'Base Added',
    displayName_Alert: 'Add Base',
    icon: FlaskRound,
    label: 'Bases'
  },
  [ActivityTopicEnum.Tannin]: {
    key: ActivityTopicEnum.Tannin,
    color: '#f59e0b', // amber-500
    description: 'Tannin additions for body and mouthfeel',
    displayName: 'Tannin Added',
    displayName_Alert: 'Add Tannin',
    icon: Leaf,
    label: 'Tannins'
  },
  [ActivityTopicEnum.PH]: {
    key: ActivityTopicEnum.PH,
    color: '#ec4899', // pink-500
    description: 'pH measurements and adjustments',
    displayName: 'pH Measured/Adjusted',
    displayName_Alert: 'Take pH Reading and/or Adjust pH',
    icon: ActivityIcon,
    label: 'pH'
  },
  [ActivityTopicEnum.DateBottled]: {
    key: ActivityTopicEnum.DateBottled,
    color: '#14b8a6', // teal-500
    description: 'Date when brew was bottled',
    displayName: 'Brew Bottled',
    displayName_Alert: 'Time to Bottle',
    icon: BottleWine,
    label: 'Bottled'
  },
  [ActivityTopicEnum.DateCreated]: {
    key: ActivityTopicEnum.DateCreated,
    color: '#22c55e', // green-500
    description: 'Date when brew was started',
    displayName: 'Date Created',
    displayName_Alert: 'Start a new brew',
    icon: PlayCircle,
    label: 'Created'
  },
  [ActivityTopicEnum.DateRacked]: {
    key: ActivityTopicEnum.DateRacked,
    color: '#6366f1', // indigo-500
    description: 'Date when brew was transferred to secondary',
    displayName: 'Brew Racked',
    displayName_Alert: 'Time to Rack Your Brew',
    icon: MoveVertical,
    label: 'Racked'
  },
  [ActivityTopicEnum.DateStabilized]: {
    key: ActivityTopicEnum.DateStabilized,
    color: '#84cc16', // lime-500
    description: 'Date when stabilizers were added',
    displayName: 'Stabilization',
    displayName_Alert: 'Stabilize your brew',
    icon: Shield,
    label: 'Stabilized'
  },
  [ActivityTopicEnum.Other]: {
    key: ActivityTopicEnum.Other,
    color: '#6b7280', // gray-500
    description: 'Other miscellaneous activities',
    displayName: 'Activity',
    displayName_Alert: 'Time for action!',
    icon: ActivityIcon,
    label: 'Other'
  }
};

// Helpers
export const getTopicConfig = (topic) => {
  if (!topic) return ActivityTopicConfiguration[ActivityTopicEnum.Other];
  
  const topicLower = topic.toLowerCase();
  const config = ActivityTopicConfiguration[topicLower];
  
  return config || ActivityTopicConfiguration[ActivityTopicEnum.Other];
};

export const getAllTopics = () => {
  return Object.values(ActivityTopicConfiguration);
};

export const getAllTopicKeys = () => {
  return Object.keys(ActivityTopicConfiguration);
};

export const getTopicColor = (topic) => {
  const config = getTopicConfig(topic);
  return config.color;
};

export const getTopicDisplayName = (topic) => {
  const config = getTopicConfig(topic);
  return config.displayName;
};

export const getTopicDisplayNameForAlerts = (topic) => {
  const config = getTopicConfig(topic);
  return config.displayName_Alert;
};

export const getTopicIcon = (topic, size = 18) => {
  const config = getTopicConfig(topic);
  const IconComponent = config.icon;
  return <IconComponent size={size} />;
};

export const getTopicLabel = (topic) => {
  const config = getTopicConfig(topic);
  return config.label;
};