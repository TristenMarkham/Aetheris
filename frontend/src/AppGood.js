import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Calendar, Users, MapPin, BarChart3, Clock, Shield, Zap, DollarSign, TrendingUp, Activity, X, MessageSquare, Wrench, Code, Settings, Loader, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const SentariOS = () => {
  // Core Platform State
  const [activeModule, setActiveModule] = useState('dashboard');
  const [platformModules, setPlatformModules] = useState([]);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [buildHistory, setBuildHistory] = useState([]);
  
  // Real Dashboard Data State
  const [realDashboardData, setRealDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const chatInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Chat UI State
  const [chatWidth, setChatWidth] = useState(450);
  const [chatHeight, setChatHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  // Connection status
  const [backendConnected, setBackendConnected] = useState(false);

  // Auto-scroll effect for chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isProcessing]);

  // Initialize platform on startup
  useEffect(() => {
    initializePlatform();
  }, []);

  // Comprehensive platform initialization
  const initializePlatform = async () => {
    console.log('🚀 Initializing Sentari OS Platform...');
    
    // Initialize default modules first
    initializeDefaultModules();
    
    // Test backend connection
    await testBackendConnection();
    
    // Load real data and modules
    await Promise.all([
      loadRealDashboardData(),
      loadExistingModules()
    ]);
    
    console.log('✅ Platform initialization complete');
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      
      if (data.status === 'healthy') {
        setBackendConnected(true);
        console.log('✅ Backend connected successfully');
      } else {
        setBackendConnected(false);
        console.warn('⚠️ Backend health check failed');
      }
    } catch (error) {
      setBackendConnected(false);
      console.error('❌ Backend connection failed:', error);
    }
  };

  // Enhanced dashboard data loading with error handling
  const loadRealDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setLoadingError(null);
      
      console.log('📊 Loading real dashboard data...');
      
      const response = await fetch('http://localhost:3000/api/business-metrics');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRealDashboardData(data.metrics);
        if (data.companyName) setCompanyName(data.companyName);
        console.log('✅ Real dashboard data loaded:', data.metrics);
      } else {
        throw new Error(data.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      setLoadingError(error.message);
      // Set fallback data
      setRealDashboardData({
        monthlyRevenue: 0,
        activeGuards: 0,
        totalSites: 0,
        totalClients: 0,
        guardsOnLeave: 0,
        averageHourlyRate: 0,
        lastUpdated: null
      });
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // Enhanced module loading with better error handling
  const loadExistingModules = useCallback(async () => {
    try {
      console.log('📦 Loading existing modules...');
      
      const response = await fetch('http://localhost:3000/api/modules');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const builtModules = data.modules || [];
        const serverUserName = data.userName;
        
        console.log(`📦 Loaded ${builtModules.length} persistent modules from backend`);
        
        const convertedModules = builtModules.map(module => ({
          id: module.id,
          name: module.name,
          type: 'ai-generated',
          status: 'active',
          description: module.description,
          features: module.features || [],
          created: module.created,
          hasGPS: module.hasGPS || false,
          originalType: module.type
        }));
        
        setPlatformModules(prev => {
          const coreModules = prev.filter(m => m.type === 'core' || m.type === 'ai' || m.type === 'system');
          const newTotal = [...coreModules, ...convertedModules];
          console.log(`📊 Total modules after reload: ${newTotal.length} (${coreModules.length} core + ${convertedModules.length} AI)`);
          return newTotal;
        });
        
        if (serverUserName && serverUserName !== userName) {
          setUserName(serverUserName);
        }
      } else {
        throw new Error(data.error || 'Failed to load modules');
      }
    } catch (error) {
      console.error('❌ Failed to load existing modules:', error);
    }
  }, [userName]);

  const initializeDefaultModules = () => {
    setPlatformModules(prev => {
      const hasDefaults = prev.some(m => m.id === 'dashboard');
      if (hasDefaults) return prev;
      
      return [
        { 
          id: 'dashboard', 
          name: 'Executive Dashboard', 
          type: 'core', 
          status: 'active',
          description: 'Real-time business metrics and AI insights'
        },
        { 
          id: 'business-setup', 
          name: 'AI Business Setup', 
          type: 'ai', 
          status: 'active',
          description: 'Aetheris-powered business configuration wizard'
        },
        { 
          id: 'module-library', 
          name: 'Module Library', 
          type: 'system', 
          status: 'active',
          description: 'Manage and deploy AI-built business modules'
        }
      ];
    });
  };

  // Enhanced chat message processing
  const processChatMessage = useCallback(async () => {
    if (!currentMessage.trim() || isProcessing) return;
    
    const userMessage = currentMessage;
    setCurrentMessage('');
    setIsProcessing(true);
    
    // Add user message immediately
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    
    try {
      console.log('🎯 Sending message to Aetheris:', userMessage);
      
      const response = await fetch('http://localhost:3000/api/aetheris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          userId: userName || 'anonymous',
          companyId: companyName || 'unknown'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Aetheris response received:', result);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'aetheris',
        message: result.response || 'No response received',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Handle data changes
      if (result.dataChanges && result.dataChanges.length > 0) {
        console.log('📊 Business data changed, reloading dashboard...');
        setTimeout(() => loadRealDashboardData(), 500);
      }
      
      // Handle new modules
      if (result.newModule) {
        const newPlatformModule = {
          id: result.newModule.id,
          name: result.newModule.name,
          type: 'ai-generated',
          status: 'active',
          description: result.newModule.description,
          features: result.newModule.features || [],
          created: result.newModule.created,
          hasGPS: result.newModule.hasGPS || false,
          originalType: result.newModule.type
        };
        
        setPlatformModules(prev => {
          const exists = prev.some(m => m.id === newPlatformModule.id);
          if (exists) return prev;
          
          console.log('📦 Adding new module to frontend:', newPlatformModule.name);
          return [...prev, newPlatformModule];
        });
        
        setBuildHistory(prev => [...prev, {
          request: userMessage,
          module: newPlatformModule,
          timestamp: new Date().toISOString()
        }]);
      }
      
      // Handle user info updates
      if (result.userName && result.userName !== userName) {
        setUserName(result.userName);
        console.log('👤 User name updated:', result.userName);
      }
      
      if (result.companyName && result.companyName !== companyName) {
        setCompanyName(result.companyName);
        console.log('🏢 Company name updated:', result.companyName);
      }
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'aetheris',
        message: `**Connection Error**: ${error.message}\n\nMake sure your backend server is running on port 3000!`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      
      // Return focus to input
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100);
    }
  }, [currentMessage, isProcessing, userName, companyName, loadRealDashboardData]);

  // Enhanced module deletion with proper error handling
  const deleteModule = useCallback(async (moduleId) => {
    const moduleToDelete = platformModules.find(m => m.id === moduleId);
    if (!moduleToDelete) {
      console.error('❌ Module not found for deletion:', moduleId);
      return;
    }
    
    console.log('🗑️ Preparing to delete module:', moduleToDelete.name);
    
    setDeleteConfirmation({
      moduleId,
      moduleName: moduleToDelete.name,
      moduleType: moduleToDelete.type
    });
  }, [platformModules]);

  // Confirm and execute module deletion
  const confirmDeleteModule = useCallback(async () => {
    if (!deleteConfirmation) {
      console.error('❌ No delete confirmation found');
      return;
    }
    
    console.log('🔥 Executing module deletion:', deleteConfirmation.moduleId);
    
    try {
      const response = await fetch(`http://localhost:3000/api/modules/${deleteConfirmation.moduleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from frontend state immediately
        setPlatformModules(prev => {
          const newModules = prev.filter(m => m.id !== deleteConfirmation.moduleId);
          console.log(`📊 Modules updated: ${prev.length} → ${newModules.length}`);
          return newModules;
        });
        
        // Switch to dashboard if we deleted the active module
        if (activeModule === deleteConfirmation.moduleId) {
          setActiveModule('dashboard');
        }
        
        // Show success message
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'aetheris',
          message: `✅ Module "${deleteConfirmation.moduleName}" deleted successfully${data.backupCreated ? ' (backup created)' : ''}`,
          timestamp: new Date().toISOString()
        }]);
        
        console.log('✅ Module deletion completed successfully');
      } else {
        throw new Error(data.error || 'Failed to delete module');
      }
    } catch (error) {
      console.error('❌ Delete request failed:', error);
      
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'aetheris',
        message: `❌ Failed to delete module: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setDeleteConfirmation(null);
    }
  }, [deleteConfirmation, activeModule]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to open AI chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAiChatOpen(prev => !prev);
      }
      
      // Escape to close chat or dialogs
      if (e.key === 'Escape') {
        if (aiChatOpen) {
          setAiChatOpen(false);
        } else if (deleteConfirmation) {
          setDeleteConfirmation(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aiChatOpen, deleteConfirmation]);

  // Memoize dashboard metrics for performance
  const dashboardMetrics = useMemo(() => {
    const baseMetrics = [
      {
        label: 'Monthly Revenue',
        value: realDashboardData?.monthlyRevenue ? `$${realDashboardData.monthlyRevenue.toLocaleString()}` : '$0',
        change: realDashboardData?.monthlyRevenue > 0 ? '+14.6%' : '+0%',
        icon: '💰',
        color: '#22c55e',
        gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
      },
      {
        label: 'Active Guards',
        value: realDashboardData?.activeGuards?.toString() || '0',
        change: realDashboardData?.activeGuards > 0 ? '+7.1%' : '+0%',
        icon: '👮',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))'
      },
      {
        label: 'Client Sites',
        value: realDashboardData?.totalSites?.toString() || '0',
        change: realDashboardData?.totalSites > 0 ? '+16.7%' : '+0%',
        icon: '🏢',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
      },
      {
        label: 'Total Clients',
        value: realDashboardData?.totalClients?.toString() || '0',
        change: realDashboardData?.totalClients > 0 ? '+4.3%' : '+0%',
        icon: '🤝',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))'
      }
    ];

    return baseMetrics;
  }, [realDashboardData]);

  // Enhanced performance data
  const performanceData = useMemo(() => {
    const baseData = [
      { name: 'Jan', revenue: 425000, guards: 89, sites: 12, efficiency: 94 },
      { name: 'Feb', revenue: 468000, guards: 92, sites: 14, efficiency: 91 },
      { name: 'Mar', revenue: 510000, guards: 96, sites: 15, efficiency: 96 },
      { name: 'Apr', revenue: 485000, guards: 94, sites: 16, efficiency: 89 },
      { name: 'May', revenue: 534000, guards: 98, sites: 18, efficiency: 93 }
    ];

    const currentMonth = {
      name: 'Current',
      revenue: realDashboardData?.monthlyRevenue || 612000,
      guards: realDashboardData?.activeGuards || 105,
      sites: realDashboardData?.totalSites || 21,
      efficiency: 97
    };

    return [...baseData, currentMonth];
  }, [realDashboardData]);

  const industryData = [
    { name: 'Security Services', value: 45, color: '#3b82f6' },
    { name: 'Healthcare', value: 25, color: '#10b981' },
    { name: 'Manufacturing', value: 20, color: '#f59e0b' },
    { name: 'Retail', value: 10, color: '#ef4444' }
  ];

  // Connection Status Component
  const ConnectionStatus = () => (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      padding: '8px 12px',
      borderRadius: '20px',
      background: backendConnected 
        ? 'rgba(34, 197, 94, 0.2)' 
        : 'rgba(239, 68, 68, 0.2)',
      border: `1px solid ${backendConnected 
        ? 'rgba(34, 197, 94, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)'}`,
      color: backendConnected ? '#22c55e' : '#ef4444',
      fontSize: '12px',
      fontWeight: '600',
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: backendConnected ? '#22c55e' : '#ef4444'
      }} />
      {backendConnected ? 'Backend Connected' : 'Backend Offline'}
    </div>
  );

  // Enhanced Dashboard Component
  const Dashboard = () => (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
      minHeight: '100vh'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: 'bold', 
          color: '#3b82f6',
          marginBottom: '8px',
          textShadow: '0 0 30px rgba(59, 130, 246, 0.6)'
        }}>
          🧠 Sentari OS
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '16px' }}>
          AI-Powered Business Intelligence Platform
        </p>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            padding: '8px 16px',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '20px',
            color: '#22c55e',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            ✅ 9 AI Cores Online
          </div>
          
          <div style={{ 
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '20px',
            color: '#3b82f6',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            📦 {platformModules.filter(m => m.status === 'active').length} Modules Active
          </div>
          
          {userName && (
            <div style={{ 
              padding: '8px 16px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              color: '#8b5cf6',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              👤 Welcome, {userName}!
            </div>
          )}
          
          {companyName && (
            <div style={{ 
              padding: '8px 16px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '20px',
              color: '#f59e0b',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              🏢 {companyName}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {dashboardLoading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Loader size={48} style={{ color: '#3b82f6', marginBottom: '16px' }} className="animate-spin" />
          <p style={{ color: '#94a3b8', fontSize: '18px' }}>Loading real business data...</p>
          {loadingError && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
              Error: {loadingError}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* KPI Metrics Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {dashboardMetrics.map((kpi, index) => (
              <div key={index} style={{
                padding: '28px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 35px ${kpi.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: kpi.gradient,
                  opacity: 0.5
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <div style={{ fontSize: '32px' }}>{kpi.icon}</div>
                    <div style={{ 
                      padding: '4px 8px',
                      background: kpi.change.startsWith('+') && kpi.change !== '+0%'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(107, 114, 128, 0.2)',
                      borderRadius: '12px',
                      color: kpi.change.startsWith('+') && kpi.change !== '+0%'
                        ? '#22c55e'
                        : '#6b7280',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {kpi.change}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    color: kpi.color, 
                    marginBottom: '8px' 
                  }}>
                    {kpi.value}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>
                    {kpi.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* Performance Chart */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(12px)'
            }}>
              <h2 style={{ 
                color: '#e2e8f0', 
                fontSize: '22px', 
                marginBottom: '20px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📈 Performance Trends
                <button
                  onClick={loadRealDashboardData}
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    color: '#3b82f6',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                  title="Refresh data"
                >
                  <RefreshCw size={14} />
                </button>
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : name
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Industry Mix */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(12px)'
            }}>
              <h2 style={{ 
                color: '#e2e8f0', 
                fontSize: '22px', 
                marginBottom: '20px', 
                fontWeight: '600' 
              }}>
                🏭 Industry Mix
              </h2>
              
              {realDashboardData?.totalClients > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        formatter={(value) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div style={{ marginTop: '16px' }}>
                    {industryData.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: index < industryData.length - 1 ? '1px solid rgba(59, 130, 246, 0.1)' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: item.color
                          }} />
                          <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{item.name}</span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <p>No client data available</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Add clients to see industry breakdown
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '28px',
            backdropFilter: 'blur(12px)',
            marginBottom: '32px'
          }}>
            <h2 style={{ 
              color: '#e2e8f0', 
              fontSize: '22px', 
              marginBottom: '20px', 
              fontWeight: '600' 
            }}>
              🚀 AI-Powered Quick Actions
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              {[
                { 
                  label: 'Setup New Business', 
                  action: () => setActiveModule('business-setup'), 
                  icon: '🎤', 
                  color: '#8b5cf6',
                  description: 'Configure your business profile'
                },
                { 
                  label: 'Ask Aetheris Anything', 
                  action: () => setAiChatOpen(true), 
                  icon: '🧠', 
                  color: '#3b82f6',
                  description: 'Chat with AI assistant'
                },
                { 
                  label: 'View All Modules', 
                  action: () => setActiveModule('module-library'), 
                  icon: '📦', 
                  color: '#10b981',
                  description: 'Manage business modules'
                },
                { 
                  label: 'Reload Dashboard', 
                  action: loadRealDashboardData, 
                  icon: '🔄', 
                  color: '#f59e0b',
                  description: 'Refresh real-time data'
                }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  style={{
                    padding: '20px',
                    background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                    border: `1px solid ${action.color}30`,
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = `0 12px 35px ${action.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{action.icon}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {action.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time Business Intelligence */}
          {realDashboardData && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ 
                color: '#22c55e', 
                fontSize: '18px', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Real-Time Business Intelligence
                <div style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  marginLeft: 'auto'
                }}>
                  LIVE DATA
                </div>
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '16px' 
              }}>
                <div style={{ 
                  padding: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600' }}>
                    GUARDS ON LEAVE
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 'bold' }}>
                    {realDashboardData.guardsOnLeave || 0}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: '600' }}>
                    AVG HOURLY RATE
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 'bold' }}>
                    ${realDashboardData.averageHourlyRate?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>
                    LAST UPDATED
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 'bold' }}>
                    {realDashboardData.lastUpdated 
                      ? new Date(realDashboardData.lastUpdated).toLocaleString() 
                      : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Business Setup Component
  const BusinessSetup = () => (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#3b82f6',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          }}>
            🧠 Aetheris Business Setup
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px' }}>
            Let me understand your business and build a custom platform for you
          </p>
        </div>

        {/* Chat Interface */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          height: '500px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div 
            ref={chatMessagesRef}
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto'
            }}
          >
            {chatMessages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '16px',
                marginTop: '60px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <p style={{ marginBottom: '8px' }}>Hello! I'm Aetheris, your AI business assistant.</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Try: "My name is John" • "Build employee module" • "Show weather"
                </p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.sender === 'user' 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : 'rgba(139, 92, 246, 0.3)',
                    border: `1px solid ${msg.sender === 'user' 
                      ? 'rgba(59, 130, 246, 0.5)' 
                      : 'rgba(139, 92, 246, 0.5)'}`,
                    color: '#e2e8f0',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}>
                    {msg.message}
                    {msg.timestamp && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#94a3b8', 
                        marginTop: '4px',
                        opacity: 0.7
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.3)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Loader size={16} className="animate-spin" />
                  Aetheris is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                ref={chatInputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    processChatMessage();
                  }
                }}
                placeholder="Ask me anything: 'Build all modules', 'My name is...', 'Show guards data'..."
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '44px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                disabled={isProcessing}
                rows="1"
              />
              <button
                onClick={processChatMessage}
                disabled={isProcessing || !currentMessage.trim()}
                style={{
                  padding: '12px 16px',
                  background: isProcessing || !currentMessage.trim()
                    ? 'rgba(107, 114, 128, 0.3)' 
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: isProcessing || !currentMessage.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  minWidth: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isProcessing ? <Loader size={16} className="animate-spin" /> : '🚀'}
              </button>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '8px'
            }}>
              <span>💡 Enhanced AI + Real Data Integration</span>
              <span>Shift+Enter for new line • Ctrl+K to toggle chat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Module Library Component
  const ModuleLibrary = () => {
    const activeModules = platformModules.filter(m => m.status === 'active');
    const aiGeneratedModules = activeModules.filter(m => m.type === 'ai-generated');
    const coreModules = activeModules.filter(m => m.type !== 'ai-generated');
    
    return (
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#3b82f6',
            marginBottom: '8px'
          }}>
            📦 Module Library
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '16px',
            marginBottom: '16px'
          }}>
            {userName ? `${userName}'s Custom Platform` : 'Your AI-Built Platform'}
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setAiChatOpen(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <MessageSquare size={16} />
              Build New Module
            </button>
            
            <button
              onClick={loadExistingModules}
              style={{
                padding: '12px 24px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              Refresh Modules
            </button>
          </div>
        </div>

        {/* AI-Generated Modules Section */}
        {aiGeneratedModules.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#22c55e', 
              fontSize: '24px', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🤖 AI-Built Modules ({aiGeneratedModules.length})
              <span style={{
                fontSize: '12px',
                padding: '4px 8px',
                background: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                PERSISTENT
              </span>
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '16px' 
            }}>
              {aiGeneratedModules.map(module => (
                <div key={module.id} style={{
                  padding: '24px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    marginBottom: '12px' 
                  }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: 'rgba(34, 197, 94, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0
                    }}>
                      🤖
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        color: '#e2e8f0', 
                        fontSize: '20px', 
                        fontWeight: '600',
                        marginBottom: '4px',
                        wordWrap: 'break-word'
                      }}>
                        {module.name}
                      </h3>
                      <div style={{ 
                        color: '#94a3b8', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span>Built {module.created ? new Date(module.created).toLocaleDateString() : 'recently'}</span>
                        {module.hasGPS && (
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            color: '#f59e0b'
                          }}>
                            📍 GPS
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteModule(module.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        padding: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      }}
                      title="Delete module permanently"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <p style={{ 
                    color: '#94a3b8', 
                    fontSize: '14px', 
                    marginBottom: '16px', 
                    lineHeight: '1.5' 
                  }}>
                    {module.description}
                  </p>
                  
                  {module.features && module.features.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        color: '#22c55e', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        KEY FEATURES:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {module.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: '#22c55e',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            {feature.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        ))}
                        {module.features.length > 3 && (
                          <span style={{ 
                            color: '#94a3b8', 
                            fontSize: '10px', 
                            padding: '4px 8px' 
                          }}>
                            +{module.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setActiveModule(module.id)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Open Module
                    </button>
                    <button
                      onClick={() => {
                        setAiChatOpen(true);
                        setCurrentMessage(`Enhance my ${module.name} module with additional features`);
                      }}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#8b5cf6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Enhance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Modules Section */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '16px' }}>
            ⚡ Core Platform Modules ({coreModules.length})
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {coreModules.map(module => (
              <div key={module.id} style={{
                padding: '24px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '12px' 
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {module.type === 'ai' ? '🧠' : 
                     module.type === 'core' ? '⚡' : '📦'}
                  </div>
                  <div>
                    <h3 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: '600' }}>
                      {module.name}
                    </h3>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                      {module.type} • {module.status}
                    </div>
                  </div>
                </div>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '14px', 
                  marginBottom: '20px', 
                  lineHeight: '1.5' 
                }}>
                  {module.description}
                </p>
                <button
                  onClick={() => setActiveModule(module.id)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Open Module
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State for AI Modules */}
        {aiGeneratedModules.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px dashed rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', marginBottom: '8px' }}>
              No AI Modules Built Yet
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '24px' }}>
              Chat with Aetheris to build your first custom business module!
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
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              🧠 Start Building with AI
            </button>
          </div>
        )}
      </div>
    );
  };

  // AI Generated Module Display
  const AIGeneratedModule = ({ module }) => (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#3b82f6',
          marginBottom: '16px'
        }}>
          🤖 {module.name}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '24px' }}>
          {module.description}
        </p>
        
        {module.features && module.features.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#22c55e', fontSize: '20px', marginBottom: '16px' }}>
              ✨ AI-Generated Features
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px' 
            }}>
              {module.features.map((feature, index) => (
                <div key={index} style={{
                  padding: '16px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  color: '#22c55e'
                }}>
                  ✅ {feature.replace(/_/g, ' ').toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {module.hasGPS && (
          <div style={{
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>📍 GPS Tracking Enabled</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              This module includes GPS location tracking capabilities.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setAiChatOpen(true);
              setCurrentMessage(`Enhance my ${module.name} module`);
            }}
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
            🧠 Enhance This Module
          </button>
          <button
            onClick={() => setActiveModule('dashboard')}
            style={{
              padding: '16px 32px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#3b82f6',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced Delete Confirmation Dialog
  const DeleteConfirmationDialog = () => {
    if (!deleteConfirmation) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '8px' }}>
              Delete Module?
            </h2>
            <p style={{ color: '#e2e8f0', fontSize: '16px', marginBottom: '8px' }}>
              Are you sure you want to delete:
            </p>
            <p style={{ 
              color: '#3b82f6', 
              fontSize: '20px', 
              fontWeight: 'bold',
              marginBottom: '16px',
              wordWrap: 'break-word'
            }}>
              "{deleteConfirmation.moduleName}"
            </p>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                📦 Automatic Backup
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                A backup will be created so you can restore this module later if needed.
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setDeleteConfirmation(null)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteModule}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Module icon helper
  const getModuleIcon = (moduleId, moduleType) => {
    if (moduleId === 'dashboard') return BarChart3;
    if (moduleId === 'business-setup') return MessageSquare;
    if (moduleId === 'module-library') return Code;
    if (moduleType === 'ai') return Wrench;
    if (moduleType === 'ai-generated') return Zap;
    return Shield;
  };

  // Render active module
  const renderActiveModule = () => {
    const currentModule = platformModules.find(m => m.id === activeModule);
    
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'business-setup':
        return <BusinessSetup />;
      case 'module-library':
        return <ModuleLibrary />;
      default:
        if (currentModule && currentModule.type === 'ai-generated') {
          return <AIGeneratedModule module={currentModule} />;
        }
        return (
          <div style={{ 
            padding: '48px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
            minHeight: '100vh'
          }}>
            <h2 style={{ color: '#e2e8f0', fontSize: '28px', marginBottom: '16px' }}>
              🚧 Module Not Found
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '24px' }}>
              This module hasn't been built yet. Ask Aetheris to create it for you!
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
              🧠 Ask Aetheris to Build This
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
      {/* Connection Status */}
      <ConnectionStatus />

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
            🧠 Sentari OS
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
              🏢 {companyName}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '16px' }}>
          {platformModules.filter(m => m.status === 'active').map(module => {
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
                onMouseEnter={(e) => {
                  if (activeModule !== module.id) {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeModule !== module.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
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
            🚀 Powered by Enhanced Aetheris
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
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={aiChatOpen ? 'Close Chat' : 'Open AI Chat (Ctrl+K)'}
      >
        {aiChatOpen ? <X size={24} /> : '🧠'}
      </button>

      {/* Enhanced AI Chat Panel */}
      {aiChatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: `${chatWidth}px`,
          height: `${chatHeight}px`,
          minWidth: '400px',
          maxWidth: '800px',
          minHeight: '400px',
          maxHeight: '80vh',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          zIndex: 1000,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Chat Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '20px',
            borderBottom: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div>
              <h3 style={{ 
                color: '#3b82f6', 
                fontSize: '18px', 
                fontWeight: '600', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🧠 Chat with Aetheris
                {isProcessing && <Loader size={16} className="animate-spin" />}
              </h3>
              {userName && (
                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px', margin: 0 }}>
                  Building for {userName} • {companyName || 'Your Company'}
                </p>
              )}
            </div>
            <button
              onClick={() => setAiChatOpen(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatMessagesRef}
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              scrollBehavior: 'smooth'
            }}
          >
            {chatMessages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '14px',
                marginTop: '40px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <p style={{ marginBottom: '8px' }}>Ask me anything about your security business:</p>
                <div style={{ 
                  fontSize: '12px', 
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span>"Build all modules" • "My name is Tristen" • "Show guards"</span>
                  <span>"Add client McDonald's" • "Build payroll system"</span>
                </div>
              </div>
            )}
            
            {chatMessages.map(msg => (
              <div key={msg.id} style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: msg.sender === 'user' 
                    ? 'rgba(59, 130, 246, 0.3)' 
                    : 'rgba(139, 92, 246, 0.3)',
                  border: `1px solid ${msg.sender === 'user' 
                    ? 'rgba(59, 130, 246, 0.5)' 
                    : 'rgba(139, 92, 246, 0.5)'}`,
                  color: '#e2e8f0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {msg.message}
                  {msg.timestamp && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#94a3b8', 
                      marginTop: '4px',
                      opacity: 0.7
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.3)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Loader size={16} className="animate-spin" />
                  Aetheris is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <textarea
                ref={chatInputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    processChatMessage();
                  }
                }}
                placeholder="Ask me anything: 'Build all modules', 'My name is...', 'Show guards data'..."
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '44px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                disabled={isProcessing}
                rows="1"
              />
              <button
                onClick={processChatMessage}
                disabled={isProcessing || !currentMessage.trim() || !backendConnected}
                style={{
                  padding: '12px 16px',
                  background: isProcessing || !currentMessage.trim() || !backendConnected
                    ? 'rgba(107, 114, 128, 0.3)' 
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: isProcessing || !currentMessage.trim() || !backendConnected ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  minWidth: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isProcessing ? <Loader size={16} className="animate-spin" /> : '🚀'}
              </button>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <span>💡 Enhanced AI + Real Data + Fixed Deletion</span>
              <span>Shift+Enter for new line • Esc to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog />

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes slideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Scrollbar styling */
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default SentariOS;