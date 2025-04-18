"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpSchema } from '@/types/auth';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

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

    // Check password strength when password field changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }

    // Check if passwords match when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }));
      } else if (name === 'confirmPassword' && formData.password !== value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }));
      } else if (name === 'confirmPassword' && formData.password === value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: '',
        }));
      }
    }
  };

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  };

  const validateForm = () => {
    try {
      // First validate the basic schema
      signUpSchema.parse({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      
      // Then check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }));
        return false;
      }
      
      // Check password strength
      const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
      if (!isPasswordStrong) {
        setErrors((prev) => ({
          ...prev,
          password: 'Password does not meet security requirements',
        }));
        return false;
      }
      
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
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'WEAK_PASSWORD') {
          setErrors((prev) => ({
            ...prev,
            password: data.message,
          }));
          throw new Error(data.message);
        } else if (data.code === 'EMAIL_EXISTS') {
          setErrors((prev) => ({
            ...prev,
            email: 'This email is already registered',
          }));
          throw new Error(data.message);
        } else {
          throw new Error(data.error || 'Failed to create account');
        }
      }
      
      // Use the login function from AuthContext
      login(data.token, data.user);
      
      // Show success message
      toast.success('Account created successfully!');
      
      // Router will handle the redirect in AuthContext
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
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
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create a new account</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
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
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
              
              {/* Password strength indicators */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">At least 8 characters</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-full ${passwordStrength.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">At least one uppercase letter</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-full ${passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">At least one lowercase letter</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">At least one number</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">At least one special character</span>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 