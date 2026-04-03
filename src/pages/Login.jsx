import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
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
    
    // Initial error state: show message if session expired
    const [error, setError] = useState(reason === 'session_expired' ? 'Tài khoản của bạn đang đăng nhập trên thiết bị khác' : '');
    const [showPassword, setShowPassword] = useState(false);
    
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
                // Store only user object, not the whole response
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                navigate('/');
                window.location.reload(); 
            }

        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
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

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tài khoản hoặc Email</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                type="text"
                                name="emailOrUsername"
                                placeholder="Username hoặc Email..."
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
            </div>
        </div>
    );
};

export default Login;
