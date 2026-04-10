import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Edit2, Trash2, Eye, 
    BookOpen, List, Save, X, Check, Search as SearchIcon
} from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import DetailModal from '../components/DetailModal/DetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import './style/Exam.css';
import examService from '../services/examService';
import topicService from '../services/topicService';
import questionService from '../services/questionService';

const Exam = () => {
    // State
    const [exams, setExams] = useState([]);
    const [topics, setTopics] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTopic, setFilterTopic] = useState('all');
    const [totalExams, setTotalExams] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, type: 'success', message: '' });

    // Picker State
    const [pickerSearch, setPickerSearch] = useState('');

    // Form Data
    const initialExamState = {
        title: '',
        description: '',
        topicId: '',
        questions: []
    };
    const [formData, setFormData] = useState(initialExamState);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!isInitialLoading) {
            fetchData();
        }
    }, [currentPage, searchTerm, filterTopic]);

    const fetchInitialData = async () => {
        try {
            await fetchTopicsAndQuestions();
            await fetchData();
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize
            };
            if (searchTerm.trim()) params.search = searchTerm;
            if (filterTopic !== 'all') params.topicId = filterTopic;
            
            const response = await examService.getAllExams(params);
            if (response.success) {
                setExams(response.data || []);
                setTotalExams(response.total || 0);
            }
        } catch (err) {
            console.error("Error fetching exams:", err);
            setError("Đã xảy ra lỗi khi tải danh sách đề thi.");
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    };

    const fetchTopicsAndQuestions = async () => {
        try {
            const [tRes, qRes] = await Promise.all([
                topicService.getAllTopics({ limit: 1000 }),
                questionService.getAllQuestions({ limit: 1000 })
            ]);

            if (tRes.success) setTopics(tRes.data || []);
            if (qRes.success) setQuestions(qRes.data || []);
        } catch (err) {
            console.error("Error fetching dependencies:", err);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterTopic]);

    const paginatedExams = exams; 

    const handleAddClick = () => {
        setIsEditing(false);
        setFormData({
            ...initialExamState,
            topicId: topics.length > 0 ? topics[0]._id : ''
        });
        setIsFormModalOpen(true);
    };

    const handleEditClick = (exam) => {
        setIsEditing(true);
        setFormData({
            ...exam,
            topicId: exam.topicId?._id || exam.topicId || '',
            questions: Array.isArray(exam.questions) ? exam.questions.map(q => q._id || q) : []
        });
        setIsFormModalOpen(true);
    };

    const handleViewDetail = async (exam) => {
        try {
            setLoading(true);
            const res = await examService.getExamById(exam._id);
            if (res.success) {
                setSelectedExam(res.data);
                setIsViewModalOpen(true);
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: 'Lỗi khi tải chi tiết đề thi.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (exam) => {
        setExamToDelete(exam);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await examService.deleteExam(examToDelete._id);
            if (res.success) {
                setExams(exams.filter(e => e._id !== examToDelete._id));
                setNotif({ isOpen: true, type: 'success', message: 'Xóa đề thi thành công!' });
                setIsDeleteModalOpen(false);
            }
        } catch (err) {
            setNotif({ isOpen: true, type: 'error', message: 'Lỗi khi xóa đề thi.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.title.trim()) {
            setNotif({ isOpen: true, type: 'error', message: 'Vui lòng nhập tiêu đề đề thi.' });
            return;
        }

        if (formData.questions.length === 0) {
            setNotif({ isOpen: true, type: 'error', message: 'Vui lòng chọn ít nhất một câu hỏi.' });
            return;
        }

        try {
            setIsSaving(true);
            let response;
            if (isEditing) {
                response = await examService.updateExam(formData._id, formData);
            } else {
                response = await examService.createExam(formData);
            }

            if (response.success) {
                setNotif({ 
                    isOpen: true, 
                    type: 'success', 
                    message: isEditing ? 'Cập nhật đề thi thành công!' : 'Thêm đề thi mới thành công!' 
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

    const toggleQuestionSelection = (questionId) => {
        setFormData(prev => {
            const isSelected = prev.questions.includes(questionId);
            if (isSelected) {
                return { ...prev, questions: prev.questions.filter(id => id !== questionId) };
            } else {
                return { ...prev, questions: [...prev.questions, questionId] };
            }
        });
    };

    // Columns for DataTable
    const columns = [
        {
            header: "Đề thi",
            key: "title",
            width: "60%",
            render: (val, row) => (
                <div className="exam-info-cell">
                    <span className="exam-title">{val}</span>
                    <div className="exam-meta">
                        <span className="badge badge-count">{row.questions?.length || 0} câu hỏi</span>
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
        return <Loading text="Đang chuẩn bị danh sách đề thi..." />;
    }

    const filteredPickerQuestions = questions.filter(q => 
        (q.question?.toLowerCase() || '').includes(pickerSearch.toLowerCase()) &&
        (formData.topicId === '' || (q.topicId?._id || q.topicId) === formData.topicId)
    );

    return (
        <div className="exam-page">
            <div className="page-header">
                <h1>Quản lý đề thi</h1>
            </div>

            <div className="exam-controls">
                <div className="left-controls">
                    <SearchBox 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder="Tìm đề thi..." 
                    />
                </div>

                <button className="btn-add" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Thêm đề thi</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={paginatedExams}
                loading={loading}
                error={error}
                pagination={{
                    total: totalExams,
                    pageSize: pageSize,
                    currentPage: currentPage,
                    onPageChange: setCurrentPage
                }}
            />

            {/* View Modal */}
            <DetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Thông tin chi tiết đề thi"
                className="exam-modal"
            >
                {selectedExam && (
                    <div className="exam-detail-view">
                        <div className="detail-header">
                            <h3 className="detail-exam-title">{selectedExam.title}</h3>
                            <p className="detail-exam-desc">{selectedExam.description || 'Không có mô tả.'}</p>
                            <div className="exam-meta">
                                <span className="badge badge-topic">{selectedExam.topicId?.name}</span>
                                <span className="badge badge-count">{selectedExam.questions?.length || 0} câu hỏi</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4 className="detail-section-title">Danh sách câu hỏi</h4>
                            <div className="questions-preview-list">
                                {selectedExam.questions.map((q, i) => (
                                    <div key={i} className="preview-item">
                                        <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>Câu {i + 1}: {q.question}</div>
                                        <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Loại: {q.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Tự luận'} - Độ khó: {q.difficulty}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            {/* Add/Edit Modal */}
            <DetailModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={isEditing ? "Cập nhật đề thi" : "Tạo đề thi mới"}
                className="exam-modal"
            >
                <form onSubmit={handleFormSubmit} className="exam-form-scroll">
                    <div className="form-section">
                        <div className="section-title"><BookOpen size={18} /> Thông tin cơ bản</div>
                        <div className="form-group" style={{marginBottom: '1rem'}}>
                            <label className="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>Tiêu đề đề thi *</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb'}}
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Nhập tiêu đề đề thi..."
                                required
                            />
                        </div>
                        <div className="form-group" style={{marginBottom: '1rem'}}>
                            <label className="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>Mô tả</label>
                            <textarea 
                                className="form-textarea" 
                                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb'}}
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Nhập mô tả đề thi..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>Chủ đề</label>
                            <select 
                                className="form-select" 
                                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb'}}
                                value={formData.topicId} 
                                onChange={(e) => setFormData({...formData, topicId: e.target.value})} 
                                required
                            >
                                {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-title"><List size={18} /> Chọn câu hỏi ({formData.questions.length})</div>
                        <div className="question-picker">
                            <div className="picker-search" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <SearchIcon size={16} color="#9ca3af" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm câu hỏi theo nội dung..." 
                                    style={{border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem'}}
                                    value={pickerSearch}
                                    onChange={(e) => setPickerSearch(e.target.value)}
                                />
                            </div>
                            <div className="picker-list">
                                {filteredPickerQuestions.length > 0 ? (
                                    filteredPickerQuestions.map(q => (
                                        <div 
                                            key={q._id} 
                                            className={`picker-item ${formData.questions.includes(q._id) ? 'selected' : ''}`}
                                            onClick={() => toggleQuestionSelection(q._id)}
                                        >
                                            <input 
                                                type="Checkbox" 
                                                checked={formData.questions.includes(q._id)} 
                                                readOnly 
                                            />
                                            <div className="picker-item-info">
                                                <div className="picker-item-text">{q.question}</div>
                                                <div className="picker-item-meta">
                                                    {q.type} • {q.difficulty}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{padding: '2rem', textAlign: 'center', color: '#9ca3af'}}>
                                        Không tìm thấy câu hỏi phù hợp.
                                    </div>
                                )}
                            </div>
                            <div className="selected-count">
                                <span>Đã chọn: {formData.questions.length} câu hỏi</span>
                                <button 
                                    type="button" 
                                    style={{background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'}}
                                    onClick={() => setFormData({...formData, questions: []})}
                                >
                                    Bỏ chọn tất cả
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="exam-form-footer" style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6'}}>
                        <button type="button" className="btn-add" style={{background: '#9ca3af', boxShadow: 'none'}} onClick={() => setIsFormModalOpen(false)}>Hủy</button>
                        <button type="submit" className="btn-add" disabled={isSaving}>
                            {isSaving ? <div className="loader-spinner" style={{width: '20px', height: '20px'}}></div> : <Save size={18} />}
                            <span>{isEditing ? "Cập nhật" : "Lưu đề thi"}</span>
                        </button>
                    </div>
                </form>
            </DetailModal>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa đề thi"
                message="Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác."
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

export default Exam;
