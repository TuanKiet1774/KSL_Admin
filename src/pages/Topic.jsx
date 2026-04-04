import React, { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, Edit2, BookOpen, Layers, Award, X } from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import DetailModal from '../components/DetailModal/DetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import AddModal from '../components/AddModal/AddModal';
import EditModal from '../components/EditModal/EditModal';
import './style/Topic.css';
import topicService from '../services/topicService';

const Topic = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTopics, setTotalTopics] = useState(0);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [topicToDelete, setTopicToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, type: 'success', message: '' });
    const [previewImage, setPreviewImage] = useState(null);

    const pageSize = 10;

    useEffect(() => {
        fetchTopics();
    }, [currentPage, searchTerm]);
    
    useEffect(() => {
        if (previewImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [previewImage]);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm
            };
            const result = await topicService.getAllTopics(params);
            
            if (result.success) {
                setTopics(result.data || []);
                setTotalTopics(result.total || 0);
            } else {
                setError("Không thể tải danh sách chủ đề.");
            }
        } catch (err) {
            console.error("Error fetching topics:", err);
            setError("Đã xảy ra lỗi khi kết nối với máy chủ.");
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    };

    // Filter change resets to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const paginatedTopics = topics; // Server-paginated components should just use the fetched list directly

    const handleViewDetail = (topic) => {
        setSelectedTopic(topic);
        setIsViewModalOpen(true);
    };

    const handleAddClick = () => {
        setFormData({
            level: 'Beginner',
            expRequired: 0
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (topic) => {
        setFormData(topic);
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (data) => {
        try {
            setIsSaving(true);
            // Prepare data: cast numeric and boolean types
            const payload = {
                ...data,
                expRequired: Number(data.expRequired) || 0,
                isLocked: data.isLocked === 'true' || data.isLocked === true
            };
            
            const result = await topicService.createTopic(payload);
            if (result.success) {
                setNotif({
                    isOpen: true,
                    type: 'success',
                    message: "Thêm chủ đề thành công!"
                });
                setIsAddModalOpen(false);
                fetchTopics();
            } else {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    message: result.message || "Đã có lỗi xảy ra."
                });
            }
        } catch (err) {
            console.error("Error adding topic:", err);
            const serverMsg = err.response?.data?.message || err.response?.data?.error || "Lỗi kết nối server.";
            setNotif({
                isOpen: true,
                type: 'error',
                message: serverMsg
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditSubmit = async (data) => {
        try {
            setIsSaving(true);
            // Prepare data: cast numeric and boolean types
            const payload = {
                ...data,
                expRequired: Number(data.expRequired) || 0,
                isLocked: data.isLocked === 'true' || data.isLocked === true
            };

            const result = await topicService.updateTopic(data._id, payload);
            if (result.success) {
                setNotif({
                    isOpen: true,
                    type: 'success',
                    message: "Cập nhật chủ đề thành công!"
                });
                setIsEditModalOpen(false);
                fetchTopics();
            } else {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    message: result.message || "Đã có lỗi xảy ra."
                });
            }
        } catch (err) {
            console.error("Error updating topic:", err);
            const serverMsg = err.response?.data?.message || err.response?.data?.error || "Lỗi kết nối server.";
            setNotif({
                isOpen: true,
                type: 'error',
                message: serverMsg
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (topic) => {
        setTopicToDelete(topic);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!topicToDelete) return;
        try {
            setIsDeleting(true);
            const data = await topicService.deleteTopic(topicToDelete._id);
            setIsDeleteModalOpen(false);

            if (data.success) {
                setTopics(topics.filter(t => t._id !== topicToDelete._id));
                setNotif({
                    isOpen: true,
                    type: 'success',
                    message: `Đã xóa chủ đề "${topicToDelete.name}" thành công.`
                });
            } else {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    message: data.message || "Không thể xóa chủ đề."
                });
            }
        } catch (err) {
            console.error("Error deleting topic:", err);
            setNotif({
                isOpen: true,
                type: 'error',
                message: "Đã xảy ra lỗi khi kết nối với máy chủ."
            });
        } finally {
            setIsDeleting(false);
            setTopicToDelete(null);
        }
    };

    const topicFields = [
        { name: 'image', label: 'Ảnh minh họa', type: 'image', fullWidth: true },
        { name: 'name', label: 'Tên chủ đề', type: 'text', required: true, fullWidth: true },

        { 
            name: 'level', 
            label: 'Trình độ', 
            type: 'select', 
            options: [
                { label: 'Beginner', value: 'Beginner' },
                { label: 'Intermediate', value: 'Intermediate' },
                { label: 'Advanced', value: 'Advanced' }
            ],
            required: true 
        },
        { name: 'expRequired', label: 'EXP yêu cầu', type: 'number'},
        // { name: 'totalWord', label: 'Số lượng từ', type: 'number', readOnly: true },
        { name: 'description', label: 'Mô tả', type: 'textarea', fullWidth: true }
    ];

    const editTopicFields = [
        ...topicFields,
    ];

    const columns = [
        {
            header: "Chủ đề",
            key: "name",
            width: "30%",
            render: (val, row) => (
                <div className="topic-info">
                    <img
                        src={row.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random&color=fff`}
                        alt={row.name}
                        className="topic-thumbnail"
                        style={{ cursor: 'zoom-in' }}
                        onClick={() => setPreviewImage(row.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random&color=fff`)}
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random&color=fff`}
                    />
                    <div className="topic-details">
                        <span className="topic-name">{row.name}</span>
                        <div className="topic-meta">
                            <span className="topic-level-badge">{row.level}</span>
                            <span className="topic-word-count-badge" style={{ marginLeft: '10px', fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px' }}>
                                {row.totalWord || 0} từ
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: "Mô tả",
            key: "description",
            width: "35%",
            render: (val) => (
                <div className="topic-description-cell" title={val}>
                    {val || "Không có mô tả"}
                </div>
            )
        },
        {
            header: "Kinh nghiệm",
            key: "expRequired",
            width: "15%",
            render: (val, row) => (
                <div className="topic-stats-cell">
                    <div className="stat-row" style={{ justifyContent: 'center' }}>
                        <Award size={14} />
                        <span>{val} EXP</span>
                    </div>
                </div>
            )
        },
        {
            header: "Thao tác",
            key: "_id",
            width: "20%",
            render: (val, row) => (
                <div className="actions">
                    <button className="action-btn" onClick={() => handleViewDetail(row)} title="Xem chi tiết"><Eye size={16} color="#6366f1" /></button>
                    <button className="action-btn" onClick={() => handleEditClick(row)} title="Chỉnh sửa"><Edit2 size={16} color="#6366f1" /></button>
                    <button className="action-btn" onClick={() => handleDeleteClick(row)} title="Xóa"><Trash2 size={16} color="#ef4444" /></button>
                </div>
            )
        }
    ];

    if (isInitialLoading) {
        return <Loading text="Đang tải danh sách chủ đề..." />;
    }

    return (
        <div className="topic-page">
            <div className="page-header">
                <div className="header-title-wrapper">
                    <h1>Quản lý chủ đề</h1>
                </div>
            </div>

            <div className="topic-controls">
                <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm tên chủ đề hoặc mô tả..."
                />

                <button className="btn-add" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Thêm chủ đề</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={paginatedTopics}
                loading={loading}
                error={error}
                pagination={{
                    total: totalTopics,
                    pageSize: pageSize,
                    currentPage: currentPage,
                    onPageChange: setCurrentPage
                }}
            />

            {/* View Modal */}
            <DetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Thông tin chi tiết chủ đề"
            >
                {selectedTopic && (
                    <div className="topic-detail-view">
                        <div className="topic-detail-hero">
                            <img
                                src={selectedTopic.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTopic.name)}&background=random&color=fff`}
                                alt={selectedTopic.name}
                                className="detail-hero-img"
                                style={{ cursor: 'zoom-in' }}
                                onClick={() => setPreviewImage(selectedTopic.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTopic.name)}&background=random&color=fff`)}
                            />
                            <div className="hero-overlay">
                                <div className="hero-meta-tags">
                                    <span className="hero-level">{selectedTopic.level}</span>
                                </div>
                                <h2>{selectedTopic.name}</h2>
                            </div>
                        </div>

                        <div className="topic-detail-content">
                            <div className="detail-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="detail-meta-item">
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Số lượng từ vựng:</span>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedTopic.totalWord || 0} từ</div>
                                </div>
                                <div className="detail-meta-item">
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Kinh nghiệm yêu cầu:</span>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedTopic.expRequired || 0} EXP</div>
                                </div>
                            </div>
                            <div className="detail-section">
                                <h4>Mô tả chủ đề</h4>
                                <p>{selectedTopic.description || "Chưa có mô tả chi tiết cho chủ đề này."}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Add Modal */}
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubmit}
                title="Tạo chủ đề mới"
                initialData={formData}
                fields={topicFields}
                isLoading={isSaving}
            />

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Cập nhật chủ đề"
                initialData={formData}
                fields={editTopicFields}
                isLoading={isSaving}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa chủ đề"
                message={`Bạn có chắc chắn muốn xóa chủ đề "${topicToDelete?.name}"? Các từ vựng thuộc chủ đề này có thể bị ảnh hưởng.`}
                isLoading={isDeleting}
            />

            {/* Notification */}
            <NotificationModal
                isOpen={notif.isOpen}
                type={notif.type}
                message={notif.message}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                autoCloseTime={3000}
            />

            {/* Image Preview Overlay */}
            {previewImage && (
                <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
                    <button className="close-preview" onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}>
                        <X size={24} />
                    </button>
                    <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="Large Preview" />
                    </div>
                </div>
            )}
        </div>

    );
};

export default Topic;
