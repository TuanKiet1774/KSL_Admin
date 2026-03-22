import React from 'react';
import { createPortal } from 'react-dom';
import './Loading.css';

const Loading = ({ text = "Đang tải dữ liệu..." }) => {
  const loadingContent = (
    <div className="loading-overlay-global">
      <div className="loader-container">
        <div className="ksl-spinner"></div>
        <div className="loading-text">{text}</div>
        <div className="loading-bar-wrapper">
          <div className="loading-bar-progress"></div>
        </div>
      </div>
    </div>
  );

  return createPortal(loadingContent, document.body);
};

export default Loading;
