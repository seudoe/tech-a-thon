'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Heart, 
  Handshake, 
  User, 
  Settings,
  Search,
  Star,
  DollarSign,
  Sprout,
  ImageIcon
} from 'lucide-react';
import ProductDetails from '@/components/ProductDetails';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price_single: number;
  price_multiple: number;
  location: string;
  description: string;
  status: string;
  seller_name: string;
  seller_phone: string;
  photos?: string[];
}

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'browse', name: 'Browse Products', icon: ShoppingCart },
    { id: 'my-orders', name: 'My Orders', icon: Package },
    { id: 'favorites', name: 'Favorites', icon: Heart },
    { id: 'suppliers', name: 'Suppliers', icon: Handshake },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">FarmConnect</h1>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Buyer</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
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
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex items-center px-3 py-2 rounded-lg transition-all text-sm ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      <span className="font-medium whitespace-nowrap">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <nav className="bg-white rounded-2xl shadow-sm p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Products</span>
                  <span className="font-semibold text-blue-600">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-purple-600">
                    {new Set(products.map(p => p.category)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Suppliers</span>
                  <span className="font-semibold text-blue-600">
                    {new Set(products.map(p => p.seller_name)).size}
                  </span>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                />
                <button 
                  onClick={() => setActiveTab('browse')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Quick Stats */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-xs text-gray-600">Products</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{new Set(products.map(p => p.category)).size}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-lg font-bold text-blue-600">{new Set(products.map(p => p.seller_name)).size}</div>
              <div className="text-xs text-gray-600">Suppliers</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && user && (
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                </div>

                <div className="max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                        {user.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-medium capitalize">
                        {user.role}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                        {user.phone_number || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Browse Products Tab */}
            {activeTab === 'browse' && (
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Browse Products</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredProducts.length} products found
                  </div>
                </div>

                {/* Mobile Search */}
                <div className="lg:hidden mb-6">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading products...</div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative">
                          {product.photos && product.photos.length > 0 ? (
                            <img
                              src={product.photos[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`fallback-icon w-full h-full flex items-center justify-center ${product.photos && product.photos.length > 0 ? 'absolute inset-0' : ''}`} style={{ display: product.photos && product.photos.length > 0 ? 'none' : 'flex' }}>
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p>Category: {product.category}</p>
                          <p>Seller: {product.seller_name}</p>
                          <p>Location: {product.location}</p>
                          <p>Stock: {product.quantity}kg</p>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-blue-600 font-semibold">₹{product.price_single}/kg</span>
                            {product.price_multiple && (
                              <div className="text-xs text-gray-500">
                                Bulk: ₹{product.price_multiple}/kg
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {product.price_multiple && (
                              <div className="text-xs text-green-600 font-medium">
                                {Math.round(((product.price_single - product.price_multiple) / product.price_single) * 100)}% off bulk
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Add to Cart
                          </button>
                          <button 
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Tabs */}
            {activeTab !== 'browse' && activeTab !== 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
                <div className="text-center py-8 lg:py-16">
                  <div className="mb-4">
                    {(() => {
                      const IconComponent = tabs.find(tab => tab.id === activeTab)?.icon;
                      return IconComponent ? <IconComponent className="w-16 h-16 text-gray-400 mx-auto" /> : null;
                    })()}
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
            )}

            {/* Welcome Message for Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Welcome Back!</h3>
                  <p className="text-blue-100">Find fresh produce from local farmers</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Featured Today</h3>
                  </div>
                  <p className="text-gray-600">Fresh tomatoes from Punjab</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Best Deals</h3>
                  </div>
                  <p className="text-gray-600">Save up to 25% on bulk orders</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          isOpen={showProductDetails}
          onClose={() => {
            setShowProductDetails(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}