import React, { useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Validation } from '../../constants/ValidationConstants';
import Button from '../UI/Button';
import '../../Styles/Calculator.css';

function AbvCalculator() {
  const navigate = useNavigate();
  const [originalGravity, setOriginalGravity] = useState('');
  const [finalGravity, setFinalGravity] = useState('1.000');
  const [result, setResult] = useState(null);
  
  // Reverse calculator state
  const [reverseOG, setReverseOG] = useState('');
  const [reverseTargetAbv, setReverseTargetAbv] = useState('');
  const [reverseResult, setReverseResult] = useState(null);

  const calculateAbv = () => {
    const og = parseFloat(originalGravity);
    const fg = parseFloat(finalGravity);

    if (isNaN(og) || isNaN(fg)) {
      alert('Please enter valid gravity readings');
      return;
    }

    if (og < 1.0 || fg < 0.980) {
      alert('Gravity readings should be realistic (OG > 1.0, FG > 0.990)');
      return;
    }

    if (fg > og) {
      alert('Final Gravity should be less than Original Gravity');
      return;
    }

    // Standard formula: ABV = (OG - FG) × 131.25
    const abv = ((og - fg) * 131.25).toFixed(2);
    
    // Alternative formula for more accurate results (Balling formula)
    const abvBalling = (76.08 * (og - fg) / (1.775 - og) * (fg / 0.794)).toFixed(2);

    setResult({
      abv,
      abvBalling,
      og: og.toFixed(3),
      fg: fg.toFixed(3),
      attenuation: (((og - fg) / (og - 1)) * 100).toFixed(1)
    });
  };

  const calculateTargetFG = () => {
    const og = parseFloat(reverseOG);
    const targetAbv = parseFloat(reverseTargetAbv);

    if (isNaN(og) || isNaN(targetAbv)) {
      alert('Please enter valid values for OG and target ABV');
      return;
    }

    if (og < 1.0) {
      alert('Original Gravity should be greater than 1.0');
      return;
    }

    if (targetAbv < 0 || targetAbv > 40) {
      alert('Target ABV should be between 0 and 40%');
      return;
    }

    // Calculate target FG: ABV = (OG - FG) × 131.25
    // Therefore: FG = OG - (ABV / 131.25)
    const targetFG = og - (targetAbv / 131.25);

    if (targetFG < 0.850) {
      alert('Target FG is unrealistically low. Consider reducing target ABV or increasing OG.');
      return;
    }

    if (targetFG >= og) {
      alert('Target FG would be equal to or greater than OG. This is not possible.');
      return;
    }

    const attenuation = (((og - targetFG) / (og - 1)) * 100).toFixed(1);

    setReverseResult({
      targetFG: targetFG.toFixed(3),
      og: og.toFixed(3),
      targetAbv: targetAbv.toFixed(2),
      attenuation
    });
  };

  const reset = () => {
    setOriginalGravity('');
    setFinalGravity('1.000');
    setResult(null);
  };

  const resetReverse = () => {
    setReverseOG('');
    setReverseTargetAbv('');
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
          <Calculator size={32} />
          <h1>ABV Calculator</h1>
          <p>Calculate Alcohol By Volume from gravity readings</p>
        </div>

        <div className="calculator-form">
          <div className="form-group">
            <label htmlFor="og" className="form-label">
              Original Gravity (OG)
            </label>
            <input
              type="number"
              id="og"
              step="0.001"
              className="form-input"
              value={originalGravity}
              onChange={(e) => setOriginalGravity(e.target.value)}
              placeholder="e.g., 1.050"
            />
            <small className="form-hint">The gravity reading before fermentation</small>
          </div>

          <div className="form-group">
            <label htmlFor="fg" className="form-label">
              Final Gravity (FG)
            </label>
            <input
              type="number"
              id="fg"
              step="0.001"
              className="form-input"
              value={finalGravity}
              onChange={(e) => setFinalGravity(e.target.value)}
              placeholder="e.g., 1.000"
            />
            <small className="form-hint">The gravity reading after fermentation</small>
          </div>

          <div className="calculator-actions">
            <Button
              variant="primary"
              size="large"
              onClick={calculateAbv}
            >
              <Calculator size={16} />
              Calculate ABV
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
                <div className="result-label">Alcohol By Volume</div>
                <div className="result-value">{result.abv}%</div>
                <div className="result-hint">Standard formula</div>
              </div>
              
              <div className="result-card secondary">
                <div className="result-label">ABV (Balling)</div>
                <div className="result-value">{result.abvBalling}%</div>
                <div className="result-hint">More accurate for higher ABV</div>
              </div>

              <div className="result-card accent">
                <div className="result-label">Attenuation</div>
                <div className="result-value">{result.attenuation}%</div>
                <div className="result-hint">Percentage of sugars consumed</div>
              </div>
            </div>

            <div className="result-info">
              <p><strong>Original Gravity:</strong> {result.og}</p>
              <p><strong>Final Gravity:</strong> {result.fg}</p>
              <p><strong>Gravity Points:</strong> {((parseFloat(result.og) - parseFloat(result.fg)) * 1000).toFixed(0)}</p>
            </div>
          </div>
        )}

        <div className="calculator-divider" style={{ margin: '3rem 0', borderTop: '2px solid var(--border-color)' }}></div>

        <div className="calculator-title">
          <Calculator size={32} />
          <h2>Target Final Gravity Calculator</h2>
          <p>Calculate what FG to stop fermentation at for a desired ABV</p>
        </div>

        <div className="calculator-form">
          <div className="form-group">
            <label htmlFor="reverseOG" className="form-label">
              Original Gravity (OG)
            </label>
            <input
              type="number"
              id="reverseOG"
              step="0.001"
              min={Validation.NumberMin}
              className="form-input"
              value={reverseOG}
              onChange={(e) => setReverseOG(e.target.value)}
              placeholder="e.g., 1.060"
            />
            <small className="form-hint">Your starting gravity reading</small>
          </div>

          <div className="form-group">
            <label htmlFor="reverseTargetAbv" className="form-label">
              Desired ABV (%)
            </label>
            <input
              type="number"
              id="reverseTargetAbv"
              step="0.1"
              min={Validation.NumberMin}
              className="form-input"
              value={reverseTargetAbv}
              onChange={(e) => setReverseTargetAbv(e.target.value)}
              placeholder="e.g., 7.5"
            />
            <small className="form-hint">The target alcohol percentage you want to achieve</small>
          </div>

          <div className="calculator-actions">
            <Button
              variant="primary"
              size="large"
              onClick={calculateTargetFG}
            >
              <Calculator size={16} />
              Calculate Target FG
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
                <div className="result-label">Target Final Gravity</div>
                <div className="result-value">{reverseResult.targetFG}</div>
                <div className="result-hint">Stop fermentation at this gravity</div>
              </div>
              
              <div className="result-card secondary">
                <div className="result-label">Target ABV</div>
                <div className="result-value">{reverseResult.targetAbv}%</div>
                <div className="result-hint">Your desired alcohol content</div>
              </div>

              <div className="result-card accent">
                <div className="result-label">Required Attenuation</div>
                <div className="result-value">{reverseResult.attenuation}%</div>
                <div className="result-hint">Percentage of sugars to consume</div>
              </div>
            </div>

            <div className="result-info">
              <p><strong>Original Gravity:</strong> {reverseResult.og}</p>
              <p><strong>Target Final Gravity:</strong> {reverseResult.targetFG}</p>
              <p>
                To achieve <strong>{reverseResult.targetAbv}% ABV</strong>, stop fermentation when gravity reaches <strong>{reverseResult.targetFG}</strong>.
              </p>
              <p className="result-warning">
                ⚠️ Note: You may need to cold crash, add potassium sorbate, or use other methods to halt fermentation at your target gravity.
              </p>
            </div>
          </div>
        )}

        <div className="calculator-info">
          <h4>About This Calculator</h4>
          <p>
            This calculator uses the standard formula: <strong>ABV = (OG - FG) × 131.25</strong>
          </p>
          <p>
            The alternative Balling formula provides more accurate results for higher gravity brews (above 6% ABV).
          </p>
          <p>
            <strong>Attenuation</strong> shows what percentage of available sugars were consumed during fermentation.
            Typical attenuation ranges from 70-85% depending on yeast strain and fermentation conditions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AbvCalculator;

