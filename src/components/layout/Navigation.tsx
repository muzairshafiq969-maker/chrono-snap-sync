import { Camera, History, User, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import nutriSnapLogo from '@/assets/nutrisnap-logo.png';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b mobile-safe">
        <div className="flex items-center justify-between h-16 mobile-px">
          <div className="flex items-center space-x-3">
            <img src={nutriSnapLogo} alt="NutriSnap" className="w-8 h-8" />
            <h1 className="text-xl font-bold text-primary">NutriSnap</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t mobile-safe">
        <div className="flex items-center justify-around h-16">
          <TabButton
            icon={<Camera />}
            label="Scan"
            isActive={activeTab === 'scan'}
            onClick={() => onTabChange('scan')}
          />
          <TabButton
            icon={<History />}
            label="History"
            isActive={activeTab === 'history'}
            onClick={() => onTabChange('history')}
          />
          <TabButton
            icon={<User />}
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={() => onTabChange('profile')}
          />
          <TabButton
            icon={<Settings />}
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
          />
        </div>
      </nav>
    </>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      <div className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}