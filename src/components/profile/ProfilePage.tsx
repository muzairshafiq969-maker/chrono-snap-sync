import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    dietary_preferences: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || '',
          dietary_preferences: data.dietary_preferences || ''
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const profileData = {
        id: user.id,
        full_name: formData.full_name || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        dietary_preferences: formData.dietary_preferences || null
      };

      const { error } = await (supabase as any)
        .from('profiles')
        .upsert(profileData);

      if (error) {
        console.error('Profile save error:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save profile. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Profile Saved",
          description: "Your profile has been updated successfully.",
        });
        loadProfile();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-20 mobile-px">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 mobile-px space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <p className="text-muted-foreground">
          Personalize your nutrition tracking experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>
            Help us provide better nutrition recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Height in cm"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Weight in kg"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary">Dietary Preferences</Label>
            <Textarea
              id="dietary"
              placeholder="e.g., Vegetarian, Vegan, Gluten-free, etc."
              value={formData.dietary_preferences}
              onChange={(e) => setFormData({ ...formData, dietary_preferences: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since:</span>
              <span>
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Unknown'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}