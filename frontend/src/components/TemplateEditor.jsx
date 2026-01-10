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
            setImageSrc(`data:${res.mimeType || 'image/png'};base64,${res.imageData}`);
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
        if (coords.qrX == null || coords.qrY == null) {
            showToast('Please click on the template to set the QR code position before saving.', 'error');
            return;
        }
        try {
            await templateService.updateCoordinates(eventId, coords);
            showToast('Template coordinates saved', 'success');
            onTemplateSaved && onTemplateSaved();
            onClose();
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
                    <button onClick={onClose} className="btn btn-secondary">Close</button>
                </div>
                <div className="template-editor-body">
                    <div className="editor-main-area" style={{ display: 'flex', gap: '20px', height: '100%' }}>

                        {/* Left Side: Editor */}
                        <div className="editor-canvas" style={{ flex: 1, overflow: 'auto' }}>
                            {imageSrc ? (
                                <div className="image-container" onClick={handleClick} style={{ position: 'relative', display: 'inline-block' }}>
                                    <img ref={imgRef} src={imageSrc} alt="Template" style={{ maxWidth: '100%', display: 'block' }} />
                                    {coords.nameX != null && coords.nameY != null && (
                                        <div
                                            className="marker marker-name"
                                            style={{
                                                left: `calc(${(coords.nameX / (imgRef.current?.naturalWidth || 1)) * 100}% - 2px)`,
                                                top: `calc(${(coords.nameY / (imgRef.current?.naturalHeight || 1)) * 100}% - 2px)`,
                                            }}
                                        />
                                    )}
                                    {coords.qrX != null && coords.qrY != null && (
                                        <div
                                            className="marker marker-qr"
                                            style={{
                                                left: `calc(${(coords.qrX / (imgRef.current?.naturalWidth || 1)) * 100}% - 2px)`,
                                                top: `calc(${(coords.qrY / (imgRef.current?.naturalHeight || 1)) * 100}% - 2px)`,
                                            }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="upload-container">
                                    <p>No template uploaded yet. Upload an image (PNG/JPG) and then click on the image to set the name and QR code positions.</p>
                                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files[0])} disabled={loading} />
                                    {hasUploaded && <div style={{ marginTop: 8, color: '#666' }}>Now click on the image to set positions.</div>}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Live Preview */}
                        <div className="preview-pane" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h4>Live Preview</h4>
                            <div className="preview-frame" style={{ flex: 1, border: '1px solid #ddd', background: '#f9f9f9', borderRadius: '4px', overflow: 'hidden' }}>
                                {previewUrl ? (
                                    <iframe
                                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        title="Certificate Preview"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                                        Set positions to see preview
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="controls">
                        <div style={{ marginBottom: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Click Mode:</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setSelectionMode('name')}
                                    className={`btn ${selectionMode === 'name' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ flex: 1, fontSize: '12px' }}
                                >
                                    Name Position
                                </button>
                                <button
                                    onClick={() => setSelectionMode('qr')}
                                    className={`btn ${selectionMode === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ flex: 1, fontSize: '12px' }}
                                >
                                    QR Position
                                </button>
                            </div>
                        </div>

                        <label>Font size</label>
                        <input
                            type="number"
                            value={coords.fontSize || ''}
                            onChange={(e) => setCoords({ ...coords, fontSize: parseInt(e.target.value || '0') || null })}
                        />

                        <label>Font color</label>
                        <input
                            type="color"
                            value={coords.fontColor || '#000000'}
                            onChange={(e) => setCoords({ ...coords, fontColor: e.target.value })}
                        />

                        <label>QR Code size (px)</label>
                        <input
                            type="number"
                            value={coords.qrSize || ''}
                            onChange={(e) => setCoords({ ...coords, qrSize: parseInt(e.target.value || '0') || null })}
                            placeholder="100"
                        />

                        <div className="button-row">
                            <button onClick={handleSave} className="btn btn-primary" disabled={coords.nameX == null || coords.nameY == null || coords.qrX == null || coords.qrY == null}>Save Coordinates</button>
                            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                        </div>

                        {imageSrc && (
                            <button
                                onClick={handleRemove}
                                className="btn btn-danger"
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Removing...' : 'Remove Template'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TemplateEditor;
