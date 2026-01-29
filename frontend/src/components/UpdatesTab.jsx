import React, { useState, useEffect } from 'react';
import { certificateService } from '../services/authService';

function UpdatesTab({ onSendUpdates, onResendUpdate, loading, participantCount, certificateStatus = [], eventId }) {
    const [updateData, setUpdateData] = useState({
        subject: '',
        content: ''
    });
    const [updateHistory, setUpdateHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load form data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(`update_form_${eventId}`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setUpdateData(parsed);
            } catch (e) {
                console.error('Failed to parse saved form data', e);
            }
        }
    }, [eventId]);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        if (updateData.subject || updateData.content) {
            localStorage.setItem(`update_form_${eventId}`, JSON.stringify(updateData));
        }
    }, [updateData, eventId]);

    // Load update history
    useEffect(() => {
        loadUpdateHistory();
    }, [eventId]);

    const loadUpdateHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await certificateService.getUpdateHistory(eventId);
            setUpdateHistory(data);
        } catch (error) {
            console.error('Failed to load update history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSendUpdates(updateData);
        // Clear form and localStorage after successful send
        setUpdateData({ subject: '', content: '' });
        localStorage.removeItem(`update_form_${eventId}`);
        // Reload history
        loadUpdateHistory();
    };

    return (
        <div className="tab-content updates-grid">
            <div className="status-card">
                <h3>Live Status ({certificateStatus.length})</h3>
                <div className="status-list-container">
                    <table className="status-list-table">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(certificateStatus) && certificateStatus.map((cert) => (
                                <tr key={cert.id}>
                                    <td>{cert.participantName}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className={`status-badge status-${(cert.updateEmailStatus || 'NOT_SENT').toLowerCase()}`}>
                                                {cert.updateEmailStatus || 'NOT_SENT'}
                                            </span>
                                            {cert.updateEmailStatus === 'FAILED' && (
                                                <button
                                                    onClick={() => onResendUpdate(cert.id)}
                                                    className="btn btn-sm btn-secondary"
                                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {certificateStatus.length === 0 && (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', color: '#888' }}>
                                        No participants loaded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h3>Send Mass Updates</h3>
                <p className="help-text">
                    This message will be sent to all <strong>{participantCount}</strong> participants.
                </p>

                <form onSubmit={handleSubmit} className="update-form">
                    <div className="form-group">
                        <label className="form-label">Email Subject</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Important Update: Event Date Changed"
                            value={updateData.subject}
                            onChange={(e) => setUpdateData({ ...updateData, subject: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Message Content</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '300px', resize: 'vertical' }}
                            placeholder="Write your update message here..."
                            value={updateData.content}
                            onChange={(e) => setUpdateData({ ...updateData, content: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <p className="small-text mt-1">
                            * Note: The organizer's name will be automatically added as a signature.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '16px' }}
                        disabled={loading || participantCount === 0}
                    >
                        {loading ? 'Sending Emails...' : 'Send Updates to All'}
                    </button>
                </form>
            </div>

            {/* Update History Section */}
            <div className="card update-history-section" style={{ gridColumn: '1 / -1' }}>
                <h3>Updates History</h3>
                {loadingHistory ? (
                    <p style={{ textAlign: 'center', color: '#888' }}>Loading history...</p>
                ) : updateHistory.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                        No updates have been sent yet.
                    </p>
                ) : (
                    <div className="update-history-list">
                        {updateHistory.map((update) => (
                            <div key={update.id} className="update-history-item">
                                <div className="update-history-header">
                                    <h4>{update.subject}</h4>
                                    <span className="update-history-meta">
                                        {new Date(update.sentAt).toLocaleString()} • {update.recipientCount} recipients
                                    </span>
                                </div>
                                <p className="update-history-content">{update.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpdatesTab;
