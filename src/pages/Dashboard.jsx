import React, { useState, useEffect } from 'react';
import { Users, BookOpen, MessageSquare, Award, PieChart, BarChart3, HelpCircle } from 'lucide-react';
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

  const { userCount = 0, topicCount = 0, wordCount = 0, feedbackCount = 0, questionCount = 0, topicsWords = [] } = stats || {};
  const total = userCount + topicCount + feedbackCount + questionCount;

  // Handlers for visual chart heights
  const maxCount = Math.max(userCount, topicCount, feedbackCount, questionCount, 1);
  const getBarHeight = (count) => (count / maxCount) * 100;

  // Handler for Topic Chart
  const maxTopicWords = Math.max(...topicsWords.map(t => t.totalWord || 0), 1);
  const getTopicBarWidth = (count) => (count / maxTopicWords) * 100;

  // Visualization for Circular Chart
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const userPerc = (userCount / (total || 1)) * circumference;
  const topicPerc = (topicCount / (total || 1)) * circumference;
  const feedbackPerc = (feedbackCount / (total || 1)) * circumference;
  const questionPerc = (questionCount / (total || 1)) * circumference;

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
                <span className="stat-value">{userCount.toLocaleString()}</span>
              </div>
              <div className="stat-card-bg-icon">
                <Users size={80} />
              </div>
            </div>

            <div className="stat-card card-topics">
              <div className="stat-icon"><BookOpen size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Chủ đề</span>
                <span className="stat-value">{topicCount.toLocaleString()}</span>
              </div>
              <div className="stat-card-bg-icon">
                <BookOpen size={80} />
              </div>
            </div>
            {/* <div className="stat-card card-words">
              <div className="stat-icon"><Award size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Từ vựng</span>
                <span className="stat-value">{wordCount.toLocaleString()}</span>
              </div>
              <div className="stat-card-bg-icon">
                <Award size={80} />
              </div>
            </div> */}

            <div className="stat-card card-questions">
              <div className="stat-icon"><HelpCircle size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Câu hỏi</span>
                <span className="stat-value">{questionCount.toLocaleString()}</span>
              </div>
              <div className="stat-card-bg-icon">
                <HelpCircle size={80} />
              </div>
            </div>

            <div className="stat-card card-feedback">
              <div className="stat-icon"><MessageSquare size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Phản hồi</span>
                <span className="stat-value">{feedbackCount.toLocaleString()}</span>
              </div>
              <div className="stat-card-bg-icon">
                <MessageSquare size={80} />
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
                  <span className="bar-label">Thành viên</span>
                </div>
                <div className="bar-item bar-topic" style={{ height: `${getBarHeight(topicCount)}%` }}>
                  <div className="bar-value-popup">{topicCount}</div>
                  <span className="bar-label">Chủ đề</span>
                </div>
                <div className="bar-item bar-feedback" style={{ height: `${getBarHeight(feedbackCount)}%` }}>
                  <div className="bar-value-popup">{feedbackCount}</div>
                  <span className="bar-label">Phản hồi</span>
                </div>
                <div className="bar-item bar-question" style={{ height: `${getBarHeight(questionCount)}%` }}>
                  <div className="bar-value-popup">{questionCount}</div>
                  <span className="bar-label">Câu hỏi</span>
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

                  {/* User segment */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none" stroke="#6366f1"
                    strokeWidth="12"
                    strokeDasharray={`${userPerc} ${circumference}`}
                    strokeDashoffset="0"
                    className="visual-progress"
                  />

                  {/* Topic segment */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none" stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${topicPerc} ${circumference}`}
                    strokeDashoffset={`-${userPerc}`}
                    className="visual-progress"
                  />

                  {/* Feedback segment */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none" stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray={`${feedbackPerc} ${circumference}`}
                    strokeDashoffset={`-${userPerc + topicPerc}`}
                    className="visual-progress"
                  />

                  {/* Question segment */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none" stroke="#8b5cf6"
                    strokeWidth="12"
                    strokeDasharray={`${questionPerc} ${circumference}`}
                    strokeDashoffset={`-${userPerc + topicPerc + feedbackPerc}`}
                    className="visual-progress"
                  />
                </svg>
                <div className="ring-label">
                  <span className="ring-total">{total}</span>
                  <span className="ring-desc">Tổng số mục</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#6366f1' }}></div> Thành viên
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#ef4444' }}></div> Chủ đề
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#f59e0b' }}></div> Phản hồi
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#8b5cf6' }}></div> Câu hỏi
                </div>
              </div>
            </div>

            <div className="chart-card topic-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 className="chart-title" style={{ marginBottom: 0 }}>
                  <BarChart3 size={20} color="#10b981" /> Phân bổ từ vựng theo chủ đề
                </h3>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', border: '1px solid #dcfce7' }}>
                  Tổng: {wordCount.toLocaleString()} từ
                </span>
              </div>
              <div className="topic-distribution">
                {topicsWords.length > 0 ? (
                  topicsWords.map((topic, index) => (
                    <div key={index} className="topic-dist-item">
                      <div className="topic-dist-label">
                        <span className="topic-dist-name">{topic.name}</span>
                        <span className="topic-dist-value">{topic.totalWord} từ</span>
                      </div>
                      <div className="topic-dist-bar-container">
                        <div
                          className="topic-dist-bar"
                          style={{
                            width: `${getTopicBarWidth(topic.totalWord)}%`,
                            background: `linear-gradient(90deg, #10b981, #34d399)`,
                            transitionDelay: `${index * 0.1}s`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>Chưa có dữ liệu chủ đề</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
