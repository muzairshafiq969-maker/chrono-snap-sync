import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { clearCache } from '@/services/cacheService';
import { toast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Trash2, 
  Info, 
  Shield,
  Database
} from 'lucide-react';

export function SettingsPage() {
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearCache = () => {
    try {
      clearCache();
      toast({
        title: "Cache Cleared",
        description: "Local cache has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Clear Cache Failed",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="pt-20 pb-20 mobile-px space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Customize your NutriSnap experience
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize how the app looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Manage your app data and cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear Local Cache</Label>
              <div className="text-sm text-muted-foreground">
                Remove cached analysis data from this device
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearCache}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Account</span>
          </CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{user?.id}</span>
            </div>
          </div>

          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">App Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Built with:</span>
            <span>React + Supabase</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Powered by:</span>
            <span>AI Nutrition Analysis</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}