// src/components/Debug/EndpointTester.js
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const EndpointTester = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const endpoints = [
    { name: 'Health Check', url: '/api/health', method: 'GET' },
    { name: 'Business Data', url: '/api/business-data', method: 'GET' },
    { name: 'Modules', url: '/api/modules', method: 'GET' },
  ];

  const testEndpoint = async (endpoint) => {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.url}`);
      const text = await response.text();
      
      let parsedData = null;
      let isJson = false;
      
      try {
        parsedData = JSON.parse(text);
        isJson = true;
      } catch (e) {
        // Not JSON, that's okay for some endpoints
      }

      return {
        success: response.ok,
        status: response.status,
        isJson,
        isHtml: text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'),
        data: isJson ? parsedData : null,
        rawText: text.substring(0, 200),
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'Network Error'
      };
    }
  };

  const testAllEndpoints = async () => {
    setTesting(true);
    const newResults = {};

    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint.name}...`);
      newResults[endpoint.name] = await testEndpoint(endpoint);
    }

    setResults(newResults);
    setTesting(false);
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  const getStatusIcon = (result) => {
    if (!result) return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    if (result.error) return <XCircle className="w-5 h-5 text-red-500" />;
    if (result.success && result.isJson) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (result.success) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (result) => {
    if (!result || result.error) return 'border-red-200 bg-red-50';
    if (result.success && result.isJson) return 'border-green-200 bg-green-50';
    if (result.success) return 'border-yellow-200 bg-yellow-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Backend Endpoint Tests</h2>
        <button 
          onClick={testAllEndpoints}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {testing ? 'Testing...' : 'Test All'}
        </button>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint) => {
          const result = results[endpoint.name];
          return (
            <div key={endpoint.name} className={`border rounded-lg p-4 ${getStatusColor(result)}`}>
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(result)}
                <h3 className="font-semibold">{endpoint.name}</h3>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {endpoint.method} {endpoint.url}
                </code>
                {result && (
                  <span className="text-sm font-medium">
                    Status: {result.status}
                  </span>
                )}
              </div>

              {result && (
                <div className="text-sm space-y-2">
                  {result.error && (
                    <p className="text-red-700">❌ Error: {result.error}</p>
                  )}
                  
                  {result.isHtml && (
                    <p className="text-orange-700">⚠️ Received HTML instead of JSON</p>
                  )}
                  
                  {result.contentType && (
                    <p className="text-gray-600">Content-Type: {result.contentType}</p>
                  )}
                  
                  {result.isJson && result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-700">View JSON Response</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {result.rawText && !result.isJson && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-700">View Raw Response</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {result.rawText}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Diagnosis</h3>
        {Object.values(results).some(r => r && r.error && r.error.includes('fetch')) && (
          <p className="text-red-700">🚨 Server appears to be down or unreachable</p>
        )}
        {Object.values(results).some(r => r && r.isHtml) && (
          <p className="text-orange-700">⚠️ Server is running but returning HTML - check your API routes</p>
        )}
        {Object.values(results).every(r => r && r.success && r.isJson) && (
          <p className="text-green-700">✅ All endpoints working correctly</p>
        )}
      </div>
    </div>
  );
};

export default EndpointTester;