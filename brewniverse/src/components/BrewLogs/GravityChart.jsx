import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatGravityDataForChart, getGravity13Break } from '../../utils/gravityCalculations';
import '../../Styles/GravityChart.css';

function GravityChart({ gravityActivities }) {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    return formatGravityDataForChart(gravityActivities);
  }, [gravityActivities]);

  // Calculate the 1/3 break line
  const oneThirdBreakValue = useMemo(() => {
    if (gravityActivities && gravityActivities.length > 0) {
      const breakValue = getGravity13Break(gravityActivities);
      return breakValue ? parseFloat(breakValue) : null;
    }
    return null;
  }, [gravityActivities]);

  // Calculate dynamic Y-axis range and ticks based on OG
  const { yAxisMin, yAxisMax, yAxisTicks } = useMemo(() => {
    const min = 0.950;
    let max = 1.300;
    
    if (chartData.length > 0) {
      const og = chartData[0].gravity;
      // Round up to nearest 0.025
      max = Math.ceil(og / 0.025) * 0.025;
      if (max <= og) {
        max = og + 0.025;
      }
    }
    
    // Generate ticks in 0.025 increments
    const ticks = [];
    for (let tick = min; tick <= max; tick += 0.025) {
      ticks.push(parseFloat(tick.toFixed(3)));
    }
    
    return { yAxisMin: min, yAxisMax: max, yAxisTicks: ticks };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="gravity-chart-tooltip">
          <p className="tooltip-date">{data.date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}</p>
          <p className="tooltip-gravity">
            <strong>Gravity:</strong> {data.gravity.toFixed(3)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Don't render if no data
  if (chartData.length === 0) {
    return (
        <div className="gravity-chart-empty">
        <Zap size={32} />
        <p>Add gravity readings to see the fermentation chart</p>
      </div>
    );
  }

  return (
    <div className="gravity-chart-container">
      <div className="gravity-chart-header">
        <h4><Zap size={20} /> Fermentation Progress</h4>
        {chartData.length > 0 && (
          <div className="gravity-chart-stats">
            <span className="stat">
              <span className="stat-label">OG:</span> 
              <span className="stat-value">{chartData[0].gravity.toFixed(3)}</span>
            </span>
            {chartData.length > 1 && (
              <>
                <span className="stat">
                  <span className="stat-label">Current:</span> 
                  <span className="stat-value">{chartData[chartData.length - 1].gravity.toFixed(3)}</span>
                </span>
                <span className="stat">
                  <span className="stat-label">Drop:</span> 
                  <span className="stat-value">
                    {(chartData[0].gravity - chartData[chartData.length - 1].gravity).toFixed(3)}
                  </span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="gravityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={theme.colors.accent} 
                stopOpacity={0.8}
              />
              <stop 
                offset="95%" 
                stopColor={theme.colors.accent} 
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          
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
            domain={[yAxisMin, yAxisMax]}
            stroke={theme.colors.textLight}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => value.toFixed(3)}
            ticks={yAxisTicks}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* 1/3 Break Reference Line */}
          {oneThirdBreakValue && (
            <ReferenceLine 
              y={oneThirdBreakValue} 
              stroke={theme.colors.warning}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: '1/3',
                position: 'right',
                fill: theme.colors.warning,
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          )}

          {/* 1.000 Target Line (end of fermentation) */}
          <ReferenceLine 
            y={1.000} 
            stroke={theme.colors.success}
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{
              value: 'Target',
              position: 'right',
              fill: theme.colors.success,
              fontSize: 11
            }}
          />
          
          <Area 
            type="monotone" 
            dataKey="gravity" 
            stroke={theme.colors.primary}
            strokeWidth={3}
            fill="url(#gravityGradient)"
            fillOpacity={1}
            activeDot={{ 
              r: 6, 
              fill: theme.colors.highlight,
              stroke: theme.colors.primary,
              strokeWidth: 2
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="gravity" 
            stroke={theme.colors.primary}
            strokeWidth={3}
            dot={{ 
              r: 4, 
              fill: theme.colors.background,
              stroke: theme.colors.primary,
              strokeWidth: 2
            }}
            activeDot={{ 
              r: 6, 
              fill: theme.colors.highlight,
              stroke: theme.colors.primary,
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {chartData.length === 1 && (
        <p className="gravity-chart-hint">
          Add more gravity readings to track fermentation progress
        </p>
      )}
    </div>
  );
}

export default GravityChart;

