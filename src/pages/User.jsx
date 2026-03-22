import React, { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, Edit2, Award } from 'lucide-react';
import Loading from '../components/Loading/Loading';
import DataTable from '../components/DataTable/DataTable';
import SearchBox from '../components/SearchBox/SearchBox';
import Modal from '../components/DetailModal/DetailModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NotificationModal from '../components/NotificationModal/NotificationModal';
import AddModal from '../components/AddModal/AddModal';
import EditModal from '../components/EditModal/EditModal';
import './style/User.css';
import userService from '../services/userService';

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, type: 'success', message: '' });

    const pageSize = 5;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            if (data.success) {
                setUsers(data.data);
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
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff`;
    };

    const getUserAvatar = (user) => {
        if (user?.avatar) return user.avatar;
        const name = user?.fullname || user?.username || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleAddClick = () => {
        setFormData({
            role: 'user',
            level: 'Beginner',
            isActive: true
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (user) => {
        const formattedUser = {
            ...user,
            birthday: user.birthday ? user.birthday.split('T')[0] : ''
        };
        setFormData(formattedUser);
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (data) => {
        try {
            setIsSaving(true);
            const result = await userService.createUser(data);
            if (result.success) {
                setNotif({
                    isOpen: true,
                    type: 'success',
                    message: "Thêm người dùng thành công!"
                });
                setIsAddModalOpen(false);
                fetchUsers();
            } else {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    message: result.message || "Đã có lỗi xảy ra."
                });
            }
        } catch (err) {
            console.error("Error adding user:", err);
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
            const result = await userService.updateUser(data._id, data);
            if (result.success) {
                setNotif({
                    isOpen: true,
                    type: 'success',
                    message: "Cập nhật người dùng thành công!"
                });
                setIsEditModalOpen(false);
                fetchUsers();
            } else {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    message: result.message || "Đã có lỗi xảy ra."
                });
            }
        } catch (err) {
            console.error("Error updating user:", err);
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

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            setIsDeleting(true);
            const data = await userService.deleteUser(userToDelete._id);
            setIsDeleteModalOpen(false);

            if (data.success) {
                setUsers(users.filter(u => u._id !== userToDelete._id));
                setNotif({
                    isOpen: true,
                    type: 'success',
                    message: `Đã xóa người dùng "${userToDelete.fullname || userToDelete.username}" thành công.`
                });
            } else {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    message: data.message || "Không thể xóa người dùng."
                });
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            setNotif({
                isOpen: true,
                type: 'error',
                message: "Đã xảy ra lỗi khi kết nối với máy chủ."
            });
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const userFields = [
        { name: 'avatar', label: 'Ảnh đại diện', type: 'image', fullWidth: true },
        { name: 'fullname', label: 'Họ và tên', type: 'text', required: true },
        { name: 'username', label: 'Tên đăng nhập', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Số điện thoại', type: 'text' },
        {
            name: 'role',
            label: 'Vai trò',
            type: 'select',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' }
            ],
            required: true
        },
        { name: 'birthday', label: 'Ngày sinh', type: 'date' },
        { name: 'address', label: 'Địa chỉ', type: 'text', fullWidth: true },
        { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
        { name: 'confirmPassword', label: 'Xác nhận mật khẩu', type: 'password', required: true }
    ];

    const columns = [
        {
            header: "Người dùng",
            key: "fullname",
            width: "30%",
            render: (val, row) => (
                <div className="user-info">
                    <img
                        src={getUserAvatar(row)}
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
                <div className="actions" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button className="action-btn" onClick={() => handleViewDetail(row)} title="Xem chi tiết"><Eye size={16} color="#6366f1" /></button>
                    <button className="action-btn" onClick={() => handleEditClick(row)} title="Chỉnh sửa"><Edit2 size={16} color="#6366f1" /></button>
                    <button className="action-btn" onClick={() => handleDeleteClick(row)} title="Xóa"><Trash2 size={16} color="#ef4444" /></button>
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

                <button className="btn-add" onClick={handleAddClick}>
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

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Chi tiết người dùng"
            >
                {selectedUser && (
                    <div className="user-detail-container">
                        <div className="user-detail-header">
                            <img
                                src={getUserAvatar(selectedUser)}
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
                                <span className="info-label">Địa chỉ</span>
                                <span className="info-value">{selectedUser.address || "N/A"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ngày sinh</span>
                                <span className="info-value">{formatDate(selectedUser.birthday)}</span>
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
                                <span className="info-value">{selectedUser.points || 0} Points</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ngày tham gia</span>
                                <span className="info-value">{formatDate(selectedUser.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add User Modal */}
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubmit}
                title="Thêm người dùng mới"
                initialData={formData}
                fields={userFields}
                isLoading={isSaving}
            />

            {/* Edit User Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Chỉnh sửa người dùng"
                initialData={formData}
                fields={userFields.filter(f => f.name !== 'password' && f.name !== 'confirmPassword')}
                isLoading={isSaving}
            />

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa người dùng"
                message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.fullname || userToDelete?.username}"? Hành động này không thể hoàn tác.`}
                isLoading={isDeleting}
            />

            {/* Notification Modal */}
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

export default User;
