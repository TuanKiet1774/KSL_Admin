import React, { useState, useEffect, useRef } from 'react';
import './style/Profile.css';
import {
    User, Mail, Shield, Calendar, MapPin, Phone, Award, Star, Zap,
    Edit2, Save, Undo2, CheckCircle2, AlertCircle, AtSign, Upload,
    Image as ImageIcon, Camera, Lock, Eye, EyeOff, KeyRound,
    ShieldCheck, RefreshCw, ArrowLeft, ExternalLink, Activity
} from 'lucide-react';
import { updateProfile, getProfile, changePassword, verifyPassword, verifyIdentity } from '../services/authService';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import DetailModal from '../components/DetailModal/DetailModal';
import Loading from '../components/Loading/Loading';
import VerificationModal from '../components/VerificationModal/VerificationModal';
import PasswordConfirmModal from '../components/PasswordConfirmModal/PasswordConfirmModal';
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
        avatar: '',
        gender: ''
    });

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showPasswordGate, setShowPasswordGate] = useState(false);

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
                        avatar: userData.avatar || userData.avatar_url || '',
                        gender: userData.gender || 'Nam'
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
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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

    const handleEditStart = async (password) => {
        await verifyPassword(password);
        setIsEditing(true);
    };

    const onChangePassword = async (currentPassword, newPassword) => {
        const result = await changePassword(currentPassword, newPassword);
        setNotification({
            isOpen: true,
            type: 'success',
            title: 'Thành công',
            message: 'Đổi mật khẩu thành công!'
        });
        return result;
    };

    return (
        <div className="profile-redesign-container">
            {pageLoading && <Loading text="Đang tải thông tin cá nhân..." />}
            {(loading || isUploading) && <Loading text={isUploading ? "Đang tải ảnh..." : "Đang lưu thay đổi..."} />}

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                autoCloseTime={3000}
            />

            {/* Avatar Modal */}
            <DetailModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                title="Cập nhật ảnh đại diện"
            >
                <div className="modern-avatar-modal">
                    <div className="avatar-preview-container">
                        <img
                            src={formData.avatar || getUserAvatar(user)}
                            alt="Preview"
                            onError={(e) => { e.target.src = getUserAvatar(user); }}
                        />
                    </div>
                    <div className="avatar-controls">
                        <div className="modern-input-group">
                            <label><AtSign size={14} /> Link ảnh trực tiếp</label>
                            <input
                                type="text"
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div className="divider-text">hoặc</div>
                        <button
                            className="modern-upload-btn"
                            onClick={() => document.getElementById('avatar-upload-input').click()}
                        >
                            <Upload size={18} />
                            Tải lên từ thiết bị
                        </button>
                        <input
                            type="file"
                            id="avatar-upload-input"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarUpload}
                        />
                    </div>
                    <button className="confirm-btn-primary" onClick={() => setIsAvatarModalOpen(false)}>
                        Hoàn tất
                    </button>
                </div>
            </DetailModal>

            {/* Profile Hero Section */}
            <div className="profile-hero">
                <div className="hero-background"></div>
                <div className="hero-content">
                    <div className={`hero-avatar-wrapper ${isEditing ? 'editing' : ''}`} onClick={() => isEditing && setIsAvatarModalOpen(true)}>
                        <img src={formData.avatar || getUserAvatar(user)} alt="Avatar" />
                        {isEditing && (
                            <div className="avatar-overlay">
                                <Camera size={24} />
                                <span>Thay đổi</span>
                            </div>
                        )}
                    </div>
                    <div className="hero-info">
                        <div className="hero-name-row">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    className="hero-name-input"
                                    placeholder="Họ và tên"
                                    autoFocus
                                />
                            ) : (
                                <h1 className="hero-fullname">{user?.fullname || 'Administrator'}</h1>
                            )}
                            <div className="role-tag">
                                <Shield size={14} />
                                {user?.role || 'Admin'}
                            </div>
                        </div>
                        <p className="hero-username">@{user?.username || 'ksl_admin'}</p>
                    </div>
                    <div className="hero-actions">
                        {!isEditing ? (
                            <button className="btn-edit-profile" onClick={() => setShowPasswordGate(true)}>
                                <Edit2 size={18} />
                                Chỉnh sửa hồ sơ
                            </button>
                        ) : (
                            <div className="editing-actions-group">
                                <button className="btn-change-pw-sub" onClick={() => setShowChangePassword(true)}>
                                    <Lock size={16} />
                                    Mật khẩu
                                </button>
                                <button className="btn-cancel-edit" onClick={() => setIsEditing(false)}>
                                    <Undo2 size={18} />
                                    Hủy
                                </button>
                                <button className="btn-save-profile" onClick={handleSave}>
                                    <Save size={18} />
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-main-grid">
                {/* Left Column: Stats & Meta */}
                <div className="grid-column left">
                    <div className="modern-card stats-card">
                        <div className="card-header">
                            <Activity size={18} />
                            <h3>Thống kê tài khoản</h3>
                        </div>
                        <div className="stats-list">
                            <div className="stat-row">
                                <div className="stat-icon-box level">
                                    <Award size={20} />
                                </div>
                                <div className="stat-text">
                                    <label>Cấp độ</label>
                                    <span className="value">{user?.level || 'Beginner'}</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon-box exp">
                                    <Zap size={20} />
                                </div>
                                <div className="stat-text">
                                    <label>Kinh nghiệm</label>
                                    <span className="value">{user?.exp || 0} Exp</span>
                                </div>
                            </div>
                            <div className="stat-row">
                                <div className="stat-icon-box points">
                                    <Star size={20} />
                                </div>
                                <div className="stat-text">
                                    <label>Điểm số</label>
                                    <span className="value">{user?.points || 0} Pts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="grid-column right">
                    <div className="modern-card info-card">
                        <div className="card-header">
                            <User size={18} />
                            <h3>Thông tin cá nhân</h3>
                        </div>
                        <div className="info-form-grid">
                            <div className="form-group">
                                <label><Mail size={14} /> Email</label>
                                <input type="text" value={user?.email || ''} readOnly disabled className="readonly-input" />
                            </div>
                            <div className="form-group">
                                <label><Phone size={14} /> Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={isEditing ? formData.phone : (user?.phone || 'Chưa cập nhật')}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    className={isEditing ? 'editable' : 'readonly-input'}
                                />
                            </div>
                            <div className="form-group">
                                <label><Calendar size={14} /> Ngày sinh</label>
                                <input
                                    type={isEditing ? "date" : "text"}
                                    name="birthday"
                                    value={isEditing ? formData.birthday : formatDate(user?.birthday)}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    className={isEditing ? 'editable' : 'readonly-input'}
                                />
                            </div>
                            <div className="form-group">
                                <label><ShieldCheck size={14} /> Giới tính</label>
                                {isEditing ? (
                                    <div className="modern-radio-group">
                                        <label className={`radio-pill ${formData.gender === 'Nam' ? 'active' : ''}`}>
                                            <input type="radio" name="gender" value="Nam" checked={formData.gender === 'Nam'} onChange={handleInputChange} />
                                            Nam
                                        </label>
                                        <label className={`radio-pill ${formData.gender === 'Nữ' ? 'active' : ''}`}>
                                            <input type="radio" name="gender" value="Nữ" checked={formData.gender === 'Nữ'} onChange={handleInputChange} />
                                            Nữ
                                        </label>
                                    </div>
                                ) : (
                                    <input type="text" value={user?.gender || 'Nam'} readOnly disabled className="readonly-input" />
                                )}
                            </div>
                            <div className="form-group full-width">
                                <label><MapPin size={14} /> Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={isEditing ? formData.address : (user?.address || 'Chưa cập nhật')}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    className={isEditing ? 'editable' : 'readonly-input'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <VerificationModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                onVerifyCurrentPassword={verifyPassword}
                onVerifyIdentity={verifyIdentity}
                onFinalSubmit={onChangePassword}
            />

            <PasswordConfirmModal
                isOpen={showPasswordGate}
                onClose={() => setShowPasswordGate(false)}
                onConfirm={handleEditStart}
            />
        </div>
    );
};

export default Profile;
