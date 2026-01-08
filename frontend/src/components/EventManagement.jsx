import React, { useState, useEffect } from 'react';
import { participantService, certificateService, authService, templateService } from '../services/authService';
import TemplateEditor from './TemplateEditor';
import './EventManagement.css';
import CollaboratorsTab from './CollaboratorsTab';
import MessagesTab from './MessagesTab';
import ParticipantsTab from './ParticipantsTab';
import CertificatesTab from './CertificatesTab';
import UpdatesTab from './UpdatesTab';
import Toast from './Toast';

function EventManagement({ event, onBack, onNotify, initialTab = 'participants' }) {
    const currentUser = authService.getCurrentUser();
    const isOwner = !!(currentUser && (
        (currentUser.id && currentUser.id === event.organizerId) ||
        (currentUser.email && event.organizerEmail && currentUser.email === event.organizerEmail)
    ));
    const [activeTab, setActiveTab] = useState(initialTab);
    const [participants, setParticipants] = useState([]);
    const [certificateStatus, setCertificateStatus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVibrating, setIsVibrating] = useState(false);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);
    const [template, setTemplate] = useState(null);

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
    }, [event.id]);

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
            }, 3000); // Poll every 3 seconds
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

        setLoading(true);

        try {
            await certificateService.generateCertificates(event.id);
            showToast('Certificates generated successfully!', 'success');
            onNotify?.('success', `Certificates generated for ${event.eventName}`);
            await loadCertificateStatus();
            setActiveTab('certificates');
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to generate certificates';
            showToast(msg, 'error');
            onNotify?.('error', msg);
        } finally {
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
                    <div className="navbar-brand">
                        <div className="brand-logo-container">
                            <img src="/assets/bharti_logo.png" alt="Logo" className="navbar-logo" />
                            <div className="brand-text-container">
                                <h2>CertiCraft</h2>
                                <div className="brand-line"></div>
                            </div>
                        </div>
                    </div>
                    <div className="secondary-actions">
                        <div className="navbar-actions">
                            <button onClick={onBack} className="btn btn-secondary btn-sm">
                                ← Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

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
                        certificateStatus={certificateStatus}
                        onFileUpload={handleFileUpload}
                        onAddParticipant={handleAddParticipant}
                        onGenerateCertificates={handleGenerateCertificates}
                        onDeleteParticipant={handleDeleteParticipant}
                        onDeleteAllParticipants={handleDeleteAllParticipants}
                        onGoToUpdates={() => participants.length > 0 ? setActiveTab('updates') : triggerVibration()}
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
                        onEditTemplate={() => setShowTemplateEditor(true)}
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
