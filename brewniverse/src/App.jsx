import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Layout/Navigation';
import Dashboard from './views/Dashboard';
import BrewLogs from './views/BrewLogs';
import Recipes from './views/Recipes';
import Alerts from './views/Alerts';
import Instructions from './views/Instructions';
import Settings from './views/Settings';
import './App.css';

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
                <Route path="/instructions/*" element={<Instructions />} />
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
