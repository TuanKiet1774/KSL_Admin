import React, { useState, useEffect } from 'react';
import './style/Profile.css';
import { User, Mail, Shield, Calendar, MapPin, Phone, Award, Star, Zap, Edit2, Save, Undo2, CheckCircle2, AlertCircle, AtSign, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { updateProfile, getProfile } from '../services/authService';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import DetailModal from '../components/DetailModal/DetailModal';
import Loading from '../components/Loading/Loading';
import { uploadToImgBB } from '../utils/upload';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [notification, setNotification] = useState({ isOpen: false, type: 'success', message: '', title: '' });
    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        address: '',
        birthday: '',
        avatar: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setPageLoading(true);
                const result = await getProfile();
                if (result) {
                    const userData = result.success ? result.data : (result.user ? result.user : result);
                    setUser(userData);
                    setFormData({
                        fullname: userData.fullname || userData.fullName || userData.full_name || '',
                        phone: userData.phone || userData.phoneNumber || userData.phone_number || '',
                        address: userData.address || '',
                        birthday: userData.birthday ? userData.birthday.split('T')[0] : '',
                        avatar: userData.avatar || userData.avatar_url || ''
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                }
            } finally {
                setPageLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const resultUrl = await uploadToImgBB(file);
            if (resultUrl) {
                setFormData(prev => ({ ...prev, avatar: resultUrl }));
                setNotification({
                    isOpen: true,
                    type: 'success',
                    title: 'Thành công',
                    message: 'Đã tải ảnh lên thành công!'
                });
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Tải ảnh lên thất bại.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getUserAvatar = (user) => {
        if (user?.avatar) return user.avatar;
        if (user?.avatar_url) return user.avatar_url;
        const name = user?.fullname || user?.username || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const result = await updateProfile(formData);
            if (result.success || result) {
                setNotification({ 
                    isOpen: true, 
                    type: 'success', 
                    title: 'Thành công',
                    message: 'Cập nhật thông tin cá nhân thành công!' 
                });
                setIsEditing(false);
                const updatedUser = { ...user, ...formData };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Dispatch event to update other components like Sidebar
                window.dispatchEvent(new Event('userProfileUpdate'));
            }
        } catch (error) {
            setNotification({ 
                isOpen: true, 
                type: 'error', 
                title: 'Lỗi',
                message: error.message || 'Đã có lỗi xảy ra khi cập nhật.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page-container">
            {pageLoading && <Loading text="Đang tải thông tin cá nhân..." />}
            {loading && <Loading text="Đang lưu thay đổi..." />}

            <NotificationModal 
                isOpen={notification.isOpen}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                autoCloseTime={3000}
            />

            <DetailModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                title="Thay đổi ảnh đại diện"
            >
                <div className="avatar-modal-content">
                    <div className="avatar-preview-box">
                        <img 
                            src={formData.avatar || getUserAvatar(user)} 
                            alt="Avatar Preview" 
                            className="avatar-preview-img"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || user?.username || 'User')}&background=6366f1&color=fff`; }}
                        />
                    </div>
                    <div className="avatar-edit-controls">
                        <div className="avatar-input-field">
                            <label>Link ảnh:</label>
                            <input
                                type="text"
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleInputChange}
                                placeholder="Dán link ảnh tại đây..."
                                className="edit-input"
                            />
                        </div>
                        <div className="avatar-upload-section">
                            <input 
                                type="file" 
                                id="avatar-upload-file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={handleAvatarUpload} 
                            />
                            <button 
                                type="button" 
                                className="avatar-upload-btn-secondary"
                                onClick={() => document.getElementById('avatar-upload-file').click()}
                                disabled={isUploading}
                            >
                                {isUploading ? <div className="loader-spinner small-spinner"></div> : <Upload size={18} />}
                                <span>Tải ảnh lên</span>
                            </button>
                        </div>
                        <button className="avatar-confirm-btn" onClick={() => setIsAvatarModalOpen(false)}>
                            Xong
                        </button>
                    </div>
                </div>
            </DetailModal>

            <div className="page-header">
                <h1>Hồ sơ cá nhân</h1>
            </div>

            <div className="profile-header-content">
                <div className={`profile-avatar-large ${isEditing ? 'is-editing' : ''}`} onClick={() => isEditing && setIsAvatarModalOpen(true)}>
                    <img
                        src={isEditing ? (formData.avatar || getUserAvatar(user)) : getUserAvatar(user)}
                        alt={user?.username}
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || user?.username || 'Admin')}&background=6366f1&color=fff`;
                        }}
                    />
                    {isEditing && (
                        <div className="avatar-edit-badge">
                            <Camera size={24} />
                        </div>
                    )}
                </div>

                <div className="profile-main-info">
                    <div className="profile-name-row">
                        <div className="profile-name-group">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    placeholder="Họ và tên..."
                                    className="edit-input-large"
                                    autoFocus
                                />
                            ) : (
                                <h1 className="profile-fullname">{user?.fullname || 'Admin'}</h1>
                            )}
                            <div className="profile-role-badge">
                                <Shield size={14} />
                                <span>{user?.role?.toUpperCase() || 'Admin'}</span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            {!isEditing ? (
                                <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={18} />
                                    <span>Chỉnh sửa hồ sơ</span>
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
                                        <Save size={18} />
                                        <span>Lưu</span>
                                    </button>
                                    <button className="profile-cancel-btn" onClick={() => setIsEditing(false)}>
                                        <Undo2 size={18} />
                                        <span>Hủy</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content-wrapper">
                <div className="stats-section">
                    <div className="stat-grid">
                        <div className="stat-item">
                            <div className="stat-icon level">
                                <Award size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Cấp độ</span>
                                <span className="stat-value">{user?.level || 'Beginner'}</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon exp">
                                <Zap size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Kinh nghiệm</span>
                                <span className="stat-value">{user?.exp || 0} EXP</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon points">
                                <Star size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Điểm số</span>
                                <span className="stat-value">{user?.points || 0} Pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-main-content">
                    <h3 className="section-title">
                        <User size={18} />
                        Thông tin chi tiết
                    </h3>
                    <div className="details-grid">
                        <div className="detail-card">
                            <div className="profile-icon">
                                <User size={24} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Tên đăng nhập</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={`@${user?.username || 'admin'}`}
                                        className="edit-input"
                                        readOnly
                                        disabled
                                    />
                                ) : (
                                    <span className="detail-value">@{user?.username || 'admin'}</span>
                                )}
                            </div>
                        </div>
                        <div className="detail-card">
                            <div className="profile-icon">
                                <AtSign size={24} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Email</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user?.email || 'N/A'}
                                        className="edit-input"
                                        readOnly
                                        disabled
                                    />
                                ) : (
                                    <span className="detail-value">{user?.email || 'N/A'}</span>
                                )}
                            </div>
                        </div>
                        <div className="detail-card">
                            <div className="profile-icon">
                                <Phone size={24} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Số điện thoại</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <span className="detail-value">{user?.phone || 'N/A'}</span>
                                )}
                            </div>
                        </div>
                        <div className="detail-card">
                            <div className="profile-icon">
                                <MapPin size={24} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Địa chỉ</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <span className="detail-value">{user?.address || 'N/A'}</span>
                                )}
                            </div>
                        </div>
                        <div className="detail-card">
                            <div className="profile-icon">
                                <Calendar size={24} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Ngày sinh</span>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <span className="detail-value">{formatDate(user?.birthday)}</span>
                                )}
                            </div>
                        </div>
                        <div className="detail-card">
                            <div className="profile-icon">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Ngày tham gia</span>
                                <span className="detail-value">{formatDate(user?.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
