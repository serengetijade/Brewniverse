import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ArrowLeft, Home, BookOpen, Bell, FileText, Settings } from 'lucide-react';
import '../../Styles/Navigation.css';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/brewlogs', icon: BookOpen, label: 'Brew Logs' },
    { path: '/recipes', icon: FileText, label: 'Recipes' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/instructions', icon: FileText, label: 'Instructions' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav className="navigation">
        <div className="nav-left">
          {!isHomePage && (
            <button className="nav-button back-button" onClick={handleBack}>
              <ArrowLeft size={24} />
            </button>
          )}
        </div>
        
        <div className="nav-center">
          <h1 className="app-title">Brewniverse</h1>
        </div>
        
        <div className="nav-right">
          <button 
            className="nav-button menu-button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <h2>Menu</h2>
              <button 
                className="close-menu-button"
                onClick={() => setIsMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="menu-items">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;

