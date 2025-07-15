import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Save, 
  RefreshCw, 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Globe, 
  Bot,
  Upload,
  Download
} from 'lucide-react';

interface SystemConfiguration {
  // Application Settings
  app_name: string;
  app_description: string;
  app_url: string;
  support_email: string;
  
  // AI Settings
  ai_enabled: boolean;
  openai_model: string;
  max_tokens: number;
  temperature: number;
  
  // Email Settings
  email_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  from_email: string;
  
  // Security Settings
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_2fa: boolean;
  
  // Lead Management
  auto_assignment: boolean;
  lead_expiry_days: number;
  max_leads_per_operator: number;
  
  // File Upload Settings
  max_file_size_mb: number;
  allowed_file_types: string[];
  
  // Notification Settings
  email_notifications: boolean;
  browser_notifications: boolean;
  notification_frequency: string;
}

export default function SystemConfig() {
  const [config, setConfig] = useState<SystemConfiguration>({
    // Application Settings
    app_name: 'TourMaster AI',
    app_description: 'AI-powered tourism management platform',
    app_url: 'https://tourmaster-ai.com',
    support_email: 'support@tourmaster-ai.com',
    
    // AI Settings
    ai_enabled: true,
    openai_model: 'gpt-4',
    max_tokens: 2000,
    temperature: 0.7,
    
    // Email Settings
    email_enabled: true,
    smtp_host: 'smtp.sendgrid.net',
    smtp_port: 587,
    from_email: 'noreply@tourmaster-ai.com',
    
    // Security Settings
    session_timeout: 480, // 8 hours in minutes
    max_login_attempts: 5,
    password_min_length: 8,
    require_2fa: false,
    
    // Lead Management
    auto_assignment: true,
    lead_expiry_days: 30,
    max_leads_per_operator: 50,
    
    // File Upload Settings
    max_file_size_mb: 10,
    allowed_file_types: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    
    // Notification Settings
    email_notifications: true,
    browser_notifications: true,
    notification_frequency: 'immediate',
  });

  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleInputChange = (key: keyof SystemConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastSaved(new Date());
      toast.success('System configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setConfig({
      app_name: 'TourMaster AI',
      app_description: 'AI-powered tourism management platform',
      app_url: 'https://tourmaster-ai.com',
      support_email: 'support@tourmaster-ai.com',
      ai_enabled: true,
      openai_model: 'gpt-4',
      max_tokens: 2000,
      temperature: 0.7,
      email_enabled: true,
      smtp_host: 'smtp.sendgrid.net',
      smtp_port: 587,
      from_email: 'noreply@tourmaster-ai.com',
      session_timeout: 480,
      max_login_attempts: 5,
      password_min_length: 8,
      require_2fa: false,
      auto_assignment: true,
      lead_expiry_days: 30,
      max_leads_per_operator: 50,
      max_file_size_mb: 10,
      allowed_file_types: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
      email_notifications: true,
      browser_notifications: true,
      notification_frequency: 'immediate',
    });
    toast.info('Configuration reset to defaults');
  };

  const exportConfig = () => {
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration exported successfully');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          System Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences
        </p>
        {lastSaved && (
          <p className="text-sm text-green-600 mt-1">
            Last saved: {lastSaved.toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>
          <Button variant="outline" onClick={exportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic application configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app_name">Application Name</Label>
                  <Input
                    id="app_name"
                    value={config.app_name}
                    onChange={(e) => handleInputChange('app_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app_url">Application URL</Label>
                  <Input
                    id="app_url"
                    value={config.app_url}
                    onChange={(e) => handleInputChange('app_url', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app_description">Application Description</Label>
                <Textarea
                  id="app_description"
                  value={config.app_description}
                  onChange={(e) => handleInputChange('app_description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={config.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI features and OpenAI settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered itinerary generation and recommendations
                  </p>
                </div>
                <Switch
                  checked={config.ai_enabled}
                  onCheckedChange={(checked) => handleInputChange('ai_enabled', checked)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openai_model">OpenAI Model</Label>
                  <Select
                    value={config.openai_model}
                    onValueChange={(value) => handleInputChange('openai_model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={config.max_tokens}
                    onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Focused (0)</span>
                  <span>Balanced (1)</span>
                  <span>Creative (2)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email delivery and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Service</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable email notifications and communication
                  </p>
                </div>
                <Switch
                  checked={config.email_enabled}
                  onCheckedChange={(checked) => handleInputChange('email_enabled', checked)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={config.smtp_host}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={config.smtp_port}
                    onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from_email">From Email Address</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={config.from_email}
                  onChange={(e) => handleInputChange('from_email', e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch
                    checked={config.email_notifications}
                    onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Browser Notifications</Label>
                  <Switch
                    checked={config.browser_notifications}
                    onCheckedChange={(checked) => handleInputChange('browser_notifications', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <Select
                    value={config.notification_frequency}
                    onValueChange={(value) => handleInputChange('notification_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={config.session_timeout}
                    onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={config.max_login_attempts}
                    onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password_min_length">Minimum Password Length</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={config.password_min_length}
                  onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all user accounts
                  </p>
                </div>
                <Switch
                  checked={config.require_2fa}
                  onCheckedChange={(checked) => handleInputChange('require_2fa', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Lead Management
              </CardTitle>
              <CardDescription>
                Configure lead assignment and management rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign leads to available operators
                  </p>
                </div>
                <Switch
                  checked={config.auto_assignment}
                  onCheckedChange={(checked) => handleInputChange('auto_assignment', checked)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead_expiry_days">Lead Expiry (days)</Label>
                  <Input
                    id="lead_expiry_days"
                    type="number"
                    value={config.lead_expiry_days}
                    onChange={(e) => handleInputChange('lead_expiry_days', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_leads_per_operator">Max Leads per Operator</Label>
                  <Input
                    id="max_leads_per_operator"
                    type="number"
                    value={config.max_leads_per_operator}
                    onChange={(e) => handleInputChange('max_leads_per_operator', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Upload Settings
              </CardTitle>
              <CardDescription>
                Configure file upload restrictions and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max_file_size_mb">Maximum File Size (MB)</Label>
                <Input
                  id="max_file_size_mb"
                  type="number"
                  value={config.max_file_size_mb}
                  onChange={(e) => handleInputChange('max_file_size_mb', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'txt', 'csv', 'xlsx'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={config.allowed_file_types.includes(type)}
                        onChange={(e) => {
                          const currentTypes = config.allowed_file_types;
                          if (e.target.checked) {
                            handleInputChange('allowed_file_types', [...currentTypes, type]);
                          } else {
                            handleInputChange('allowed_file_types', currentTypes.filter(t => t !== type));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {type.toUpperCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}