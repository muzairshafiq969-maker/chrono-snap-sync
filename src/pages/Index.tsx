import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/layout/Navigation';
import { AuthPage } from '@/components/auth/AuthPage';
import { ScanPage } from '@/components/scan/ScanPage';
import { HistoryPage } from '@/components/history/HistoryPage';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('scan');

  // Redirect authenticated users to main page
  useEffect(() => {
    if (user && activeTab === 'auth') {
      setActiveTab('scan');
    }
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'scan':
        return <ScanPage />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ScanPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
