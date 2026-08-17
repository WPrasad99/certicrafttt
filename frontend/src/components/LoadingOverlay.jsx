import React from 'react';

import './LoadingOverlay.css';

const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <video 
                    className="loading-video"
                    src="/assets/loading.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </div>
        </div>
    );
};

export default LoadingOverlay;
