// src/components/AI/AIBusinessAssistant.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle, Cpu, Zap } from 'lucide-react';

const AIBusinessAssistant = ({ userName, companyName, onChatOpen }) => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aetherisStatus, setAetherisStatus] = useState(null);
  const [lastResponse, setLastResponse] = useState('');
  const [error, setError] = useState(null);

  // Check Aetheris system status
  const checkAetherisStatus = async () => {
    try {
      // Use explicit URL for your backend
      const endpoint = 'http://localhost:3000/api/aetheris/status';
      
      console.log('Checking Aetheris status at:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      // Get the actual response text for debugging
      const responseText = await response.text();
      
      // Check if it's HTML (error page)
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error('Received HTML instead of JSON - API endpoint not accessible');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Aetheris status loaded:', data);
      
      // Extract status from the complex response structure
      const status = {
        status: data.aetherisStatus || data.status || 'unknown',
        cores: data.coresOnline || data.cores || 0,
        connection: data.connection || 'unknown',
        coreHealth: data.platformHealth?.coreHealth || {},
        kpiTrends: data.kpiTrends || []
      };
      
      setAetherisStatus(status);
      setError(null);
      
    } catch (err) {
      console.error('Failed to check Aetheris status:', err.message);
      setError(err.message);
      setAetherisStatus({ 
        status: 'offline', 
        cores: 0, 
        connection: 'failed' 
      });
    }
  };

  useEffect(() => {
    checkAetherisStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkAetherisStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced AI features that map to specific cores
  const aiFeatures = [
    {
      id: 'oracle-forecast',
      name: 'Business Forecasting',
      icon: '🔮',
      description: 'Oracle Core: Revenue predictions and growth analysis',
      color: '#8b5cf6',
      coreId: 'oracle',
      message: 'Analyze our current business trends and provide a 6-month revenue forecast with growth recommendations'
    },
    {
      id: 'pulse-monitoring',
      name: 'Real-Time KPIs',
      icon: '📊',
      description: 'Pulse Core: Live performance monitoring and alerts',
      color: '#22c55e',
      coreId: 'pulse', 
      message: 'Show me real-time KPI dashboard with current performance metrics and any alerts'
    },
    {
      id: 'atlas-optimization',
      name: 'Resource Optimization',
      icon: '⚡',
      description: 'Atlas Core: Optimize guard deployment and costs',
      color: '#f59e0b',
      coreId: 'atlas',
      message: 'Analyze our current resource allocation and suggest optimizations for maximum efficiency and profit'
    },
    {
      id: 'harmony-clients',
      name: 'Client Intelligence',
      icon: '🤝',
      description: 'Harmony Core: Client satisfaction and retention analysis',
      color: '#3b82f6',
      coreId: 'harmony',
      message: 'Analyze client relationships, identify churn risks, and suggest retention strategies'
    },
    {
      id: 'platform-builder',
      name: 'Platform Builder',
      icon: '🛠️',
      description: 'Forge Core: Build modules and modify platform',
      color: '#ec4899',
      coreId: 'forge',
      message: 'Show me what modules I can build or help me create a new business module'
    },
    {
      id: 'multi-core-analysis',
      name: 'Comprehensive Analysis',
      icon: '🧠',
      description: 'Multi-Core: Complete business intelligence report',
      color: '#6366f1',
      coreId: 'multi',
      message: 'Provide a comprehensive business analysis using multiple AI cores - include forecasting, performance, optimization, and client intelligence'
    }
  ];

  const executeAIFeature = async (feature) => {
    setAiProcessing(true);
    setActiveFeature(feature.id);
    setLastResponse('');
    
    try {
      let response;
      
      if (feature.coreId === 'multi') {
        // Use general Aetheris chat for multi-core analysis
        response = await fetch('http://localhost:3000/api/aetheris/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: feature.message,
            userId: userName || 'user',
            companyId: companyName || 'default'
          })
        });
      } else {
        // Use specific AI core
        response = await fetch(`http://localhost:3000/api/aetheris/core/${feature.coreId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: feature.message
          })
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success !== false) {
        const responseText = data.response || data.message || 'Analysis completed successfully.';
        setLastResponse(responseText);
        
        // Store the response for the chat to display
        localStorage.setItem('aiAssistantResponse', JSON.stringify({
          feature: feature.name,
          response: responseText,
          coresUsed: data.coresUsed || [feature.coreId],
          timestamp: new Date().toISOString()
        }));
        
        // Open chat to show results
        setTimeout(() => {
          if (onChatOpen) onChatOpen();
        }, 1000);
      } else {
        setLastResponse(`Error: ${data.error || 'Analysis failed. Please try again.'}`);
      }
      
    } catch (error) {
      console.error('AI feature execution error:', error);
      setLastResponse(`Connection error: ${error.message}`);
    } finally {
      setAiProcessing(false);
      setActiveFeature(null);
    }
  };

  const testPlatformModification = async () => {
    setAiProcessing(true);
    setActiveFeature('platform-test');
    
    try {
      const response = await fetch('http://localhost:3000/api/aetheris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Make the platform pink theme',
          userId: userName || 'user',
          companyId: companyName || 'default'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLastResponse(data.response || data.message || 'Platform modification test completed.');
      
    } catch (error) {
      setLastResponse(`Platform test failed: ${error.message}`);
    } finally {
      setAiProcessing(false);
      setActiveFeature(null);
    }
  };

  const getStatusColor = () => {
    if (!aetherisStatus) return '#f59e0b';
    if (aetherisStatus.status === 'online') return '#22c55e';
    if (aetherisStatus.status === 'offline') return '#ef4444';
    return '#f59e0b';
  };

  const isSystemReady = () => {
    return aetherisStatus && 
           (aetherisStatus.status === 'online') && 
           !aiProcessing;
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px 0'
    }}>
      {/* Header with Aetheris Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ color: '#3b82f6', margin: 0 }}>
          🧠 Aetheris AI Cores
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {aetherisStatus ? (
            <>
              {aetherisStatus.status === 'online' ? (
                <CheckCircle size={16} style={{ color: '#22c55e' }} />
              ) : (
                <AlertCircle size={16} style={{ color: '#f59e0b' }} />
              )}
              <span style={{ 
                color: getStatusColor(),
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {aetherisStatus.cores} Cores {aetherisStatus.status}
              </span>
            </>
          ) : (
            <Loader size={16} className="animate-spin" style={{ color: '#3b82f6' }} />
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '12px'
        }}>
          <strong>Connection Issue:</strong> {error}
          <button
            onClick={checkAetherisStatus}
            style={{
              marginLeft: '8px',
              padding: '4px 8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              color: '#ef4444',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* AI Feature Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        {aiFeatures.map(feature => (
          <button
            key={feature.id}
            onClick={() => executeAIFeature(feature)}
            disabled={!isSystemReady()}
            style={{
              padding: '16px',
              background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
              border: `1px solid ${feature.color}30`,
              borderRadius: '8px',
              color: '#e2e8f0',
              cursor: isSystemReady() ? 'pointer' : 'not-allowed',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              opacity: isSystemReady() ? 1 : 0.6
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{feature.icon}</div>
            <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>{feature.name}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{feature.description}</div>
            {feature.coreId !== 'multi' && (
              <div style={{ 
                marginTop: '4px', 
                fontSize: '10px', 
                color: feature.color,
                background: `${feature.color}20`,
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {feature.coreId.toUpperCase()} CORE
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Test Platform Modification */}
      <div style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)', paddingTop: '16px', marginTop: '16px' }}>
        <button
          onClick={testPlatformModification}
          disabled={!isSystemReady()}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #ec489920, #ec489910)',
            border: '1px solid #ec489930',
            borderRadius: '8px',
            color: '#e2e8f0',
            cursor: isSystemReady() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            opacity: isSystemReady() ? 1 : 0.6
          }}
        >
          🎨 Test Platform Modification (Make It Pink)
        </button>
      </div>
      
      {/* Processing Status */}
      {aiProcessing && (
        <div style={{ 
          textAlign: 'center', 
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Cpu size={20} className="animate-spin" style={{ color: '#3b82f6' }} />
            <span style={{ color: '#3b82f6', fontWeight: '500' }}>
              AI Core Processing...
            </span>
          </div>
          <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '12px' }}>
            {activeFeature && aiFeatures.find(f => f.id === activeFeature)?.name || 'Analyzing request'}
          </p>
        </div>
      )}
      
      {/* Last Response Preview */}
      {lastResponse && !aiProcessing && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={16} style={{ color: '#22c55e' }} />
            <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '500' }}>
              Latest AI Analysis
            </span>
          </div>
          <p style={{ 
            color: '#e2e8f0', 
            fontSize: '12px', 
            margin: 0,
            maxHeight: '60px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {lastResponse.substring(0, 200)}{lastResponse.length > 200 ? '...' : ''}
          </p>
          {onChatOpen && (
            <button
              onClick={onChatOpen}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '4px',
                color: '#22c55e',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              View Full Analysis →
            </button>
          )}
        </div>
      )}
      
      {/* System Status Info */}
      {aetherisStatus && aetherisStatus.kpiTrends && aetherisStatus.kpiTrends.length > 0 && (
        <div style={{ 
          marginTop: '16px',
          padding: '8px',
          background: 'rgba(59, 130, 246, 0.05)',
          borderRadius: '6px',
          fontSize: '10px',
          color: '#94a3b8'
        }}>
          <div>Live KPI Monitoring Active</div>
          <div style={{ marginTop: '2px' }}>
            Latest: Guard Utilization {aetherisStatus.kpiTrends[aetherisStatus.kpiTrends.length - 1]?.value}%, 
            Client Satisfaction {aetherisStatus.kpiTrends[aetherisStatus.kpiTrends.length - 2]?.value}%
          </div>
        </div>
      )}
      
      {/* Help Text */}
      <div style={{ 
        marginTop: '16px', 
        fontSize: '11px', 
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Each feature uses specialized AI cores from your Aetheris system. 
        Click any feature to get intelligent business insights.
      </div>
    </div>
  );
};

export default AIBusinessAssistant;