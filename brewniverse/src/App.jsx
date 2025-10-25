import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './Styles/App.css';
import Navigation from './components/Layout/Navigation';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Alerts from './views/Alerts';
import BrewLogs from './views/BrewLogs';
import Calculator from './views/Calculator';
import Dashboard from './views/Dashboard';
import Recipes from './views/Recipes';
import Settings from './views/Settings';

function App() {
    return (
        <AppProvider>
            <ThemeProvider>
                <Router>
                    <div className="app">
                        <Navigation />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/brewlogs/*" element={<BrewLogs />} />
                                <Route path="/recipes/*" element={<Recipes />} />
                                <Route path="/alerts/*" element={<Alerts />} />
                                <Route path="/calculator/*" element={<Calculator />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </ThemeProvider>
        </AppProvider>
    );
}

export default App;
