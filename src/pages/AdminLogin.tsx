
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  // If user is already logged in and is an admin, redirect to admin dashboard
  React.useEffect(() => {
    if (user && isAdmin()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    console.log('🎯 AdminLogin.tsx: onLogin called with:', {
      email: data.email,
      expectedRole: 'admin',
      timestamp: new Date().toISOString()
    });
    
    setIsSubmitting(true);
    setError(null);

    // EXPLICITLY call login with 'admin' role
    const result = await login(data.email, data.password, 'admin');

    console.log('📋 AdminLogin.tsx: Login result:', {
      success: result.success,
      error: result.error,
      timestamp: new Date().toISOString()
    });

    if (result.success) {
      console.log('✅ AdminLogin.tsx: Admin login successful, navigating to:', from);
      navigate(from, { replace: true });
    } else {
      console.error('❌ AdminLogin.tsx: Admin login failed:', result.error);
      setError(result.error || 'Login failed');
    }

    setIsSubmitting(false);
  };

  const handleSwitchToOperatorLogin = async () => {
    // If user is logged in as operator, log them out first
    if (user && !isAdmin()) {
      await logout();
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to B2C Link */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to SafiriSmart
          </Link>
        </div>

        {/* Show different content if user is logged in as operator */}
        {user && !isAdmin() && (
          <Card className="border-2 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You are currently logged in as an operator ({user.email}). 
                  To access the admin portal, you need to log out and sign in with admin credentials.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSwitchToOperatorLogin} variant="outline" className="flex-1">
                  Switch to Operator Login
                </Button>
                <Button onClick={logout} variant="outline" className="flex-1">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-red-200">
          <CardHeader className="text-center bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 mr-2" />
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
            </div>
            <CardDescription className="text-red-100 text-base">
              Administrative access to SafiriSmart
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Enter your admin email"
                  {...loginForm.register('email')}
                  className={loginForm.formState.errors.email ? 'border-red-500' : ''}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your admin password"
                  {...loginForm.register('password')}
                  className={loginForm.formState.errors.password ? 'border-red-500' : ''}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={handleSwitchToOperatorLogin}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Operator Login →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
