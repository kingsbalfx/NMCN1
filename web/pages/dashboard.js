import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats] = useState({
    exams_taken: 12,
    avg_score: 78,
    streak: 5,
    questions_solved: 248
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/auth/me");
        if (mounted) setUser(res.data.user || res.data);
      } catch (err) {
        // handled by ProtectedRoute
      }
    })();
    return () => (mounted = false);
  }, []);

  const StatCard = ({ icon, label, value, color = '#0066ff' }) => (
    <div style={{
      padding: '24px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: `2px solid ${color}20`,
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 102, 255, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 102, 255, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 255, 0.08)';
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );

  const ActionCard = ({ icon, title, description, action, color = '#0066ff' }) => (
    <div style={{
      padding: '20px',
      borderRadius: '12px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      e.currentTarget.style.borderColor = '#e2e8f0';
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{title}</h4>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}>{description}</p>
          <a href={action.href} style={{
            display: 'inline-block',
            color: color,
            fontSize: '12px',
            fontWeight: '600',
            textDecoration: 'none',
            padding: '4px 0',
            borderBottom: `1px solid ${color}`,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0052cc';
            e.currentTarget.style.borderBottomColor = '#0052cc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = color;
            e.currentTarget.style.borderBottomColor = color;
          }}>
            {action.text} →
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#0066ff', fontSize: '32px', fontWeight: '700' }}>
            Welcome{user ? `, ${user.full_name}! 👋` : "!"}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            Master Nursing & Midwifery CBT • Clinical Exams • Professional Practice
          </p>
        </div>

        {/* Stats Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '600' }}>Your Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            <StatCard icon="📝" label="Exams Taken" value={stats.exams_taken} color="#0066ff" />
            <StatCard icon="⭐" label="Average Score" value={`${stats.avg_score}%`} color="#10b981" />
            <StatCard icon="🔥" label="Current Streak" value={`${stats.streak}d`} color="#f59e0b" />
            <StatCard icon="✓" label="Questions Solved" value={stats.questions_solved} color="#8b5cf6" />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '600' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <ActionCard
              icon="📚"
              title="Browse Question Bank"
              description="Access curated questions by subject, topic, and difficulty level"
              action={{ text: 'View Subjects', href: '/subjects' }}
              color="#0066ff"
            />
            <ActionCard
              icon="🎯"
              title="Take Mock Exam"
              description="Simulate exam conditions and get detailed performance analytics"
              action={{ text: 'Start Mission', href: '/curriculum-quiz' }}
              color="#10b981"
            />
            <ActionCard
              icon="📊"
              title="Study Plan"
              description="Follow daily quests based on your weak areas, tutor activity, and quiz scores"
              action={{ text: 'Open Plan', href: '/study-plan' }}
              color="#f59e0b"
            />
            <ActionCard
              icon="👥"
              title="AI Tutor"
              description="Ask curriculum questions and get simple explanations, examples, and visual prompts"
              action={{ text: 'Ask Tutor', href: '/tutor' }}
              color="#8b5cf6"
            />
            <ActionCard
              icon="🎁"
              title="Permanent Access"
              description="Activate lifetime access with the one-time student registration fee"
              action={{ text: 'View Plans', href: '/subscribe' }}
              color="#ec4899"
            />
            <ActionCard
              icon="⚙️"
              title="Account Settings"
              description="Manage your profile, preferences, and account information"
              action={{ text: 'Settings', href: '/settings' }}
              color="#6b7280"
            />
          </div>
        </div>

        {/* Recent Activity Preview */}
        <div style={{
          padding: '24px',
          borderRadius: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          marginBottom: '40px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '600' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '14px' }}>
              <span style={{ fontSize: '18px' }}>✓</span>
              <span style={{ flex: 1, color: '#0f172a' }}>Completed Anatomy Quiz</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>2 hours ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '14px' }}>
              <span style={{ fontSize: '18px' }}>⭐</span>
              <span style={{ flex: 1, color: '#0f172a' }}>Achieved 95% on Physiology Mock Exam</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>1 day ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '14px' }}>
              <span style={{ fontSize: '18px' }}>📈</span>
              <span style={{ flex: 1, color: '#0f172a' }}>5-day study streak started</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>5 days ago</span>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
