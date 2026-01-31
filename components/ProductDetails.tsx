'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, User, Phone, Package, DollarSign, Star, Heart, ShoppingCart, Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeCropImage, urlToFile, formatClassName, getQualityColor, getConfidenceColor, type PredictionResponse } from '../lib/services/image-analysis-service';

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

interface ProductDetailsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetails({ product, isOpen, onClose }: ProductDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState<PredictionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!isOpen) return null;

  const photos = product.photos && product.photos.length > 0 
    ? product.photos 
    : ['/api/placeholder/400/300']; // Fallback placeholder

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Analyze image when current image changes
  useEffect(() => {
    const analyzeCurrentImage = async () => {
      const currentPhoto = photos[currentImageIndex];
      
      // Skip analysis for placeholder images or invalid URLs
      if (!currentPhoto || 
          currentPhoto === '/api/placeholder/400/300' || 
          currentPhoto.includes('placeholder') ||
          typeof currentPhoto !== 'string') {
        setAnalysisData(null);
        setAnalysisError(null);
        setIsAnalyzing(false);
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisData(null);

      try {
        const file = await urlToFile(currentPhoto, `product-image-${currentImageIndex}.jpg`);
        
        if (!file) {
          setAnalysisError('Unable to process this image');
          return;
        }

        const result = await analyzeCropImage(file);
        
        if (result) {
          setAnalysisData(result);
        } else {
          setAnalysisError('Analysis failed - please try another image');
        }
      } catch (error) {
        setAnalysisError('Something went wrong with the image analysis');
        console.error('Image analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (isOpen) {
      analyzeCurrentImage();
    } else {
      // Reset state when modal closes
      setAnalysisData(null);
      setAnalysisError(null);
      setIsAnalyzing(false);
    }
  }, [currentImageIndex, isOpen, photos]);

  const bulkDiscount = product.price_single > product.price_multiple 
    ? Math.round(((product.price_single - product.price_multiple) / product.price_single) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-blue-600 mt-1">👁️ Buyer's View - This is how customers see your product</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Slideshow */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={photos[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-80 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/400/300';
                }}
              />
              
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {photos.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/64/64';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* ML Analysis Results */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI Quality Analysis</h3>
              </div>

              {isAnalyzing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing image quality...</span>
                </div>
              )}

              {analysisError && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{analysisError}</span>
                </div>
              )}

              {analysisData && !isAnalyzing && (
                <div className="space-y-3">
                  {/* Prediction Class */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Classification:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {formatClassName(analysisData.predicted_class)}
                    </span>
                  </div>

                  {/* Confidence Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Confidence:</span>
                    <span className={`text-sm font-semibold ${getConfidenceColor(analysisData.confidence_score)}`}>
                      {analysisData.confidence_score || 'N/A'}
                    </span>
                  </div>

                  {/* Quality Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Quality Score:</span>
                    <div className={`px-2 py-1 rounded border text-sm font-medium ${getQualityColor(analysisData.quality_score)}`}>
                      {typeof analysisData.quality_score === 'number' ? `${analysisData.quality_score}/5` : 'N/A'}
                      {analysisData.quality_score >= 4 && <CheckCircle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>

                  {/* Quality Indicator Bar */}
                  {typeof analysisData.quality_score === 'number' && !isNaN(analysisData.quality_score) && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Quality</span>
                        <span>{analysisData.quality_score}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            analysisData.quality_score >= 4 ? 'bg-green-500' :
                            analysisData.quality_score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, (analysisData.quality_score / 5) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Message */}
                  {analysisData.message && (
                    <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2">
                      {analysisData.message}
                    </div>
                  )}
                </div>
              )}

              {!analysisData && !isAnalyzing && !analysisError && (
                <div className="text-sm text-gray-500 text-center py-2">
                  {photos[currentImageIndex]?.includes('placeholder') || !photos[currentImageIndex] 
                    ? 'No image available for analysis' 
                    : 'Select an image to see AI quality analysis'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category and Rating */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {product.category}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.5 (23 reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-600">Single Unit Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{product.price_single}/kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bulk Price (10kg+)</p>
                  <p className="text-2xl font-bold text-green-600">₹{product.price_multiple}/kg</p>
                </div>
              </div>
              
              {bulkDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">
                    Save {bulkDiscount}% on bulk orders (10kg or more)
                  </p>
                </div>
              )}
            </div>

            {/* Stock and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Available Stock</p>
                  <p className="font-semibold">{product.quantity} kg</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{product.location}</p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{product.seller_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{product.seller_phone}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Contact Seller */}
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}