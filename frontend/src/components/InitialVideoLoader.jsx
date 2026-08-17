import React from 'react';

const InitialVideoLoader = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: '#000000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <video 
                src="/assets/loading.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

export default InitialVideoLoader;
