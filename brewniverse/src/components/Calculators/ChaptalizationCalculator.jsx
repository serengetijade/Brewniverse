import React, { useState } from 'react';
import { ArrowLeft, Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import '../../Styles/Calculator.css';

function ChaptalizationCalculator() {
  const navigate = useNavigate();
  const [currentGravity, setCurrentGravity] = useState('1.000');
  const [desiredAbv, setDesiredAbv] = useState('');
  const [volume, setVolume] = useState('');
  const [sugarType, setSugarType] = useState('sugar');
  const [result, setResult] = useState(null);
  const [sugarDisplayMode, setSugarDisplayMode] = useState('lbs'); // 'lbs', 'lbs-oz', 'kg'

  // Gravity points per pound per gallon for different sugar types
  const sugarData = {
    sugar: { name: 'Table Sugar (Sucrose)', ppg: 46, unit: 'pounds' },
    honey: { name: 'Honey', ppg: 35, unit: 'pounds' },
    maple: { name: 'Maple Syrup', ppg: 30, unit: 'pounds' }
  };

  const calculate = () => {
    const cg = parseFloat(currentGravity);
    const targetAbv = parseFloat(desiredAbv);
    const vol = parseFloat(volume);

    if (isNaN(cg) || isNaN(targetAbv) || isNaN(vol)) {
      alert('Please enter valid numbers for all fields');
      return;
    }

    if (cg < 1.0 || cg > 1.200) {
      alert('Current gravity should be between 1.000 and 1.200');
      return;
    }

    if (targetAbv < 0 || targetAbv > 20) {
      alert('Target ABV should be between 0 and 20%');
      return;
    }

    if (vol <= 0) {
      alert('Volume must be greater than 0');
      return;
    }

    // Calculate required final gravity based on desired ABV
    // ABV = (OG - FG) × 131.25, assuming FG of ~1.000 for dry fermentation
    const assumedFinalGravity = 1.000;
    const requiredOG = (targetAbv / 131.25) + assumedFinalGravity;

    if (requiredOG <= cg) {
      alert('Your current gravity already exceeds what is needed for the target ABV');
      return;
    }

    // Calculate gravity points needed
    const gravityPointsNeeded = (requiredOG - cg) * 1000;

    // Calculate sugar needed based on type
    const selectedSugar = sugarData[sugarType];
    const sugarNeeded = (gravityPointsNeeded * vol) / selectedSugar.ppg;

    // Calculate new estimated OG
    const newOG = cg + (gravityPointsNeeded / 1000);

    // Calculate potential ABV with new OG
    const potentialAbv = ((newOG - assumedFinalGravity) * 131.25).toFixed(2);

    setResult({
      sugarNeeded: sugarNeeded.toFixed(2),
      sugarType: selectedSugar.name,
      unit: selectedSugar.unit,
      gravityPointsNeeded: gravityPointsNeeded.toFixed(0),
      newOG: newOG.toFixed(3),
      potentialAbv,
      currentGravity: cg.toFixed(3),
      volume: vol
    });
  };

  const toggleSugarDisplay = () => {
    if (sugarDisplayMode === 'lbs') {
      setSugarDisplayMode('lbs-oz');
    } else if (sugarDisplayMode === 'lbs-oz') {
      setSugarDisplayMode('kg');
    } else {
      setSugarDisplayMode('lbs');
    }
  };

  const formatSugarAmount = (lbs) => {
    const pounds = parseFloat(lbs);
    
    if (sugarDisplayMode === 'lbs') {
      return `${pounds.toFixed(2)} lbs`;
    } else if (sugarDisplayMode === 'lbs-oz') {
      const wholePounds = Math.floor(pounds);
      const ounces = (pounds - wholePounds) * 16;
      return `${wholePounds} lbs ${ounces.toFixed(1)} oz`;
    } else { // kg
      const kg = pounds * 0.453592;
      return `${kg.toFixed(3)} kg`;
    }
  };

  const reset = () => {
    setCurrentGravity('1.000');
    setDesiredAbv('');
    setVolume('');
    setSugarType('sugar');
    setResult(null);
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
          <Beaker size={32} />
          <h1>Chaptalization Calculator</h1>
          <p>Calculate how much sugar to add to reach your target ABV</p>
        </div>

        <div className="calculator-form">
          <div className="form-group">
            <label htmlFor="currentGravity" className="form-label">
              Current Specific Gravity
            </label>
            <input
              type="number"
              id="currentGravity"
              step="0.001"
              className="form-input"
              value={currentGravity}
              onChange={(e) => setCurrentGravity(e.target.value)}
              placeholder="e.g., 1.050"
            />
            <small className="form-hint">The current gravity of your must</small>
          </div>

          <div className="form-group">
            <label htmlFor="desiredAbv" className="form-label">
              Desired ABV (%)
            </label>
            <input
              type="number"
              id="desiredAbv"
              step="0.1"
              className="form-input"
              value={desiredAbv}
              onChange={(e) => setDesiredAbv(e.target.value)}
              placeholder="e.g., 12.5"
            />
            <small className="form-hint">Your target alcohol percentage</small>
          </div>

          <div className="form-group">
            <label htmlFor="volume" className="form-label">
              Volume (gallons)
            </label>
            <input
              type="number"
              id="volume"
              step="0.1"
              className="form-input"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="e.g., 5"
            />
            <small className="form-hint">Total volume of your batch</small>
          </div>

          <div className="form-group">
            <label htmlFor="sugarType" className="form-label">
              Sugar Type
            </label>
            <select
              id="sugarType"
              className="form-select"
              value={sugarType}
              onChange={(e) => setSugarType(e.target.value)}
            >
              <option value="sugar">Table Sugar (Sucrose) - 46 PPG</option>
              <option value="honey">Honey - 35 PPG</option>
              <option value="maple">Maple Syrup - 30 PPG</option>
            </select>
            <small className="form-hint">PPG = Points Per Pound per Gallon</small>
          </div>

          <div className="calculator-actions">
            <Button
              variant="primary"
              size="large"
              onClick={calculate}
            >
              <Beaker size={16} />
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
              <div 
                className="result-card primary" 
                onClick={toggleSugarDisplay}
                style={{ cursor: 'pointer' }}
                title="Click to switch units"
              >
                <div className="result-label">Sugar Needed</div>
                <div className="result-value">{formatSugarAmount(result.sugarNeeded)}</div>
                <div className="result-hint">{result.sugarType} (click to toggle units)</div>
              </div>
              
              <div className="result-card secondary">
                <div className="result-label">New Original Gravity</div>
                <div className="result-value">{result.newOG}</div>
                <div className="result-hint">After adding sugar</div>
              </div>

              <div className="result-card accent">
                <div className="result-label">Potential ABV</div>
                <div className="result-value">{result.potentialAbv}%</div>
                <div className="result-hint">If fermented dry</div>
              </div>
            </div>

            <div className="result-info">
              <p><strong>Current Gravity:</strong> {result.currentGravity}</p>
              <p><strong>Gravity Points Added:</strong> {result.gravityPointsNeeded}</p>
              <p><strong>Volume:</strong> {result.volume} gallons</p>
              <p className="result-warning">
                ⚠️ This calculation assumes fermentation to a final gravity of 1.000 (bone dry). 
                Actual ABV may be lower if fermentation stops early or you backsweeten.
              </p>
            </div>
          </div>
        )}

        <div className="calculator-info">
          <h4>About Chaptalization</h4>
          <p>
            Chaptalization is the process of adding sugar to must before or during fermentation 
            to increase the final alcohol content. This is a common practice in wine and mead making.
          </p>
          <p>
            <strong>Sugar Contributions (Points Per Pound per Gallon):</strong>
          </p>
          <ul>
            <li><strong>Table Sugar (Sucrose):</strong> 46 PPG - Pure, highly fermentable</li>
            <li><strong>Honey:</strong> 35 PPG - Adds flavor and complexity</li>
            <li><strong>Maple Syrup:</strong> 30 PPG - Unique flavor profile</li>
          </ul>
          <p>
            <strong>Tips:</strong>
          </p>
          <ul>
            <li>Dissolve sugar in warm water before adding to your must</li>
            <li>Add gradually and mix thoroughly to avoid shocking the yeast</li>
            <li>Consider yeast alcohol tolerance when setting target ABV</li>
            <li>Remember that residual sugars will affect final ABV calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChaptalizationCalculator;

