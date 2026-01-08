import React from 'react';

function ParticipantsTab({
    participants,
    onFileUpload,
    onAddParticipant,
    onGenerateCertificates,
    onDeleteParticipant,
    onDeleteAllParticipants,
    onGoToUpdates,
    loading
}) {
    return (
        <div className="tab-content">
            <div className="card">
                <h3>Upload Participants</h3>
                <p className="help-text">
                    Upload a CSV or Excel file with columns: <strong>Name</strong> and <strong>Email</strong>
                </p>

                <div className="upload-section action-grid">
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={onFileUpload}
                        disabled={loading}
                        id="file-upload"
                        className="file-input"
                    />
                    <label htmlFor="file-upload" className="btn btn-primary action-btn">
                        Choose File
                    </label>

                    <button
                        onClick={onGenerateCertificates}
                        className="btn btn-primary action-btn"
                        disabled={loading}
                    >
                        Generate Certificates
                    </button>

                    <button
                        onClick={onGoToUpdates}
                        className="btn btn-primary action-btn"
                        disabled={loading}
                    >
                        Send Updates
                    </button>
                </div>

                <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

                <h3>Add Participant Manually</h3>
                <form onSubmit={onAddParticipant} className="manual-add-form" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Name</label>
                        <input name="name" className="form-input" required placeholder="Participant Name" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Email</label>
                        <input name="email" type="email" className="form-input" required placeholder="participant@example.com" />
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={loading} style={{ marginBottom: '0' }}>
                        Add
                    </button>
                </form>
            </div>

            {Array.isArray(participants) && participants.length > 0 && (
                <div className="card">
                    <div className="participant-actions">
                        <h3>Participants List ({participants.length})</h3>
                        <button
                            onClick={onDeleteAllParticipants}
                            className="delete-all-btn"
                            disabled={loading}
                        >
                            Remove All Participants
                        </button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(participants) && participants.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.email}</td>
                                        <td>
                                            <button
                                                onClick={() => onDeleteParticipant(p.id)}
                                                className="btn-remove"
                                                disabled={loading}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ParticipantsTab;
