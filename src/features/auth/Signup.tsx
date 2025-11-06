import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Workflow, Mail, Lock, User, Facebook } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { useGoogleAuth } from '@/shared/hooks/useGoogleAuth';
import { authService } from '@/shared/services/authService';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthContext();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (signupError) {
      setSignupError(null);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      username: formData.username ? '' : 'Username is required',
      email: formData.email
        ? validateEmail(formData.email)
          ? ''
          : 'Please enter a valid email address'
        : 'Email is required',
      password: formData.password
        ? formData.password.length >= 6
          ? ''
          : 'Password must be at least 6 characters'
        : 'Password is required',
      confirmPassword: formData.confirmPassword
        ? formData.confirmPassword === formData.password
          ? ''
          : 'Passwords do not match'
        : 'Please confirm your password',
    };

    setErrors(newErrors);

    if (!newErrors.username && !newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      try {
        setIsSignupLoading(true);
        setSignupError(null);

        const response = await authService.signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        signIn(response.user);

        setRedirectTo('/editor');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
        setSignupError(errorMessage);
        console.error('Signup error:', error);
      } finally {
        setIsSignupLoading(false);
      }
    }
  };

  // Google Auth handler
  const handleGoogleAuthSuccess = async (idToken: string, accessToken: string) => {
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);

      // Call API to login with Google (backend handles both signup and login)
      const response = await authService.loginWithOAuth({
        provider: 'google',
        idToken,
        accessToken,
      });

      // Update auth context with user data
      signIn(response.user);

      // Navigate to editor after signup
      navigate('/editor');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with Google';
      setGoogleError(errorMessage);
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleAuthError = (error: Error) => {
    setGoogleError(error.message);
    console.error('Google auth error:', error);
  };

  // Initialize Google Auth hook
  const { isLoaded: isGoogleLoaded, signIn: triggerGoogleSignIn } = useGoogleAuth({
    onSuccess: handleGoogleAuthSuccess,
    onError: handleGoogleAuthError,
    autoLoad: true,
  });

  const handleGoogleSignIn = () => {
    if (!isGoogleLoaded) {
      setGoogleError('Google authentication is not ready yet. Please try again in a moment.');
      return;
    }
    setGoogleError(null);
    triggerGoogleSignIn();
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook Sign In');
  };

  // Redirect after successful signup
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Workflow className="w-10 h-10 text-[#f65e05]" />
            <span className="font-bold text-2xl text-gray-800">Hit The Hay</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-600">Sign up to get started with Hit The Hay</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f65e05] focus:border-transparent ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f65e05] focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f65e05] focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f65e05] focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {signupError && (
              <p className="text-sm text-red-600 text-center">{signupError}</p>
            )}

            <div className="text-sm text-gray-600">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-[#f65e05] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#f65e05] hover:underline">
                Privacy Policy
              </Link>
              .
            </div>

            <button
              type="submit"
              disabled={isSignupLoading}
              className="w-full bg-[#f65e05] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#f65e05] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignupLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!isGoogleLoaded || isGoogleLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-gray-300 border-t-[#f65e05] rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
            {googleError && (
              <p className="text-sm text-red-600 text-center">{googleError}</p>
            )}

            <button
              type="button"
              onClick={handleFacebookSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <Facebook className="w-5 h-5 mr-3 text-[#1877F2]" />
              Sign in with Facebook
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-[#f65e05] hover:text-orange-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;



