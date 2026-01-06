import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';

export const DemoModeToggle = () => {
  const { isOnboardingEnabled, updateSetting, loading } = useAppSettings();

  const handleToggle = async (enabled: boolean) => {
    const result = await updateSetting('operator_onboarding_enabled', enabled);
    if (result.success) {
      toast.success(enabled 
        ? 'Operator onboarding enabled - new signups are now allowed' 
        : 'Demo Mode activated - new operator signups are disabled'
      );
    } else {
      toast.error('Failed to update setting: ' + (result.error || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <Card className="border-muted bg-muted/20">
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isOnboardingEnabled ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5" />
          Operator Onboarding
        </CardTitle>
        <CardDescription>
          Control whether new operators can register on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isOnboardingEnabled && (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <span className="text-sm font-medium">
              {isOnboardingEnabled ? 'Signups Enabled' : 'Demo Mode (Signups Disabled)'}
            </span>
          </div>
          <Switch
            checked={isOnboardingEnabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isOnboardingEnabled 
            ? 'New operators can create accounts and access the platform.'
            : 'New operator registrations are blocked. Existing operators can still log in.'}
        </p>
      </CardContent>
    </Card>
  );
};
