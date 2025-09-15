// src/components/Common/ConnectionStatus.js
import React from 'react';

const ConnectionStatus = ({ isConnected, className, style }) => (
  <div style={{
    position: 'fixed',
    top: '16px',
    right: '16px',
    padding: '8px 12px',
    borderRadius: '20px',
    background: isConnected 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(239, 68, 68, 0.2)',
    border: `1px solid ${isConnected 
      ? 'rgba(34, 197, 94, 0.3)' 
      : 'rgba(239, 68, 68, 0.3)'}`,
    color: isConnected ? '#22c55e' : '#ef4444',
    fontSize: '12px',
    fontWeight: '600',
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ...style
  }}
  className={className}
  >
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: isConnected ? '#22c55e' : '#ef4444'
    }} />
    {isConnected ? 'Backend Connected' : 'Backend Offline'}
  </div>
);

export default ConnectionStatus;