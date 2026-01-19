import React from 'react';

function ParticipantsTab({
    participants,
    onFileUpload,
    onAddParticipant,
    onGenerateCertificates,
    onDeleteParticipant,
    onDeleteAllParticipants,
    onEditTemplate,
    loading,
    isOwner,
    template,
    triggerVibration
}) {

    const uploadFileBtnRef = React.useRef(null);
    const uploadTemplateBtnRef = React.useRef(null);

    const handleUploadTemplateClick = () => {
        if (!participants || participants.length === 0) {
            triggerVibration();
            // Focus on upload file button
            if (uploadFileBtnRef.current) {
                uploadFileBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                uploadFileBtnRef.current.focus();
                uploadFileBtnRef.current.classList.add('highlight-pulse');
                setTimeout(() => uploadFileBtnRef.current.classList.remove('highlight-pulse'), 1000);
            }
            return;
        }
        onEditTemplate();
    };

    const handleGenerateClick = () => {
        if (!participants || participants.length === 0) {
            triggerVibration();
            if (uploadFileBtnRef.current) {
                uploadFileBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                uploadFileBtnRef.current.focus();
                uploadFileBtnRef.current.classList.add('highlight-pulse');
                setTimeout(() => uploadFileBtnRef.current.classList.remove('highlight-pulse'), 1000);
            }
            return;
        }

        // Check if template is uploaded
        // We assume 'template' prop is passed. If template is null/undefined, it's missing.
        // However, the backend might return { html: ..., ... } or just be null.
        // Let's assume truthy template means valid.
        if (!template) {
            triggerVibration();
            if (uploadTemplateBtnRef.current) {
                uploadTemplateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                uploadTemplateBtnRef.current.focus();
                uploadTemplateBtnRef.current.classList.add('highlight-pulse');
                setTimeout(() => uploadTemplateBtnRef.current.classList.remove('highlight-pulse'), 1000);
            }
            return;
        }

        onGenerateCertificates();
    };

    // Helper to determine if button should look disabled (conceptually)
    const isTemplateBtnDisabled = (!participants || participants.length === 0);
    const isGenerateBtnDisabled = (!participants || participants.length === 0) || !template;

    return (
        <div className="tab-content">
            <div className="card">
                <h3>Upload Participants</h3>
                <p className="help-text">
                    Upload a CSV or Excel file with columns: <strong>Name</strong> and <strong>Email</strong>
                </p>

                <div className="upload-section action-grid">
                    <div>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={onFileUpload}
                            disabled={loading}
                            id="file-upload"
                            className="file-input"
                        />
                        <label
                            htmlFor="file-upload"
                            className="btn btn-primary action-btn"
                            ref={uploadFileBtnRef}
                            tabIndex="0" // Make focusable
                        >
                            Choose File
                        </label>
                    </div>

                    <button
                        ref={uploadTemplateBtnRef}
                        onClick={handleUploadTemplateClick}
                        className={`btn btn-primary action-btn ${isTemplateBtnDisabled ? 'btn-disabled-style' : ''}`}
                        disabled={loading} // Only disable for actual loading, not logic
                    >
                        Upload Template
                    </button>

                    <button
                        onClick={handleGenerateClick}
                        className={`btn btn-primary action-btn ${isGenerateBtnDisabled ? 'btn-disabled-style' : ''}`}
                        disabled={loading} // Only disable for actual loading
                    >
                        Generate Certificates
                    </button>
                </div>

                <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

                <h3>Add Participant Manually</h3>
                <form onSubmit={onAddParticipant} className="manual-add-form">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input name="name" className="form-input" required placeholder="Participant Name" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input name="email" type="email" className="form-input" required placeholder="participant@example.com" />
                    </div>
                    <button type="submit" className="btn btn-secondary add-btn" disabled={loading}>
                        Add
                    </button>
                </form>
            </div>

            {Array.isArray(participants) && participants.length > 0 && (
                <div className="card">
                    <div className="participant-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Participants List ({participants.length})</h3>
                        <button
                            onClick={() => {
                                if (window.confirm('DANGER: Are you sure you want to remove ALL participants? This will also delete their generated certificates. This action cannot be undone.')) {
                                    onDeleteAllParticipants();
                                }
                            }}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
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
