import { ArrowLeft, Bell, BookOpen, Calculator, FileText, Home, Menu, NotebookPen, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../Styles/Navigation.css';
import { useNavigationContext } from '../../contexts/NavigationContext';

function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { navigate: contextNavigate } = useNavigationContext();

    const menuItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/brewlogs', icon: BookOpen, label: 'Brew Logs' },
        { path: '/recipes', icon: FileText, label: 'Recipes' },
        { path: '/journal', icon: NotebookPen, label: 'Journal' },
        { path: '/alerts', icon: Bell, label: 'Alerts' },
        { path: '/calculator', icon: Calculator, label: 'Calculator' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleNavigation = (path) => {
        contextNavigate(path, navigate);
        setIsMenuOpen(false);
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            // Pass a callback function for back navigation
            contextNavigate(() => navigate(-1));
        } else {
            contextNavigate('/', navigate);
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

