import React, { useState, useEffect, useRef } from 'react';
import { participantService, certificateService, authService, templateService, collaborationService, messageService } from '../services/authService';
import TemplateEditor from './TemplateEditor';
import './EventManagement.css';
import CollaboratorsTab from './CollaboratorsTab';
import MessagesTab from './MessagesTab';
import ParticipantsTab from './ParticipantsTab';
import CertificatesTab from './CertificatesTab';
import UpdatesTab from './UpdatesTab';
import Toast from './Toast';
import SettingsModal from './SettingsModal';

function EventManagement({ event, onBack, onNotify, initialTab = 'participants' }) {
    const currentUser = authService.getCurrentUser();
    const isOwner = !!(currentUser && (
        (currentUser.id && String(currentUser.id) === String(event.organizerId)) ||
        (currentUser.email && event.organizerEmail && currentUser.email === event.organizerEmail)
    ));

    const [activeTab, setActiveTab] = useState(initialTab);
    const [participants, setParticipants] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [certificateStatus, setCertificateStatus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVibrating, setIsVibrating] = useState(false);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);
    const [template, setTemplate] = useState(null);

    // Navbar states from Dashboard
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isNotifVibrating, setIsNotifVibrating] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);

    const notificationsDropdownRef = useRef(null);
    const requestsDropdownRef = useRef(null);

    const loadTemplate = async () => {
        try {
            const t = await templateService.getTemplate(event.id).catch(e => null);
            setTemplate(t);
        } catch (err) {
            console.error('Failed to load template:', err);
            setTemplate(null);
        }
    };

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, show: false });
    };

    const triggerVibration = () => {
        setIsVibrating(true);
        showToast('First upload participants list', 'error');
        setTimeout(() => setIsVibrating(false), 400);
    };

    useEffect(() => {
        loadParticipants();
        loadCertificateStatus();
        loadTemplate();
        loadRequests();
        const interval = setInterval(loadRequests, 10000);
        return () => clearInterval(interval);
    }, [event.id]);

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

    const loadRequests = async () => {
        try {
            const [reqs, sentReqs, actionLogs, unreadMsgs] = await Promise.all([
                collaborationService.getRequests(),
                collaborationService.getSentRequests(),
                collaborationService.getOwnedEventsLogs(),
                messageService.getUnreadMessages()
            ]);
            setPendingRequests(Array.isArray(reqs) ? reqs : []);

            // Process unread messages as notifications
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
            // Find the event in our list
            // If it's the current event, we just switch tabs
            if (String(notif.eventId) === String(event.id)) {
                setActiveTab(notif.targetTab || 'participants');
            } else {
                // If it's a different event, we return to dashboard and then the notification click there would handle it
                // Or we could stay here and just show a message.
                // For now, let's just toast
                showToast(`New activity in another event. Head to Dashboard to view.`, 'info');
            }
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    // Polling for certificate status if any are PENDING or SENDING
    useEffect(() => {
        if (!Array.isArray(certificateStatus)) return;

        const needsPolling = certificateStatus.some(
            cert => cert.generationStatus === 'PENDING' ||
                cert.emailStatus === 'SENDING' ||
                cert.updateEmailStatus === 'SENDING'
        );

        if (needsPolling) {
            const interval = setInterval(() => {
                loadCertificateStatus();
            }, 2000); // Poll every 2 seconds for snappier real-time feel
            return () => clearInterval(interval);
        }
    }, [certificateStatus]);

    const loadParticipants = async () => {
        try {
            const data = await participantService.getParticipants(event.id);
            setParticipants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load participants:', error);
            setParticipants([]);
        }
    };

    const handleDeleteParticipant = async (participantId) => {
        try {
            await participantService.deleteParticipant(event.id, participantId);
            showToast('Participant removed', 'success');
            await loadParticipants();
            await loadCertificateStatus();
        } catch (error) {
            showToast('Failed to remove participant', 'error');
        }
    };

    const handleDeleteAllParticipants = async () => {
        if (!window.confirm('Are you sure you want to remove ALL participants? This will also delete any generated certificates.')) return;

        setLoading(true);
        try {
            await participantService.deleteAllParticipants(event.id);
            showToast('All participants removed', 'success');
            await loadParticipants();
            await loadCertificateStatus();
        } catch (error) {
            showToast('Failed to remove all participants', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadCertificateStatus = async () => {
        try {
            const data = await certificateService.getCertificateStatus(event.id);
            setCertificateStatus(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load certificate status:', error);
            setCertificateStatus([]);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        // Toast handled in success/catch

        try {
            await participantService.uploadParticipants(event.id, file);
            showToast('Participants uploaded successfully!', 'success');
            onNotify?.('success', `Participants uploaded for ${event.eventName}`);
            await loadParticipants();
            await loadCertificateStatus();
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to upload participants';
            showToast(msg, 'error');
            onNotify?.('error', msg);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleGenerateCertificates = async () => {
        if (participants.length === 0) {
            triggerVibration();
            return;
        }

        // Switch to certificates tab immediately
        setActiveTab('certificates');

        // We set a local "busy" state if needed, but the polling will show progress
        setLoading(true);

        try {
            // Start generation in background
            certificateService.generateCertificates(event.id)
                .then(() => {
                    showToast('Certificates generated successfully!', 'success');
                    loadCertificateStatus();
                })
                .catch(error => {
                    const msg = error.response?.data?.error || 'Failed to generate certificates';
                    showToast(msg, 'error');
                })
                .finally(() => {
                    setLoading(false);
                });

            // Immediate check to show initial PENDING states if backend creates them fast
            await loadCertificateStatus();
        } catch (error) {
            console.error('Initial generation trigger failed:', error);
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (certificateId) => {
        try {
            const blob = await certificateService.downloadCertificate(certificateId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate_${certificateId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            showToast('Failed to download certificate', 'error');
        }
    };

    const handleDownloadAll = async () => {
        setLoading(true);
        try {
            const blob = await certificateService.downloadAllCertificates(event.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${event.eventName}_certificates.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('All certificates downloaded!', 'success');
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to download certificates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async (certificateId) => {
        // Optimistic UI update: Set status to SENDING locally
        setCertificateStatus(prev => prev.map(cert =>
            cert.id === certificateId ? { ...cert, emailStatus: 'SENDING' } : cert
        ));

        try {
            await certificateService.sendCertificateEmail(certificateId);
            // After triggering, load actual status from backend
            await loadCertificateStatus();
        } catch (error) {
            showToast('Failed to send email. Check SMTP configuration.', 'error');
            await loadCertificateStatus(); // Restore actual status
        }
    };

    const handleSendAllEmails = async () => {
        // Optimistic UI update for all generated certificates
        setCertificateStatus(prev => prev.map(cert =>
            cert.generationStatus === 'GENERATED' ? { ...cert, emailStatus: 'SENDING' } : cert
        ));

        setLoading(true);
        try {
            await certificateService.sendAllEmails(event.id);
            // No alert as requested
            await loadCertificateStatus();
        } catch (error) {
            const msg = 'Failed to send emails. Check SMTP configuration.';
            showToast(msg, 'error');
            onNotify?.('error', msg);
            await loadCertificateStatus();
        } finally {
            setLoading(false);
        }
    };

    const handleSendUpdates = async (updateData) => {
        // Optimistic UI update: Set status to SENDING for all participants
        setCertificateStatus(prev => {
            if (!Array.isArray(prev)) return prev;
            return prev.map(cert => ({
                ...cert,
                updateEmailStatus: 'SENDING'
            }));
        });

        setLoading(true);
        try {
            await certificateService.sendUpdateEmails(event.id, updateData.subject, updateData.content);
            // No alert as requested
            onNotify?.('success', `Updates sent for ${event.eventName}`);
            // Trigger a reload to catch up with backend state
            setTimeout(loadCertificateStatus, 1000);
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to send updates';
            showToast(msg, 'error');
            onNotify?.('error', msg);
            // Revert status on failure (optional, but good practice is to reload)
            await loadCertificateStatus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendUpdate = async (participantId) => {
        try {
            await certificateService.resendUpdateEmail(participantId);
            showToast('Email status reset. Please include in next "Send Mass Updates" batch.', 'success');
            await loadCertificateStatus();
        } catch (error) {
            showToast('Failed to reset status', 'error');
        }
    };


    const handleAddParticipant = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');

        if (!name || !email) return;

        setLoading(true);
        try {
            await participantService.addParticipant(event.id, { name, email });
            showToast('Participant added', 'success');
            e.target.reset();
            await loadParticipants();
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to add participant';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
            <nav className="navbar">
                <div className="navbar-content">
                    <div className="navbar-brand-group">
                        <button onClick={onBack} className="btn-back-nav" title="Back to Dashboard">
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div className="navbar-brand">
                            <div className="brand-logo-container">
                                <img src="/assets/bharti_logo.png" alt="Logo" className="navbar-logo" />
                                <div className="brand-text-container">
                                    <h2>CertiCraft</h2>
                                    <div className="brand-line"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </button>

                    <div className={`secondary-actions ${isMenuOpen ? 'mobile-show' : ''}`} onClick={() => setIsMenuOpen(false)}>
                        <div className="navbar-actions">
                            {/* Settings Icon */}
                            <button
                                className="notifications-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSettings(true);
                                    setIsMenuOpen(false);
                                }}
                                title="Settings"
                            >
                                <i className="fa-solid fa-gear" style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
                            </button>

                            {/* Notification Bell Icon */}
                            <div className="notifications-container" ref={notificationsDropdownRef}>
                                <button
                                    className={`notifications-btn ${isNotifVibrating ? 'vibrate-bt' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowNotifications(!showNotifications);
                                        setShowRequestsDropdown(false);
                                    }}
                                    title="Notifications"
                                >
                                    <i className="fa-solid fa-bell" style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
                                    {notifications.length > 0 &&
                                        <span className="notification-badge">{notifications.length}</span>
                                    }
                                </button>

                                {showNotifications && (
                                    <div className="notifications-dropdown">
                                        <div className="notifications-header">
                                            <h3>Notifications</h3>
                                        </div>
                                        <div className="notifications-list">
                                            {notifications.length === 0 ? (
                                                <div className="notification-item" style={{ textAlign: 'center', color: '#888' }}>
                                                    No new notifications
                                                </div>
                                            ) : (
                                                Array.isArray(notifications) && notifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className={`notification-item ${notif.type} ${notif.eventId ? 'clickable' : ''}`}
                                                        onClick={() => handleNotificationClick(notif)}
                                                    >
                                                        <div className="notification-content">
                                                            <div className="notification-message">{notif.message}</div>
                                                            <div className="notification-meta">
                                                                <span className="notification-time">{notif.time}</span>
                                                                <button
                                                                    className="dismiss-notif-btn"
                                                                    onClick={(e) => handleDismissNotification(e, notif.id)}
                                                                    title="Dismiss"
                                                                >
                                                                    <i className="fa-solid fa-xmark"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Team Collaboration Icon */}
                            <div className="notifications-container" style={{ marginLeft: '12px' }} ref={requestsDropdownRef}>
                                <button
                                    className={`notifications-btn ${pendingRequests.length > 0 ? 'vibrate-bt' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRequestsDropdown(!showRequestsDropdown);
                                        setShowNotifications(false);
                                    }}
                                    title="Collaboration Requests"
                                >
                                    <i className="fa-solid fa-user-plus" style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
                                    {Array.isArray(pendingRequests) && pendingRequests.length > 0 &&
                                        <span className="notification-badge" style={{ background: '#333', color: 'white' }}>{pendingRequests.length}</span>
                                    }
                                </button>

                                {showRequestsDropdown && (
                                    <div className="notifications-dropdown minimal-dropdown" style={{ width: '320px', right: '0' }}>
                                        <div className="notifications-header minimal-header">
                                            <h3>Team invitations</h3>
                                        </div>
                                        <div className="notifications-list">
                                            {(!Array.isArray(pendingRequests) || pendingRequests.length === 0) ? (
                                                <div className="notification-item" style={{ justifyContent: 'center', color: '#888' }}>
                                                    No pending invitations
                                                </div>
                                            ) : (
                                                Array.isArray(pendingRequests) && pendingRequests.map(req => (
                                                    <div key={req.id} className="notification-item" style={{ display: 'block' }}>
                                                        <div className="notification-message" style={{ marginBottom: '8px' }}>
                                                            <strong>{req.eventName}</strong>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>From: {req.senderName}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ background: '#4caf50', color: 'white', flex: 1 }}
                                                                onClick={() => handleAcceptRequest(req.id)}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ background: '#f44336', color: 'white', flex: 1 }}
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

                        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onUpdate={() => {
                    // Update any local state if needed
                }}
                showToast={showToast}
            />

            <div className={`container ${isVibrating ? 'vibrate' : ''}`}>
                <div className="event-header">
                    <h1>{event.eventName}</h1>
                    <p className="event-meta">
                        {new Date(event.eventDate).toLocaleDateString()} • {event.organizerName}
                    </p>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        Participants
                    </button>
                    <button
                        className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('certificates')}
                    >
                        Certificates
                    </button>
                    <button
                        className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('updates')}
                    >
                        Send Updates
                    </button>
                    <button
                        className={`tab ${activeTab === 'team' ? 'active' : ''}`}
                        onClick={() => setActiveTab('team')}
                    >
                        Team
                    </button>
                    <button
                        className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        Team Messages
                    </button>
                </div>

                {activeTab === 'participants' && (
                    <ParticipantsTab
                        participants={participants}
                        template={template} // Pass template
                        certificateStatus={certificateStatus}
                        onFileUpload={handleFileUpload}
                        onAddParticipant={handleAddParticipant}
                        onGenerateCertificates={handleGenerateCertificates}
                        onDeleteParticipant={handleDeleteParticipant}
                        onDeleteAllParticipants={handleDeleteAllParticipants}
                        onEditTemplate={() => setShowTemplateEditor(true)}
                        triggerVibration={triggerVibration} // Pass vibration trigger
                        loading={loading}
                    />
                )}

                {activeTab === 'certificates' && (
                    <CertificatesTab
                        certificates={certificateStatus}
                        template={template}
                        onDownloadCertificate={handleDownloadCertificate}
                        onDownloadAll={handleDownloadAll}
                        onSendEmail={handleSendEmail}
                        onSendAllEmails={handleSendAllEmails}
                        onGoToUpdates={() => participants.length > 0 ? setActiveTab('updates') : triggerVibration()}
                        loading={loading}
                    />
                )}

                {showTemplateEditor && (
                    <TemplateEditor
                        eventId={event.id}
                        templateService={templateService}
                        showToast={showToast}
                        onClose={() => { setShowTemplateEditor(false); loadTemplate(); }}
                        onTemplateSaved={() => loadTemplate()}
                    />
                )}

                {activeTab === 'updates' && (
                    <UpdatesTab
                        onSendUpdates={handleSendUpdates}
                        onResendUpdate={handleResendUpdate}
                        loading={loading}
                        participantCount={participants.length}
                        certificateStatus={certificateStatus}
                        eventId={event.id}
                    />
                )}

                {activeTab === 'team' && (
                    <CollaboratorsTab eventId={event.id} isOwner={isOwner} />
                )}
                {activeTab === 'messages' && (
                    <MessagesTab eventId={event.id} event={event} isOwner={isOwner} />
                )}
            </div>
        </div>
    );
}

export default EventManagement;
