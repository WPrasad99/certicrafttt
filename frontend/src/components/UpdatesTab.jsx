import React, { useState } from 'react';

function UpdatesTab({ onSendUpdates, onResendUpdate, loading, participantCount, certificateStatus = [] }) {
    const [updateData, setUpdateData] = useState({
        subject: '',
        content: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSendUpdates(updateData);
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
        </div>
    );
}

export default UpdatesTab;
