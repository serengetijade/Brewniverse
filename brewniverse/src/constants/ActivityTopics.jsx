import { Activity as ActivityIcon, BottleWine, CirclePlus, FlaskConical, FlaskRound,
    Leaf, MoveVertical, Pill, PlayCircle, Scale, Shield, Sparkles, TestTubeDiagonal,
} from 'lucide-react';

export const ActivityTopicEnum = {
    Acid: 'acid',
    Addition: 'addition',
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
        color: '#7cce29',
        rgb: '124, 206, 41',
        description: 'Specific gravity measurements for tracking fermentation progress',
        displayName: 'Gravity Reading',
        displayName_Alert: 'Take Gravity Reading',
        icon: Scale,
        label: 'Gravity'
    },
    [ActivityTopicEnum.Yeast]: {
        key: ActivityTopicEnum.Yeast,
        color: '#ffc947',
        rgb: '255, 201, 71',
        description: 'Yeast pitching and additions',
        displayName: 'Yeast Added',
        displayName_Alert: 'Add Yeast',
        icon: Sparkles,
        label: 'Yeast'
    },
    [ActivityTopicEnum.Nutrient]: {
        key: ActivityTopicEnum.Nutrient,
        color: '#ff66ff',
        rgb: '255,102,255',
        description: 'Yeast nutrient additions',
        displayName: 'Nutrients Added',
        displayName_Alert: 'Add Nutrients',
        icon: Pill,
        label: 'Nutrients'
    },
    [ActivityTopicEnum.PecticEnzyme]: {
        key: ActivityTopicEnum.PecticEnzyme,
        color: '#c79fea',
        rgb: '199,159,234',
        description: 'Pectic enzyme additions for clarity',
        displayName: 'Pectic Enzyme Added',
        displayName_Alert: 'Add Pectic Enzyme',
        icon: TestTubeDiagonal,
        label: 'Pectic Enzyme'
    },
    [ActivityTopicEnum.Acid]: {
        key: ActivityTopicEnum.Acid,
        color: '#b6e62b',
        rgb: '182,230,43',
        description: 'Acid additions for pH adjustment',
        displayName: 'Acid Added',
        displayName_Alert: 'Add Acid',
        icon: FlaskConical,
        label: 'Acids'
    },
    [ActivityTopicEnum.Base]: {
        key: ActivityTopicEnum.Base,
        color: '#06b6d4',
        rgb: '6,182,212',
        description: 'Base additions for pH adjustment',
        displayName: 'Base Added',
        displayName_Alert: 'Add Base',
        icon: FlaskRound,
        label: 'Bases'
    },
    [ActivityTopicEnum.Tannin]: {
        key: ActivityTopicEnum.Tannin,
        color: '#a16707',
        rgb: '161,103,7',
        description: 'Tannin additions for body and mouthfeel',
        displayName: 'Tannin Added',
        displayName_Alert: 'Add Tannin',
        icon: Leaf,
        label: 'Tannins'
    },
    [ActivityTopicEnum.PH]: {
        key: ActivityTopicEnum.PH,
        color: '#ec4899',
        rgb: '236,72,153',
        description: 'pH measurements and adjustments',
        displayName: 'pH Measured/Adjusted',
        displayName_Alert: 'Take pH Reading and/or Adjust pH',
        icon: ActivityIcon,
        label: 'pH'
    },
    [ActivityTopicEnum.DateCreated]: {
        key: ActivityTopicEnum.DateCreated,
        color: '#006633',
        rgb: '0,102,51',
        description: 'Date when brew was started',
        displayName: 'Date Created',
        displayName_Alert: 'Start a new brew',
        icon: PlayCircle,
        label: 'Created'
    },
    [ActivityTopicEnum.DateRacked]: {
        key: ActivityTopicEnum.DateRacked,
        color: '#0066ff',
        rgb: '0,102,255',
        description: 'Date when brew was transferred to secondary',
        displayName: 'Brew Racked',
        displayName_Alert: 'Time to Rack Your Brew',
        icon: MoveVertical,
        label: 'Racked'
    },
    [ActivityTopicEnum.DateStabilized]: {
        key: ActivityTopicEnum.DateStabilized,
        color: '#69c3ff',
        rgb: '105,195,255',
        description: 'Date when stabilizers were added',
        displayName: 'Stabilization',
        displayName_Alert: 'Stabilize your brew',
        icon: Shield,
        label: 'Stabilized'
    },
    [ActivityTopicEnum.DateBottled]: {
        key: ActivityTopicEnum.DateBottled,
        color: '#67ad34',
        rgb: '103,173,52',
        description: 'Date when brew was bottled',
        displayName: 'Brew Bottled',
        displayName_Alert: 'Time to Bottle',
        icon: BottleWine,
        label: 'Bottled'
    },
    [ActivityTopicEnum.Addition]: {
        key: ActivityTopicEnum.Addition,
        color: '#000000',
        rgb: '0, 0, 0',
        description: 'Addition',
        displayName: 'Addition',
        displayName_Alert: 'Make an addition',
        icon: CirclePlus,
        label: 'Addition Added'
    },
    [ActivityTopicEnum.Other]: {
        key: ActivityTopicEnum.Other,
        color: '#6b7280',
        rgb: '107, 114, 128',
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

export const getTopicColorRgb = (topic) => {
    const config = getTopicConfig(topic);
    return config.rgb;
};

export const getTopicDisplayName = (topic) => {
    const config = getTopicConfig(topic);
    return config.displayName;
};

export const getTopicDisplayNameForAlerts = (topic) => {
    const config = getTopicConfig(topic);
    return config.displayName_Alert;
};

export const getTopicIcon = (topic, size = 20) => {
    const config = getTopicConfig(topic);
    const IconComponent = config.icon;
    return <IconComponent size={size} />;
};

export const getTopicLabel = (topic) => {
    const config = getTopicConfig(topic);
    return config.label;
};