import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, eventService, analyticsService, collaborationService, messageService } from '../services/authService';
import { Plus, BarChart, Settings, Settings2, Zap, Send, Bell, UsersRound, X } from 'lucide-react';
import EventManagement from './EventManagement';
import Modal from './Modal';
import AnalyticsCharts from './AnalyticsCharts';
import CollaborationRequests from './CollaborationRequests';
import EventList from './EventList';
import SettingsModal from './SettingsModal';
import Toast from './Toast';
import Sidebar from './Sidebar';
import KpiCard from './KpiCard';
import './DashboardNew.css';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, totalCertificates: 0, totalParticipants: 0, deliverySuccessRate: null });
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [initialTab, setInitialTab] = useState('participants');
    const [modal, setModal] = useState({ isOpen: false, eventId: null });
    const [modalMode, setModalMode] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isNotifVibrating, setIsNotifVibrating] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);

    const notificationsDropdownRef = useRef(null);
    const requestsDropdownRef = useRef(null);

    const showToast = (message, type = 'info') => setToast({ show: true, message, type });
    const hideToast = () => setToast({ ...toast, show: false });

    useEffect(() => {
        loadData();
        const interval = setInterval(loadRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (requestsDropdownRef.current && !requestsDropdownRef.current.contains(event.target)) {
                setShowRequestsDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            const [eventsData, statsData] = await Promise.all([
                eventService.getAllEvents(),
                analyticsService.getStats()
            ]);
            setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.events || []));
            setStats(statsData);
            await loadRequests();
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRequests = async () => {
        try {
            const [reqs, unreadMsgs] = await Promise.all([
                collaborationService.getRequests(),
                messageService.getUnreadMessages()
            ]);
            setPendingRequests(Array.isArray(reqs) ? reqs : []);

            if (Array.isArray(unreadMsgs)) {
                unreadMsgs.forEach(msg => {
                    const uniqueId = msg.id;
                    const dismissed = JSON.parse(localStorage.getItem('dismissed_notif_ids') || '[]');
                    if (dismissed.includes(uniqueId)) return;

                    setNotifications(prev => {
                        if (prev.some(n => n.id === uniqueId)) return prev;
                        return [{
                            id: uniqueId,
                            type: 'info',
                            message: `New message from ${msg.senderName}: ${msg.content?.substring(0, 30)}...`,
                            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            eventId: msg.eventId,
                            targetTab: 'messages'
                        }, ...prev].slice(0, 10);
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load requests:', error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await collaborationService.respondToRequest(requestId, 'ACCEPTED');
            showToast('Invitation accepted!', 'success');
            loadRequests();
        } catch (error) {
            showToast('Failed to accept invitation', 'error');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await collaborationService.respondToRequest(requestId, 'DECLINED');
            showToast('Invitation declined', 'info');
            loadRequests();
        } catch (error) {
            showToast('Failed to decline invitation', 'error');
        }
    };

    const handleDismissNotification = (e, notifId) => {
        e.stopPropagation();
        const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notif_ids') || '[]');
        if (!dismissedIds.includes(notifId)) {
            dismissedIds.push(notifId);
            localStorage.setItem('dismissed_notif_ids', JSON.stringify(dismissedIds));
        }
        setNotifications(prev => prev.filter(n => n.id !== notifId));
    };

    const handleNotificationClick = (notif) => {
        if (notif.eventId) {
            const event = events.find(e => String(e.id) === String(notif.eventId));
            if (event) {
                setSelectedEvent(event);
                setInitialTab(notif.targetTab || 'participants');
            } else {
                showToast('Event not found or you do not have access', 'error');
            }
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const addNotification = (type, message) => {
        showToast(message, type);
    };

    const confirmDeletion = async () => {
        try {
            await eventService.deleteEvent(modal.eventId);
            addNotification('success', `Event deleted`);
            loadData();
        } catch (error) {
            addNotification('error', error.response?.data?.error || 'Failed to delete event');
        }
    };

    if (loading) return <div className="spinner"></div>;

    if (selectedEvent) {
        return <EventManagement
            event={selectedEvent}
            initialTab={initialTab}
            onBack={() => { setSelectedEvent(null); loadData(); }}
            onNotify={addNotification}
        />;
    }

    return (
        <div className="um-app-container">
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
                user={user}
                onOpenSettings={() => setModalMode('settings')}
                onOpenProfile={() => setModalMode('profile')}
            />

            <main className="um-main">
                <SettingsModal
                    isOpen={!!modalMode}
                    mode={modalMode}
                    onClose={() => setModalMode(null)}
                    onUpdate={() => { setUser(authService.getCurrentUser()); loadData(); }}
                    showToast={showToast}
                />

                <div className="um-page-header">
                    <div className="um-hero-section">
                        <div className="um-welcome">Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋</div>
                        <h1 className="um-hero">
                            Managing <span className="um-hero-icon"><Settings2 size={20} /></span> Your Events <br />
                            and <span className="um-hero-icon neon"><Zap size={20} /></span> Certificates
                        </h1>
                    </div>

                    <div className="um-top-actions">
                        {/* Notification Bell */}
                        <div className="notifications-container" ref={notificationsDropdownRef} style={{ position: 'relative' }}>
                            <button
                                className={`um-btn-icon ${isNotifVibrating ? 'vibrate-bt' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifications(!showNotifications);
                                    setShowRequestsDropdown(false);
                                }}
                                title="Notifications"
                            >
                                <Bell size={20} />
                                {notifications.length > 0 &&
                                    <span className="notification-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {notifications.length}
                                    </span>
                                }
                            </button>

                            {showNotifications && (
                                <div className="notifications-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '16px', boxShadow: 'var(--um-shadow-soft)', width: '300px', zIndex: 100, border: '1px solid #f1f5f9' }}>
                                    <div className="notifications-header" style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Notifications</h3>
                                    </div>
                                    <div className="notifications-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: notif.eventId ? 'pointer' : 'default' }}
                                                    onClick={() => handleNotificationClick(notif)}
                                                >
                                                    <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>{notif.message}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{notif.time}</span>
                                                        <button
                                                            onClick={(e) => handleDismissNotification(e, notif.id)}
                                                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team Invites */}
                        <div className="notifications-container" ref={requestsDropdownRef} style={{ position: 'relative' }}>
                            <button
                                className={`um-btn-icon ${pendingRequests.length > 0 ? 'vibrate-bt' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRequestsDropdown(!showRequestsDropdown);
                                    setShowNotifications(false);
                                }}
                                title="Collaboration Requests"
                            >
                                <UsersRound size={20} />
                                {Array.isArray(pendingRequests) && pendingRequests.length > 0 &&
                                    <span className="notification-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#3b82f6', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {pendingRequests.length}
                                    </span>
                                }
                            </button>

                            {showRequestsDropdown && (
                                <div className="notifications-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '16px', boxShadow: 'var(--um-shadow-soft)', width: '320px', zIndex: 100, border: '1px solid #f1f5f9' }}>
                                    <div className="notifications-header" style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Team Invitations</h3>
                                    </div>
                                    <div className="notifications-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {(!Array.isArray(pendingRequests) || pendingRequests.length === 0) ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                                No pending invitations
                                            </div>
                                        ) : (
                                            pendingRequests.map(req => (
                                                <div key={req.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{req.eventName}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>From: {req.senderName}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            style={{ flex: 1, background: '#10b981', color: 'white', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                                                            onClick={() => handleAcceptRequest(req.id)}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            style={{ flex: 1, background: '#ef4444', color: 'white', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                                                            onClick={() => handleDeclineRequest(req.id)}
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>



                <div className="um-grid">
                    <div className="um-left-col">
                        <div className="um-kpi-row">
                            <KpiCard
                                title="Total Events"
                                value={stats.totalEvents ?? 0}
                                dots={3}
                                variant="light"
                                icon={<Settings2 size={16} />}
                            />
                            <KpiCard
                                title="Certificates Sent"
                                value={stats.totalSentCerts ?? 0}
                                dots={4}
                                variant="neon"
                                icon={<Send size={16} />}
                            />
                            <KpiCard
                                title="Certificates Generated"
                                value={stats.totalCertificates ?? 0}
                                dots={5}
                                variant="dark"
                                icon={<Zap size={16} />}
                            />
                        </div>

                        {/* Events List */}
                        <div className="um-content-card" style={{ height: 'auto', marginBottom: '24px' }}>
                            <EventList
                                events={events}
                                onEventSelect={(e) => { setInitialTab('participants'); setSelectedEvent(e); }}
                                onDeleteRequest={(id) => setModal({ isOpen: true, eventId: id })}
                                onRefresh={loadData}
                                onNotify={addNotification}
                            />
                        </div>

                        {/* Statistics (Full width) */}
                        <div className="um-content-card" style={{ display: 'flex', flexDirection: 'column', height: 'auto', marginBottom: '24px' }}>
                            <div className="um-content-header" style={{ marginBottom: '8px' }}>
                                <h2 className="um-content-title">Monthly Statistics</h2>
                            </div>
                            <AnalyticsCharts stats={stats} events={events} />
                        </div>
                    </div>
                </div>
            </main>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, eventId: null })}
                onConfirm={confirmDeletion}
                title="Delete Event"
                message="Are you sure you want to delete this event?"
            />
        </div>
    );
}

export default Dashboard;
