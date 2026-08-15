import React from 'react';
import { Home, LogOut, PlayCircle, HelpCircle, User, Settings } from 'lucide-react';
import './DashboardNew.css';

function Sidebar({ activeTab, onTabChange, onLogout, user, onOpenSettings, onOpenProfile }) {
    const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <aside className="um-sidebar">
            <div className="um-sidebar-top">
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0 4px', marginBottom: '16px' }}>
                    <img src="/assets/logo.png" alt="Logo" style={{ width: '100%', maxWidth: '56px', height: 'auto', objectFit: 'contain' }} />
                </div>
                <nav className="um-sidebar-nav">
                    <button 
                        className={`um-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onTabChange('dashboard')}
                        title="Dashboard"
                    >
                        <Home size={20} />
                    </button>
                    <button 
                        className="um-nav-item"
                        onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                        title="Demo Video"
                    >
                        <PlayCircle size={20} />
                    </button>
                    <button 
                        className="um-nav-item"
                        onClick={onOpenProfile}
                        title="Profile"
                    >
                        <User size={20} />
                    </button>
                    <button 
                        className="um-nav-item"
                        onClick={onOpenSettings}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                </nav>
            </div>

            <div className="um-sidebar-bottom">
                <button 
                    className="um-nav-item"
                    title="Help Center"
                >
                    <HelpCircle size={20} />
                </button>
                <button 
                    className="um-nav-item"
                    onClick={onLogout}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;
