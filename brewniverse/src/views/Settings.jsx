import React from 'react';
import { useApp, ActionTypes } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/UI/Button';
import '../Styles/Settings.css';

function Settings() {
  const { state, dispatch } = useApp();
  const { themes, currentTheme, switchTheme } = useTheme();

  const handleSettingChange = (setting, value) => {
    dispatch({
      type: ActionTypes.UPDATE_SETTINGS,
      payload: { [setting]: value }
    });
  };

  const handleThemeChange = (themeName) => {
    switchTheme(themeName);
    handleSettingChange('theme', themeName);
  };

  const defaultViewOptions = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'brewlogs', label: 'Brew Logs' },
    { value: 'recipes', label: 'Recipes' },
    { value: 'alerts', label: 'Alerts' },
    { value: 'calculator', label: 'Calculator' },
  ];

  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    value: key,
    label: theme.name
  }));

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your Brewniverse experience</p>
      </div>

      <div className="settings-logo">
        <img src="/BrewniverseLogo.png" alt="Brewniverse Logo"/>
      </div>

      {/* Themes */}
      <div className="settings-sections">
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Appearance</h2>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label className="form-label" htmlFor="theme-select">
                  Color Theme
                </label>
                <select
                  id="theme-select"
                  className="form-select"
                  value={currentTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  {themeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="setting-description">
                  Choose your preferred color scheme.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Navigation</h2>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label className="form-label" htmlFor="default-view-select">
                  Default View
                </label>
                <select
                  id="default-view-select"
                  className="form-select"
                  value={state.settings.defaultView}
                  onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                >
                  {defaultViewOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="setting-description">
                  Choose which view opens when you start the app
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Data Management</h2>
            </div>
            <div className="card-content">
              <div className="data-stats">
                <div className="stat-item">
                  <span className="stat-label">Brew Logs:</span>
                  <span className="stat-value">{state.brewLogs.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Recipes:</span>
                  <span className="stat-value">{state.recipes.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Alerts:</span>
                  <span className="stat-value">{state.alerts.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Instructions:</span>
                  <span className="stat-value">{state.instructions.length}</span>
                </div>
              </div>
              
              <div className="data-actions">
                <Button
                  variant="outline"
                  onClick={() => {
                    const dataStr = JSON.stringify(state, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `brewniverse-backup-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Data
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const importedData = JSON.parse(event.target.result);
                            if (confirm('This will replace all your current data. Are you sure?')) {
                              dispatch({
                                type: ActionTypes.LOAD_DATA,
                                payload: importedData
                              });
                              alert('Data imported successfully!');
                            }
                          } catch (error) {
                            alert('Error importing data. Please check the file format.');
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                >
                  Import Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">About</h2>
            </div>
            <div className="card-content">
              <div className="about-info">
                <h3>Brewniverse</h3>
                <p>Your comprehensive brewing companion for tracking batches, managing recipes, and staying organized throughout your brewing journey.</p>
                
                <div className="features-list">
                  <h4>Features:</h4>
                  <ul>
                    <li>Track brew logs with detailed information</li>
                    <li>Manage and reference recipes</li>
                    <li>Set up alerts and reminders</li>
                    <li>Calculate brew outcomes</li>
                    <li>Customizable themes and settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

