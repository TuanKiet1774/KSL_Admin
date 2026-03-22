import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Eye, Plus, Trash2, Edit2, Award } from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import Modal from '../components/Modal/Modal';
import './style/User.css';

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const pageSize = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/users`);
                if (response.data.success) {
                    setUsers(response.data.data);
                } else {
                    setError("Không thể tải danh sách người dùng.");
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Đã xảy ra lỗi khi kết nối với máy chủ.");
            } finally {
                setTimeout(() => setLoading(false), 600);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredUsers = users.filter(user =>
        (user.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalUsers = filteredUsers.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    const handleImageError = (e, name) => {
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const columns = [
        { 
            header: "Người dùng", 
            key: "fullname", 
            width: "30%",
            render: (val, row) => (
                <div className="user-info">
                    <img 
                        src={row.avatar} 
                        alt={row.fullname} 
                        className="user-avatar"
                        onError={(e) => handleImageError(e, row.fullname || row.username)}
                    />
                    <div className="user-name-wrapper">
                        <span className="user-fullname">{row.fullname || "N/A"}</span>
                        <span className="user-username">@{row.username}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Liên hệ", 
            key: "email", 
            width: "25%",
            render: (val, row) => (
                <div className="user-contact">
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{row.email}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{row.phone}</div>
                </div>
            )
        },
        { 
            header: "Vai trò", 
            key: "role", 
            width: "10%",
            render: (val) => (
                <span className={`badge badge-${val}`}>
                    {val}
                </span>
            )
        },
        { 
            header: "Trình độ", 
            key: "level", 
            width: "15%",
            render: (val) => (
                <div className="level-badge">
                    <Award size={16} color="#6366f1" />
                    <span>{val || "Beginner"}</span>
                </div>
            )
        },
        { 
            header: "Chức năng", 
            key: "_id", 
            width: "20%",
            render: (val, row) => (
                <div className="actions">
                    <button className="action-btn" onClick={() => handleViewDetail(row)} title="Xem chi tiết"><Eye size={16} color="#6366f1" /></button>
                    <button className="action-btn" title="Chỉnh sửa"><Edit2 size={16} color="#6366f1" /></button>
                    <button className="action-btn" title="Xóa"><Trash2 size={16} color="#ef4444" /></button>
                </div>
            )
        }
    ];

    return (
        <div className="user-page">
            {loading && users.length === 0 && <Loading text="Đang tải danh sách người dùng..." />}

            <div className="page-header">
                <h1>Quản lý người dùng</h1>
            </div>

            <div className="user-controls">
                <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm tên, email hoặc username..."
                />

                <button className="btn-add">
                    <Plus size={20} />
                    <span>Thêm người dùng</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={paginatedUsers}
                loading={loading}
                error={error}
                pagination={{ 
                    total: totalUsers, 
                    pageSize: pageSize, 
                    currentPage: currentPage,
                    onPageChange: setCurrentPage
                }}
            />

            {/* User Detail Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Chi tiết người dùng"
            >
                {selectedUser && (
                    <div className="user-detail-container">
                        <div className="user-detail-header">
                            <img 
                                src={selectedUser.avatar} 
                                alt={selectedUser.fullname} 
                                className="detail-avatar"
                                onError={(e) => handleImageError(e, selectedUser.fullname || selectedUser.username)}
                            />
                            <div className="header-info">
                                <h3>{selectedUser.fullname || "N/A"}</h3>
                                <div className="username">@{selectedUser.username}</div>
                                <div className={`badge badge-${selectedUser.role}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                    {selectedUser.role}
                                </div>
                            </div>
                        </div>

                        <div className="user-info-grid">
                            <div className="info-item">
                                <span className="info-label">Email</span>
                                <span className="info-value">{selectedUser.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Số điện thoại</span>
                                <span className="info-value">{selectedUser.phone || "N/A"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ngày sinh</span>
                                <span className="info-value">{formatDate(selectedUser.birthday)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Địa chỉ</span>
                                <span className="info-value">{selectedUser.address || "N/A"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Trình độ</span>
                                <span className="info-value">{selectedUser.level || "Beginner"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Kinh nghiệm (EXP)</span>
                                <span className="info-value">{selectedUser.exp || 0} EXP</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Điểm số</span>
                                <span className="info-value">{selectedUser.points} Points</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ngày tham gia</span>
                                <span className="info-value">{formatDate(selectedUser.createdAt)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Cập nhật lần cuối</span>
                                <span className="info-value">{formatDate(selectedUser.updatedAt)}</span>
                            </div>
                        </div>

                    </div>
                )}
            </Modal>
        </div>
    );
};

export default User;
