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
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />

        {/* Protected Routes with Sidebar Layout */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
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
