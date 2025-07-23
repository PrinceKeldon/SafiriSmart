
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company name is required'),
  specializations: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, signup, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already logged in as operator
  React.useEffect(() => {
    if (user && !isAdmin()) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, navigate, from]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    console.log('🎯 Login.tsx: onLogin called with:', {
      email: data.email,
      expectedRole: 'operator',
      timestamp: new Date().toISOString()
    });
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // EXPLICITLY call login with 'operator' role
    const result = await login(data.email, data.password, 'operator');

    console.log('📋 Login.tsx: Login result:', {
      success: result.success,
      error: result.error,
      timestamp: new Date().toISOString()
    });

    if (result.success) {
      console.log('✅ Login.tsx: Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } else {
      console.error('❌ Login.tsx: Login failed:', result.error);
      setError(result.error || 'Login failed');
    }

    setIsSubmitting(false);
  };

  const onSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const specializations = data.specializations 
      ? data.specializations.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const result = await signup(data.email, data.password, data.name, data.company, specializations);

    if (result.success) {
      setSuccessMessage('Account created successfully! You can now sign in.');
      signupForm.reset();
    } else {
      setError(result.error || 'Signup failed');
    }

    setIsSubmitting(false);
  };

  const handleSwitchToAdminLogin = async () => {
    // If user is logged in as admin, log them out first
    if (user && isAdmin()) {
      await logout();
    }
    navigate('/admin/login');
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to SafiriSmart
            </Link>
          </div>
          
          <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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

        {/* Show different content if user is logged in as admin */}
        {user && isAdmin() && (
          <Card className="border-2 border-blue-200 mb-6">
            <CardContent className="pt-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You are currently logged in as an admin ({user.email}). 
                  To access the operator portal, you need to log out and sign in with operator credentials.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSwitchToAdminLogin} variant="outline" className="flex-1">
                  Switch to Admin Login
                </Button>
                <Button onClick={logout} variant="outline" className="flex-1">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle>TourMaster AI</CardTitle>
            <CardDescription className="text-base">
              Access your tour operator dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  {/* Email/Password Login Form */}
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    {(error || successMessage) && (
                      <Alert variant={error ? "destructive" : "default"}>
                        <AlertDescription>{error || successMessage}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register('email')}
                        className={loginForm.formState.errors.email ? 'border-red-500' : ''}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <PasswordInput
                        id="login-password"
                        placeholder="Enter your password"
                        {...loginForm.register('password')}
                        className={loginForm.formState.errors.password ? 'border-red-500' : ''}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  {(error || successMessage) && (
                    <Alert variant={error ? "destructive" : "default"}>
                      <AlertDescription>{error || successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      {...signupForm.register('name')}
                      className={signupForm.formState.errors.name ? 'border-red-500' : ''}
                    />
                    {signupForm.formState.errors.name && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signupForm.register('email')}
                      className={signupForm.formState.errors.email ? 'border-red-500' : ''}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <PasswordInput
                      id="signup-password"
                      placeholder="Choose a strong password"
                      {...signupForm.register('password')}
                      className={signupForm.formState.errors.password ? 'border-red-500' : ''}
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Company Name</Label>
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="Enter your company name"
                      {...signupForm.register('company')}
                      className={signupForm.formState.errors.company ? 'border-red-500' : ''}
                    />
                    {signupForm.formState.errors.company && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.company.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-specializations">Specializations (Optional)</Label>
                    <Textarea
                      id="signup-specializations"
                      placeholder="e.g., Safari Tours, Mountain Climbing, Cultural Tours (comma-separated)"
                      {...signupForm.register('specializations')}
                      className="resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">Enter your tour specializations separated by commas</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center">
              <button 
                onClick={handleSwitchToAdminLogin}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Admin Login →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
