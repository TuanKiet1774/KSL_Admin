import React, { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, Edit2, BookOpen, Layers, Award, Image as ImageIcon, Film, MousePointer, X } from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import FilterBox from '../components/FilterBox/FilterBox';
import DetailModal from '../components/DetailModal/DetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import AddModal from '../components/AddModal/AddModal';
import EditModal from '../components/EditModal/EditModal';
import './style/Word.css';
import wordService from '../services/wordService';
import topicService from '../services/topicService';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/media';

const Word = () => {
    const [words, setWords] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalWords, setTotalWords] = useState(0);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [wordToDelete, setWordToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, type: 'success', message: '' });
    const [previewImage, setPreviewImage] = useState(null);
    
    const pageSize = 10;

    useEffect(() => {
        fetchData();
        fetchTopics();
    }, []);

    useEffect(() => {
        if (!isInitialLoading) {
            fetchData();
        }
    }, [currentPage, searchTerm, selectedTopicId]);
    
    useEffect(() => {
        if (previewImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [previewImage]);

    const fetchTopics = async () => {
        try {
            const res = await topicService.getAllTopics({ limit: 1000 });
            if (res.success) {
                setTopics(res.data || []);
            }
        } catch (err) {
            console.error("Error fetching topics:", err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
                topicId: selectedTopicId === 'all' ? undefined : selectedTopicId
            };
            
            const wordsRes = await wordService.getAllWords(params);

            if (wordsRes.success) {
                setWords(wordsRes.data || []);
                setTotalWords(wordsRes.total || 0);
            }
        } catch (err) {
            console.error("Error fetching words:", err);
            setError("Đã xảy ra lỗi khi tải dữ liệu từ vựng.");
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    };

    // Effect for searchTerm - reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedTopicId]);

    const handleAddClick = () => {
        setFormData({
            exp: 5,
            'media.type': 'image',
            'media.url': '',
            topicId: topics.length > 0 ? topics[0]._id : ''
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (word) => {
        setFormData({
            ...word,
            'media.url': word.media?.url || '',
            'media.type': word.media?.type || 'image',
            topicId: word.topicId?._id || word.topicId
        });
        setIsEditModalOpen(true);
    };

    const validateMedia = (media) => {
        if (!media.url) return null;
        const extension = media.url.split('?')[0].split('.').pop().toLowerCase();
        
        if (media.type === 'image') {
            if (!['jpg', 'jpeg', 'png', 'webp', 'svg', 'avif'].includes(extension)) {
                return "Ảnh phải có định dạng .jpg, .jpeg, .png, .webp, .svg hoặc .avif";
            }
        } else if (media.type === 'gif') {
            if (extension !== 'gif') {
                return "GIF phải có định dạng .gif";
            }
        } else if (media.type === 'video') {
            if (!isYouTubeUrl(media.url) && extension !== 'mp4') {
                return "Video phải có định dạng .mp4 hoặc link YouTube hợp lệ.";
            }
        }
        return null;
    };

    const transformPayload = (data) => {
        const payload = { ...data };
        payload.media = {
            url: data['media.url'] || '',
            type: data['media.type'] || 'image'
        };
        delete payload['media.url'];
        delete payload['media.type'];
        return payload;
    };

    const handleViewDetail = (word) => {
        setSelectedWord(word);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (word) => {
        setWordToDelete(word);
        setIsDeleteModalOpen(true);
    };

    const handleAddSubmit = async (data) => {
        try {
            setIsSaving(true);
            const payload = transformPayload(data);
            
            const mediaError = validateMedia(payload.media);
            if (mediaError) {
                setNotif({ isOpen: true, type: 'error', message: mediaError });
                setIsSaving(false);
                return;
            }

            const result = await wordService.createWord(payload);
            if (result.success) {
                setNotif({ isOpen: true, type: 'success', message: "Thêm từ vựng thành công!" });
                setIsAddModalOpen(false);
                fetchData();
            } else {
                setNotif({ isOpen: true, type: 'error', message: result.message || "Đã có lỗi xảy ra." });
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: err.response?.data?.message || "Lỗi server." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditSubmit = async (data) => {
        try {
            setIsSaving(true);
            const payload = transformPayload(data);

            const mediaError = validateMedia(payload.media);
            if (mediaError) {
                setNotif({ isOpen: true, type: 'error', message: mediaError });
                setIsSaving(false);
                return;
            }

            const result = await wordService.updateWord(data._id, payload);
            if (result.success) {
                setNotif({ isOpen: true, type: 'success', message: "Cập nhật thành công!" });
                setIsEditModalOpen(false);
                fetchData();
            } else {
                setNotif({ isOpen: true, type: 'error', message: result.message || "Đã có lỗi xảy ra." });
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: err.response?.data?.message || "Lỗi server." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            const result = await wordService.deleteWord(wordToDelete._id);
            if (result.success) {
                setNotif({ isOpen: true, type: 'success', message: `Xóa "${wordToDelete.name}" thành công!` });
                setIsDeleteModalOpen(false);
                fetchData();
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: "Lỗi khi xóa từ vựng." });
        } finally {
            setIsDeleting(false);
        }
    };

    const paginatedWords = words; // Already paginated from server

    const wordFields = [
        { name: 'topicId', label: 'Chủ đề', type: 'select', options: topics.map(t => ({ label: t.name, value: t._id })), required: true, fullWidth: true },
        { name: 'name', label: 'Từ vựng', type: 'text', required: true, fullWidth: true },

        { name: 'description', label: 'Mô tả', type: 'textarea', required: true, fullWidth: true },
        { name: 'exp', label: 'EXP nhận được', type: 'number'},
        { 
            name: 'media.type', 
            label: 'Loại phương tiện', 
            type: 'select', 
            options: [
                { label: 'Hình ảnh', value: 'image' },
                { label: 'GIF', value: 'gif' },
                { label: 'Video', value: 'video' }
            ],
            required: true 
        },
        { name: 'media.url', label: 'Ảnh/Gif/Video', type: 'upload', required: true, fullWidth: true }
    ];

    const columns = [
        {
            header: "Từ vựng",
            key: "name",
            width: "25%",
            render: (val, row) => (
                <div className="word-info">
                    {row.media?.url ? (
                        <div className="word-media-preview" onClick={() => setPreviewImage(row.media.url)} style={{ cursor: 'zoom-in' }}>
                            {row.media.type === 'video' ? <Film size={20} /> : <img src={row.media.url} alt={val} className="word-thumb" />}
                        </div>
                    ) : (
                        <div className="word-media-placeholder"><ImageIcon size={20} /></div>
                    )}
                    <div className="word-details">
                        <span className="word-name">{val}</span>
                        <span className="word-topic-badge">{row.topicId?.name || "Chưa phân loại"}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Mô tả",
            key: "description",
            width: "35%",
            render: (val) => <div className="word-desc-column" title={val}>{val}</div>
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
        return <Loading text="Đang tải dữ liệu từ vựng..." />;
    }

    return (
        <div className="word-page">
            <div className="page-header">
                <h1>Quản lý từ vựng</h1>
            </div>

            <div className="word-controls">
                <div className="left-controls">
                    <SearchBox 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder="Tìm theo tên, mô tả hoặc chủ đề..." 
                    />
                    
                    <FilterBox 
                        value={selectedTopicId}
                        onChange={setSelectedTopicId}
                        options={topics.map(t => ({ label: t.name, value: t._id }))}
                        placeholder="Tất cả chủ đề"
                        icon={BookOpen}
                    />
                </div>

                <button className="btn-add" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Thêm từ mới</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={paginatedWords}
                loading={loading}
                error={error}
                pagination={{
                    total: totalWords,
                    pageSize: pageSize,
                    currentPage: currentPage,
                    onPageChange: setCurrentPage
                }}
            />

            {/* View Modal */}
            <DetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Chi tiết từ vựng"
            >
                {selectedWord && (
                    <div className="word-detail-view">
                        <div className="detail-media">
                            {selectedWord.media?.type === 'video' ? (
                                isYouTubeUrl(selectedWord.media.url) ? (
                                    <iframe 
                                        width="100%" 
                                        height="300" 
                                        src={getYouTubeEmbedUrl(selectedWord.media.url)} 
                                        title="YouTube video player" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        style={{borderRadius: '12px'}}
                                    ></iframe>
                                ) : (
                                    <video src={selectedWord.media.url} controls className="detail-video" />
                                )
                            ) : (
                                <img 
                                    src={selectedWord.media?.url || 'https://via.placeholder.com/300?text=No+Image'} 
                                    alt={selectedWord.name} 
                                    className="detail-img" 
                                />
                            )}
                        </div>
                        <div className="detail-info">
                            <h3>{selectedWord.name}</h3>
                            <div className="detail-meta">
                                <span className="detail-topic"><Layers size={14} /> {selectedWord.topicId?.name}</span>
                                <span className="detail-exp"><Award size={14} /> {selectedWord.exp} EXP</span>
                            </div>
                            <div className="detail-desc">
                                <h4>Mô tả:</h4>
                                <p>{selectedWord.description}</p>
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
                title="Thêm từ vựng mới"
                initialData={formData}
                fields={wordFields}
                isLoading={isSaving}
            />

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Chỉnh sửa từ vựng"
                initialData={formData}
                fields={wordFields}
                isLoading={isSaving}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa từ vựng"
                message={`Bạn có chắc chắn muốn xóa từ "${wordToDelete?.name}"?`}
                isLoading={isDeleting}
            />

            {/* Notification */}
            <NotificationModal
                isOpen={notif.isOpen}
                type={notif.type}
                message={notif.message}
                onClose={() => setNotif({ ...notif, isOpen: false })}
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

export default Word;
