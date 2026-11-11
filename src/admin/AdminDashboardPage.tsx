import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bot,
  FolderGit2,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AchievementsTab } from './tabs/AchievementsTab';
import { AssistantTab } from './tabs/AssistantTab';
import { CertificatesTab } from './tabs/CertificatesTab';
import { MessagesTab } from './tabs/MessagesTab';
import { ProfileSkillsTab } from './tabs/ProfileSkillsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import './admin.css';

type AdminTabId =
  | 'certificates'
  | 'assistant'
  | 'projects'
  | 'achievements'
  | 'profile'
  | 'messages';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
}

const TABS: { id: AdminTabId; label: string; icon: typeof ShieldCheck }[] = [
  { id: 'certificates', label: 'Certificates & AI', icon: ShieldCheck },
  { id: 'assistant', label: 'AI Assistant & KB', icon: Bot },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'profile', label: 'Profile & Skills', icon: UserCog },
  { id: 'messages', label: 'Messages', icon: Mail },
];

export function AdminDashboardPage({ onNavigateHome }: AdminDashboardPageProps) {
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTabId>('certificates');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: 'var(--text-secondary)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Loader2 size={22} color="var(--accent-cyan)" className="animate-spin" />
        <span className="font-mono">Verifying admin session...</span>
      </div>
    );
  }

  if (!isAdmin || !user) {
    return <AdminLoginPage onNavigateHome={onNavigateHome} />;
  }

  return (
    <div className="admin-shell">
      <header className="glass-panel admin-header">
        <div>
          <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
            PROTECTED PORTFOLIO ADMIN · {user.email}
          </div>
          <h1 className="font-display" style={{ margin: '0.2rem 0 0', fontSize: '1.45rem' }}>
            Portfolio Content & AI Control Center
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onNavigateHome}
            className="glass-btn glass-btn-secondary"
          >
            <ArrowLeft size={15} />
            Public Portfolio
          </button>

          <button
            type="button"
            onClick={() => void signOut()}
            className="glass-btn glass-btn-secondary"
            style={{ color: '#fecaca' }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </header>

      <nav aria-label="Admin sections" className="admin-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-btn ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'certificates' && <CertificatesTab />}
      {activeTab === 'assistant' && <AssistantTab />}
      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'achievements' && <AchievementsTab />}
      {activeTab === 'profile' && <ProfileSkillsTab />}
      {activeTab === 'messages' && <MessagesTab />}
    </div>
  );
}

