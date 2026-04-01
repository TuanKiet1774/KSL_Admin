import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Languages,
  FileText,
  MessageSquare,
  LogOut,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import './Sidebar.css';
import { logout, getProfile } from '../../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        const parsedData = JSON.parse(storedUser);
        let currentUser = parsedData.success && parsedData.data ? parsedData.data :
          (parsedData.user ? parsedData.user :
            (parsedData.data ? parsedData.data : parsedData));

        setUserData(currentUser);
        const profileResult = await getProfile();
        if (profileResult) {
          const freshUser = profileResult.success ? profileResult.data :
            (profileResult.user ? profileResult.user :
              (profileResult.data ? profileResult.data : profileResult));

          if (freshUser && (freshUser.fullname || freshUser.username || freshUser.email)) {
            setUserData(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        }
      } catch (error) {
        console.error("Error in Sidebar fetchUserData:", error);
      }
    };

    fetchUserData();

    // Listen for profile updates from the Profile page
    window.addEventListener('userProfileUpdate', fetchUserData);
    return () => window.removeEventListener('userProfileUpdate', fetchUserData);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'User', icon: Users, path: '/users' },
    { name: 'Topic', icon: BookOpen, path: '/topics' },
    { name: 'Word', icon: Languages, path: '/words' },
    { name: 'Question', icon: HelpCircle, path: '/questions' },
    { name: 'Exam', icon: FileText, path: '/exams' },
    { name: 'Feedback', icon: MessageSquare, path: '/feedback' },
  ];


  const getUserAvatar = (user) => {
    if (user?.avatar) return user.avatar;
    if (user?.avatar_url) return user.avatar_url;
    const name = user?.fullname || user?.username || 'Admin';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <img src="/Logo_Nobackground.png" alt="KSL Logo" className="logo-img" />
          </div>
          <span className="logo-text">KSL Admin</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-section" onClick={() => navigate('/profile')}>
            <div className="user-avatar-mini">
              <img 
                src={getUserAvatar(userData)} 
                alt={userData?.username || 'User'} 
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.fullname || userData?.username || 'Admin')}&background=6366f1&color=fff`;
                }}
              />
            </div>
            <div className="user-info-mini">
              <span className="user-name-mini">{userData?.fullname || userData?.username || 'Admin'}</span>
              <span className="user-role-mini">{userData?.role?.toUpperCase() || 'ADMINISTRATOR'}</span>
            </div>
            <ChevronRight size={16} className="chevron-icon" />
          </div>

          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

