import React, { useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Validation } from '../../constants/ValidationConstants';
import Button from '../UI/Button';
import '../../Styles/Calculator.css';

function BrixConverter() {
    const navigate = useNavigate();
    const [brix, setBrix] = useState('');
    const [specificGravity, setSpecificGravity] = useState('');
    const [result, setResult] = useState(null);

    // Convert Brix to Specific Gravity
    // SG = (Brix / (258.6 - ((Brix / 258.2) * 227.1))) + 1
    const brixToSG = (brixValue) => {
        const b = parseFloat(brixValue);
        return ((b / (258.6 - ((b / 258.2) * 227.1))) + 1);
    };

    // Convert Specific Gravity to Brix
    // Brix = (((182.4601 * SG - 775.6821) * SG + 1262.7794) * SG - 669.5622)
    const sgToBrix = (sg) => {
        const s = parseFloat(sg);
        return (((182.4601 * s - 775.6821) * s + 1262.7794) * s - 669.5622);
    };

    // Calculate potential ABV from Brix (for dry wines)
    const brixToAbv = (brixValue) => {
        return (parseFloat(brixValue) * 0.55).toFixed(2);
    };

    const convertFromBrix = () => {
        const b = parseFloat(brix);

        if (isNaN(b)) {
            alert('Please enter a valid Brix value');
            return;
        }

        if (b < 0 || b > 50) {
            alert('Brix should be between 0 and 50');
            return;
        }

        const sg = brixToSG(b);
        const potentialAbv = brixToAbv(b);

        setResult({
            type: 'fromBrix',
            brix: b.toFixed(2),
            sg: sg.toFixed(3),
            potentialAbv,
            gravityPoints: ((sg - 1) * 1000).toFixed(0)
        });
    };

    const convertFromSG = () => {
        const sg = parseFloat(specificGravity);

        if (isNaN(sg)) {
            alert('Please enter a valid Specific Gravity value');
            return;
        }

        if (sg < 1.0 || sg > 1.200) {
            alert('Specific Gravity should be between 1.000 and 1.200');
            return;
        }

        const b = sgToBrix(sg);
        const potentialAbv = brixToAbv(b);

        setResult({
            type: 'fromSG',
            brix: b.toFixed(2),
            sg: sg.toFixed(3),
            potentialAbv,
            gravityPoints: ((sg - 1) * 1000).toFixed(0)
        });
    };

    const reset = () => {
        setBrix('');
        setSpecificGravity('');
        setResult(null);
    };

    return (
        <div className="main-content-container">
            <div className="main-content-section calculator-page">
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
                    <Calculator size={32} />
                    <h1>Brix Converter</h1>
                    <p>Convert between Brix and Specific Gravity</p>
                </div>

                <div className="calculator-form">
                    <div className="form-section-calc">
                        <h3>Convert from Brix</h3>
                        <div className="form-group">
                            <label htmlFor="brix" className="form-label">
                                Brix (°Bx)
                            </label>
                            <input
                                type="number"
                                id="brix"
                                step="0.1"
                                min={Validation.NumberMin}
                                className="form-input"
                                value={brix}
                                onChange={(e) => {
                                    setBrix(e.target.value);
                                    setResult(null);
                                }}
                                placeholder="e.g., 12.5"
                            />
                            <small className="form-hint">Sugar content in degrees Brix</small>
                        </div>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={convertFromBrix}
                        >
                            <Calculator size={20}/> Convert to SG
                        </Button>
                    </div>

                    <div className="converter-divider">
                        <span>OR</span>
                    </div>

                    <div className="form-section-calc">
                        <h3>Convert from Specific Gravity</h3>
                        <div className="form-group">
                            <label htmlFor="sg" className="form-label">
                                Specific Gravity
                            </label>
                            <input
                                type="number"
                                id="sg"
                                step="0.001"
                                min={Validation.NumberMin}
                                className="form-input"
                                value={specificGravity}
                                onChange={(e) => {
                                    setSpecificGravity(e.target.value);
                                    setResult(null);
                                }}
                                placeholder="e.g., 1.050"
                            />
                            <small className="form-hint">Relative density of your liquid</small>
                        </div>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={convertFromSG}
                        >
                            <Calculator size={20} /> Convert to Brix
                        </Button>
                    </div>

                    {result && (
                        <div className="calculator-actions">
                            <Button
                                variant="outline"
                                size="large"
                                onClick={reset}
                            >
                                Reset
                            </Button>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="calculator-results">
                        <h3>Conversion Results</h3>
                        <div className="result-grid">
                            <div className="result-card primary">
                                <div className="result-label">Brix</div>
                                <div className="result-value">{result.brix}°Bx</div>
                                <div className="result-hint">Sugar content</div>
                            </div>

                            <div className="result-card secondary">
                                <div className="result-label">Specific Gravity</div>
                                <div className="result-value">{result.sg}</div>
                                <div className="result-hint">Relative density</div>
                            </div>

                            <div className="result-card accent">
                                <div className="result-label">Potential ABV</div>
                                <div className="result-value">{result.potentialAbv}%</div>
                                <div className="result-hint">If fermented dry</div>
                            </div>

                            <div className="result-card highlight">
                                <div className="result-label">Gravity Points</div>
                                <div className="result-value">{result.gravityPoints}</div>
                                <div className="result-hint">(SG - 1) × 1000</div>
                            </div>
                        </div>

                        <div className="result-info">
                            <p>
                                {result.type === 'fromBrix'
                                    ? `${result.brix}°Bx is equivalent to ${result.sg} SG`
                                    : `${result.sg} SG is equivalent to ${result.brix}°Bx`
                                }
                            </p>
                            <p>
                                This would produce approximately <strong>{result.potentialAbv}% ABV</strong> if
                                fermented completely dry (all sugars consumed).
                            </p>
                        </div>
                    </div>
                )}

                <div className="calculator-info">
                    <h4>About Brix and Specific Gravity</h4>
                    <p>
                        <strong>Brix (°Bx):</strong> A measurement of sugar content in a solution. One degree Brix
                        is equal to 1 gram of sucrose in 100 grams of solution. Commonly used in winemaking and
                        fruit processing.
                    </p>
                    <p>
                        <strong>Specific Gravity (SG):</strong> The ratio of the density of a liquid to the density
                        of water. Water has an SG of 1.000. Sugars increase the density, while alcohol decreases it.
                    </p>
                    <p>
                        <strong>Conversion Formulas:</strong>
                    </p>
                    <ul>
                        <li>Brix to SG: SG = (Brix / (258.6 - ((Brix / 258.2) × 227.1))) + 1</li>
                        <li>SG to Brix: Brix = (((182.4601 × SG - 775.6821) × SG + 1262.7794) × SG - 669.5622)</li>
                    </ul>
                    <p>
                        <strong>Potential ABV:</strong> Calculated as Brix × 0.55, assuming complete fermentation.
                        This is a rough estimate for dry wines. Actual ABV depends on yeast strain, nutrients,
                        temperature, and whether fermentation goes to completion.
                    </p>
                    <p>
                        <strong>When to use each:</strong>
                    </p>
                    <ul>
                        <li>Use a <strong>refractometer</strong> to measure Brix - requires only a few drops</li>
                        <li>Use a <strong>hydrometer</strong> to measure SG - requires a larger sample</li>
                        <li>Refractometers need temperature compensation and correction during fermentation</li>
                        <li>Hydrometers are accurate during fermentation but less convenient</li>
                    </ul>
                </div>
            </div>
            </div>
        </div>
    );
}

export default BrixConverter;

