import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Workflow, Mail, Lock, User } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { authService } from '@/shared/services/authService';
import { GoogleButton } from '@/shared/components/GoogleButton';
import { FacebookButton } from '@/shared/components/FacebookButton';
import type { OAuthCredentials } from '@/shared/types/oauth';

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

  const handleGoogleSuccess = async (credentials: OAuthCredentials) => {
    try {
      const response = await authService.loginWithOAuth(credentials);
      signIn(response.user);
      navigate('/editor');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = (error: Error) => {
    console.error('Google auth error:', error);
  };

  const handleFacebookSuccess = async (credentials: OAuthCredentials) => {
    try {
      const response = await authService.loginWithOAuth(credentials);
      signIn(response.user);
      navigate('/editor');
    } catch (error) {
      console.error('Facebook login error:', error);
    }
  };

  const handleFacebookError = (error: Error) => {
    console.error('Facebook auth error:', error);
  };

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
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            <FacebookButton
              onSuccess={handleFacebookSuccess}
              onError={handleFacebookError}
            />
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



