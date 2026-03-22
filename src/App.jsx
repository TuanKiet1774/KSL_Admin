import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/User';
import Topics from './pages/Topic';
import Words from './pages/Word';
import Exams from './pages/Exam';
import Feedback from './pages/Feedback';
import './App.css';

function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/words" element={<Words />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
