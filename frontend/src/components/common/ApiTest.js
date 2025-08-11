import React, { useState } from 'react';
import { suggestionsAPI } from '../../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testApiKey = () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    return {
      hasKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'None'
    };
  };

  const testCitySearch = async () => {
    setLoading(true);
    try {
      const results = await suggestionsAPI.searchCities('Paris');
      setTestResults(prev => ({
        ...prev,
        citySearch: {
          success: true,
          count: Array.isArray(results) ? results.length : 0,
          sample: Array.isArray(results) && results.length > 0 ? results[0] : null,
          raw: results
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        citySearch: {
          success: false,
          error: error.message,
          stack: error.stack
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testActivityDiscovery = async () => {
    setLoading(true);
    try {
      const results = await suggestionsAPI.discoverActivities('Paris');
      setTestResults(prev => ({
        ...prev,
        activityDiscovery: {
          success: true,
          count: Array.isArray(results) ? results.length : 0,
          sample: Array.isArray(results) && results.length > 0 ? results[0] : null,
          raw: results
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        activityDiscovery: {
          success: false,
          error: error.message,
          stack: error.stack
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testPopularCities = async () => {
    setLoading(true);
    try {
      const results = await suggestionsAPI.getPopularCities(5);
      setTestResults(prev => ({
        ...prev,
        popularCities: {
          success: true,
          count: Array.isArray(results) ? results.length : 0,
          sample: Array.isArray(results) && results.length > 0 ? results[0] : null,
          raw: results
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        popularCities: {
          success: false,
          error: error.message,
          stack: error.stack
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
  };

  const apiKeyInfo = testApiKey();

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Test & Debug</h3>
      
      {/* API Key Status */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <h4 className="font-medium mb-2">API Key Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Has Key:</span>
            <span className={apiKeyInfo.hasKey ? 'text-green-600' : 'text-red-600'}>
              {apiKeyInfo.hasKey ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Key Length:</span>
            <span>{apiKeyInfo.keyLength}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Key Preview:</span>
            <span className="font-mono text-xs">{apiKeyInfo.keyPreview}</span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6 space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={testCitySearch}
            disabled={loading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            Test City Search
          </button>
          <button
            onClick={testActivityDiscovery}
            disabled={loading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            Test Activity Discovery
          </button>
          <button
            onClick={testPopularCities}
            disabled={loading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            Test Popular Cities
          </button>
        </div>
        <button
          onClick={clearResults}
          className="btn-secondary text-sm px-4 py-2"
        >
          Clear Results
        </button>
      </div>

      {/* Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="p-4 bg-white rounded-lg border">
              <h4 className="font-medium mb-2 capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h4>
              {result.success ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600 ml-2">✅ Success</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Count:</span>
                    <span className="ml-2">{result.count}</span>
                  </div>
                  {result.sample && (
                    <div className="text-sm">
                      <span className="font-medium">Sample:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.sample, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>
                    <span className="text-red-600 ml-2">❌ Failed</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Error:</span>
                    <span className="ml-2 text-red-600">{result.error}</span>
                  </div>
                  {result.stack && (
                    <div className="text-sm">
                      <span className="font-medium">Stack:</span>
                      <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-auto">
                        {result.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your frontend directory</p>
          <p>2. Add: <code className="bg-blue-100 px-1 rounded">REACT_APP_GEMINI_API_KEY=your_api_key_here</code></p>
          <p>3. Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></p>
          <p>4. Restart your development server</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
