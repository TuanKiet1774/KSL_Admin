import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Languages, 
  FileText, 
  MessageSquare, 
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'User', icon: Users, path: '/users' },
    { name: 'Topic', icon: BookOpen, path: '/topics' },
    { name: 'Word', icon: Languages, path: '/words' },
    { name: 'Exam', icon: FileText, path: '/exams' },
    { name: 'Feedback', icon: MessageSquare, path: '/feedback' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
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
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
