import React, { useState } from 'react';
import { ArrowLeft, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Validation } from '../../constants/ValidationConstants';
import Button from '../UI/Button';
import '../../Styles/Calculator.css';

function AbvDilutionCalculator() {
    const navigate = useNavigate();
    const [currentAbv, setCurrentAbv] = useState('');
    const [currentVolume, setCurrentVolume] = useState('');
    const [addedAbv, setAddedAbv] = useState('0');
    const [addedVolume, setAddedVolume] = useState('');
    const [result, setResult] = useState(null);

    // Reverse calculator state
    const [reverseCurrentAbv, setReverseCurrentAbv] = useState('');
    const [reverseCurrentVolume, setReverseCurrentVolume] = useState('');
    const [reverseTargetAbv, setReverseTargetAbv] = useState('');
    const [reverseSolutionAbv, setReverseSolutionAbv] = useState('0');
    const [reverseResult, setReverseResult] = useState(null);

    const calculate = () => {
        const abv1 = parseFloat(currentAbv);
        const vol1 = parseFloat(currentVolume);
        const abv2 = parseFloat(addedAbv);
        const vol2 = parseFloat(addedVolume);

        if (isNaN(abv1) || isNaN(vol1) || isNaN(abv2) || isNaN(vol2)) {
            alert('Please enter valid numbers for all fields');
            return;
        }

        if (abv1 < 0 || abv1 > 100 || abv2 < 0 || abv2 > 100) {
            alert('ABV values should be between 0 and 100');
            return;
        }

        if (vol1 <= 0 || vol2 <= 0) {
            alert('Volume values must be greater than 0');
            return;
        }

        // Calculate weighted average ABV
        const totalVolume = vol1 + vol2;
        const totalAlcohol = (abv1 * vol1) + (abv2 * vol2);
        const finalAbv = (totalAlcohol / totalVolume).toFixed(2);

        // Calculate dilution/strengthening
        const abvChange = (finalAbv - abv1).toFixed(2);
        const percentChange = (((finalAbv - abv1) / abv1) * 100).toFixed(1);

        setResult({
            finalAbv,
            totalVolume: totalVolume.toFixed(2),
            abvChange,
            percentChange,
            isDilution: finalAbv < abv1
        });
    };

    const calculateVolumeNeeded = () => {
        const currentAbv = parseFloat(reverseCurrentAbv);
        const currentVol = parseFloat(reverseCurrentVolume);
        const targetAbv = parseFloat(reverseTargetAbv);
        const solutionAbv = parseFloat(reverseSolutionAbv);

        if (isNaN(currentAbv) || isNaN(currentVol) || isNaN(targetAbv) || isNaN(solutionAbv)) {
            alert('Please enter valid numbers for all fields');
            return;
        }

        if (currentAbv < 0 || currentAbv > 100 || targetAbv < 0 || targetAbv > 100 || solutionAbv < 0 || solutionAbv > 100) {
            alert('ABV values should be between 0 and 100');
            return;
        }

        if (currentVol <= 0) {
            alert('Volume must be greater than 0');
            return;
        }

        // Check if target is achievable
        if (targetAbv > currentAbv && solutionAbv <= currentAbv) {
            alert('Cannot increase ABV with a solution that has lower or equal ABV');
            return;
        }

        if (targetAbv < currentAbv && solutionAbv >= currentAbv) {
            alert('Cannot decrease ABV with a solution that has higher or equal ABV');
            return;
        }

        if (targetAbv === currentAbv) {
            alert('Target ABV is the same as current ABV. No addition needed.');
            return;
        }

        // Calculate volume needed: (ABV1 × Vol1) + (ABV2 × Vol2) = TargetABV × (Vol1 + Vol2)
        // Solving for Vol2: Vol2 = (TargetABV × Vol1 - ABV1 × Vol1) / (ABV2 - TargetABV)
        const volumeNeeded = ((targetAbv * currentVol) - (currentAbv * currentVol)) / (solutionAbv - targetAbv);

        if (volumeNeeded < 0) {
            alert('Calculation resulted in negative volume. Check your inputs.');
            return;
        }

        const totalVolume = currentVol + volumeNeeded;
        const percentChange = ((volumeNeeded / currentVol) * 100).toFixed(1);

        setReverseResult({
            volumeNeeded: volumeNeeded.toFixed(2),
            totalVolume: totalVolume.toFixed(2),
            currentAbv: currentAbv.toFixed(2),
            targetAbv: targetAbv.toFixed(2),
            solutionAbv: solutionAbv.toFixed(2),
            percentChange,
            isDilution: targetAbv < currentAbv
        });
    };

    const reset = () => {
        setCurrentAbv('');
        setCurrentVolume('');
        setAddedAbv('0');
        setAddedVolume('');
        setResult(null);
    };

    const resetReverse = () => {
        setReverseCurrentAbv('');
        setReverseCurrentVolume('');
        setReverseTargetAbv('');
        setReverseSolutionAbv('0');
        setReverseResult(null);
    };

    return (
        <div className="calculator-page">
            <div className="calculator-header">
                <Button
                    variant="ghost"
                    size="small"
                    onClick={() => navigate('/calculator')}
                >
                    <ArrowLeft size={16} />
                    Back to Calculators
                </Button>
            </div>

            <div className="calculator-container">
                <div className="calculator-title">
                    <Droplet size={32} />
                    <h1>ABV Dilution Calculator</h1>
                    <p>Calculate final ABV when mixing two volumes</p>
                </div>

                <div className="calculator-form">
                    <div className="form-section-calc">
                        <h3>Current Batch</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="currentAbv" className="form-label">
                                    Current ABV (%)
                                </label>
                                <input
                                    type="number"
                                    id="currentAbv"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={currentAbv}
                                    onChange={(e) => setCurrentAbv(e.target.value)}
                                    placeholder="e.g., 12.5"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="currentVolume" className="form-label">
                                    Current Volume
                                </label>
                                <input
                                    type="number"
                                    id="currentVolume"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={currentVolume}
                                    onChange={(e) => setCurrentVolume(e.target.value)}
                                    placeholder="e.g., 5"
                                />
                                <small className="form-hint">In any unit (gallons, liters, etc.)</small>
                            </div>
                        </div>
                    </div>

                    <div className="form-section-calc">
                        <h3>Volume Being Added</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="addedAbv" className="form-label">
                                    Added ABV (%)
                                </label>
                                <input
                                    type="number"
                                    id="addedAbv"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={addedAbv}
                                    onChange={(e) => setAddedAbv(e.target.value)}
                                    placeholder="e.g., 0 (for water)"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="addedVolume" className="form-label">
                                    Added Volume
                                </label>
                                <input
                                    type="number"
                                    id="addedVolume"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={addedVolume}
                                    onChange={(e) => setAddedVolume(e.target.value)}
                                    placeholder="e.g., 1"
                                />
                                <small className="form-hint">Must use same unit as current volume</small>
                            </div>
                        </div>
                    </div>

                    <div className="calculator-actions">
                        <Button
                            variant="primary"
                            size="large"
                            onClick={calculate}
                        >
                            <Droplet size={16} />
                            Calculate
                        </Button>
                        <Button
                            variant="outline"
                            size="large"
                            onClick={reset}
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                {result && (
                    <div className="calculator-results">
                        <h3>Results</h3>
                        <div className="result-grid">
                            <div className="result-card primary">
                                <div className="result-label">Final ABV</div>
                                <div className="result-value">{result.finalAbv}%</div>
                                <div className="result-hint">After mixing</div>
                            </div>

                            <div className={`result-card ${result.isDilution ? 'accent' : 'secondary'}`}>
                                <div className="result-label">ABV Change</div>
                                <div className="result-value">
                                    {result.abvChange > 0 ? '+' : ''}{result.abvChange}%
                                </div>
                                <div className="result-hint">
                                    {result.isDilution ? 'Diluted' : 'Strengthened'}
                                </div>
                            </div>

                            <div className="result-card highlight">
                                <div className="result-label">Total Volume</div>
                                <div className="result-value">{result.totalVolume}</div>
                                <div className="result-hint">Final volume</div>
                            </div>
                        </div>

                        <div className="result-info">
                            <p>
                                <strong>Percent Change:</strong> {result.percentChange}%
                            </p>
                            <p>
                                Your batch was <strong>{result.isDilution ? 'diluted' : 'strengthened'}</strong> by
                                adding {addedVolume} units at {addedAbv}% ABV.
                            </p>
                        </div>
                    </div>
                )}

                <div className="calculator-divider" style={{ margin: '3rem 0', borderTop: '2px solid var(--border-color)' }}></div>

                <div className="calculator-title">
                    <Droplet size={32} />
                    <h2>Target ABV Volume Calculator</h2>
                    <p>Calculate how much to add to reach your target ABV</p>
                </div>

                <div className="calculator-form">
                    <div className="form-section-calc">
                        <h3>Current Batch</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="reverseCurrentAbv" className="form-label">
                                    Current ABV (%)
                                </label>
                                <input
                                    type="number"
                                    id="reverseCurrentAbv"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={reverseCurrentAbv}
                                    onChange={(e) => setReverseCurrentAbv(e.target.value)}
                                    placeholder="e.g., 12.5"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="reverseCurrentVolume" className="form-label">
                                    Current Volume
                                </label>
                                <input
                                    type="number"
                                    id="reverseCurrentVolume"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={reverseCurrentVolume}
                                    onChange={(e) => setReverseCurrentVolume(e.target.value)}
                                    placeholder="e.g., 5"
                                />
                                <small className="form-hint">In any unit (gallons, liters, etc.)</small>
                            </div>
                        </div>
                    </div>

                    <div className="form-section-calc">
                        <h3>Target Settings</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="reverseTargetAbv" className="form-label">
                                    Target ABV (%)
                                </label>
                                <input
                                    type="number"
                                    id="reverseTargetAbv"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={reverseTargetAbv}
                                    onChange={(e) => setReverseTargetAbv(e.target.value)}
                                    placeholder="e.g., 10"
                                />
                                <small className="form-hint">Your desired final ABV</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reverseSolutionAbv" className="form-label">
                                    Solution ABV (%)
                                </label>
                                <input
                                    type="number"
                                    id="reverseSolutionAbv"
                                    step="0.1"
                                    min={Validation.NumberMin}
                                    className="form-input"
                                    value={reverseSolutionAbv}
                                    onChange={(e) => setReverseSolutionAbv(e.target.value)}
                                    placeholder="e.g., 0 (for water)"
                                />
                                <small className="form-hint">ABV of what you're adding (0 for water)</small>
                            </div>
                        </div>
                    </div>

                    <div className="calculator-actions">
                        <Button
                            variant="primary"
                            size="large"
                            onClick={calculateVolumeNeeded}
                        >
                            <Droplet size={16} />
                            Calculate Volume Needed
                        </Button>
                        <Button
                            variant="outline"
                            size="large"
                            onClick={resetReverse}
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                {reverseResult && (
                    <div className="calculator-results">
                        <h3>Results</h3>
                        <div className="result-grid">
                            <div className="result-card primary">
                                <div className="result-label">Volume to Add</div>
                                <div className="result-value">{reverseResult.volumeNeeded}</div>
                                <div className="result-hint">Units at {reverseResult.solutionAbv}% ABV</div>
                            </div>

                            <div className={`result-card ${reverseResult.isDilution ? 'accent' : 'secondary'}`}>
                                <div className="result-label">Target ABV</div>
                                <div className="result-value">{reverseResult.targetAbv}%</div>
                                <div className="result-hint">
                                    {reverseResult.isDilution ? 'Diluted' : 'Strengthened'}
                                </div>
                            </div>

                            <div className="result-card highlight">
                                <div className="result-label">Final Volume</div>
                                <div className="result-value">{reverseResult.totalVolume}</div>
                                <div className="result-hint">Total after addition</div>
                            </div>
                        </div>

                        <div className="result-info">
                            <p>
                                <strong>Volume Increase:</strong> {reverseResult.percentChange}%
                            </p>
                            <p>
                                Add <strong>{reverseResult.volumeNeeded} units</strong> at {reverseResult.solutionAbv}% ABV to your
                                {reverseResult.currentAbv}% ABV batch to reach <strong>{reverseResult.targetAbv}% ABV</strong>.
                            </p>
                            <p>
                                Your final volume will be <strong>{reverseResult.totalVolume} units</strong>.
                            </p>
                        </div>
                    </div>
                )}

                <div className="calculator-info">
                    <h4>About This Calculator</h4>
                    <p>
                        This calculator helps you determine the final ABV when mixing two volumes with different alcohol contents.
                    </p>
                    <p>
                        <strong>Common uses:</strong>
                    </p>
                    <ul>
                        <li>Diluting high-ABV brews with water (set Added ABV to 0%)</li>
                        <li>Blending two batches of different strengths</li>
                        <li>Adding spirits to fortify wine or mead</li>
                        <li>Calculating effects of topping off with fresh juice</li>
                    </ul>
                    <p>
                        The formula uses a weighted average: <strong>(ABV₁ × Vol₁ + ABV₂ × Vol₂) / (Vol₁ + Vol₂)</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AbvDilutionCalculator;

