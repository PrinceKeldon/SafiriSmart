
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SystemConfigurationCard: React.FC = () => {
  const navigate = useNavigate();

  const handleSystemSettings = () => {
    navigate('/admin/system-config');
  };

  const handleEnvConfig = () => {
    navigate('/admin/env-config');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>
          Configure system settings, API keys, and platform preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full" variant="outline" onClick={handleSystemSettings}>
          <Settings className="mr-2 h-4 w-4" />
          System Settings
        </Button>
        <Button className="w-full" variant="outline" onClick={handleEnvConfig}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Environment Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
