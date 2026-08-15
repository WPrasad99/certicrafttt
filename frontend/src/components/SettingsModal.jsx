import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './SettingsModal.css';
import { X, User, Mail, Lock, Building, Key, AtSign, Loader2, Settings } from 'lucide-react';

const SettingsModal = ({ isOpen, mode, onClose, onUpdate, showToast }) => {
    const user = authService.getCurrentUser();
    const [activeSection, setActiveSection] = useState('email');
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        instituteName: user?.instituteName || '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [emailData, setEmailData] = useState({
        smtpUser: user?.smtpUser || '',
        smtpPassword: '',
        fromEmail: user?.fromEmail || '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const currentUser = authService.getCurrentUser();
            setProfileData({
                fullName: currentUser?.fullName || '',
                instituteName: currentUser?.instituteName || '',
            });
            setEmailData({
                smtpUser: currentUser?.smtpUser || '',
                smtpPassword: currentUser?.hasSmtpKey ? '********' : '',
                fromEmail: currentUser?.fromEmail || '',
            });
            if (mode === 'profile') {
                setActiveSection('profile');
            } else {
                setActiveSection('email');
            }
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateSettings(profileData);
            showToast('Profile updated successfully!', 'success');
            onUpdate();
            onClose();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            await authService.changePassword({
                newPassword: passwordData.newPassword,
            });
            showToast('Password changed successfully!', 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateSettings({
                smtpHost: emailData.smtpUser ? 'smtp-relay.brevo.com' : '',
                smtpPort: emailData.smtpUser ? '2525' : '',
                smtpUser: emailData.smtpUser.trim(),
                smtpPassword: emailData.smtpPassword.trim(),
                fromEmail: emailData.fromEmail.trim(),
            });
            showToast('Email settings updated successfully!', 'success');
            onUpdate();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to update email settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="um-modal-overlay" onClick={onClose}>
            <div className="um-modal-content rev-modal" onClick={e => e.stopPropagation()}>
                <div className="rev-header-bg">
                    <button className="rev-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                    
                    <div className="rev-header-content">
                        {mode === 'profile' && (
                            <>
                                <h2>Revamp Your Profile</h2>
                                <p>Update your profile to reflect the best version of yourself!</p>
                            </>
                        )}
                        {mode === 'settings' && (
                            <>
                                <h2>Account Settings</h2>
                                <p>Manage your email configuration and account security here.</p>
                            </>
                        )}
                    </div>
                </div>

                {mode === 'settings' && (
                    <div className="rev-tabs">
                        <button
                            className={`rev-tab ${activeSection === 'email' ? 'active' : ''}`}
                            onClick={() => setActiveSection('email')}
                        >
                            <Mail size={16} /> Email Setup
                        </button>
                        <button
                            className={`rev-tab ${activeSection === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveSection('password')}
                        >
                            <Lock size={16} /> Security
                        </button>
                    </div>
                )}
                {mode === 'profile' && (
                    <div className="rev-tabs">
                        <button className="rev-tab active">
                            <User size={16} /> Basic Info
                        </button>
                    </div>
                )}

                <div className="rev-body">
                    {activeSection === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="rev-form" id="profile-form">
                            <div className="rev-row">
                                <div className="rev-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.fullName}
                                        onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="rev-group">
                                    <label>Institute Name</label>
                                    <input
                                        type="text"
                                        value={profileData.instituteName}
                                        onChange={e => setProfileData({ ...profileData, instituteName: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="rev-group">
                                <label>Email Address</label>
                                <input type="email" value={user?.email} disabled />
                            </div>
                        </form>
                    )}

                    {activeSection === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="rev-form" id="email-form">
                            <div className="rev-group">
                                <label>Brevo SMTP Username</label>
                                <input
                                    type="text"
                                    value={emailData.smtpUser}
                                    onChange={e => setEmailData({ ...emailData, smtpUser: e.target.value })}
                                />
                            </div>

                            <div className="rev-group">
                                <label>Brevo SMTP Password (API Key)</label>
                                <input
                                    type="password"
                                    value={emailData.smtpPassword}
                                    onChange={e => setEmailData({ ...emailData, smtpPassword: e.target.value })}
                                />
                            </div>

                            <div className="rev-group">
                                <label>From Email Address</label>
                                <input
                                    type="email"
                                    value={emailData.fromEmail}
                                    onChange={e => setEmailData({ ...emailData, fromEmail: e.target.value })}
                                />
                            </div>
                        </form>
                    )}

                    {activeSection === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="rev-form" id="password-form">
                            <div className="rev-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="rev-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </form>
                    )}
                </div>

                <div className="rev-footer">
                    <button type="button" className="rev-btn-cancel" onClick={onClose}>Cancel</button>
                    <button 
                        type="submit" 
                        form={activeSection === 'profile' ? 'profile-form' : activeSection === 'email' ? 'email-form' : 'password-form'} 
                        className="rev-btn-submit" 
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
