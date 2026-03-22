import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-content">
          <div className="confirm-icon-wrapper">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <h3 className="confirm-modal-title">{title || "Xác nhận xóa"}</h3>
          <p className="confirm-modal-message">
            {message || "Bạn có chắc chắn muốn xóa dữ liệu này? Hành động này không thể hoàn tác."}
          </p>
          <div className="confirm-modal-actions">
            <button 
              className="confirm-btn confirm-btn-cancel" 
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              Hủy
            </button>
            <button 
              className="confirm-btn confirm-btn-delete" 
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận xóa"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
