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

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
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
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} không được để trống.`;
            }
            if (field.type === 'email' && formData[field.name]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[field.name])) {
                    newErrors[field.name] = "Email không hợp lệ.";
                }
            }
        });

        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
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
