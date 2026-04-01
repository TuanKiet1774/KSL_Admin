import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, type = 'success', title, message, autoCloseTime = 0 }) => {
  useEffect(() => {
    if (isOpen && autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTime, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return createPortal(
    <div className="notif-modal-overlay">
      <div 
        className={`notif-modal-container notif-modal-${type}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notif-icon-wrapper">
          {isSuccess ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>
        <h3 className="notif-title">{title || (isSuccess ? 'Thành công' : 'Thất bại')}</h3>
        <p className="notif-message">
          {message || (isSuccess ? 'Thao tác đã được thực hiện thành công.' : 'Đã xảy ra lỗi khi thực hiện thao tác.')}
        </p>
        <button className="notif-btn" onClick={onClose} type="button">
          Đóng
        </button>
      </div>
    </div>,
    document.body
  );
};

export default NotificationModal;
