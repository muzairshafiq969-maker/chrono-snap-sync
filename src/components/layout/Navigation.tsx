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
      {/* Top Header with Glass Effect */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect mobile-safe">
        <div className="flex items-center justify-between h-16 mobile-px">
          <div className="flex items-center space-x-3 animate-fade-in">
            <div className="animate-float">
              <img src={nutriSnapLogo} alt="NutriSnap" className="w-8 h-8 drop-shadow-lg" />
            </div>
            <h1 className="text-xl font-bold text-gradient">NutriSnap</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-10 h-10 p-0 hover-lift rounded-full bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect mobile-safe">
        <div className="flex items-center justify-around h-16 px-2">
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
      className={`relative flex flex-col items-center space-y-1 h-auto py-3 px-4 rounded-2xl transition-all duration-300 hover-lift ${
        isActive 
          ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
          : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
      }`}
    >
      <div className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium transition-all duration-200 ${
        isActive ? 'text-primary-foreground' : ''
      }`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full animate-glow" />
      )}
    </Button>
  );
}