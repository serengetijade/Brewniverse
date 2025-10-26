import React, { useMemo } from 'react';
import { Candy, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import '../../Styles/SugarProgressChart.css';

function SugarProgressChart({ gravityActivities }) {
    const { theme } = useTheme();

    const sugarData = useMemo(() => {
        if (!gravityActivities || gravityActivities.length === 0) {
            return null;
        }

        const og = parseFloat(gravityActivities[0].description);
        const currentGravity = parseFloat(gravityActivities[gravityActivities.length - 1].description);

        const ogPoints = (og - 1) * 1000;
        const currentPoints = (currentGravity - 1) * 1000;
        const sugarConsumed = ogPoints - currentPoints;
        const residualSugar = currentPoints;
        const percentConsumed = ogPoints > 0 ? ((sugarConsumed / ogPoints) * 100).toFixed(1) : 0;

        return {
            ogPoints,
            currentPoints,
            sugarConsumed,
            residualSugar,
            percentConsumed,
            og,
            currentGravity
        };
    }, [gravityActivities]);

    if (!sugarData || sugarData.ogPoints === 0) {
        return (
            <div className="sugar-chart-empty">
                <Candy size={32} />
                <p>Add gravity readings to see sugar consumption</p>
            </div>
        );
    }

    const chartData = [
        {
            name: 'Sugar Consumed',
            value: sugarData.sugarConsumed,
            fill: theme.colors.secondary
        },
        {
            name: 'Residual Sugar (RS)',
            value: sugarData.residualSugar,
            fill: theme.colors.highlight
        }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="sugar-chart-tooltip">
                    <p className="tooltip-label">{data.payload.name}</p>
                    <p className="tooltip-value">{data.value.toFixed(1)} points</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="sugar-chart-container">
            <div className="sugar-chart-header">
                <h3>
                    <Candy size={20} />
                    Sugar Consumption
                </h3>
                <div className="sugar-chart-badge">
                    <Droplets size={14} />
                    {sugarData.percentConsumed}% Consumed
                </div>
            </div>

            <div className="sugar-chart-stats">
                <div className="stat-item">
                    <span className="stat-label">Original Gravity</span>
                    <span className="stat-value original">{sugarData.og.toFixed(3)}</span>
                    <span className="stat-subtext">{sugarData.ogPoints.toFixed(1)} pts</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Current Gravity</span>
                    <span className="stat-value current">{sugarData.currentGravity.toFixed(3)}</span>
                    <span className="stat-subtext">{sugarData.currentPoints.toFixed(1)} pts</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Sugar Consumed</span>
                    <span className="stat-value consumed">{sugarData.sugarConsumed.toFixed(1)} pts</span>
                    <span className="stat-subtext">{sugarData.percentConsumed}%</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Residual Sugar (RS)</span>
                    <span className="stat-value residual">{sugarData.residualSugar.toFixed(1)} pts</span>
                    <span className="stat-subtext">{(100 - sugarData.percentConsumed).toFixed(1)}%</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.colors.border}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke={theme.colors.textLight}
                        style={{ fontSize: '13px', fontWeight: '500' }}
                    />
                    <YAxis
                        stroke={theme.colors.textLight}
                        style={{ fontSize: '12px' }}
                        label={{
                            value: 'Gravity Points',
                            angle: -90,
                            position: 'insideLeft',
                            fill: theme.colors.textLight,
                            style: { fontSize: '12px' }
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="top"
                            formatter={(value) => `${value.toFixed(1)}`}
                            fill={theme.colors.text}
                            style={{ fontSize: '12px', fontWeight: '600' }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="sugar-chart-visual">
                <div className="sugar-bar">
                    <div
                        className="consumed-section"
                        style={{ width: `${sugarData.percentConsumed}%` }}
                    >
                        <span className="section-label">Consumed</span>
                    </div>
                    <div
                        className="residual-section"
                        style={{ width: `${100 - sugarData.percentConsumed}%` }}
                    >
                        <span className="section-label">RS</span>
                    </div>
                </div>
            </div>

            <p className="sugar-chart-hint">
                {sugarData.percentConsumed < 50
                    ? 'Early fermentation - most sugar remains'
                    : sugarData.percentConsumed < 90
                        ? 'Active fermentation - sugar being consumed'
                        : 'Nearly complete - minimal residual sugar'}
            </p>
        </div>
    );
}

export default SugarProgressChart;

