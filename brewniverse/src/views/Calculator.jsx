import { Beaker, Calculator as CalcIcon, Droplet, Percent } from 'lucide-react';
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import '../Styles/Calculator.css';
import AbvCalculator from '../components/Calculators/AbvCalculator';
import AbvDilutionCalculator from '../components/Calculators/AbvDilutionCalculator';
import BrixConverter from '../components/Calculators/BrixConverter';
import ChaptalizationCalculator from '../components/Calculators/ChaptalizationCalculator';

function CalculatorList() {
    const navigate = useNavigate();

    const calculators = [
        {
            title: 'ABV Calculator',
            description: 'Calculate Alcohol By Volume from Original and Final Gravity',
            icon: Percent,
            path: '/calculator/abv',
            color: 'primary'
        },
        {
            title: 'ABV Dilution Calculator',
            description: 'Calculate ABV after adding a volume of different strength',
            icon: Droplet,
            path: '/calculator/dilution',
            color: 'secondary'
        },
        {
            title: 'Chaptalization Calculator',
            description: 'Calculate how much sugar to add to reach desired ABV',
            icon: Beaker,
            path: '/calculator/chaptalization',
            color: 'accent'
        },
        {
            title: 'Brix Converter',
            description: 'Convert between Brix and Specific Gravity',
            icon: CalcIcon,
            path: '/calculator/brix',
            color: 'highlight'
        }
    ];

    return (
        <div className="calculator-page">
            <div className="page-header">
                <h1>Brewing Calculators</h1>
                <p>Essential tools for your brewing calculations</p>
            </div>

            <div className="calculators-grid">
                {calculators.map((calc) => {
                    const Icon = calc.icon;
                    return (
                        <div
                            key={calc.path}
                            className={`interactive-card interactive-card-${calc.color}`}
                            onClick={() => navigate(calc.path)}
                        >
                            <div className="card-icon">
                                <Icon size={40} />
                            </div>
                            <div className="card-content">
                                <h3>{calc.title}</h3>
                                <p>{calc.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Calculator() {
    return (
        <Routes>
            <Route index element={<CalculatorList />} />
            <Route path="abv" element={<AbvCalculator />} />
            <Route path="dilution" element={<AbvDilutionCalculator />} />
            <Route path="chaptalization" element={<ChaptalizationCalculator />} />
            <Route path="brix" element={<BrixConverter />} />
        </Routes>
    );
}

export default Calculator;