// src/components/Chat/ChatPanel.js - Complete File with Data Refresh
import React from 'react';
import { X, History, RefreshCw } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '../../hooks/useChat';
import { CHAT_CONFIG } from '../../utils/constants';

const ChatPanel = ({ 
  isOpen, 
  onClose, 
  userName, 
  companyName,
  fileAnalysisResult,
  onDataChanged
}) => {
  // FIXED: Pass onDataChanged to useChat hook
  const {
    messages,
    isLoading,
    showHistory,
    sendMessage,
    loadChatHistory,
    startFreshChat
  } = useChat(onDataChanged);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '24px',
      width: `${CHAT_CONFIG.DEFAULT_WIDTH}px`,
      height: `${CHAT_CONFIG.DEFAULT_HEIGHT}px`,
      minWidth: `${CHAT_CONFIG.MIN_WIDTH}px`,
      maxWidth: `${CHAT_CONFIG.MAX_WIDTH}px`,
      minHeight: `${CHAT_CONFIG.MIN_HEIGHT}px`,
      maxHeight: `${CHAT_CONFIG.MAX_HEIGHT_VH}vh`,
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
            Chat with Aetheris
          </h3>
          {userName && (
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px', margin: 0 }}>
              Building for {userName} • {companyName || 'Your Company'}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* History Controls */}
          {!showHistory && (
            <button
              onClick={() => loadChatHistory(20)}
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '6px',
                color: '#22c55e',
                cursor: 'pointer',
                padding: '6px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                fontSize: '11px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
              }}
              title="Load recent chat history"
            >
              <History size={14} />
            </button>
          )}
          
          {showHistory && (
            <button
              onClick={startFreshChat}
              style={{
                background: 'rgba(249, 115, 22, 0.2)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                borderRadius: '6px',
                color: '#f97316',
                cursor: 'pointer',
                padding: '6px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                fontSize: '11px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)';
              }}
              title="Start fresh chat"
            >
              <RefreshCw size={14} />
            </button>
          )}
          
          <button
            onClick={onClose}
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
      </div>
      
      {/* History Indicator */}
      {showHistory && (
        <div style={{
          padding: '8px 20px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
          color: '#22c55e',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          📜 Showing recent chat history
        </div>
      )}
      
      {/* Chat Messages */}
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        style={{ flex: 1 }}
      />
      
      {/* Chat Input */}
      <MessageInput 
        onSendMessage={sendMessage}
        disabled={isLoading}
        userName={userName}
        companyName={companyName}
      />
    </div>
  );
};

export default ChatPanel;