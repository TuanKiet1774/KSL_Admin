import React, { useState, useEffect } from 'react';
import { Eye, Trash2, MessageSquare, Star, Clock, User } from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import Modal from '../components/DetailModal/DetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import feedbackService from '../services/feedbackService';
import './style/FeedBack.css';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, type: 'success', message: '' });

    const pageSize = 10;

    useEffect(() => {
        fetchFeedbacks();
    }, [currentPage, searchTerm]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm
            };
            const result = await feedbackService.getAllFeedbacks(params);
            if (result.success) {
                setFeedbacks(result.data || []);
                setTotalFeedbacks(result.total || (result.data ? result.data.length : 0));
            } else {
                setError("Không thể tải danh sách phản hồi.");
            }
        } catch (err) {
            console.error("Error fetching feedbacks:", err);
            setError("Đã xảy ra lỗi khi kết nối với máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (feedback) => {
        setFeedbackToDelete(feedback);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!feedbackToDelete) return;
        try {
            setIsDeleting(true);
            const result = await feedbackService.deleteFeedback(feedbackToDelete._id);
            setIsDeleteModalOpen(false);
            if (result.success) {
                setNotif({ isOpen: true, type: 'success', message: "Xóa phản hồi thành công." });
                fetchFeedbacks();
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: "Lỗi khi xóa phản hồi." });
        } finally {
            setIsDeleting(false);
            setFeedbackToDelete(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={14} 
                        fill={i < (rating || 0) ? "#f59e0b" : "none"} 
                        color={i < (rating || 0) ? "#f59e0b" : "#e2e8f0"} 
                    />
                ))}
            </div>
        );
    };

    const getAvatar = (userId) => {
        if (userId?.avatar) return userId.avatar;
        const name = userId?.fullname || userId?.username || "Guest";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    };

    const columns = [
        {
            header: "Người gửi",
            key: "userId",
            width: "25%",
            render: (val, row) => (
                <div className="feedback-user">
                    <img 
                        src={getAvatar(row.userId)} 
                        alt="Avatar" 
                        className="fb-user-avatar"
                        onError={(e) => { e.target.src = getAvatar(null); }}
                    />
                    <div className="user-details">
                        <span className="user-name">{row.userId?.fullname || row.userId?.username || "Người dùng ẩn"}</span>
                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>@{row.userId?.username || 'anonymous'}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Nội dung",
            key: "comment",
            width: "35%",
            render: (val) => (
                <div className="feedback-comment-cell" title={val}>
                    {val || "Không có nội dung"}
                </div>
            )
        },
        {
            header: "Đánh giá",
            key: "rating",
            width: "15%",
            render: (val) => renderStars(val)
        },
        {
            header: "Thời gian",
            key: "createdAt",
            width: "15%",
            render: (val) => (
                <div className="feedback-time">
                    <Clock size={14} style={{ marginRight: '6px' }} />
                    {formatDate(val)}
                </div>
            )
        },
        {
            header: "Thao tác",
            key: "_id",
            width: "10%",
            render: (val, row) => (
                <div className="actions">
                    <button className="action-btn" onClick={() => handleViewDetail(row)} title="Xem chi tiết"><Eye size={16} color="#6366f1" /></button>
                    <button className="action-btn" onClick={() => handleDeleteClick(row)} title="Xóa"><Trash2 size={16} color="#ef4444" /></button>
                </div>
            )
        }
    ];

    // Client-side filtering as per controller logic (no server-side search/paging yet)
    const filteredFeedbacks = feedbacks.filter(fb => {
        const nameMatch = (fb.userId?.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (fb.userId?.username || "").toLowerCase().includes(searchTerm.toLowerCase());
        const commentMatch = (fb.comment || "").toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || commentMatch;
    });

    const paginatedFeedbacks = filteredFeedbacks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="feedback-page">
            <div className="page-header">
                <h1>Quản lý phản hồi</h1>
            </div>

            <div className="feedback-controls">
                <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm theo nội dung hoặc tên người gửi..."
                />
            </div>

            <DataTable
                columns={columns}
                data={paginatedFeedbacks}
                loading={loading}
                error={error}
                pagination={{
                    total: filteredFeedbacks.length,
                    pageSize: pageSize,
                    currentPage: currentPage,
                    onPageChange: setCurrentPage
                }}
            />

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Chi tiết phản hồi"
            >
                {selectedFeedback && (
                    <div className="feedback-detail">
                        <div className="detail-header">
                            <div className="user-avatar-circle">
                                <User size={32} color="#6366f1" />
                            </div>
                            <div className="header-text">
                                <h3>{selectedFeedback.userId?.fullname || selectedFeedback.userId?.username || "Người dùng ẩn"}</h3>
                                <div className="detail-time">{formatDate(selectedFeedback.createdAt)}</div>
                            </div>
                        </div>

                        <div className="detail-body">
                            <div className="detail-section">
                                <label>Mức độ đánh giá</label>
                                <div className="rating-large">
                                    {renderStars(selectedFeedback.rating)}
                                    <span style={{ marginLeft: '10px', fontWeight: 600, color: '#f59e0b' }}>{selectedFeedback.rating}/5</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <label>Nội dung góp ý</label>
                                <div className="comment-box">
                                    <MessageSquare size={16} style={{ marginTop: '4px', flexShrink: 0 }} color="#94a3b8" />
                                    <p>{selectedFeedback.comment || "Không có nội dung chi tiết."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa phản hồi"
                message="Bạn có chắc chắn muốn xóa phản hồi này không? Hành động này không thể hoàn tác."
                isLoading={isDeleting}
            />

            <NotificationModal
                isOpen={notif.isOpen}
                type={notif.type}
                message={notif.message}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                autoCloseTime={3000}
            />
        </div>
    );
};

export default Feedback;
