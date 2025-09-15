// src/components/Dashboard/Dashboard.js
import React from 'react';
import { RefreshCw, Loader } from 'lucide-react';
import BusinessMetrics from './BusinessMetrics';
import PerformanceCharts from './PerformanceCharts';
import QuickActions from './QuickActions';
import AIBusinessAssistant from '../AI/AIBusinessAssistant';
import FileDropZone from '../FileUpload/FileDropZone';
import { useBusinessData } from '../../hooks/useBusinessData';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = ({ 
  userName, 
  companyName,
  onModuleChange,
  onChatOpen,
  onFileAnalyzed
}) => {
  const { businessData, isLoading, error, refreshData, derivedMetrics } = useBusinessData();

  if (isLoading) {
    return (
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Loader size={48} style={{ color: '#3b82f6', marginBottom: '16px' }} className="animate-spin" />
          <p style={{ color: '#94a3b8', fontSize: '18px' }}>Loading real business data...</p>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
              Error: {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
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
        
        {/* Status Indicators */}
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
            📦 {derivedMetrics.totalModules} Modules Active
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

      {/* Business Metrics */}
      <BusinessMetrics data={businessData} onRefresh={refreshData} />

      {/* AI Business Assistant */}
      <AIBusinessAssistant 
        userName={userName}
        companyName={companyName}
        onChatOpen={onChatOpen}
      />

      {/* File Drop Zone */}
      <FileDropZone onFileAnalyzed={onFileAnalyzed} />

      {/* Performance Charts */}
      <PerformanceCharts data={businessData} />

      {/* Quick Actions */}
      <QuickActions 
        onModuleChange={onModuleChange}
        onChatOpen={onChatOpen}
        onRefreshData={refreshData}
      />

      {/* Real-Time Intelligence */}
      {businessData.analytics && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '32px'
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
                EMPLOYEES ON LEAVE
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 'bold' }}>
                {businessData.analytics.employeesOnLeave || 0}
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
                {formatCurrency(businessData.analytics.averageHourlyRate || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {businessData.lastUpdated 
                  ? formatDate(businessData.lastUpdated, { includeTime: true, timeStyle: 'short' })
                  : 'Never'}
              </div>
            </div>

            {businessData.analytics.grossProfit > 0 && (
              <div style={{ 
                padding: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px'
              }}>
                <div style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: '600' }}>
                  GROSS PROFIT
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 'bold' }}>
                  {formatCurrency(businessData.analytics.grossProfit)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
