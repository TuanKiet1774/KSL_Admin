import React, { useState, useEffect } from 'react';
import { Users, BookOpen, MessageSquare, Award, PieChart, BarChart3, TrendingUp, ArrowUpRight } from 'lucide-react';
import Loading from '../components/Loading/Loading';
import dashboardService from '../services/dashboardService';
import './style/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getStatistics();
      if (result.success) {
        setStats(result.data);
      } else {
        setError("Không thể tải dữ liệu thống kê.");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Đã xảy ra lỗi khi kết nối với server.");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (loading && !stats) return <Loading text="Đang chuẩn bị dữ liệu Dashboard..." />;

  const { userCount = 0, topicCount = 0, wordCount = 0, feedbackCount = 0 } = stats || {};
  const total = userCount + topicCount + wordCount + feedbackCount;

  // Handlers for visual chart heights
  const maxCount = Math.max(userCount, topicCount, wordCount, feedbackCount, 1);
  const getBarHeight = (count) => (count / maxCount) * 100;

  // Visualization for Circular Chart
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const wordPerc = (wordCount / (total || 1)) * circumference;
  const userPerc = (userCount / (total || 1)) * circumference;
  const topicPerc = (topicCount / (total || 1)) * circumference;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Tổng quan hệ thống</h1>
            <p>Chào mừng bạn quay lại! Dưới đây là tóm tắt hoạt động của ứng dụng KSL.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="error-container" style={{ padding: '2rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', border: '1px solid #fee2e2' }}>
          {error}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card card-users">
              <div className="stat-icon"><Users size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Người dùng</span>
                <span className="stat-value" style={{ color: '#6366f1', alignItems: 'center', margin: 'auto' }}>{userCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card card-topics">
              <div className="stat-icon"><BookOpen size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Chủ đề</span>
                <span className="stat-value" style={{ color: '#f34d28ff', alignItems: 'center', margin: 'auto' }}>{topicCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card card-words">
              <div className="stat-icon"><Award size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Từ vựng</span>
                <span className="stat-value" style={{ color: '#1fd70bff', alignItems: 'center', margin: 'auto' }}>{wordCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card card-feedback">
              <div className="stat-icon"><MessageSquare size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Phản hồi</span>
                <span className="stat-value" style={{ color: '#ef9f44ff', alignItems: 'center', margin: 'auto' }}>{feedbackCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3 className="chart-title">
                <BarChart3 size={20} color="#6366f1" /> So sánh dữ liệu
              </h3>
              <div className="bar-chart-visual">
                <div className="bar-item bar-user" style={{ height: `${getBarHeight(userCount)}%` }}>
                  <div className="bar-value-popup">{userCount}</div>
                  <span className="bar-label">Users</span>
                </div>
                <div className="bar-item bar-topic" style={{ height: `${getBarHeight(topicCount)}%` }}>
                  <div className="bar-value-popup">{topicCount}</div>
                  <span className="bar-label">Topics</span>
                </div>
                <div className="bar-item bar-word" style={{ height: `${getBarHeight(wordCount)}%` }}>
                  <div className="bar-value-popup">{wordCount}</div>
                  <span className="bar-label">Words</span>
                </div>
                <div className="bar-item bar-feedback" style={{ height: `${getBarHeight(feedbackCount)}%` }}>
                  <div className="bar-value-popup">{feedbackCount}</div>
                  <span className="bar-label">Feedbacks</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                <PieChart size={20} color="#10b981" /> Phân bổ nội dung
              </h3>
              <div className="visual-ring-container">
                <svg width="240" height="240" className="visual-ring">
                  <circle cx="120" cy="120" r="90" fill="none" stroke="#f1f5f9" strokeWidth="12" />

                  {/* Words segment */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none" stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${wordPerc} ${circumference}`}
                    strokeDashoffset="0"
                    className="visual-progress"
                  />

                  {/* User segment offset */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none" stroke="#6366f1"
                    strokeWidth="12"
                    strokeDasharray={`${userPerc} ${circumference}`}
                    strokeDashoffset={`-${wordPerc}`}
                    className="visual-progress"
                  />
                </svg>
                <div className="ring-label">
                  <span className="ring-total">{total}</span>
                  <span className="ring-desc">Tổng số mục</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div> Từ vựng
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }}></div> Thành viên
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f1f5f9' }}></div> Khác
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
