import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import './FormBase.css';
import { uploadToImgBB } from '../../utils/upload';

const FormBase = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    initialData = {},
    fields = [],
    isLoading = false,
    submitText = "Lưu thay đổi"
}) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [uploadingField, setUploadingField] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            setErrors({});
            setShowPasswords({});
        }
    }, [isOpen, initialData]);

    const validateField = (name, value, currentData) => {
        const field = fields.find(f => f.name === name);
        if (!field) return "";

        // Only validate if value is not empty or if it was previously touched/error exists
        // However, for "immediate" requirement, we validate if there's a value
        if (field.required && !value) {
            return `${field.label} không được để trống.`;
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return "Email không đúng định dạng. Vui lòng kiểm tra lại.";
            }
        }

        if (field.type === 'password' && value) {
            const password = value;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const noWhitespace = !/\s/.test(password);
            
            if (password.length < 6) {
                return "Mật khẩu phải có ít nhất 6 ký tự.";
            } else if (!hasUpperCase || !hasNumber || !hasSpecialChar || !noWhitespace) {
                return "Mật khẩu phải chứa ít nhất 1 ký tự hoa, 1 ký số, 1 ký tự đặc biệt.";
            }
        }

        if (name === 'confirmPassword' && value) {
            if (value !== currentData.password) {
                return "Mật khẩu xác nhận không khớp.";
            }
        }

        return "";
    };

    const handleChange = (name, value) => {
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        
        // Validate current field
        const error = validateField(name, value, updatedData);
        setErrors(prev => ({ ...prev, [name]: error }));

        // If password changes, re-validate confirmPassword
        if (name === 'password' && formData.confirmPassword) {
            const confirmError = value === formData.confirmPassword ? "" : "Mật khẩu xác nhận không khớp.";
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    const handleFileChange = async (name, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        handleChange(name, localUrl);

        try {
            setUploadingField(name);
            const imageUrl = await uploadToImgBB(file);
            handleChange(name, imageUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload hình ảnh thất bại. Vui lòng thử lại!');
        } finally {
            setUploadingField(null);
        }
    };

    const validate = () => {
        const newErrors = {};
        fields.forEach(field => {
            const error = validateField(field.name, formData[field.name], formData);
            if (error) {
                newErrors[field.name] = error;
            }
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} không được để trống.`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container form-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-content">
                    <form onSubmit={(e) => { e.preventDefault(); if (validate()) onSubmit(formData); }}>
                        <div className="form-grid">
                            {fields.map((field) => (
                                <div key={field.name} className={`form-group ${field.fullWidth ? 'full-width' : ''}`}>
                                    <label className="form-label">{field.label}</label>
                                    
                                    {field.type === 'select' ? (
                                        <select 
                                            className="form-select"
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            required={field.required}
                                        >
                                            <option value="">-- Chọn {field.label} --</option>
                                            {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea 
                                            className="form-textarea"
                                            placeholder={field.placeholder || `Nhập ${field.label}...`}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            required={field.required}
                                        />
                                    ) : field.type === 'upload' ? (
                                        <div className="form-image-upload no-preview">
                                            <input type="file" id={`file-input-${field.name}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(field.name, e)} />
                                            <div className="image-upload-info">
                                                <input 
                                                    type="text" 
                                                    className="form-input image-url-input" 
                                                    placeholder={field.placeholder || `URL ${field.label}...`} 
                                                    value={formData[field.name] || ''} 
                                                    onChange={(e) => handleChange(field.name, e.target.value)} 
                                                />
                                                <button 
                                                    type="button" 
                                                    className="image-upload-btn" 
                                                    onClick={() => document.getElementById(`file-input-${field.name}`).click()} 
                                                    disabled={uploadingField === field.name}
                                                >
                                                    {uploadingField === field.name ? <div className="loader-spinner" style={{width: '14px', height: '14px', borderWeight: '2px'}}></div> : <Upload size={16} />} 
                                                    Tải lên
                                                </button>
                                            </div>
                                        </div>
                                    ) : field.type === 'image' ? (
                                        <div className="form-image-upload">
                                            <div className="image-preview-wrapper">
                                                <img 
                                                    src={formData[field.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullname || formData.username || 'User')}&background=random&color=fff`} 
                                                    alt="Preview" className="image-preview-img" 
                                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullname || formData.username || 'User')}&background=random&color=fff`; }}
                                                />
                                                {uploadingField === field.name && <div className="image-uploading-overlay"><div className="loader-spinner"></div></div>}
                                            </div>
                                            <input type="file" id={`file-input-${field.name}`} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(field.name, e)} />
                                            <div className="image-upload-info">
                                                <input type="text" className="form-input image-url-input" placeholder="URL ảnh..." value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} />
                                                <button type="button" className="image-upload-btn" onClick={() => document.getElementById(`file-input-${field.name}`).click()} disabled={uploadingField === field.name}><Upload size={16} /> Tải ảnh</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="input-with-addons">
                                            {field.type === 'date' ? (
                                                <div className="masked-date-input-wrapper">
                                                    <input
                                                        type="text"
                                                        className={`form-input masked-date-input ${field.readOnly ? 'input-readonly' : ''}`}
                                                        placeholder="dd/mm/yyyy"
                                                        value={formData[field.name] ? (() => {
                                                            const val = formData[field.name];
                                                            if (val.includes('-')) {
                                                                const [y, m, d] = val.split('-');
                                                                return `${d}/${m}/${y}`;
                                                            }
                                                            return val;
                                                        })() : ''}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '').substring(0, 8);
                                                            if (val.length >= 3 && val.length <= 4) {
                                                                val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                                            } else if (val.length >= 5) {
                                                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                                                            }
                                                            
                                                            if (val.length === 10) {
                                                                const [d, m, y] = val.split('/');
                                                                handleChange(field.name, `${y}-${m}-${d}`);
                                                            } else {
                                                                setFormData(prev => ({ ...prev, [field.name]: val }));
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const val = e.target.value;
                                                            if (val && val.length === 10) {
                                                                const [d, m, y] = val.split('/');
                                                                const date = new Date(`${y}-${m}-${d}`);
                                                                if (isNaN(date.getTime()) || date.getDate() !== parseInt(d)) {
                                                                    setErrors(prev => ({ ...prev, [field.name]: "Ngày sinh không hợp lệ." }));
                                                                } else {
                                                                    handleChange(field.name, `${y}-${m}-${d}`);
                                                                }
                                                            } else if (val && val.length > 0) {
                                                                setErrors(prev => ({ ...prev, [field.name]: "Định dạng ngày phải là dd/mm/yyyy." }));
                                                            }
                                                        }}
                                                        readOnly={field.readOnly}
                                                    />
                                                    <div className="calendar-icon-wrapper">
                                                        <input 
                                                            type="date" 
                                                            className="hidden-date-picker"
                                                            value={formData[field.name] && formData[field.name].includes('-') ? formData[field.name] : ''}
                                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                                            tabIndex="-1"
                                                        />
                                                        <div className="calendar-trigger-icon">📅</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="password-input-wrapper">
                                                    <input
                                                        type={field.type === 'password' ? (showPasswords[field.name] ? 'text' : 'password') : (field.type || 'text')}
                                                        className={`form-input ${field.readOnly ? 'input-readonly' : ''}`}
                                                        placeholder={field.placeholder || `Nhập ${field.label}...`}
                                                        value={formData[field.name] || ''}
                                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                                        required={field.required}
                                                        readOnly={field.readOnly}
                                                    />
                                                    {field.type === 'password' && (
                                                        <button type="button" className="password-toggle-btn" onClick={() => setShowPasswords(prev => ({ ...prev, [field.name]: !prev[field.name] }))}>
                                                            {showPasswords[field.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors[field.name] && <span className="form-error"><AlertCircle size={14} /> {errors[field.name]}</span>}
                                </div>
                            ))}
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="form-btn form-btn-submit" disabled={isLoading || !!uploadingField}>
                                {isLoading ? <><div className="loader-spinner"></div> <span>Đang xử lý...</span></> : <><Save size={18} /> <span>{submitText}</span></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FormBase;
