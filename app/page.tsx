'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Wheat, ShoppingCart, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'farmer' | 'buyer'>('farmer');
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // email or phone
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: formData.identifier,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Store user data in localStorage (in production, use proper session management)
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect based on user role
          if (data.user.role === 'farmer') {
            router.push('/dashboard/farmer');
          } else {
            router.push('/dashboard/buyer');
          }
        } else {
          setError(data.error || 'Login failed');
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.identifier,
            phone_number: formData.phone_number,
            password: formData.password,
            role: userType
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Auto-login after registration
          localStorage.setItem('user', JSON.stringify(data.user));
          
          if (data.user.role === 'farmer') {
            router.push('/dashboard/farmer');
          } else {
            router.push('/dashboard/buyer');
          }
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FarmConnect</h1>
          <p className="text-gray-600">Digital Marketplace for Farmers</p>
        </div>

        {/* Login/Register Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('farmer')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'farmer'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <Wheat className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Farmer</div>
                    <div className="text-xs text-gray-500">Sell produce</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('buyer')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'buyer'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Buyer</div>
                    <div className="text-xs text-gray-500">Buy produce</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email/Phone Input */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                {isLogin ? 'Email or Phone Number' : 'Email Address'}
              </label>
              <input
                type={isLogin ? "text" : "email"}
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                placeholder={isLogin ? "Enter email or phone number" : "Enter your email address"}
                required
              />
            </div>

            {/* Phone Number (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter your phone number"
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                userType === 'farmer'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              }`}
            >
              {loading ? 'Please wait...' : `${isLogin ? 'Login' : 'Register'} as ${userType === 'farmer' ? 'Farmer' : 'Buyer'}`}
            </button>
          </form>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-medium">Demo Users Available:</span><br />
              Farmer: rajesh.farmer@farmconnect.com / farmer123<br />
              Buyer: amit.buyer@farmconnect.com / buyer123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}