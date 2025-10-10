import React, { useState } from 'react';

const CalculatorForm = () => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [result, setResult] = useState(null);

  const handleInput1Change = (e) => setInput1(e.target.value);
  const handleInput2Change = (e) => setInput2(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num1 = parseFloat(input1);
    const num2 = parseFloat(input2);
    if (!isNaN(num1) && !isNaN(num2)) {
      setResult(num1 + num2);
    } else {
      setResult('Invalid input');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Value 1:
          <input
            type="number"
            value={input1}
            onChange={handleInput1Change}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Value 2:
          <input
            type="number"
            value={input2}
            onChange={handleInput2Change}
            required
          />
        </label>
      </div>
      <button type="submit">Calculate</button>
      {result !== null && (
        <div>
          <strong>Result:</strong> {result}
        </div>
      )}
    </form>
  );
};

export default CalculatorForm;