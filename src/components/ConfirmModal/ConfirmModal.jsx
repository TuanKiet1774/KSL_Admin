import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isLoading = false,
  confirmText,
  cancelText = "Hủy",
  type = "danger" 
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch(type) {
      case 'warning':
        return { icon: <AlertCircle size={28} />, color: '#f59e0b', defaultTitle: 'Cảnh báo' };
      case 'success':
        return { icon: <CheckCircle size={28} />, color: '#10b981', defaultTitle: 'Thành công' };
      case 'info':
        return { icon: <Info size={28} />, color: '#3b82f6', defaultTitle: 'Thông báo' };
      case 'danger':
      default:
        return { icon: <AlertTriangle size={28} />, color: '#ef4444', defaultTitle: 'Xác nhận xóa' };
    }
  };

  const config = getTypeConfig();

  return createPortal(
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className={`confirm-modal-container type-${type}`} onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="confirm-modal-content">
          <div className="confirm-icon-wrapper" style={{ color: config.color, backgroundColor: `${config.color}15` }}>
            {config.icon}
          </div>
          
          <h3 className="confirm-modal-title">{title || config.defaultTitle}</h3>
          <p className="confirm-modal-message">
            {message || "Bạn có chắc chắn muốn thực hiện hành động này?"}
          </p>
          
          <div className="confirm-modal-actions">
            <button 
              className="confirm-btn confirm-btn-cancel" 
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              {cancelText}
            </button>
            <button 
              className={`confirm-btn confirm-btn-submit type-${type}`}
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <div className="btn-spinner"></div>
              ) : (
                confirmText || (type === 'danger' ? 'Xác nhận xóa' : 'Xác nhận')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
