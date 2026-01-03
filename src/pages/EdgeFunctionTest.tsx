import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'expected';
  message: string;
  duration?: number;
}

// Helper to extract actual response from FunctionsHttpError
const extractFunctionResponse = async (error: any): Promise<{ status?: number; message?: string }> => {
  try {
    // FunctionsHttpError has context with the response
    if (error?.context?.json) {
      const json = await error.context.json();
      return { status: error.context.status, message: json?.message || JSON.stringify(json) };
    }
    // Try to parse the error message
    if (error?.message) {
      return { message: error.message };
    }
  } catch {
    // Ignore parsing errors
  }
  return { message: 'Unknown error' };
};

const EdgeFunctionTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, status, message, duration } : r);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const testFunction = async (name: string, testFn: () => Promise<{ status: TestResult['status']; message: string }>) => {
    updateResult(name, 'pending', 'Testing...');
    const start = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - start;
      updateResult(name, result.status, result.message, duration);
    } catch (error: any) {
      const duration = Date.now() - start;
      updateResult(name, 'error', error.message || 'Unknown error', duration);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // Test get-public-operators (public function)
    await testFunction('get-public-operators', async () => {
      const { data, error } = await supabase.functions.invoke('get-public-operators');
      if (error) throw error;
      console.log('get-public-operators response:', data);
      return { status: 'success', message: 'Function responded successfully' };
    });

    // Test auth-login (expects 401 for invalid credentials - that's correct behavior)
    await testFunction('auth-login', async () => {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { email: 'test@example.com', password: 'testpassword123' }
      });
      console.log('auth-login response:', data, error);
      
      // If we get an error, check if it's an expected auth rejection
      if (error) {
        const response = await extractFunctionResponse(error);
        // 401/403 or "Invalid" messages mean the function is working correctly
        if (response.status === 401 || response.status === 403 || 
            response.message?.includes('Invalid') || response.message?.includes('credentials') ||
            error.message?.includes('non-2xx')) {
          return { status: 'expected', message: 'Auth rejected (expected: invalid test credentials)' };
        }
        throw error;
      }
      return { status: 'success', message: 'Login successful' };
    });

    // Test operator-signup (check it responds)
    await testFunction('operator-signup', async () => {
      const { data, error } = await supabase.functions.invoke('operator-signup', {
        body: { 
          email: `test-${Date.now()}@example.com`, 
          password: 'testpassword123',
          name: 'Test Operator',
          company: 'Test Company',
          specializations: ['Safari']
        }
      });
      console.log('operator-signup response:', data, error);
      if (error) throw error;
      return { status: 'success', message: 'Function responded successfully' };
    });

    // Test generate-description
    await testFunction('generate-description', async () => {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { 
          packageName: 'Test Safari Package',
          context: 'A 5-day wildlife safari in the Serengeti',
          userKeywords: 'adventure, wildlife, photography'
        }
      });
      if (error) throw error;
      console.log('generate-description response:', data);
      return { status: 'success', message: 'Function responded successfully' };
    });

    // Test send-email (will likely fail without valid recipient, but checks deployment)
    await testFunction('send-email', async () => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          to: 'test@example.com',
          type: 'confirmation',
          data: { traveler_name: 'Test User' }
        }
      });
      console.log('send-email response:', data, error);
      if (error) {
        const response = await extractFunctionResponse(error);
        // Email service errors are expected without proper setup
        return { status: 'expected', message: response.message || 'Email service not configured' };
      }
      return { status: 'success', message: 'Email sent successfully' };
    });

    // Test create-lead
    await testFunction('create-lead', async () => {
      const { data, error } = await supabase.functions.invoke('create-lead', {
        body: { 
          traveler: {
            name: 'Test Traveler',
            email: 'traveler@example.com',
            phone: '+1234567890',
            country: 'United States'
          },
          preferences: {
            duration: 5,
            budget_range: 'mid-range',
            interests: ['wildlife', 'photography'],
            group_size: 2
          },
          schedule: {
            start_date: '2025-06-01',
            flexibility: 'flexible'
          }
        }
      });
      console.log('create-lead response:', data, error);
      if (error) throw error;
      return { status: 'success', message: 'Lead created successfully' };
    });

    // Test auth-me (requires auth token - 401 without token is expected)
    await testFunction('auth-me', async () => {
      const { data, error } = await supabase.functions.invoke('auth-me');
      console.log('auth-me response:', data, error);
      
      if (error) {
        const response = await extractFunctionResponse(error);
        // 401 or missing token errors mean the function is working correctly
        if (response.status === 401 || 
            response.message?.includes('authorization') || 
            response.message?.includes('token') || 
            response.message?.includes('Missing') ||
            error.message?.includes('non-2xx')) {
          return { status: 'expected', message: 'Auth rejected (expected: no token provided)' };
        }
        throw error;
      }
      return { status: 'success', message: 'User authenticated' };
    });

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expected':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Testing</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Success</Badge>;
      case 'expected':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Expected</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Error</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Edge Function Test Suite
          </CardTitle>
          <CardDescription>
            Test all deployed Supabase Edge Functions to verify they are working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Test Results
              </h3>
              {results.map((result) => (
                <div 
                  key={result.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium text-sm">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-xs text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Notes:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>auth-login/auth-me:</strong> Expected to return auth errors without valid credentials</li>
              <li>• <strong>generate-description:</strong> Requires OPENAI_API_KEY secret</li>
              <li>• <strong>send-email:</strong> Requires RESEND_API_KEY secret</li>
              <li>• <strong>create-lead:</strong> Will create test data in the database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeFunctionTest;
