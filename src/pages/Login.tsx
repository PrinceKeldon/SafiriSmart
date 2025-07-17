
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
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';

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
  const { login, loginWithGoogle, signup, user, isAdmin, logout } = useAuth();
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

  const onGoogleLogin = async () => {
    console.log('🎯 Login.tsx: Google login called');
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const result = await loginWithGoogle('operator');

    console.log('📋 Login.tsx: Google login result:', {
      success: result.success,
      error: result.error,
      timestamp: new Date().toISOString()
    });

    if (!result.success) {
      console.error('❌ Login.tsx: Google login failed:', result.error);
      setError(result.error || 'Google login failed');
      setIsSubmitting(false);
    }
    // Note: If successful, the user will be redirected by OAuth flow
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
                  {/* Google Sign In Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onGoogleLogin}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

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
                      <Input
                        id="login-password"
                        type="password"
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
                    <Input
                      id="signup-password"
                      type="password"
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
