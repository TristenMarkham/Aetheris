// src/components/Common/ConfirmationIndicator.js
import React from 'react';

const ConfirmationIndicator = ({ activeConfirmation, onClear }) => {
  if (!activeConfirmation) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '16px',
      background: 'rgba(245, 158, 11, 0.9)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#f59e0b',
      fontSize: '12px',
      fontWeight: '600',
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '300px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#f59e0b',
        animation: 'pulse 2s infinite'
      }} />
      Waiting for confirmation...
      <button
        onClick={onClear}
        style={{
          background: 'none',
          border: 'none',
          color: '#f59e0b',
          cursor: 'pointer',
          fontSize: '14px',
          marginLeft: '8px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ConfirmationIndicator; 
