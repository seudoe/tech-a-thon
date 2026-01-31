'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader, Database, AlertTriangle, Copy } from 'lucide-react';

export default function TestRatingsPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [createResult, setCreateResult] = useState<any>(null);

  const checkRatingsTable = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/create-ratings-direct');
      const data = await response.json();
      setTableStatus(data);
    } catch (error) {
      console.error('Error checking table:', error);
      setTableStatus({ error: 'Failed to check table' });
    } finally {
      setIsChecking(false);
    }
  };

  const createRatingsTable = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/create-ratings-direct', {
        method: 'POST'
      });
      const data = await response.json();
      setCreateResult(data);
      
      // Refresh status after creation
      if (data.success) {
        setTimeout(() => {
          checkRatingsTable();
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating table:', error);
      setCreateResult({ error: 'Failed to create table' });
    } finally {
      setIsCreating(false);
    }
  };

  const copySQL = () => {
    const sql = `-- Create ratings table for FarmConnect platform
CREATE TABLE IF NOT EXISTS public.ratings (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  rater_id BIGINT NOT NULL,
  rated_id BIGINT NOT NULL,
  rater_type VARCHAR(10) NOT NULL CHECK (rater_type IN ('buyer', 'seller')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_order_rater UNIQUE(order_id, rater_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON public.ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON public.ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_type ON public.ratings(rater_type);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Users can view all ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert ratings" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Users can update their own ratings" ON public.ratings FOR UPDATE USING (true);`;

    navigator.clipboard.writeText(sql);
    alert('SQL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ratings Table Setup</h1>
            <p className="text-gray-600">
              Fix the "Could not find the table 'public.ratings'" error
            </p>
          </div>

          {/* Error Alert */}
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Current Error</h3>
                <p className="text-red-700 text-sm mt-1">
                  <code>Could not find the table 'public.ratings' in the schema cache</code>
                </p>
                <p className="text-red-600 text-sm mt-2">
                  This means the ratings table doesn't exist in your Supabase database.
                </p>
              </div>
            </div>
          </div>

          {/* Check Table Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Check Ratings Table</h2>
              <button
                onClick={checkRatingsTable}
                disabled={isChecking}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChecking ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Check Table
              </button>
            </div>

            {tableStatus && (
              <div className={`p-4 border rounded-lg ${
                tableStatus.exists 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {tableStatus.exists ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={tableStatus.exists ? 'text-green-700' : 'text-red-700'}>
                    {tableStatus.message}
                  </span>
                </div>
                {tableStatus.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {tableStatus.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create Table */}
          {tableStatus && !tableStatus.exists && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create Ratings Table</h2>
                <button
                  onClick={createRatingsTable}
                  disabled={isCreating}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Create Table
                </button>
              </div>

              {createResult && (
                <div className={`p-4 border rounded-lg ${
                  createResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {createResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={createResult.success ? 'text-green-700' : 'text-red-700'}>
                      {createResult.message || createResult.error}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual SQL Option */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Manual Setup (Recommended)</h3>
            <p className="text-blue-800 mb-4">
              If the automatic creation doesn't work, you can run the SQL manually in your Supabase dashboard:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 mb-4">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
              <li>Navigate to "SQL Editor"</li>
              <li>Copy the SQL below and paste it</li>
              <li>Click "Run" to execute</li>
            </ol>
            <button
              onClick={copySQL}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy SQL to Clipboard
            </button>
          </div>

          {/* Success Message */}
          {tableStatus?.exists && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <h3 className="text-green-800 font-medium">Table Created Successfully!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    You can now go back to your dashboard and use the rating system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center space-x-4">
            <a
              href="/dashboard/buyer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Buyer Dashboard
            </a>
            <a
              href="/dashboard/farmer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Farmer Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}