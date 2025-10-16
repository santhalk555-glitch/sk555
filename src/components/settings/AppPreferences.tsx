import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Moon, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

const AppPreferences = () => {
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en';
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('enable_notifications, language')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
      } else if (data) {
        setEnableNotifications(data.enable_notifications ?? true);
        if (data.language) {
          setLanguage(data.language);
          i18n.changeLanguage(data.language);
        }
      }
      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  const updatePreference = async (field: string, value: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: t('error'),
        description: 'Failed to update preference.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('success'),
        description: t('settingUpdated')
      });
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
    i18n.changeLanguage(newLanguage);
    
    if (user) {
      await updatePreference('language', newLanguage);
    }
    
    toast({
      title: t('success'),
      description: t('languageChanged')
    });
  };

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
    toast({
      title: t('success'),
      description: t('themeChanged')
    });
  };

  if (loading) {
    return <div className="animate-pulse">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {t('notificationSettings')}
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">{t('enableNotifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notificationDescription')}
              </p>
            </div>
            <Switch
              id="notifications"
              checked={enableNotifications}
              onCheckedChange={(checked) => {
                setEnableNotifications(checked);
                updatePreference('enable_notifications', checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            {t('themeMode')}
          </CardTitle>
          <CardDescription>
            Choose your preferred theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">{t('darkMode')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('darkModeDescription')}
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('language')}
          </CardTitle>
          <CardDescription>
            {t('selectLanguage')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={language} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
              <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppPreferences;