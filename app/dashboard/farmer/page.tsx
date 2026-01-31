'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'my-crops', name: 'My Crops', icon: '🌾' },
    { id: 'orders', name: 'Orders', icon: '📦' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">FarmConnect</h1>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Farmer</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7H4l5-5v5z" />
                </svg>
              </button>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <div className="bg-white rounded-xl shadow-sm p-2 mb-4">
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center px-3 py-2 rounded-lg transition-all text-sm ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    <span className="font-medium whitespace-nowrap">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <nav className="bg-white rounded-2xl shadow-sm p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-3">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Listings</span>
                  <span className="font-semibold text-green-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Orders</span>
                  <span className="font-semibold text-orange-600">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month Sales</span>
                  <span className="font-semibold text-green-600">₹45,230</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Stats */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-gray-600">Active Listings</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-xs text-gray-600">Pending Orders</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-lg font-bold text-green-600">₹45K</div>
              <div className="text-xs text-gray-600">Month Sales</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
              <div className="text-center py-8 lg:py-16">
                <div className="text-4xl lg:text-6xl mb-4">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
                <p className="text-gray-600 text-base lg:text-lg">
                  This is the {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} section.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Feature implementation coming soon...
                </p>
              </div>
            </div>

            {/* Welcome Message for Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Welcome Back!</h3>
                  <p className="text-green-100">Ready to manage your farm produce?</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Weather</h3>
                  <p className="text-gray-600">Perfect for harvesting! ☀️ 28°C</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Trends</h3>
                  <p className="text-gray-600">Tomato prices up 15% 📈</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}