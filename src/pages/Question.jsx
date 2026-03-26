import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Edit2, Trash2, Eye, 
    HelpCircle, CheckCircle, List, Image as ImageIcon, Video, Clock, 
    Star, Info, PlusCircle, MinusCircle, Check, AlertCircle, X, Save, Upload,
    Box, Layers, BookOpen, Target
} from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import DetailModal from '../components/DetailModal/DetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import './style/Question.css';
import questionService from '../services/questionService';
import topicService from '../services/topicService';
import { uploadToImgBB } from '../utils/upload';

const Question = () => {
    // State
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterTopic, setFilterTopic] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, type: 'success', message: '' });

    // Form Data
    const initialQuestionState = {
        question: '',
        type: 'multiple-choice',
        difficulty: 'easy',
        media: { url: '', type: 'none' },
        options: [
            { content: '', isCorrect: true, media: { url: '', type: 'none' } },
            { content: '', isCorrect: false, media: { url: '', type: 'none' } }
        ],
        topicId: '',
        score: 1,
        time: 30
    };
    const [formData, setFormData] = useState(initialQuestionState);
    const [uploadingField, setUploadingField] = useState(null); // 'main-media' or index-media for options

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [qRes, tRes] = await Promise.all([
                questionService.getAllQuestions(),
                topicService.getAllTopics()
            ]);

            if (qRes.success) {
                setQuestions(qRes.data || []);
            }
            if (tRes.success) {
                setTopics(tRes.data || []);
                if (tRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, topicId: tRes.data[0]._id }));
                }
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Đã xảy ra lỗi khi tải dữ liệu.");
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    };

    // Filter logic
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || q.type === filterType;
        const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
        const matchesTopic = filterTopic === 'all' || (q.topicId?._id || q.topicId) === filterTopic;
        
        return matchesSearch && matchesType && matchesDiff && matchesTopic;
    });

    const totalFiltered = filteredQuestions.length;
    const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Handlers
    const handleAddClick = () => {
        setIsEditing(false);
        setFormData({
            ...initialQuestionState,
            topicId: topics.length > 0 ? topics[0]._id : ''
        });
        setIsFormModalOpen(true);
    };

    const handleEditClick = (question) => {
        setIsEditing(true);
        setFormData({
            ...question,
            topicId: question.topicId?._id || question.topicId,
            media: question.media || { url: '', type: 'image' },
            options: question.options.map(opt => ({
                ...opt,
                media: opt.media || { url: '', type: 'none' }
            }))
        });
        setIsFormModalOpen(true);
    };

    const handleViewDetail = (question) => {
        setSelectedQuestion(question);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (question) => {
        setQuestionToDelete(question);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await questionService.deleteQuestion(questionToDelete._id);
            if (res.success) {
                setQuestions(questions.filter(q => q._id !== questionToDelete._id));
                setNotif({ isOpen: true, type: 'success', message: 'Xóa câu hỏi thành công!' });
                setIsDeleteModalOpen(false);
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: 'Lỗi khi xóa câu hỏi.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Basic validation
        if (!formData.question.trim()) {
            setNotif({ isOpen: true, type: 'error', message: 'Vui lòng nhập nội dung câu hỏi.' });
            return;
        }

        if (formData.type === 'multiple-choice') {
            const correctOnes = formData.options.filter(o => o.isCorrect);
            if (correctOnes.length !== 1) {
                setNotif({ isOpen: true, type: 'error', message: 'Cần chọn chính xác một đáp án đúng cho câu hỏi trắc nghiệm.' });
                return;
            }
            if (formData.options.length < 2) {
                setNotif({ isOpen: true, type: 'error', message: 'Câu hỏi trắc nghiệm cần ít nhất 2 đáp án.' });
                return;
            }
        } else {
            const correctOnes = formData.options.filter(o => o.isCorrect);
            if (correctOnes.length === 0) {
                setNotif({ isOpen: true, type: 'error', message: 'Vui lòng cung cấp ít nhất một đáp án đúng.' });
                return;
            }
        }

        try {
            setIsSaving(true);
            let response;
            if (isEditing) {
                response = await questionService.updateQuestion(formData._id, formData);
            } else {
                response = await questionService.createQuestion(formData);
            }

            if (response.success) {
                setNotif({ 
                    isOpen: true, 
                    type: 'success', 
                    message: isEditing ? 'Cập nhật câu hỏi thành công!' : 'Thêm câu hỏi mới thành công!' 
                });
                setIsFormModalOpen(false);
                fetchData();
            }
        } catch (err) {
            setNotif({ 
                isOpen: true, 
                type: 'error', 
                message: err.response?.data?.message || 'Đã có lỗi xảy ra.' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (field, file, optionIndex = null) => {
        if (!file) return;
        try {
            setUploadingField(optionIndex !== null ? `opt-${optionIndex}` : 'main');
            const url = await uploadToImgBB(file);
            
            if (optionIndex !== null) {
                const newOptions = [...formData.options];
                newOptions[optionIndex].media.url = url;
                setFormData({ ...formData, options: newOptions });
            } else {
                setFormData({ ...formData, media: { ...formData.media, url: url } });
            }
        } catch (err) {
            alert('Upload thất bại!');
        } finally {
            setUploadingField(null);
        }
    };

    const handleTypeChange = (newType) => {
        let newOptions = [...formData.options];
        if (newType === 'short-answer' || newType === 'recognition') {
            const firstCorrect = newOptions.find(o => o.isCorrect) || newOptions[0];
            newOptions = [{ 
                ...firstCorrect, 
                isCorrect: true,
                media: firstCorrect.media || { url: '', type: 'none' }
            }];
        } else if (newType === 'multiple-choice' && newOptions.length < 2) {
            newOptions = [
                { content: '', isCorrect: true, media: { url: '', type: 'none' } },
                { content: '', isCorrect: false, media: { url: '', type: 'none' } }
            ];
        }
        setFormData({ ...formData, type: newType, options: newOptions });
    };

    const addOption = () => {
        if (formData.type !== 'multiple-choice') return;
        setFormData({
            ...formData,
            options: [...formData.options, { content: '', isCorrect: false, media: { url: '', type: 'none' } }]
        });
    };

    const removeOption = (index) => {
        if (formData.type === 'multiple-choice' && formData.options.length <= 2) return;
        if (formData.type !== 'multiple-choice' && formData.options.length <= 1) return;
        
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const toggleCorrectOption = (index) => {
        const newOptions = formData.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setFormData({ ...formData, options: newOptions });
    };

    // Columns for DataTable
    const columns = [
        {
            header: "Câu hỏi",
            key: "question",
            width: "80%",
            render: (val, row) => (
                <div className="question-info-cell">
                    <span className="question-text">{val}</span>
                    <div className="question-meta">
                        <span className="badge badge-type">{row.type === 'multiple-choice' ? 'Trắc nghiệm' : row.type === 'short-answer' ? 'Tự luận' : 'Nhận diện'}</span>
                        <span className={`badge badge-diff-${row.difficulty}`}>{row.difficulty === 'easy' ? 'Dễ' : row.difficulty === 'medium' ? 'Trung bình' : 'Khó'}</span>
                        <span className="badge badge-topic">{row.topicId?.name || 'Vãng lai'}</span>
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
        return <Loading text="Đang chuẩn bị ngân hàng câu hỏi..." />;
    }

    return (
        <div className="question-page">
            <div className="page-header">
                <h1>Quản lý ngân hàng câu hỏi</h1>
            </div>

            <div className="question-controls">
                <div className="left-controls">
                    <SearchBox 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder="Tìm theo nội dung câu hỏi..." 
                    />
                </div>

                <button className="btn-add" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Thêm câu hỏi</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={paginatedQuestions}
                loading={loading}
                error={error}
                pagination={{
                    total: totalFiltered,
                    pageSize: pageSize,
                    currentPage: currentPage,
                    onPageChange: setCurrentPage
                }}
            />

            {/* View Modal */}
            <DetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Thông tin chi tiết câu hỏi"
                className="question-modal"
            >
                {selectedQuestion && (
                    <div className="question-detail-view">
                        <div className="detail-header">
                            <h3 className="detail-question-text">{selectedQuestion.question}</h3>
                            <div className="question-meta">
                                <span className={`badge badge-diff-${selectedQuestion.difficulty}`}>{selectedQuestion.difficulty}</span>
                                <span className="badge badge-type">{selectedQuestion.type}</span>
                                <span className="badge badge-topic">{selectedQuestion.topicId?.name}</span>
                            </div>
                        </div>

                        {selectedQuestion.media?.url && (
                            <div className="detail-media-container">
                                {selectedQuestion.media.type === 'video' ? (
                                    <video src={selectedQuestion.media.url} controls />
                                ) : (
                                    <img src={selectedQuestion.media.url} alt="Question media" />
                                )}
                            </div>
                        )}

                        <div className="detail-section">
                            <h4 className="detail-options-title">Danh sách đáp án</h4>
                            <div className="detail-options-list">
                                {selectedQuestion.options.map((opt, i) => (
                                    <div key={i} className={`detail-option-item ${opt.isCorrect ? 'is-correct' : ''}`}>
                                        <div className="detail-option-marker">
                                            {opt.isCorrect ? <Check size={14} /> : String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="detail-option-text">{opt.content}</span>
                                        {opt.media?.url && (
                                            <div className="detail-option-media-preview">
                                                {opt.media.type === 'video' ? (
                                                    <Video size={16} color="#9ca3af" />
                                                ) : (
                                                    <img src={opt.media.url} alt="Option media" className="option-mini-img" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section" style={{display: 'flex', gap: '2rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem'}}>
                            <div>
                                <h5 style={{color: '#9ca3af', marginBottom: '0.25rem', fontSize: '0.75rem'}}>ĐIỂM SỐ</h5>
                                <span style={{fontWeight: '700'}}>{selectedQuestion.score} điểm</span>
                            </div>
                            <div>
                                <h5 style={{color: '#9ca3af', marginBottom: '0.25rem', fontSize: '0.75rem'}}>THỜI GIAN</h5>
                                <span style={{fontWeight: '700'}}>{selectedQuestion.time} giây</span>
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Add/Edit Modal (Custom Form) */}
            <DetailModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={isEditing ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
                className="question-modal"
            >
                <form onSubmit={handleFormSubmit} className="question-form-scroll">
                    {/* Basic Info */}
                    <div className="form-section">
                        <div className="section-title"><HelpCircle size={18} /> Thông tin câu hỏi</div>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Nội dung câu hỏi *</label>
                                <textarea 
                                    className="form-textarea" 
                                    rows="3"
                                    value={formData.question}
                                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                                    placeholder="Nhập nội dung câu hỏi..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Loại câu hỏi</label>
                                <select className="form-select" value={formData.type} onChange={(e) => handleTypeChange(e.target.value)}>
                                    <option value="multiple-choice">Trắc nghiệm</option>
                                    <option value="short-answer">Tự luận</option>
                                    <option value="recognition">Nhận diện</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Độ khó</label>
                                <select className="form-select" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                                    <option value="easy">Dễ</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="hard">Khó</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Chủ đề</label>
                                <select className="form-select" value={formData.topicId} onChange={(e) => setFormData({...formData, topicId: e.target.value})} required>
                                    {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Điểm số</label>
                                <input type="number" className="form-input" value={formData.score} onChange={(e) => setFormData({...formData, score: Number(e.target.value)})} min="1" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Thời gian làm (giây)</label>
                                <input type="number" className="form-input" value={formData.time} onChange={(e) => setFormData({...formData, time: Number(e.target.value)})} min="0" />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="form-section">
                        <div className="section-title"><ImageIcon size={18} /> Hình ảnh / Video minh họa</div>
                        <div className="form-group full-width">
                            <label className="form-label">Phương tiện (Loại / URL / Tải lên)</label>
                            <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                                <select 
                                    className="form-select" 
                                    style={{width: '150px', minWidth: '150px'}}
                                    value={formData.media.type} 
                                    onChange={(e) => setFormData({...formData, media: {...formData.media, type: e.target.value}})}
                                >
                                    <option value="none">Không có</option>
                                    <option value="image">Hình ảnh</option>
                                    <option value="gif">GIF</option>
                                    <option value="video">Video</option>
                                </select>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={formData.media.url} 
                                    onChange={(e) => setFormData({...formData, media: {...formData.media, url: e.target.value}})} 
                                    placeholder="URL hình ảnh hoặc video minh họa..." 
                                    disabled={formData.media.type === 'none'}
                                />
                                <input type="file" id="main-media-upload" hidden onChange={(e) => handleFileUpload('main', e.target.files[0])} />
                                <button 
                                    type="button" 
                                    className="btn-add" 
                                    style={{padding: '0.75rem', boxShadow: 'none'}} 
                                    onClick={() => document.getElementById('main-media-upload').click()} 
                                    disabled={uploadingField === 'main' || formData.media.type === 'none'}
                                    title="Tải tệp lên"
                                >
                                    {uploadingField === 'main' ? <div className="loader-spinner" style={{width: '20px', height: '20px'}}></div> : <Upload size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="form-section">
                        <div className="section-title"><List size={18} /> Danh sách đáp án</div>
                        <div className="options-list">
                            {formData.options.map((option, idx) => (
                                <div key={idx} className={`option-item ${option.isCorrect ? 'correct' : ''}`}>
                                    <div className="option-header">
                                        <span className="option-number">Đáp án {idx + 1}</span>
                                        <div className="option-actions">
                                            {formData.type === 'multiple-choice' && (
                                                <button type="button" onClick={() => removeOption(idx)} className="option-btn btn-delete-option" title="Xóa đáp án">
                                                    <MinusCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="option-content-grid">
                                        <div className="form-group" style={{margin: 0}}>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                value={option.content} 
                                                onChange={(e) => {
                                                    const newOpts = [...formData.options];
                                                    newOpts[idx].content = e.target.value;
                                                    setFormData({...formData, options: newOpts});
                                                }}
                                                placeholder={`Nội dung đáp án ${idx + 1}...`}
                                                required
                                            />
                                        </div>
                                        {formData.type === 'multiple-choice' && (
                                            <div 
                                                className={`correct-toggle ${option.isCorrect ? 'active' : ''}`}
                                                onClick={() => toggleCorrectOption(idx)}
                                            >
                                                {option.isCorrect ? <CheckCircle size={16} /> : <div style={{width: 16}} />}
                                                <span>{option.isCorrect ? 'Chính xác' : 'Đáp án đúng?'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Option Media */}
                                    <div className="option-media-section" style={{marginTop: '1rem', borderTop: '1px dashed #e5e7eb', paddingTop: '0.75rem'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                                {['none', 'image', 'gif', 'video'].map(mType => (
                                                    <button
                                                        key={mType}
                                                        type="button"
                                                        onClick={() => {
                                                            const newOpts = [...formData.options];
                                                            newOpts[idx].media.type = mType;
                                                            setFormData({...formData, options: newOpts});
                                                        }}
                                                        style={{
                                                            padding: '0.4rem 0.6rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid',
                                                            borderColor: option.media.type === mType ? '#6366f1' : '#e5e7eb',
                                                            background: option.media.type === mType ? '#f5f3ff' : '#fff',
                                                            color: option.media.type === mType ? '#6366f1' : '#6b7280',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {mType === 'none' && <X size={14} />}
                                                        {mType === 'image' && <ImageIcon size={14} />}
                                                        {mType === 'gif' && <Box size={14} />}
                                                        {mType === 'video' && <Video size={14} />}
                                                        <span style={{textTransform: 'capitalize'}}>{mType === 'none' ? 'Không' : mType}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {option.media.type !== 'none' && (
                                                <div style={{flex: 1, display: 'flex', gap: '0.5rem', animation: 'fadeIn 0.3s ease-out'}}>
                                                    <input 
                                                        type="text" 
                                                        className="form-input" 
                                                        style={{flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.8rem', height: '32px'}}
                                                        value={option.media.url} 
                                                        onChange={(e) => {
                                                            const newOpts = [...formData.options];
                                                            newOpts[idx].media.url = e.target.value;
                                                            setFormData({...formData, options: newOpts});
                                                        }}
                                                        placeholder={`URL ${option.media.type}...`}
                                                    />
                                                    <input type="file" id={`opt-media-${idx}`} hidden onChange={(e) => handleFileUpload(`opt-${idx}`, e.target.files[0], idx)} />
                                                    <button 
                                                        type="button" 
                                                        className="btn-add" 
                                                        style={{padding: '0 0.5rem', height: '32px', boxShadow: 'none'}} 
                                                        onClick={() => document.getElementById(`opt-media-${idx}`).click()} 
                                                        disabled={uploadingField === `opt-${idx}`}
                                                    >
                                                        {uploadingField === `opt-${idx}` ? <div className="loader-spinner" style={{width: '14px', height: '14px'}}></div> : <Upload size={14} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {option.media.type === 'image' && option.media.url && (
                                            <div style={{marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', width: 'fit-content'}}>
                                                <img src={option.media.url} alt="Option preview" style={{height: '60px', display: 'block'}} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {formData.type === 'multiple-choice' && (
                                <button type="button" className="btn-add-option" onClick={addOption}>
                                    <PlusCircle size={20} />
                                    <span>Thêm đáp án mới</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="question-form-footer" style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6'}}>
                        <button type="button" className="btn-add" style={{background: '#9ca3af', boxShadow: 'none'}} onClick={() => setIsFormModalOpen(false)}>Hủy</button>
                        <button type="submit" className="btn-add" disabled={isSaving}>
                            {isSaving ? <div className="loader-spinner" style={{width: '20px', height: '20px'}}></div> : <Save size={18} />}
                            <span>{isEditing ? "Cập nhật" : "Lưu câu hỏi"}</span>
                        </button>
                    </div>
                </form>
            </DetailModal>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa câu hỏi"
                message="Bạn có chắc chắn muốn xóa câu hỏi này khỏi hệ thống? Hành động này không thể hoàn tác."
                isLoading={isDeleting}
            />

            {/* Notifications */}
            <NotificationModal
                isOpen={notif.isOpen}
                type={notif.type}
                message={notif.message}
                onClose={() => setNotif({ ...notif, isOpen: false })}
            />
        </div>
    );
};

export default Question;
