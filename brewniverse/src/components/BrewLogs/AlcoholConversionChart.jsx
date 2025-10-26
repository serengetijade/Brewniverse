import React, { useMemo } from 'react';
import { Wine, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrentAbv, getPotentialAbv } from '../../utils/gravityCalculations';
import '../../Styles/AlcoholConversionChart.css';

function AlcoholConversionChart({ gravityActivities }) {
  const { theme } = useTheme();

  const alcoholData = useMemo(() => {
    if (!gravityActivities || gravityActivities.length === 0) {
      return null;
    }

    const currentAbv = parseFloat(getCurrentAbv(gravityActivities)) || 0;
    const potentialAbv = parseFloat(getPotentialAbv(gravityActivities)) || 0;
    const remainingAbv = Math.max(0, potentialAbv - currentAbv);
    const conversionPercent = potentialAbv > 0 ? ((currentAbv / potentialAbv) * 100).toFixed(1) : 0;

    return {
      currentAbv,
      potentialAbv,
      remainingAbv,
      conversionPercent
    };
  }, [gravityActivities]);

  if (!alcoholData || alcoholData.potentialAbv === 0) {
    return (
      <div className="alcohol-chart-empty">
        <Wine size={32} />
        <p>Add gravity readings to see alcohol conversion</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Current ABV',
      value: alcoholData.currentAbv,
      fill: theme.colors.primary
    },
    {
      name: 'Remaining Potential',
      value: alcoholData.remainingAbv,
      fill: theme.colors.surface
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="alcohol-chart-tooltip">
          <p className="tooltip-label">{data.payload.name}</p>
          <p className="tooltip-value">{data.value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="alcohol-chart-container">
      <div className="alcohol-chart-header">
        <h3>
          <Wine size={20} />
          Alcohol Conversion
        </h3>
        <div className="alcohol-chart-badge">
          <Target size={14} />
          {alcoholData.conversionPercent}% Complete
        </div>
      </div>

      <div className="alcohol-chart-stats">
        <div className="stat-item">
          <span className="stat-label">Current ABV</span>
          <span className="stat-value primary">{alcoholData.currentAbv.toFixed(2)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Potential ABV</span>
          <span className="stat-value secondary">{alcoholData.potentialAbv.toFixed(2)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Remaining</span>
          <span className="stat-value tertiary">{alcoholData.remainingAbv.toFixed(2)}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme.colors.border}
            horizontal={false}
          />
          <XAxis 
            type="number"
            domain={[0, alcoholData.potentialAbv]}
            stroke={theme.colors.textLight}
            style={{ fontSize: '12px' }}
            label={{ value: 'ABV %', position: 'bottom', fill: theme.colors.textLight }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            stroke={theme.colors.textLight}
            style={{ fontSize: '13px', fontWeight: '500' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            stackId="a"
            radius={[0, 8, 8, 0]}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList 
              dataKey="value" 
              position="right" 
              formatter={(value) => `${value.toFixed(2)}%`}
              fill={theme.colors.text}
              style={{ fontSize: '12px', fontWeight: '600' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="alcohol-chart-progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${alcoholData.conversionPercent}%`,
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`
          }}
        />
      </div>
      <p className="alcohol-chart-hint">
        Fermentation is {alcoholData.conversionPercent}% complete based on potential alcohol
      </p>
    </div>
  );
}

export default AlcoholConversionChart;