'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Wheat, 
  Package, 
  TrendingUp, 
  User, 
  Settings, 
  Plus,
  Sun,
  ArrowUp,
  MapPin,
  Calculator,
  Tag,
  Sprout,
  ImageIcon
} from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import EditProduct from '@/components/EditProduct';

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
  photos?: string[];
}

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProducts(parsedUser.id);
    }
  }, []);

  const fetchProducts = async (sellerId: number) => {
    try {
      const response = await fetch(`/api/products?seller_id=${sellerId}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'my-crops', name: 'My Crops', icon: Wheat },
    { id: 'add-product', name: 'Add Product', icon: Plus },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      name: formData.get('name'),
      category: formData.get('category'),
      quantity: parseInt(formData.get('quantity') as string),
      seller_id: user.id,
      price_single: parseFloat(formData.get('price_single') as string),
      price_multiple: parseFloat(formData.get('price_multiple') as string),
      location: formData.get('location'),
      description: formData.get('description')
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const result = await response.json();
        const productId = result.product.id;
        
        // If photos are selected, upload them automatically
        if (selectedPhotos.length > 0) {
          const uploadedUrls: string[] = [];
          
          for (let i = 0; i < selectedPhotos.length; i++) {
            const file = selectedPhotos[i];
            
            // Create FormData for server-side upload
            const photoFormData = new FormData();
            photoFormData.append('file', file);
            photoFormData.append('userId', user.id.toString());
            photoFormData.append('productId', productId.toString());

            // Upload via API route
            const uploadResponse = await fetch('/api/upload-photo', {
              method: 'POST',
              body: photoFormData
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              uploadedUrls.push(uploadResult.url);
            }
          }

          // Update product with photo URLs
          if (uploadedUrls.length > 0) {
            await fetch('/api/upload-photos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: productId,
                photoUrls: uploadedUrls
              })
            });
          }
        }
        
        // Refresh products list and reset form
        fetchProducts(user.id);
        setActiveTab('my-crops');
        (e.target as HTMLFormElement).reset();
        setSelectedPhotos([]);
        setNewProductId(null);
        
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handlePhotosUploaded = async (photoUrls: string[]) => {
    if (!newProductId) return;

    try {
      const response = await fetch('/api/upload-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newProductId,
          photoUrls
        })
      });

      if (response.ok) {
        // Refresh products list and reset form
        if (user) {
          fetchProducts(user.id);
        }
        setActiveTab('my-crops');
        setNewProductId(null);
        setSelectedPhotos([]);
        alert('Product and photos uploaded successfully!');
      }
    } catch (error) {
      console.error('Error updating product photos:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setShowEditModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">FarmConnect</h1>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Farmer</span>
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
                          ? 'bg-green-100 text-green-700'
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
                          ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
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
                  <span className="text-gray-600">Active Listings</span>
                  <span className="font-semibold text-green-600">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Stock</span>
                  <span className="font-semibold text-orange-600">
                    {products.reduce((sum, p) => sum + p.quantity, 0)}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Price</span>
                  <span className="font-semibold text-green-600">
                    ₹{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price_single, 0) / products.length) : 0}/kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Stats */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{products.length}</div>
              <div className="text-xs text-gray-600">Active Listings</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{products.reduce((sum, p) => sum + p.quantity, 0)}</div>
              <div className="text-xs text-gray-600">Total Stock (kg)</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-lg font-bold text-green-600">
                ₹{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price_single, 0) / products.length) : 0}
              </div>
              <div className="text-xs text-gray-600">Avg Price/kg</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && user && (
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-green-600 mr-3" />
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
                      <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium capitalize">
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
                    <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Product Form */}
            {activeTab === 'add-product' && (
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center mb-6">
                    <Plus className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                        placeholder="e.g., Fresh Tomatoes"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select name="category" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900" required>
                        <option value="" className="text-gray-500">Select category</option>
                        <option value="vegetables" className="text-gray-900">Vegetables</option>
                        <option value="fruits" className="text-gray-900">Fruits</option>
                        <option value="grains" className="text-gray-900">Grains</option>
                        <option value="herbs" className="text-gray-900">Herbs & Spices</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Quantity (kg)
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                        placeholder="e.g., 500"
                        required
                      />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Tag className="w-4 h-4 inline mr-1" />
                          Single Unit Price (₹/kg)
                        </label>
                        <input
                          type="number"
                          name="price_single"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                          placeholder="e.g., 50.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calculator className="w-4 h-4 inline mr-1" />
                          Bulk Price (₹/kg) - Min 10kg
                        </label>
                        <input
                          type="number"
                          name="price_multiple"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                          placeholder="e.g., 45.00"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                        placeholder="e.g., Punjab, India"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-500"
                        placeholder="Describe your product quality, farming methods, etc."
                      ></textarea>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Product Photos
                      </label>
                      <PhotoUpload
                        onPhotosChange={setSelectedPhotos}
                        userId={user?.id}
                        maxPhotos={5}
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors"
                      >
                        Add Product
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        onClick={() => setActiveTab('my-crops')}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* My Crops Tab */}
            {activeTab === 'my-crops' && (
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Wheat className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">My Crops</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading products...</div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Wheat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first product to the marketplace</p>
                    <button
                      onClick={() => setActiveTab('add-product')}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Category: {product.category}</p>
                          <p>Single: ₹{product.price_single}/kg</p>
                          {product.price_multiple && <p>Bulk: ₹{product.price_multiple}/kg</p>}
                          <p>Stock: {product.quantity}kg</p>
                          <p>Location: {product.location}</p>
                          {product.photos && product.photos.length > 0 && (
                            <p className="text-blue-600">📸 {product.photos.length} photo{product.photos.length > 1 ? 's' : ''}</p>
                          )}
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {product.status}
                          </span>
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Tabs */}
            {activeTab !== 'add-product' && activeTab !== 'my-crops' && activeTab !== 'profile' && (
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
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Welcome Back!</h3>
                  <p className="text-green-100">Ready to manage your farm produce?</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Sun className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Today's Weather</h3>
                  </div>
                  <p className="text-gray-600">Perfect for harvesting! 28°C</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <ArrowUp className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Market Trends</h3>
                  </div>
                  <p className="text-gray-600">Tomato prices up 15%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProduct
          product={editingProduct}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
          userId={user?.id || 0}
        />
      )}
    </div>
  );
}