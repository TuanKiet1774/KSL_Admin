import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    Lock, CheckCircle2, AlertCircle, 
    Eye, EyeOff, KeyRound, ArrowLeft,
    User, Mail, ShieldCheck
} from 'lucide-react';
import './VerificationModal.css';

const VerificationModal = ({ 
    isOpen, 
    onClose, 
    onVerifyCurrentPassword,
    onVerifyIdentity,
    onFinalSubmit 
}) => {
    // States
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form States
    const [currentPassword, setCurrentPassword] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI Visibility States
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    
    // Refs
    const prevOpen = useRef(false);

    // Lifecycle
    useEffect(() => {
        if (isOpen && !prevOpen.current) {
            setStep(1);
            setError('');
            setSuccess('');
            setCurrentPassword('');
            setUsername('');
            setEmail('');
            setNewPassword('');
            setConfirmPassword('');
            
            document.body.style.overflow = 'hidden';
        } else if (!isOpen && prevOpen.current) {
            document.body.style.overflow = 'unset';
        }
        
        prevOpen.current = isOpen;

        return () => {
            if (prevOpen.current && !isOpen) {
                document.body.style.overflow = 'unset';
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Handlers
    const handleNextStep = async (e) => {
        if (e) e.preventDefault();
        if (loading) return;
        if (!currentPassword.trim()) {
            setError('Vui lòng nhập mật khẩu hiện tại');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onVerifyCurrentPassword(currentPassword);
            setError('');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Mật khẩu hiện tại không chính xác');
        } finally {
            setLoading(false);
        }
    };

    const handleNextStepIdentity = async (e) => {
        if (e) e.preventDefault();
        if (loading) return;
        if (!username.trim() || !email.trim()) {
            setError('Vui lòng nhập đầy đủ Username và Email');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onVerifyIdentity(username, email);
            setError('');
            setStep(3);
        } catch (err) {
            setError(err.message || 'Thông tin không chính xác');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        if (e) e.preventDefault();
        if (loading) return;

        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?!\s).+$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt và không chứa khoảng trắng');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onFinalSubmit(currentPassword, newPassword);
            setSuccess('Đổi mật khẩu thành công!');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 2) return { level: score, text: 'Yếu', color: '#ef4444' };
        if (score <= 3) return { level: score, text: 'Trung bình', color: '#f59e0b' };
        if (score <= 4) return { level: score, text: 'Mạnh', color: '#22c55e' };
        return { level: score, text: 'Rất mạnh', color: '#10b981' };
    };

    const strength = getPasswordStrength(newPassword);

    // Render Helpers
    const renderStep1 = () => (
        <div className="verif-step-content" key="step1">
            <div className="verif-icon-wrapper change">
                <Lock size={32} />
            </div>
            <h2>Xác nhận mật khẩu</h2>

            <div className="verif-input-group">
                <label>Mật khẩu hiện tại</label>
                <div className="verif-input-wrapper">
                    <Lock size={18} className="verif-input-icon" />
                    <input
                        type={showPass.current ? "text" : "password"}
                        placeholder="Nhập mật khẩu hiện tại..."
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleNextStep(e)}
                        disabled={loading}
                        autoFocus
                    />
                    <button type="button" className="verif-pass-toggle" onClick={() => setShowPass({...showPass, current: !showPass.current})}>
                        {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {error && <div className="verif-error"><AlertCircle size={14} /> {error}</div>}

            <button className="verif-btn-primary change" onClick={(e) => handleNextStep(e)} disabled={loading}>
                {loading ? <div className="verif-spinner"></div> : 'Tiếp tục'}
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="verif-step-content" key="step2">
            <div className="verif-icon-wrapper success">
                <ShieldCheck size={32} />
            </div>
            <h2>Xác thực danh tính</h2>

            <div className="verif-input-group">
                <label>Tên đăng nhập (Username)</label>
                <div className="verif-input-wrapper">
                    <User size={18} className="verif-input-icon" />
                    <input
                        type="text"
                        placeholder="Nhập username của bạn..."
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        disabled={loading}
                        autoFocus
                    />
                </div>
            </div>

            <div className="verif-input-group">
                <label>Email</label>
                <div className="verif-input-wrapper">
                    <Mail size={18} className="verif-input-icon" />
                    <input
                        type="email"
                        placeholder="Nhập email của bạn..."
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleNextStepIdentity(e)}
                        disabled={loading}
                    />
                </div>
            </div>

            {error && <div className="verif-error"><AlertCircle size={14} /> {error}</div>}

            <button className="verif-btn-primary change" onClick={(e) => handleNextStepIdentity(e)} disabled={loading}>
                {loading ? <div className="verif-spinner"></div> : 'Tiếp tục'}
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="verif-step-content" key="step3">
            <div className="verif-icon-wrapper success">
                <KeyRound size={32} />
            </div>
            <h2>Đặt mật khẩu mới</h2>

            <div className="verif-input-group">
                <label>Mật khẩu mới</label>
                <div className="verif-input-wrapper">
                    <Lock size={18} className="verif-input-icon" />
                    <input
                        type={showPass.new ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới..."
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                        disabled={loading}
                        autoFocus
                    />
                    <button type="button" className="verif-pass-toggle" onClick={() => setShowPass({...showPass, new: !showPass.new})}>
                        {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {newPassword && (
                    <div className="verif-strength">
                        <div className="strength-bars">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`strength-bar ${strength.level >= i ? 'active' : ''}`} style={{ backgroundColor: strength.level >= i ? strength.color : '' }}></div>
                            ))}
                        </div>
                        <span className="strength-text" style={{ color: strength.color }}>{strength.text}</span>
                    </div>
                )}
            </div>

            <div className="verif-input-group">
                <label>Xác nhận mật khẩu</label>
                <div className="verif-input-wrapper">
                    <Lock size={18} className="verif-input-icon" />
                    <input
                        type={showPass.confirm ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu..."
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit(e)}
                        disabled={loading}
                    />
                    <button type="button" className="verif-pass-toggle" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}>
                        {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {error && <div className="verif-error"><AlertCircle size={14} /> {error}</div>}
            {success && <div className="verif-success"><CheckCircle2 size={14} /> {success}</div>}

            <div className="verif-btn-group">
                <button className="verif-btn-primary change" onClick={(e) => handleFinalSubmit(e)} disabled={loading}>
                    {loading ? <div className="verif-spinner"></div> : 'Xác nhận'}
                </button>
            </div>
        </div>
    );

    return createPortal(
        <div className="verif-overlay">
            <div className="verif-modal" onClick={(e) => e.stopPropagation()}>
                {step > 1 && (
                    <button className="verif-back-btn" onClick={() => setStep(step - 1)} disabled={loading}>
                        <ArrowLeft size={20} />
                    </button>
                )}
                <button className="verif-close-btn" onClick={onClose}>×</button>

                {/* Step indicator */}
                <div className="verif-steps">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        {step > 1 ? <CheckCircle2 size={16} /> : '1'}
                    </div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        {step > 2 ? <CheckCircle2 size={16} /> : '2'}
                    </div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
                        {step > 3 ? <CheckCircle2 size={16} /> : '3'}
                    </div>
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>,
        document.body
    );
};

export default VerificationModal;
