import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Workflow, Mail, Lock } from 'lucide-react';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { authService } from '@/shared/services/authService';
import { GoogleButton } from '@/shared/components/GoogleButton';
import { FacebookButton } from '@/shared/components/FacebookButton';
import type { OAuthCredentials } from '@/shared/types/oauth';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthContext();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      username: formData.username ? '' : 'Username is required',
      password: formData.password ? '' : 'Password is required',
    };

    setErrors(newErrors);

    if (!newErrors.username && !newErrors.password) {
      setIsLoading(true);
      try {
        const response = await authService.login({
          username_or_email: formData.username,
          password: formData.password,
        });

        signIn(response.user);
        navigate('/');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
        setErrors({
          username: '',
          password: errorMessage,
        });
      } finally {
        setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Workflow className="w-10 h-10 text-[#f65e05]" />
            <span className="font-bold text-2xl text-gray-800">Hit The Hay</span>
          </div>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#f65e05] focus:ring-[#f65e05] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#f65e05] hover:text-orange-600"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f65e05] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#f65e05] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
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
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-[#f65e05] hover:text-orange-600"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



