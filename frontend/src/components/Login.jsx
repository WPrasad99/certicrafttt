import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';
import LoadingOverlay from './LoadingOverlay';



function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRedirectLoading, setShowRedirectLoading] = useState(false);

    // Typing animation logic
    const fullText = "Streamline your certificate workflow\nwith automated generation and dispatch.";
    const [displayText, setDisplayText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + fullText.charAt(index));
                setIndex(prev => prev + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [index]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(formData);
            setShowRedirectLoading(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Use production backend URL or localhost for development
        const backendUrl = window.location.hostname.includes('render.com')
            ? 'https://certicraft-backendd.onrender.com'
            : 'http://localhost:8080';

        // Start Google OAuth flow on the backend
        window.location.href = `${backendUrl}/auth/google`;
    };

    return (
        <div className="auth-container">
            {showRedirectLoading && <LoadingOverlay />}
            <div className="auth-card-landscape auth-page-animation">
                <div className="login-left">
                    <div className="brand-section fade-in-up">
                        <div className="logo-placeholder">
                            <img src="/assets/bharti_logo.png" alt="Bharati Vidyapeeth Logo" className="logo-image" />
                        </div>
                        <h1 className="welcome-text">Welcome !</h1>
                        <div className="typing-container">
                            <p className="brand-tagline">
                                {displayText}
                                <span className="typing-cursor"></span>
                            </p>
                        </div>
                    </div>

                    <div className="features-grid fade-in-up delay-1">
                        <div className="feature-card">
                            <span className="feature-icon">⚡</span>
                            <h3>Fast Generation</h3>
                            <p>Generate certificates instantly</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🔒</span>
                            <h3>Secure</h3>
                            <p>Tamper-proof verification</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📤</span>
                            <h3>Easy Dispatch</h3>
                            <p>Send via email in one click</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📊</span>
                            <h3>Analytics</h3>
                            <p>Track your event success</p>
                        </div>
                    </div>
                </div>

                <div className="login-right fade-in-up delay-2">
                    <div className="form-header">
                        <h2>Login Account</h2>
                        <p className="auth-subtitle">Welcome back! Please enter your details.</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </p>

                    <div className="btn-divider">OR</div>

                    <a
                        href="https://certicraft-backendd.onrender.com/auth/google"
                        onClick={(e) => { window.location.href = 'https://certicraft-backendd.onrender.com/auth/google'; }}
                        className="google-btn"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
                        Sign in with Google
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Login;
