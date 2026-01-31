'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader, Database, AlertTriangle } from 'lucide-react';

export default function SetupPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [setupResult, setSetupResult] = useState<any>(null);

  const checkTables = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/setup-all-tables');
      const data = await response.json();
      setTableStatus(data);
    } catch (error) {
      console.error('Error checking tables:', error);
      setTableStatus({ error: 'Failed to check tables' });
    } finally {
      setIsChecking(false);
    }
  };

  const createTables = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/setup-all-tables', {
        method: 'POST'
      });
      const data = await response.json();
      setSetupResult(data);
      
      // Refresh table status after creation
      if (data.success) {
        setTimeout(() => {
          checkTables();
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating tables:', error);
      setSetupResult({ error: 'Failed to create tables' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
            <p className="text-gray-600">
              Set up the required database tables for the FarmConnect platform
            </p>
          </div>

          {/* Check Tables Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Table Status</h2>
              <button
                onClick={checkTables}
                disabled={isChecking}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChecking ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Check Tables
              </button>
            </div>

            {tableStatus && (
              <div className="space-y-3">
                {tableStatus.tables ? (
                  Object.entries(tableStatus.tables).map(([tableName, status]: [string, any]) => (
                    <div key={tableName} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        {status.exists ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mr-3" />
                        )}
                        <span className="font-medium text-gray-900 capitalize">{tableName}</span>
                      </div>
                      <div className="text-sm">
                        {status.exists ? (
                          <span className="text-green-600">✓ Exists</span>
                        ) : (
                          <span className="text-red-600">✗ Missing</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : tableStatus.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700">{tableStatus.error}</span>
                    </div>
                  </div>
                ) : null}

                {tableStatus.allTablesExist && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-700">All tables are set up correctly!</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create Tables Section */}
          {tableStatus && !tableStatus.allTablesExist && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create Missing Tables</h2>
                <button
                  onClick={createTables}
                  disabled={isCreating}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Create Tables
                </button>
              </div>

              {setupResult && (
                <div className={`p-4 border rounded-lg ${
                  setupResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {setupResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={setupResult.success ? 'text-green-700' : 'text-red-700'}>
                      {setupResult.message || setupResult.error}
                    </span>
                  </div>
                  {setupResult.tables && (
                    <div className="mt-2 text-sm text-gray-600">
                      Created tables: {setupResult.tables.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click "Check Tables" to see which tables exist</li>
              <li>If any tables are missing, click "Create Tables" to set them up</li>
              <li>Once all tables are created, you can use the rating system</li>
              <li>Go back to the dashboard to test the rating functionality</li>
            </ol>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}