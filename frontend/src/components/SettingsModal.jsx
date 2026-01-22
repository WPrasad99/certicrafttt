import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, onUpdate, showToast }) => {
    const user = authService.getCurrentUser();
    const [activeSection, setActiveSection] = useState('profile'); // 'profile' or 'password'
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        instituteName: user?.instituteName || '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const currentUser = authService.getCurrentUser();
            setProfileData({
                fullName: currentUser?.fullName || '',
                instituteName: currentUser?.instituteName || '',
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateSettings(profileData);
            showToast('Profile updated successfully!', 'success');
            onUpdate();
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

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="settings-modal-header">
                    <div className="header-title">
                        <i className="fa-solid fa-gear"></i>
                        <h2>Account Settings</h2>
                    </div>
                    <button className="close-settings-btn" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="settings-container">
                    <aside className="settings-sidebar">
                        <button
                            className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveSection('profile')}
                        >
                            <i className="fa-solid fa-user"></i>
                            <span>Profile</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveSection('password')}
                        >
                            <i className="fa-solid fa-lock"></i>
                            <span>Password</span>
                        </button>
                    </aside>

                    <main className="settings-main">
                        {activeSection === 'profile' && (
                            <div className="settings-section animate-fade-in">
                                <h3>Personal Information</h3>
                                <p className="section-desc">Update your name and institutional details.</p>

                                <form onSubmit={handleProfileSubmit}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <div className="input-with-icon">
                                            <i className="fa-solid fa-user-pen"></i>
                                            <input
                                                type="text"
                                                value={profileData.fullName}
                                                onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <div className="input-with-icon">
                                            <i className="fa-solid fa-envelope"></i>
                                            <input type="text" value={user?.email} disabled className="input-disabled" />
                                        </div>
                                        <small>Email cannot be changed</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Institute Name</label>
                                        <div className="input-with-icon">
                                            <i className="fa-solid fa-building-columns"></i>
                                            <input
                                                type="text"
                                                value={profileData.instituteName}
                                                onChange={e => setProfileData({ ...profileData, instituteName: e.target.value })}
                                                placeholder="School/University Name"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="save-settings-btn" disabled={loading}>
                                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeSection === 'password' && (
                            <div className="settings-section animate-fade-in">
                                <h3>Security</h3>
                                <p className="section-desc">Change your password to keep your account secure.</p>

                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <div className="input-with-icon">
                                            <i className="fa-solid fa-key"></i>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <div className="input-with-icon">
                                            <i className="fa-solid fa-check-double"></i>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="save-settings-btn" disabled={loading}>
                                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
