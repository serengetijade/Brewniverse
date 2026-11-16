import React from 'react';
import '../../Styles/GravityStatsAndChart.css';
import { getCurrentAbv, getGravity13Break, getGravityFinal, getGravityOriginal, getPotentialAbv } from '../../utils/GravityCalculations';
import GravityChart from './GravityChart';

function GravityStatsAndChart({ gravityActivities = [], emptyMessage = 'Add gravity readings to see calculated values' }) {
    const originalGravity = getGravityOriginal(gravityActivities);
    const oneThirdBreak = getGravity13Break(gravityActivities);
    const currentGravity = getGravityFinal(gravityActivities);
    const currentAbv = getCurrentAbv(gravityActivities);
    const potentialAbv = getPotentialAbv(gravityActivities);

    return (
        <div className="gravity-stats-and-chart">
            {gravityActivities.length === 0 && emptyMessage && (
                <p className="section-description">{emptyMessage}</p>
            )}

            <div className="gravity-stats-container">
                <div className="gravity-stat-card accent20">
                    <div className="gravity-stat-label">Original Gravity</div>
                    <div className="gravity-stat-value">
                        {originalGravity || '—'}
                    </div>
                    {originalGravity && (
                        <div className="gravity-stat-subtitle">Starting point</div>
                    )}
                </div>

                <div className="gravity-stat-card accent15">
                    <div className="gravity-stat-label">1/3 Break Gravity</div>
                    <div className="gravity-stat-value">
                        {oneThirdBreak || '—'}
                    </div>
                    {oneThirdBreak && (
                        <div className="gravity-stat-subtitle">Add nutrient at this point</div>
                    )}
                </div>

                <div className="gravity-stat-card accent10">
                    <div className="gravity-stat-label">Current Gravity</div>
                    <div className="gravity-stat-value">
                        {currentGravity || '—'}
                    </div>
                    {currentGravity <= 1 && (
                        <div className="gravity-stat-subtitle">Fermentation complete</div>
                    )}
                </div>

                <div className="gravity-stat-card accent08">
                    <div className="gravity-stat-label">Current ABV</div>
                    <div className="gravity-stat-value">
                        {currentAbv || '—'}
                        {currentAbv && <span className="gravity-stat-unit">%</span>}
                    </div>
                    {currentAbv && (
                        <div className="gravity-stat-subtitle">Present alcohol content</div>
                    )}
                </div>

                <div className="gravity-stat-card accent05">
                    <div className="gravity-stat-label">Potential Final ABV</div>
                    <div className="gravity-stat-value">
                        {potentialAbv || '—'}
                        {potentialAbv && <span className="gravity-stat-unit">%</span>}
                    </div>
                    {potentialAbv && (
                        <div className="gravity-stat-subtitle">Estimated at completion</div>
                    )}
                </div>
            </div>

            <GravityChart gravityActivities={gravityActivities} />
        </div>
    );
}

export default GravityStatsAndChart;
