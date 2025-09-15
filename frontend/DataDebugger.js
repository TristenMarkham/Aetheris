// src/components/Debug/DataDebugger.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const DataDebugger = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Testing endpoint: http://localhost:3001/api/business-data');
      const response = await fetch('http://localhost:3001/api/business-data');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('📡 Raw response (first 200 chars):', text.substring(0, 200));
      
      // Check if it's HTML (common error response)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        setError(`Server returned HTML instead of JSON. Status: ${response.status}`);
        setApiResponse({ 
          isHtml: true, 
          status: response.status,
          rawText: text.substring(0, 500) + '...' 
        });
        return;
      }
      
      try {
        const data = JSON.parse(text);
        setApiResponse(data);
        console.log('✅ Parsed JSON successfully:', data);
      } catch (parseError) {
        setError(`JSON Parse Error: ${parseError.message}`);
        setApiResponse({ 
          parseError: true,
          rawText: text.substring(0, 500) + (text.length > 500 ? '...' : '')
        });
      }
    } catch (fetchError) {
      console.log('🚨 Network error:', fetchError);
      setError(`Network Error: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const DataSection = ({ title, data, expectedType = 'array' }) => {
    const isValid = expectedType === 'array' ? Array.isArray(data) : typeof data === expectedType;
    const actualType = Array.isArray(data) ? 'array' : typeof data;
    
    return (
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          {isValid ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <h3 className="font-semibold">{title}</h3>
          <span className={`text-sm px-2 py-1 rounded ${
            isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            Expected: {expectedType}, Got: {actualType}
          </span>
        </div>
        
        {Array.isArray(data) && (
          <p className="text-sm text-gray-600 mb-2">
            Length: {data.length} items
          </p>
        )}
        
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-700">View Data</summary>
          <pre className="mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading data for debugging...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="font-semibold text-red-800">API Error</h2>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Backend Data Debug</h2>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {apiResponse?.success === false && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">API returned success: false</p>
          <p className="text-sm text-yellow-700">Error: {apiResponse.error}</p>
        </div>
      )}

      {apiResponse?.data ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Data Structure Analysis</h3>
          <DataSection 
            title="Employees" 
            data={apiResponse.data.employees} 
            expectedType="array" 
          />
          <DataSection 
            title="Clients" 
            data={apiResponse.data.clients} 
            expectedType="array" 
          />
          <DataSection 
            title="Sites" 
            data={apiResponse.data.sites} 
            expectedType="array" 
          />
          <DataSection 
            title="Company Info" 
            data={apiResponse.data.companyInfo} 
            expectedType="object" 
          />
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Raw Response</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DataDebugger;