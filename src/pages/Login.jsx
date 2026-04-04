import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
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

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.emailOrUsername || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await login(formData.emailOrUsername, formData.password);

            if (response.success) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                
                // Immediately go to splash screen with authorization state
                navigate('/splash', { state: { fromLogin: true } });
            }

        } catch (err) {
            let errorMsg = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
            
            if (errorMsg === 'Invalid credentials') {
                errorMsg = 'Thông tin đăng nhập chưa chính xác';
            }
            
            setError(errorMsg);

            if (errorMsg.toLowerCase().includes('quản trị viên')) {
                console.error('Chỉ có quản trị viên mới có thể truy cập');
            }
        } finally {
            setLoading(false);
        }
    };

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
                                placeholder="Username"
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
                    Quên mật khẩu? <a href="#">Liên hệ kĩ thuật</a>
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
