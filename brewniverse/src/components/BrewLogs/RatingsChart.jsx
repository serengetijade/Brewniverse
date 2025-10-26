import React, { useMemo } from 'react';
import { Star, Info } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import '../../Styles/RatingsChart.css';

function RatingsChart({ brewLogId }) {
    const { theme } = useTheme();
    const { state } = useApp();

    const ratingsData = useMemo(() => {
        const entries = state.journalEntries
            .filter(entry => entry.brewLogId === brewLogId)
            .filter(entry => entry.rating > 0) // Exclude entries without ratings
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (entries.length < 2) {
            return null;
        }

        return entries.map(entry => ({
            date: new Date(entry.date),
            dateLabel: new Date(entry.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            rating: entry.rating,
            name: entry.name
        }));
    }, [state.journalEntries, brewLogId]);

    const averageRating = useMemo(() => {
        if (!ratingsData) return 0;
        const sum = ratingsData.reduce((acc, data) => acc + data.rating, 0);
        return sum / ratingsData.length;
    }, [ratingsData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="ratings-chart-tooltip">
                    <p className="tooltip-date">{data.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}</p>
                    <p className="tooltip-name">{data.name}</p>
                    <p className="tooltip-rating">
                        <strong>Rating:</strong> {data.rating.toFixed(1)} <Star size={14} fill="currentColor" />
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!ratingsData) {
        return null;
    }

    return (
        <div className="ratings-chart-container">
            <div className="ratings-chart-header">
                <h4><Star size={20} /> Ratings </h4>
                <div className="ratings-chart-stats">
                    <span className="stat">
                        <span className="stat-label">Average:</span>
                        <span className="stat-value">{averageRating.toFixed(2)} <Star size={16} stroke="#f59e0b" fill="#fbbf24" /></span>
                    </span>
                    <span className="stat">
                        <span className="stat-label">Tastings:</span>
                        <span className="stat-value">{ratingsData.length}</span>
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={ratingsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.colors.border}
                        opacity={0.5}
                    />

                    <XAxis
                        dataKey="dateLabel"
                        stroke={theme.colors.textLight}
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />

                    <YAxis
                        domain={[0, 5]}
                        stroke={theme.colors.textLight}
                        style={{ fontSize: '12px' }}
                        ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]}
                        tickFormatter={(value) => value.toFixed(1)}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Average Rating Reference Line */}
                    <ReferenceLine
                        y={averageRating}
                        stroke={theme.colors.info}
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                            value: `Avg: ${averageRating.toFixed(2)}`,
                            position: 'right',
                            fill: theme.colors.info,
                            fontSize: 12,
                            fontWeight: 'bold'
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke={theme.colors.highlight}
                        strokeWidth={3}
                        dot={{
                            r: 5,
                            fill: theme.colors.secondary,
                            stroke: theme.colors.highlight,
                            strokeWidth: 2
                        }}
                        activeDot={{
                            r: 7,
                            fill: theme.colors.highlight,
                            stroke: theme.colors.primary,
                            strokeWidth: 2
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="ratings-chart-note">
                <Info size={14} />
                <span>Journal entries without ratings are not included in this chart</span>
            </div>
        </div>
    );
}

export default RatingsChart;