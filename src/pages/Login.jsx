import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import './style/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
                // Store user data and token in localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
                
                // Redirect to dashboard
                navigate('/');
                // Force a page reload to update App.jsx state if necessary, 
                // or just rely on state management. 
                // For simplicity here, we'll navigate.
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
