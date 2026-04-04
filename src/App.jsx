import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/SideBar/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/User';
import Topics from './pages/Topic';
import Words from './pages/Word';
import Questions from './pages/Question';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Exams from './pages/Exam';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            setIsAdmin(true);
            setIsAuthenticated(true);
          } else {
            setIsAdmin(false);
            setIsAuthenticated(false);
            // Clear storage if not admin but has token (e.g. from user site)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (e) {
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={
          isChecking ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
              <div className="loader-spinner"></div>
            </div>
          ) : !isAuthenticated ? <Login /> : <Navigate to="/" />
        } />

        <Route path="/splash" element={<SplashScreen />} />

        {/* Protected Routes with Sidebar Layout */}
        <Route
          path="*"
          element={
            isChecking ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
                <div className="loader-spinner"></div>
              </div>
            ) : isAuthenticated && isAdmin ? (
              <div className="layout">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/topics" element={<Topics />} />
                    <Route path="/words" element={<Words />} />
                    <Route path="/questions" element={<Questions />} />
                    <Route path="/exams" element={<Exams />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
            ) : !isAuthenticated && localStorage.getItem('user') ? (
              // This case happens if user is logged in but not admin
              <Navigate to="/login?reason=unauthorized" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
