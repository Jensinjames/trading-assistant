"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema } from '@/types/auth';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

export default function LoginPage() {
  return (
    <SearchParamsWrapper>
      <LoginContent />
    </SearchParamsWrapper>
  );
}

function LoginContent() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  // Check for lockout status
  useEffect(() => {
    const checkLockout = () => {
      if (lockoutEndTime) {
        const now = new Date();
        if (now >= lockoutEndTime) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setLoginAttempts(0);
        }
      }
    };

    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutEndTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        const path = err.path[0];
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime!.getTime() - new Date().getTime()) / 1000 / 60);
      toast.error(`Account is temporarily locked. Please try again in ${remainingTime} minutes.`);
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'INVALID_CREDENTIALS') {
          // Increment login attempts
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          // Lock account after 5 failed attempts
          if (newAttempts >= 5) {
            const lockoutTime = new Date();
            lockoutTime.setMinutes(lockoutTime.getMinutes() + 15); // 15-minute lockout
            setLockoutEndTime(lockoutTime);
            setIsLocked(true);
            toast.error('Too many failed attempts. Account locked for 15 minutes.');
          } else {
            toast.error('Invalid email or password');
          }
          
          throw new Error(data.message || 'Invalid credentials');
        } else {
          throw new Error(data.error || 'Failed to log in');
        }
      }
      
      // Reset login attempts on successful login
      setLoginAttempts(0);
      
      // Use the login function from AuthContext
      login(data.token, data.user);
      
      // Show success message
      toast.success('Login successful!');
      
      // Router will handle the redirect in AuthContext
    } catch (error: any) {
      console.error('Login error:', error);
      if (!isLocked) {
        toast.error(error.message || 'Failed to log in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 px-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Assistant</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Log in to your account</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                disabled={isLocked}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                disabled={isLocked}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
            
            {isLocked && lockoutEndTime && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Account temporarily locked due to too many failed attempts. 
                  Please try again in {Math.ceil((lockoutEndTime.getTime() - new Date().getTime()) / 1000 / 60)} minutes.
                </p>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isLoading || isLocked
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Logging in...' : isLocked ? 'Account Locked' : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 