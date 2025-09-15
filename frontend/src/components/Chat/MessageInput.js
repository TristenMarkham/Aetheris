// src/components/Chat/MessageInput.js
import React, { useState, useRef } from 'react';
import { Loader } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled, userName, companyName }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!currentMessage.trim() || disabled) return;
    
    onSendMessage(currentMessage);
    setCurrentMessage('');
    
    // Return focus to input after a brief delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <textarea
          ref={inputRef}
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything: 'Build all modules', 'My name is...', 'Show profit analysis'..."
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
          disabled={disabled}
          rows="1"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !currentMessage.trim()}
          style={{
            padding: '12px 16px',
            background: disabled || !currentMessage.trim()
              ? 'rgba(107, 114, 128, 0.3)' 
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            cursor: disabled || !currentMessage.trim() ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            minWidth: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {disabled ? <Loader size={16} className="animate-spin" /> : '🚀'}
        </button>
      </div>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <span>💡 Enhanced AI + File Analysis + Confirmations</span>
        <span>Shift+Enter for new line • Esc to close</span>
      </div>
    </div>
  );
};

export default MessageInput; 
