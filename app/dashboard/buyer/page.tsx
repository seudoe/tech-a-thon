'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'browse', name: 'Browse Products', icon: '🛒' },
    { id: 'my-orders', name: 'My Orders', icon: '📦' },
    { id: 'favorites', name: 'Favorites', icon: '❤️' },
    { id: 'suppliers', name: 'Suppliers', icon: '🤝' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">FarmConnect</h1>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Buyer</span>
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
                        ? 'bg-blue-100 text-blue-700'
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
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
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
                  <span className="text-gray-600">Active Orders</span>
                  <span className="font-semibold text-blue-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favorite Suppliers</span>
                  <span className="font-semibold text-purple-600">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month Spent</span>
                  <span className="font-semibold text-blue-600">₹32,450</span>
                </div>
              </div>
            </div>

            {/* Search Widget */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Quick Stats */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-xs text-gray-600">Active Orders</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">15</div>
              <div className="text-xs text-gray-600">Suppliers</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-lg font-bold text-blue-600">₹32K</div>
              <div className="text-xs text-gray-600">Month Spent</div>
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
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Welcome Back!</h3>
                  <p className="text-blue-100">Find fresh produce from local farmers</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Today</h3>
                  <p className="text-gray-600">Fresh tomatoes from Punjab 🍅</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Deals</h3>
                  <p className="text-gray-600">Save up to 25% on bulk orders 💰</p>
                </div>
              </div>
            )}

            {/* Browse Products Preview */}
            {activeTab === 'browse' && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-4xl">🥕</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Product {item}</h3>
                      <p className="text-gray-600 text-sm">Fresh from farm</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-blue-600 font-semibold">₹{50 + item * 10}/kg</span>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}