import React from 'react';
import { Search, Bell, Share2 } from 'lucide-react';
import './DashboardNew.css';

function Topbar({ 
    user, 
    notifications, 
    onNotificationsClick, 
    showNotifications,
    pendingRequests,
    onRequestsClick,
    showRequests 
}) {
    const userName = user?.fullName || user?.name || 'User';
    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <header className="pm-topbar">
            <div className="pm-breadcrumbs">
                <span>Main Menu</span>
                <span style={{ color: '#cbd5e1' }}>›</span>
                <span className="active">Dashboard</span>
            </div>

            <div className="pm-topbar__right">
                <div className="pm-search">
                    <Search />
                    <input type="text" placeholder="Search" />
                </div>

                <div className="pm-icon-btn" onClick={onNotificationsClick} style={{ position: 'relative' }}>
                    <Bell />
                    {notifications?.length > 0 && (
                        <span style={{
                            position: 'absolute', top: -2, right: -2, 
                            background: 'var(--pm-danger)', color: 'white', 
                            fontSize: '9px', fontWeight: 'bold', width: '14px', height: '14px', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {notifications.length}
                        </span>
                    )}
                </div>

                <div className="pm-icon-btn" onClick={onRequestsClick} style={{ position: 'relative' }}>
                    <Share2 />
                    {pendingRequests?.length > 0 && (
                        <span style={{
                            position: 'absolute', top: -2, right: -2, 
                            background: 'var(--pm-text-dark)', color: 'white', 
                            fontSize: '9px', fontWeight: 'bold', width: '14px', height: '14px', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {pendingRequests.length}
                        </span>
                    )}
                </div>

                <div className="pm-avatar">
                    {initials}
                </div>
            </div>
        </header>
    );
}

export default Topbar;
