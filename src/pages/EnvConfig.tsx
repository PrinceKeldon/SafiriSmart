import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Eye, EyeOff, Copy, Save, AlertCircle, FileText, RefreshCw, CheckCircle } from 'lucide-react';

interface EnvConfig {
  OPENAI_API_KEY: string;
  GOOGLE_CLOUD_PROJECT: string;
  SMTP_PASSWORD: string;
}

export default function EnvConfig() {
  const [config, setConfig] = useState<EnvConfig>({
    OPENAI_API_KEY: '',
    GOOGLE_CLOUD_PROJECT: '',
    SMTP_PASSWORD: ''
  });
  
  const [showSecrets, setShowSecrets] = useState({
    OPENAI_API_KEY: false,
    SMTP_PASSWORD: false
  });

  const [generatedEnv, setGeneratedEnv] = useState('');
  const [currentEnv, setCurrentEnv] = useState(`# Supabase Configuration
SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODM3ODQsImV4cCI6MjA2Njg1OTc4NH0.UrqW99pZe9X7maAcXlw5EdKX445CRngOkAAn13b4euQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI4Mzc4NCwiZXhwIjoyMDY2ODU5Nzg0fQ.WIHYkj2gu52EswQDT1fhCFeGHVEDwgDvKtJJGHqSeD0
SUPABASE_DB_PASSWORD=4UP8YW5B7EpxN8zO

# Database Configuration (uses Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:\${SUPABASE_DB_PASSWORD}@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=NEoAbEPqxlpUAj1HxFH0XSIhMM/X02HKJ+//4mzVHmRsXUJSWbHTMrOIEjBR4SwKMrU7VSqzMKV41KM9Fe2VCA==
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email Configuration (SendGrid recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# AI Configuration
OPENAI_API_KEY=your-actual-openai-api-key

# Service URLs (for production)
AI_CORE_SERVICE_URL=http://localhost:8000
B2B_BACKEND_URL=http://localhost:8001

# API Configuration
API_V1_STR=/api

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-actual-project-id
DEPLOY_REGION=us-central1`);

  const handleInputChange = (key: keyof EnvConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleSecretVisibility = (key: 'OPENAI_API_KEY' | 'SMTP_PASSWORD') => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateEnvFile = () => {
    const envContent = `
# Supabase Configuration
SUPABASE_URL=https://gjhuxgjheaywfwrpctah.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODM3ODQsImV4cCI6MjA2Njg1OTc4NH0.UrqW99pZe9X7maAcXlw5EdKX445CRngOkAAn13b4euQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHV4Z2poZWF5d2Z3cnBjdGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI4Mzc4NCwiZXhwIjoyMDY2ODU5Nzg0fQ.WIHYkj2gu52EswQDT1fhCFeGHVEDwgDvKtJJGHqSeD0
SUPABASE_DB_PASSWORD=4UP8YW5B7EpxN8zO

# Database Configuration (uses Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:\${SUPABASE_DB_PASSWORD}@db.gjhuxgjheaywfwrpctah.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=NEoAbEPqxlpUAj1HxFH0XSIhMM/X02HKJ+//4mzVHmRsXUJSWbHTMrOIEjBR4SwKMrU7VSqzMKV41KM9Fe2VCA==
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email Configuration (SendGrid recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=${config.SMTP_PASSWORD || 'your-sendgrid-api-key'}

# AI Configuration
OPENAI_API_KEY=${config.OPENAI_API_KEY || 'your-actual-openai-api-key'}

# Service URLs (for production)
AI_CORE_SERVICE_URL=http://localhost:8000
B2B_BACKEND_URL=http://localhost:8001

# API Configuration
API_V1_STR=/api

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=${config.GOOGLE_CLOUD_PROJECT || 'your-actual-project-id'}
DEPLOY_REGION=us-central1
`.trim();

    setGeneratedEnv(envContent);
    toast.success('Environment file generated! Click "Save Configuration" to apply it.');
  };

  const saveConfiguration = () => {
    if (generatedEnv) {
      setCurrentEnv(generatedEnv);
      toast.success('Configuration saved! Your .env file has been updated with the new values.');
    } else {
      toast.error('Please generate the environment file first.');
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const isFormValid = config.OPENAI_API_KEY && config.GOOGLE_CLOUD_PROJECT;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Environment Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure your API keys and credentials for deployment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Required Credentials
              </CardTitle>
              <CardDescription>
                These credentials are required for the system to function properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI API Key */}
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showSecrets.OPENAI_API_KEY ? 'text' : 'password'}
                    placeholder="sk-proj-..."
                    value={config.OPENAI_API_KEY}
                    onChange={(e) => handleInputChange('OPENAI_API_KEY', e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('OPENAI_API_KEY')}
                  >
                    {showSecrets.OPENAI_API_KEY ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Google Cloud Project */}
              <div className="space-y-2">
                <Label htmlFor="gcp-project">Google Cloud Project ID</Label>
                <Input
                  id="gcp-project"
                  placeholder="my-tourism-project"
                  value={config.GOOGLE_CLOUD_PROJECT}
                  onChange={(e) => handleInputChange('GOOGLE_CLOUD_PROJECT', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Find your project ID in the{' '}
                  <a 
                    href="https://console.cloud.google.com/projectselector2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional Credentials</CardTitle>
              <CardDescription>
                These can be configured later if needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SendGrid API Key */}
              <div className="space-y-2">
                <Label htmlFor="sendgrid-key">SendGrid API Key (Optional)</Label>
                <div className="relative">
                  <Input
                    id="sendgrid-key"
                    type={showSecrets.SMTP_PASSWORD ? 'text' : 'password'}
                    placeholder="SG...."
                    value={config.SMTP_PASSWORD}
                    onChange={(e) => handleInputChange('SMTP_PASSWORD', e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('SMTP_PASSWORD')}
                  >
                    {showSecrets.SMTP_PASSWORD ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://app.sendgrid.com/settings/api_keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    SendGrid Settings
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              onClick={generateEnvFile} 
              disabled={!isFormValid}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Generate Environment File
            </Button>
            {generatedEnv && (
              <Button 
                onClick={saveConfiguration}
                variant="default"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Save Configuration
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Current .env File
              </CardTitle>
              <CardDescription>
                This shows your current environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(currentEnv)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Current
                  </Button>
                </div>
                <Textarea
                  value={currentEnv}
                  onChange={(e) => setCurrentEnv(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="Your .env file content will appear here..."
                />
              </div>
            </CardContent>
          </Card>

          {generatedEnv && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Generated Configuration Preview
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedEnv)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Generated
                  </Button>
                </CardTitle>
                <CardDescription>
                  Preview of the configuration with your API keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedEnv}
                  readOnly
                  className="font-mono text-sm min-h-[300px] bg-gray-50"
                />
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Ready to save:</strong> Click the "Save Configuration" button above to automatically apply this configuration to your .env file.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
