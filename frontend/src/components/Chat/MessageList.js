// src/components/Chat/MessageList.js
import React, { useRef, useEffect } from 'react';
import { Loader } from 'lucide-react';

const MessageList = ({ messages, isLoading, style }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={messagesEndRef}
      style={{
        padding: '16px',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        ...style
      }}
    >
      {messages.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '14px',
          marginTop: '40px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <p style={{ marginBottom: '8px' }}>Ask me anything about your business:</p>
          <div style={{ 
            fontSize: '12px', 
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span>"Build all modules" • "My name is Tristen" • "Show profit analysis"</span>
            <span>"Add client McDonald's" • "Upload employee data" • "Business intelligence"</span>
          </div>
        </div>
      ) : (
        messages.map(msg => (
          <div key={msg.id} style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: msg.sender === 'user' || msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: (msg.sender === 'user' || msg.role === 'user')
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'rgba(139, 92, 246, 0.3)',
              border: `1px solid ${(msg.sender === 'user' || msg.role === 'user')
                ? 'rgba(59, 130, 246, 0.5)' 
                : 'rgba(139, 92, 246, 0.5)'}`,
              color: '#e2e8f0',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {/* 🔧 FIXED: Check both content and message properties */}
              {msg.content || msg.message || 'No message content'}
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
      
      {isLoading && (
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
  );
};

export default MessageList;