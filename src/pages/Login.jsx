import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { User, Lock, Eye, EyeOff, LogIn, KeyRound } from 'lucide-react';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import './style/Login.css';

const Login = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const reason = queryParams.get('reason');

    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(
        reason === 'session_expired'
            ? 'Tài khoản của bạn đang đăng nhập trên thiết bị khác'
            : reason === 'unauthorized'
                ? 'Tài khoản của bạn không có quyền truy cập hệ thống quản trị.'
                : ''
    );
    const [showPassword, setShowPassword] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.emailOrUsername, formData.password);
            if (result.success) {
                navigate('/splash', { state: { fromLogin: true } });
            } else {
                setError(result.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            setError(err.message || 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reason === 'unauthorized') {
            console.error('Chỉ có quản trị viên mới có thể truy cập');
        }
    }, [reason]);

    // Show modal when error changes
    useEffect(() => {
        if (error) {
            setIsNotifOpen(true);
        }
    }, [error, 
        // Add a random seed to force re-open if the message is the same
        loading 
    ]);


    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/Logo_Nobackground.png" alt="KSL Logo" className="login-logo" />
                    <h1>Chào mừng trở lại</h1>
                    <p>Hệ thống quản trị KSL Admin</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                type="text"
                                name="emailOrUsername"
                                placeholder="Nhập tên đăng nhập..."
                                value={formData.emailOrUsername}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Nhập mật khẩu..."
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.875rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Đăng nhập</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                </div>

                <NotificationModal
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                    type="error"
                    title="Lỗi Đăng Nhập"
                    message={error}
                />
            </div>

        </div>
    );
};

export default Login;
