import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { getCurrentAbv, getGravityActivities } from '../../utils/gravityCalculations';
import '../../Styles/MiniAbvCalculator.css';
import Button from '../UI/Button';

function MiniAbvCalculator({ formState, updateFormData }) {
    const gravityActivities = getGravityActivities(formState.activity || []);
    const calculatedCurrentAbv = getCurrentAbv(gravityActivities);
    const originalAbv = calculatedCurrentAbv || '';

    const [currentVolume, setCurrentVolume] = useState('');
    const [currentAbv, setCurrentAbv] = useState(originalAbv);
    const [addedVolume, setAddedVolume] = useState('');
    const [addedAbv, setAddedAbv] = useState('0');
    const [hasManuallyEditedAbv, setHasManuallyEditedAbv] = useState(false);

    // Only auto-populate currentAbv on initial load or when gravity readings are first added
    useEffect(() => {
        if (calculatedCurrentAbv && !hasManuallyEditedAbv && !currentAbv) {
            setCurrentAbv(calculatedCurrentAbv);
        }
    }, [calculatedCurrentAbv, hasManuallyEditedAbv, currentAbv]);

    const finalAbv = React.useMemo(() => {
        const abv1 = parseFloat(currentAbv);
        const vol1 = parseFloat(currentVolume);
        const abv2 = parseFloat(addedAbv);
        const vol2 = parseFloat(addedVolume);

        if (isNaN(abv1) || isNaN(vol1) || isNaN(abv2) || isNaN(vol2)) {
            return null;
        }

        if (abv1 < 0 || abv1 > 100 || abv2 < 0 || abv2 > 100) {
            return null;
        }

        if (vol1 <= 0 || vol2 < 0) {
            return null;
        }

        // Weighted average ABV
        const totalVolume = vol1 + vol2;
        const totalAlcohol = (abv1 * vol1) + (abv2 * vol2);
        return (totalAlcohol / totalVolume).toFixed(2);
    }, [currentAbv, currentVolume, addedAbv, addedVolume]);

    useEffect(() => {
        // Only update finalAbv when we have a calculated value
        // Don't clear it if inputs are incomplete
        if (finalAbv !== null) {
            const currentFinalAbv = formState.finalAbv || '';
            if (String(currentFinalAbv) !== String(finalAbv)) {
                updateFormData({ finalAbv: finalAbv });
            }
        }
    }, [finalAbv, formState.finalAbv, updateFormData]);

    const handleAbvChange = (e) => {
        setCurrentAbv(e.target.value);
        setHasManuallyEditedAbv(true);
    };

    const resetToOriginal = () => {
        setCurrentAbv(originalAbv);
        setHasManuallyEditedAbv(false);
    };

    return (
        <div className="mini-dilution-calculator">
            <p className="section-description">
                Calculate the final ABV after diluting, backsweetening, or blending your brew
            </p>
            
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="calc-currentVolume" className="form-label">
                        Current Volume
                    </label>
                    <input
                        type="number"
                        id="calc-currentVolume"
                        step="0.001"
                        min="0"
                        className="form-input"
                        value={currentVolume}
                        onChange={(e) => setCurrentVolume(e.target.value)}
                        placeholder="e.g., 5"
                    />
                    <small className="form-hint">In any unit (gallons, liters, etc.)</small>
                </div>

                <div className="form-group">
                    <label htmlFor="calc-currentAbv" className="form-label">
                        Current ABV (%)
                    </label>
                    <input
                        type="number"
                        id="calc-currentAbv"
                        step="0.01"
                        min="0"
                        max="100"
                        className="form-input"
                        value={currentAbv}
                        onChange={handleAbvChange}
                        placeholder={originalAbv || "e.g., 12.5"}
                    />
                    {originalAbv && (
                        <small className="form-hint">From gravity readings: {originalAbv}%</small>
                    )}
                    {originalAbv && String(currentAbv) !== String(originalAbv) && (
                        <Button
                            variant="ghost"
                            type="button"
                            className="reset-button"
                            onClick={resetToOriginal}
                            title="Reset to calculated ABV"
                        >
                            <RotateCcw size={14} />
                            Reset to {originalAbv}%
                        </Button>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="calc-addedVolume" className="form-label">
                        Added Volume
                    </label>
                    <input
                        type="number"
                        id="calc-addedVolume"
                        step="0.001"
                        min="0"
                        className="form-input"
                        value={addedVolume}
                        onChange={(e) => setAddedVolume(e.target.value)}
                        placeholder="e.g., 1"
                    />
                    <small className="form-hint">Must use same unit as current volume</small>
                </div>

                <div className="form-group">
                    <label htmlFor="calc-addedAbv" className="form-label">
                        Added ABV (%)
                    </label>
                    <input
                        type="number"
                        id="calc-addedAbv"
                        step="0.01"
                        min="0"
                        max="100"
                        className="form-input"
                        value={addedAbv}
                        onChange={(e) => setAddedAbv(e.target.value)}
                        placeholder="e.g., 0 (for water)"
                    />
                    <small className="form-hint">0% for water dilution</small>
                </div>
            </div>

            {finalAbv !== null && (
                <div className="mini-calc-result">
                    <div className="mini-calc-result-label">Final ABV</div>
                    <div className="mini-calc-result-value">{finalAbv}%</div>
                </div>
            )}
        </div>
    );
}

export default MiniAbvCalculator;

