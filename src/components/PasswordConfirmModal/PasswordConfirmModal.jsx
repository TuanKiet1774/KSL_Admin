import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './PasswordConfirmModal.css';

const PasswordConfirmModal = ({ isOpen, onClose, onConfirm, loading: externalLoading }) => {
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu để xác nhận');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onConfirm(password);
            setPassword('');
            onClose();
        } catch (err) {
            setError(err.message || 'Mật khẩu không chính xác');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="pw-gate-overlay">
            <div className="pw-gate-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pw-gate-header">
                    <div className="pw-gate-icon">
                        <Lock size={24} />
                    </div>
                    <h2>Xác nhận mật khẩu</h2>
                    <p>Vui lòng nhập mật khẩu của bạn để chỉnh sửa hồ sơ</p>
                </div>

                <form className="pw-gate-form" onSubmit={handleSubmit}>
                    <div className="pw-gate-input-group">
                        <div className="pw-gate-input-wrapper">
                            <Lock size={18} className="pw-gate-icon-inner" />
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Nhập mật khẩu..."
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                autoFocus
                                disabled={loading || externalLoading}
                            />
                            <button 
                                type="button" 
                                className="pw-gate-toggle"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="pw-gate-error"><AlertCircle size={14} /> {error}</div>}

                    <div className="pw-gate-actions">
                        <button type="button" className="pw-gate-btn-cancel" onClick={onClose} disabled={loading || externalLoading}>
                            Hủy
                        </button>
                        <button type="submit" className="pw-gate-btn-confirm" disabled={loading || externalLoading}>
                            {loading || externalLoading ? <div className="loader-spinner small"></div> : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PasswordConfirmModal;
