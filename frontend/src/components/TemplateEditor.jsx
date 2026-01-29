import React, { useEffect, useRef, useState } from 'react';
import './TemplateEditor.css';

function TemplateEditor({ eventId, onClose, templateService, showToast, onTemplateSaved }) {
    const [template, setTemplate] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [coords, setCoords] = useState({ nameX: null, nameY: null, qrX: null, qrY: null, fontSize: null, fontColor: null, qrSize: null });
    const [hasUploaded, setHasUploaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectionMode, setSelectionMode] = useState('name'); // 'name' or 'qr'
    const [previewUrl, setPreviewUrl] = useState(null);
    const imgRef = useRef();

    // Load template on mount
    useEffect(() => {
        const load = async () => {
            try {
                const t = await templateService.getTemplate(eventId);
                if (!t) {
                    setTemplate(null);
                    setImageSrc(null);
                    setCoords({ nameX: null, nameY: null, qrX: null, qrY: null, fontSize: 40, fontColor: '#000000', qrSize: 100 });
                    return;
                }
                setTemplate(t);
                // Prefer imageUrl (Supabase direct link) over base64
                const src = t.imageUrl || (t.imageData ? `data:${t.mimeType || 'image/png'};base64,${t.imageData}` : null);
                setImageSrc(src);
                setCoords({ nameX: t.nameX, nameY: t.nameY, qrX: t.qrX, qrY: t.qrY, fontSize: t.fontSize, fontColor: t.fontColor, qrSize: t.qrSize || 100 });
            } catch (err) {
                if (err?.response?.status === 404) {
                    setTemplate(null);
                    setImageSrc(null);
                } else {
                    showToast('Failed to load template', 'error');
                }
            }
        };
        load();
    }, [eventId]);

    // Real-time preview effect with debounce
    useEffect(() => {
        if (!imageSrc || !coords.nameX || !coords.nameY || !coords.qrX || !coords.qrY) return;

        const timer = setTimeout(async () => {
            // Avoid setting loading=true here to prevent UI flickering, just update silently or show small indicator?
            // Or keep loading but make it subtle. 
            // For now we just call handlePreview logic directly.
            try {
                const blob = await templateService.getPreview(eventId, coords);
                const url = URL.createObjectURL(blob);
                setPreviewUrl(prev => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
            } catch (err) {
                console.error('Preview generation failed', err);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [coords, eventId, imageSrc]); // Dependencies: updates when coords change

    const handleClick = (e) => {
        if (!imgRef.current) return;
        const img = imgRef.current;
        const rect = img.getBoundingClientRect();
        // Compute click coords relative to the image's natural size
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const displayedWidth = rect.width;
        const displayedHeight = rect.height;

        const ratioX = Math.max(0, Math.min(1, clickX / displayedWidth));
        const ratioY = Math.max(0, Math.min(1, clickY / displayedHeight));

        const x = Math.round(ratioX * naturalWidth);
        const y = Math.round(ratioY * naturalHeight);

        if (selectionMode === 'name') {
            setCoords({ ...coords, nameX: x, nameY: y });
        } else if (selectionMode === 'qr') {
            setCoords({ ...coords, qrX: x, qrY: y });
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const res = await templateService.uploadTemplate(eventId, file);
            // Backend returns imageData + mimeType when successful
            setTemplate(res);
            // Prefer imageUrl (Supabase direct link) over base64
            const src = res.imageUrl || (res.imageData ? `data:${res.mimeType || 'image/png'};base64,${res.imageData}` : null);
            setImageSrc(src);
            // Reset coords and prompt user to pick name center
            setCoords({ nameX: null, nameY: null, qrX: null, qrY: null, fontSize: res.fontSize || 40, fontColor: res.fontColor || '#000000', qrSize: res.qrSize || 100 });
            setHasUploaded(true);
            showToast('Template uploaded. Click on the image to set the name and QR code positions.', 'success');
            onTemplateSaved && onTemplateSaved();
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to upload template';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (coords.nameX == null || coords.nameY == null) {
            showToast('Please click on the template to set the name center before saving.', 'error');
            return;
        }
        // QR coordinates are optional - can be set later
        try {
            await templateService.updateCoordinates(eventId, coords);
            showToast('Template coordinates saved successfully!', 'success');
            onTemplateSaved && onTemplateSaved();
        } catch (err) {
            showToast('Failed to save coordinates', 'error');
        }
    };

    const handleRemove = async () => {
        if (!window.confirm('Are you sure you want to remove this template? This will revert the event to having no template.')) return;
        try {
            setLoading(true);
            await templateService.deleteTemplate(eventId);
            setTemplate(null);
            setImageSrc(null);
            setCoords({ nameX: null, nameY: null, qrX: null, qrY: null, fontSize: 40, fontColor: '#000000', qrSize: 100 });
            showToast('Template removed', 'success');
            onTemplateSaved && onTemplateSaved();
        } catch (err) {
            showToast('Failed to remove template', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="template-editor-overlay">
            <div className="template-editor">
                <div className="template-editor-header">
                    <h3>{template ? 'Edit Template' : 'Add Template'}</h3>
                    <button onClick={onClose} className="btn btn-secondary btn-close-editor">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="template-editor-body">
                    {/* LEFT: Main Canvas Area */}
                    <div className="editor-canvas">
                        {imageSrc ? (
                            <div className="image-container" onClick={handleClick} style={{ cursor: 'crosshair' }}>
                                <img ref={imgRef} src={imageSrc} alt="Template" />

                                {/* Instant Frontend Overlay - NAME */}
                                {coords.nameX != null && coords.nameY != null && (
                                    <div
                                        className={`overlay-element overlay-name ${selectionMode === 'name' ? 'active' : ''}`}
                                        style={{
                                            left: `calc(${(coords.nameX / (imgRef.current?.naturalWidth || 1)) * 100}%)`,
                                            top: `calc(${(coords.nameY / (imgRef.current?.naturalHeight || 1)) * 100}%)`,
                                            fontSize: `${(coords.fontSize || 40) * ((imgRef.current?.width || 1) / (imgRef.current?.naturalWidth || 1))}px`,
                                            color: coords.fontColor || '#000000',
                                            border: selectionMode === 'name' ? '2px dashed #2563eb' : '1px dashed rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        John Doe
                                    </div>
                                )}

                                {/* Instant Frontend Overlay - QR */}
                                {coords.qrX != null && coords.qrY != null && (
                                    <div
                                        className={`overlay-element overlay-qr ${selectionMode === 'qr' ? 'active' : ''}`}
                                        style={{
                                            left: `calc(${(coords.qrX / (imgRef.current?.naturalWidth || 1)) * 100}%)`,
                                            top: `calc(${(coords.qrY / (imgRef.current?.naturalHeight || 1)) * 100}%)`,
                                            width: `${(coords.qrSize || 100) * ((imgRef.current?.width || 1) / (imgRef.current?.naturalWidth || 1))}px`,
                                            height: `${(coords.qrSize || 100) * ((imgRef.current?.width || 1) / (imgRef.current?.naturalWidth || 1))}px`,
                                            border: selectionMode === 'qr' ? '2px dashed #2563eb' : '1px dashed rgba(0,0,0,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.8)'
                                        }}
                                    >
                                        <span style={{ fontSize: '10px' }}>QR</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <div style={{ marginBottom: '20px' }}>
                                    <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 0 01-.88-7.903A5 0 1115.9 6L16 6a5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                </div>
                                <h3>Upload a Certificate Template</h3>
                                <p style={{ maxWidth: '400px', margin: '10px auto' }}>
                                    Upload a high-quality PNG or JPG image of your certificate. You'll be able to position the name and QR code overlays in the next step.
                                </p>
                                <input
                                    type="file"
                                    id="template-upload"
                                    accept="image/*"
                                    onChange={(e) => handleUpload(e.target.files[0])}
                                    disabled={loading}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="template-upload" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                    {loading ? 'Uploading...' : 'Choose Image'}
                                </label>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sidebar Controls */}
                    <div className="editor-sidebar">
                        <div className="sidebar-scroll">
                            {/* Mode Selection */}
                            <div className="control-group">
                                <h4>Editing Mode</h4>
                                <div className="mode-toggles">
                                    <button
                                        onClick={() => setSelectionMode('name')}
                                        className={`toggle-btn ${selectionMode === 'name' ? 'active' : ''}`}
                                    >
                                        Name Position
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('qr')}
                                        className={`toggle-btn ${selectionMode === 'qr' ? 'active' : ''}`}
                                    >
                                        QR Position
                                    </button>
                                </div>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    Click on the image to place the {selectionMode === 'name' ? 'participant name' : 'verification QR code'}.
                                </p>
                            </div>

                            <hr style={{ borderColor: '#eee' }} />

                            {/* Styling Controls */}
                            <div className="control-group">
                                <h4>Appearance</h4>
                                <div className="input-group">
                                    <label>Font Size</label>
                                    <input
                                        type="number"
                                        value={coords.fontSize || ''}
                                        onChange={(e) => setCoords({ ...coords, fontSize: parseInt(e.target.value || '0') || null })}
                                        placeholder="40"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Font Color</label>
                                    <input
                                        type="color"
                                        value={coords.fontColor || '#000000'}
                                        onChange={(e) => setCoords({ ...coords, fontColor: e.target.value })}
                                        style={{ height: '40px', padding: '2px' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>QR Size (px)</label>
                                    <input
                                        type="number"
                                        value={coords.qrSize || ''}
                                        onChange={(e) => setCoords({ ...coords, qrSize: parseInt(e.target.value || '0') || null })}
                                        placeholder="100"
                                    />
                                </div>
                            </div>

                            {/* PDF Preview (Small) */}
                            <div className="preview-box">
                                <h4>PDF Verification</h4>
                                <div className="preview-frame-container">
                                    {previewUrl ? (
                                        <iframe
                                            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                            title="Certificate Preview"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 'none' }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>
                                            Set positions to see PDF preview
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="sidebar-footer">
                            <div className="button-row" style={{ flexDirection: 'column' }}>
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '12px' }}
                                    disabled={coords.nameX == null || coords.nameY == null}
                                >
                                    Save Coordinates
                                </button>

                                {imageSrc && (
                                    <button
                                        onClick={handleRemove}
                                        className="btn btn-danger"
                                        style={{
                                            width: '100%',
                                            marginTop: '8px',
                                            background: '#fff1f2',
                                            color: '#e11d48',
                                            border: '1px solid #fecdd3'
                                        }}
                                        disabled={loading}
                                    >
                                        Remove Template
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TemplateEditor;
