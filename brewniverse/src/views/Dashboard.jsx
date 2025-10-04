import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Bell, Clipboard } from 'lucide-react';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';
import '../Styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();

  const shortcuts = [
    {
      title: 'Brew Logs',
      icon: BookOpen,
      path: '/brewlogs',
      count: state.brewLogs.length,
      color: 'primary'
    },
    {
      title: 'Recipes',
      icon: FileText,
      path: '/recipes',
      count: state.recipes.length,
      color: 'secondary'
    },
    {
      title: 'Alerts',
      icon: Bell,
      path: '/alerts',
      count: state.alerts.length,
      color: 'accent'
    },
    {
      title: 'Instructions',
      icon: Clipboard,
      path: '/instructions',
      count: state.instructions.length,
      color: 'highlight'
    }
  ];

  // Get recent activity
  const recentBrewLogs = state.brewLogs
    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
    .slice(0, 3);

  // Get upcoming alerts
  const upcomingAlerts = state.alerts
    .filter(alert => new Date(alert.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Brewniverse</h1>
        <p>Track your brewing journey</p>
      </div>

      <div className="shortcuts-grid">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <div key={shortcut.path} className={`shortcut-card shortcut-${shortcut.color}`}>
              <div className="shortcut-icon">
                <Icon size={32} />
              </div>
              <div className="shortcut-content">
                <h3>{shortcut.title}</h3>
                <p className="shortcut-count">{shortcut.count} items</p>
              </div>
              <Button
                variant="ghost"
                size="medium"
                onClick={() => navigate(shortcut.path)}
                className="shortcut-button"
              >
                Open
              </Button>
            </div>
          );
        })}
      </div>

      <div className="dashboard-sections">
        {recentBrewLogs.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Brew Logs</h2>
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/brewlogs')}
              >
                View All
              </Button>
            </div>
            <div className="recent-items">
              {recentBrewLogs.map((log) => (
                <div key={log.id} className="recent-item">
                  <div className="recent-item-content">
                    <h4>{log.name}</h4>
                    <p>{log.type}</p>
                    <small>{new Date(log.dateCreated).toLocaleDateString()}</small>
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/brewlogs/${log.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingAlerts.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Upcoming Alerts</h2>
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/alerts')}
              >
                View All
              </Button>
            </div>
            <div className="recent-items">
              {upcomingAlerts.map((alert) => (
                <div key={alert.id} className="recent-item alert-item">
                  <div className="recent-item-content">
                    <h4>{alert.name}</h4>
                    <p>{alert.description}</p>
                    <small>{new Date(alert.date).toLocaleDateString()}</small>
                  </div>
                  <div className="alert-indicator" />
                </div>
              ))}
            </div>
          </div>
        )}

        {recentBrewLogs.length === 0 && upcomingAlerts.length === 0 && (
          <div className="empty-dashboard">
            <h2>Get Started</h2>
            <p>Create your first brew log or recipe to begin tracking your brewing journey!</p>
            <div className="get-started-buttons">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/brewlogs/new')}
              >
                Create Brew Log
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => navigate('/recipes/new')}
              >
                Add Recipe
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

