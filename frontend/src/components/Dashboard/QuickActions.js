// src/components/Dashboard/QuickActions.js
import React from 'react';

const QuickActions = ({ onModuleChange, onChatOpen, onRefreshData }) => {
  const actions = [
    { 
      label: 'Setup New Business', 
      action: () => onModuleChange('business-setup'), 
      icon: '🎤', 
      color: '#8b5cf6',
      description: 'Configure your business profile'
    },
    { 
      label: 'Ask Aetheris Anything', 
      action: onChatOpen, 
      icon: '🧠', 
      color: '#3b82f6',
      description: 'Chat with AI assistant'
    },
    { 
      label: 'View All Modules', 
      action: () => onModuleChange('module-library'), 
      icon: '📦', 
      color: '#10b981',
      description: 'Manage business modules'
    },
    { 
      label: 'Reload Dashboard', 
      action: onRefreshData, 
      icon: '🔄', 
      color: '#f59e0b',
      description: 'Refresh real-time data'
    }
  ];

  return (
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
        {actions.map((action, index) => (
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
  );
};

export default QuickActions; 
