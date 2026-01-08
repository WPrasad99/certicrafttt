import React from 'react';

function CertificatesTab({ certificates, template, onDownloadCertificate, onDownloadAll, onSendEmail, onSendAllEmails, onEditTemplate, loading }) {
    const generatedCount = Array.isArray(certificates) ? certificates.filter(c => c.generationStatus === 'GENERATED').length : 0;

    const getStatusClass = (status) => {
        const statusMap = {
            'GENERATED': 'success',
            'SENT': 'success',
            'FAILED': 'error',
            'PENDING': 'warning',
            'SENDING': 'info',
            'NOT_GENERATED': 'warning',
            'NOT_SENT': 'neutral',
        };
        return statusMap[status] || 'info';
    };

    return (
        <div className="tab-content">
            <div className="card">
                <div className="certificate-actions">
                    <h3>Certificate Actions</h3>
                    <div className="button-group">
                        <button
                            onClick={onDownloadAll}
                            className="btn btn-primary"
                            disabled={loading || generatedCount === 0}
                        >
                            Download All as ZIP
                        </button>
                        <button
                            onClick={onSendAllEmails}
                            className="btn btn-secondary"
                            disabled={loading || generatedCount === 0}
                        >
                            Email All Certificates
                        </button>                        <button
                            onClick={onEditTemplate}
                            className="btn btn-outline"
                        >
                            Upload Template
                        </button>                    </div>
                </div>
            </div>

            {Array.isArray(certificates) && certificates.length > 0 && (
                <div className="card">
                    <h3>Certificate Status</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Participant Name</th>
                                    <th>Email</th>
                                    <th>Generation Status</th>
                                    <th>Email Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(certificates) && certificates.map((cert, index) => (
                                    <tr key={index}>
                                        <td>{cert.participantName}</td>
                                        <td>{cert.email}</td>
                                        <td>
                                            <span className={`badge badge-${getStatusClass(cert.generationStatus)}`}>
                                                {cert.generationStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getStatusClass(cert.emailStatus)}`}>
                                                {cert.emailStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {cert.generationStatus === 'GENERATED' && (
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => onDownloadCertificate(cert.id)}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => onSendEmail(cert.id)}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={cert.emailStatus === 'SENDING'}
                                                    >
                                                        {cert.emailStatus === 'SENT' ? 'Resend' : cert.emailStatus === 'FAILED' ? 'Retry' : 'Send'}
                                                    </button>
                                                </div>
                                            )}
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

export default CertificatesTab;
