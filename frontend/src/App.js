// src/App.js - Refactored Version
import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare, BarChart3, Code, Wrench, Shield, Zap } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import ChatPanel from './components/Chat/ChatPanel';
import ConnectionStatus from './components/UI/ConnectionStatus';
import ConfirmationIndicator from './components/UI/ConfirmationIndicator';


// Testers
//import TestComponent from './TestComponent';
//import EndpointTester from './components/Debug/EndpointTester';
//import DataDebugger from './components/Debug/DataDebugger';


// Hooks
import { useBusinessData } from './hooks/useBusinessData';
import { useConfirmation } from './hooks/useConfirmation';

// Utils
import { DEFAULT_MODULES } from './utils/constants';
import apiService from './services/apiService';

const SentariOS = () => {
  // Core Platform State
  const [activeModule, setActiveModule] = useState('dashboard');
  const [platformModules, setPlatformModules] = useState([]);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  // User & Company State
  const [userName, setUserName] = useState(null);
  const [companyName, setCompanyName] = useState('');
  
  // Connection Status
  const [backendConnected, setBackendConnected] = useState(false);
  
  // File Analysis State
  const [fileAnalysisResult, setFileAnalysisResult] = useState(null);

  // Custom Hooks
  const { businessData, refreshData } = useBusinessData();
  const { 
    activeConfirmation, 
    clearConfirmation,
    processConfirmationResponse 
  } = useConfirmation(userName, companyName);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await apiService.request('/api/health');
      
      if (response.status === 'healthy') {
        setBackendConnected(true);
        console.log('Backend connected successfully');
      } else {
        setBackendConnected(false);
        console.warn('Backend health check failed');
      }
    } catch (error) {
      setBackendConnected(false);
      console.error('Backend connection failed:', error);
    }
  };

  // Load existing modules from backend
  const loadExistingModules = useCallback(async () => {
    try {
      console.log('Loading existing modules...');
      
      const data = await apiService.getModules();
      
      if (data.success) {
        const builtModules = data.modules || [];
        const serverUserName = data.userName;
        
        console.log(`Loaded ${builtModules.length} persistent modules from backend`);
        
        const convertedModules = builtModules.map(module => ({
          id: module.id,
          name: module.name,
          type: 'ai-generated',
          status: 'active',
          description: module.description,
          features: module.features || [],
          created: module.created,
          hasGPS: module.hasGPS || false,
          originalType: module.originalType || module.type
        }));
        
        setPlatformModules(prev => {
          const coreModules = prev.filter(m => m.type === 'core' || m.type === 'ai' || m.type === 'system');
          const newTotal = [...coreModules, ...convertedModules];
          console.log(`Total modules after reload: ${newTotal.length}`);
          return newTotal;
        });
        
        if (serverUserName && serverUserName !== userName) {
          setUserName(serverUserName);
        }
      } else {
        throw new Error(data.error || 'Failed to load modules');
      }
    } catch (error) {
      console.error('Failed to load existing modules:', error);
    }
  }, [userName]);

  // Initialize default modules
  const initializeDefaultModules = () => {
    setPlatformModules(prev => {
      const hasDefaults = prev.some(m => m.id === 'dashboard');
      if (hasDefaults) return prev;
      
      return DEFAULT_MODULES;
    });
  };

  // Comprehensive platform initialization
  const initializePlatform = async () => {
    console.log('Initializing Sentari OS Platform...');
    
    // Initialize default modules first
    initializeDefaultModules();
    
    // Test backend connection
    await testBackendConnection();
    
    // Load real data and modules
    await Promise.all([
      refreshData(),
      loadExistingModules()
    ]);
    
    console.log('Platform initialization complete');
  };

  // Initialize platform on startup
  useEffect(() => {
    initializePlatform();
  }, []);

  // Handle file analysis
  const handleFileAnalyzed = useCallback((result) => {
    setFileAnalysisResult(result);
    setAiChatOpen(true);
  }, []);

  // Handle data changes from chat/AI operations
  const handleDataChanged = useCallback(() => {
    setTimeout(() => refreshData(), 500);
  }, [refreshData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAiChatOpen(prev => !prev);
      }
      
      if (e.key === 'Escape') {
        if (aiChatOpen) {
          setAiChatOpen(false);
        } else if (activeConfirmation) {
          clearConfirmation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aiChatOpen, activeConfirmation, clearConfirmation]);

  // Module icon helper
  const getModuleIcon = (moduleId, moduleType) => {
    if (moduleId === 'dashboard') return BarChart3;
    if (moduleId === 'business-setup') return MessageSquare;
    if (moduleId === 'module-library') return Code;
    if (moduleId === 'ai-assistant') return Wrench;
    if (moduleType === 'ai') return Wrench;
    if (moduleType === 'ai-generated') return Zap;
    return Shield;
  };

  // Render active module content
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <Dashboard
            userName={userName}
            companyName={companyName}
            onModuleChange={setActiveModule}
            onChatOpen={() => setAiChatOpen(true)}
            onFileAnalyzed={handleFileAnalyzed}
          />
        );
      default:
        return (
          <div style={{ 
            padding: '48px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
            minHeight: '100vh'
          }}>
            <h2 style={{ color: '#e2e8f0', fontSize: '28px', marginBottom: '16px' }}>
              Module Not Found
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '24px' }}>
              This module has not been built yet.
            </p>
            <button
              onClick={() => setAiChatOpen(true)}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Ask AI to Build This
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      <ConnectionStatus isConnected={backendConnected} />
      <ConfirmationIndicator 
        activeConfirmation={activeConfirmation} 
        onClear={clearConfirmation} 
      />

      {/* Sidebar Navigation */}
      <div style={{
        width: '280px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(59, 130, 246, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#3b82f6',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            marginBottom: '8px'
          }}>
            Sentari OS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            AI-Powered Business Platform
          </p>
          {userName && (
            <div style={{ 
              marginTop: '8px',
              padding: '4px 8px',
              background: 'rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              color: '#22c55e',
              fontSize: '12px'
            }}>
              Welcome, {userName}!
            </div>
          )}
          {companyName && (
            <div style={{ 
              marginTop: '4px',
              padding: '4px 8px',
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              color: '#f59e0b',
              fontSize: '12px'
            }}>
              {companyName}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '16px' }}>
          {(platformModules || []).filter(m => m.status === 'active').map(module => {
            const IconComponent = getModuleIcon(module.id, module.type);
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginBottom: '8px',
                  background: activeModule === module.id 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'transparent',
                  border: activeModule === module.id
                    ? '1px solid rgba(59, 130, 246, 0.5)'
                    : '1px solid transparent',
                  borderRadius: '8px',
                  color: activeModule === module.id ? '#3b82f6' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <IconComponent size={20} />
                <span style={{ flex: 1 }}>{module.name}</span>
                {module.type === 'ai-generated' && (
                  <span style={{ 
                    background: 'rgba(34, 197, 94, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>
            Powered by Aetheris
          </div>
          <div style={{ 
            color: backendConnected ? '#22c55e' : '#ef4444', 
            fontSize: '12px', 
            fontWeight: '500' 
          }}>
            {backendConnected ? 'Backend Connected' : 'Backend Offline'}
          </div>
          <div style={{ color: '#3b82f6', fontSize: '11px', marginTop: '2px' }}>
            Press Ctrl+K to open AI chat
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderActiveModule()}
      </div>

      {/* Sticky AI Chat Button */}
      <button
        onClick={() => setAiChatOpen(!aiChatOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: aiChatOpen 
            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        title={aiChatOpen ? 'Close Chat' : 'Open AI Chat (Ctrl+K)'}
      >
        {aiChatOpen ? <X size={24} /> : 'AI'}
      </button>

      {/* AI Chat Panel */}
      <ChatPanel
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        userName={userName}
        companyName={companyName}
        fileAnalysisResult={fileAnalysisResult}
        onDataChanged={handleDataChanged}
      />
	{/*<div className="p-4 space-y-4">
  		<EndpointTester />
  		<DataDebugger />
	</div>*/}
    </div>
  );
};

export default SentariOS;