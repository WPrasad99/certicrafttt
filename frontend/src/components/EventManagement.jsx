import React, { useState, useEffect, useRef } from 'react';
import { participantService, certificateService, authService, templateService, collaborationService, messageService } from '../services/authService';
import TemplateEditor from './TemplateEditor';
import './EventManagement.css';
import * as XLSX from 'xlsx';
import CollaboratorsTab from './CollaboratorsTab';
import MessagesTab from './MessagesTab';
import ParticipantsTab from './ParticipantsTab';
import CertificatesTab from './CertificatesTab';
import UpdatesTab from './UpdatesTab';
import Toast from './Toast';
import SettingsModal from './SettingsModal';
import { ArrowLeft, Users, Award, Send, UsersRound, MessageSquare, Settings, Bell, X } from 'lucide-react';

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
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            // Extract participants, matching backend logic
            const newParticipants = [];
            for (const r of rows) {
                const name = r.name || r.Name || r.fullName || r.FullName || r.full_name || r.participantName || '';
                const email = r.email || r.Email || '';
                if (name && email) {
                    newParticipants.push({ name: String(name).trim(), email: String(email).trim() });
                }
            }

            if (newParticipants.length === 0) {
                showToast('No valid participants found in file.', 'error');
                return;
            }

            showToast(`Uploading ${newParticipants.length} participants...`, 'info');

            const chunkSize = 10;
            for (let i = 0; i < newParticipants.length; i += chunkSize) {
                const chunk = newParticipants.slice(i, i + chunkSize);
                try {
                    const createdBatch = await participantService.uploadParticipantsBatch(event.id, chunk);
                    if (createdBatch && createdBatch.length > 0) {
                        setParticipants(prev => [...prev, ...createdBatch]);
                    }
                } catch (err) {
                    console.error('Batch upload error:', err);
                }
            }

            showToast('Participants uploaded successfully!', 'success');
            onNotify?.('success', `Participants uploaded for ${event.eventName}`);
            await loadCertificateStatus();
        } catch (error) {
            console.error('Failed to parse or upload:', error);
            showToast('Failed to process file', 'error');
            onNotify?.('error', 'Failed to process file');
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
            const msg = error.response?.data?.error || 'Failed to send email.';
            showToast(msg, 'error');
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
            const msg = error.response?.data?.error || 'Failed to send emails.';
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
        <div className="um-app-container">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

            <aside className="um-sidebar">
                <div className="um-sidebar-top">
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0 4px', marginBottom: '16px' }}>
                        <img src="/assets/logo.png" alt="Logo" style={{ width: '100%', maxWidth: '56px', height: 'auto', objectFit: 'contain' }} />
                    </div>
                    <nav className="um-sidebar-nav">
                        <button 
                            className="um-nav-item"
                            onClick={onBack}
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px auto' }}></div>
                        
                        <button 
                            className={`um-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participants')}
                            title="Participants"
                        >
                            <Users size={20} />
                        </button>
                        <button 
                            className={`um-nav-item ${activeTab === 'certificates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('certificates')}
                            title="Certificates"
                        >
                            <Award size={20} />
                        </button>
                        <button 
                            className={`um-nav-item ${activeTab === 'updates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('updates')}
                            title="Send Updates"
                        >
                            <Send size={20} />
                        </button>
                        <button 
                            className={`um-nav-item ${activeTab === 'team' ? 'active' : ''}`}
                            onClick={() => setActiveTab('team')}
                            title="Team"
                        >
                            <UsersRound size={20} />
                        </button>
                        <button 
                            className={`um-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                            onClick={() => setActiveTab('messages')}
                            title="Team Messages"
                        >
                            <MessageSquare size={20} />
                        </button>
                    </nav>
                </div>

                <div className="um-sidebar-bottom">
                    <button 
                        className="um-nav-item"
                        onClick={() => setShowSettings(true)}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </aside>

            <main className="um-main">
                <SettingsModal
                    isOpen={showSettings}
                    mode="settings"
                    onClose={() => setShowSettings(false)}
                    onUpdate={() => {}}
                    showToast={showToast}
                />

                <div className="um-page-header">
                    <div className="um-hero-section">
                        <h1 className="um-hero" style={{ marginBottom: '8px', marginTop: 0 }}>
                            {event.eventName}
                        </h1>
                        <div style={{ color: 'var(--um-text-dark)', opacity: 0.7, fontSize: '15px' }}>
                            {new Date(event.eventDate).toLocaleDateString()} • Organized by {event.organizerName}
                        </div>
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

                <div className={`um-grid ${isVibrating ? 'vibrate' : ''}`}>
                        <div className="um-content-card" style={{ width: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                            <div className="um-content-header" style={{ marginBottom: '32px' }}>
                                <h2 className="um-content-title">
                                    {activeTab === 'participants' && 'Participants List'}
                                    {activeTab === 'certificates' && 'Certificates'}
                                    {activeTab === 'updates' && 'Mass Updates'}
                                    {activeTab === 'team' && 'Collaborators'}
                                    {activeTab === 'messages' && 'Team Messages'}
                                </h2>
                            </div>

                            {activeTab === 'participants' && (
                                <ParticipantsTab
                                    participants={participants}
                                    template={template}
                                    certificateStatus={certificateStatus}
                                    onFileUpload={handleFileUpload}
                                    onAddParticipant={handleAddParticipant}
                                    onGenerateCertificates={handleGenerateCertificates}
                                    onDeleteParticipant={handleDeleteParticipant}
                                    onDeleteAllParticipants={handleDeleteAllParticipants}
                                    onEditTemplate={() => setShowTemplateEditor(true)}
                                    triggerVibration={triggerVibration}
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
                </main>
            </div>
    );
}

export default EventManagement;
