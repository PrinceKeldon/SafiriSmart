
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const SystemConfigurationCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>
          Configure system settings, API keys, and platform preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          System Settings
        </Button>
      </CardContent>
    </Card>
  );
};
