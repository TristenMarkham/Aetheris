// src/hooks/useChat.js - Complete File with Dashboard Data Refresh
import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

export const useChat = (onDataChanged) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [allHistory, setAllHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Start with empty chat - no automatic history loading
  useEffect(() => {
    console.log('💬 Chat initialized - starting fresh');
    setMessages([]);
  }, []);

  // Load chat history manually when requested
  const loadChatHistory = useCallback(async (maxMessages = 20) => {
    try {
      console.log('🔄 Loading chat history on request...');
      const response = await fetch(`${API_BASE}/api/chat/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const history = await response.json();
      console.log('📜 Chat history loaded:', history.length, 'messages');
      
      // Transform and limit messages
      const transformedHistory = Array.isArray(history) ? history
        .slice(-maxMessages) // Take last N messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message || '',
          timestamp: msg.timestamp,
          id: msg.id || Date.now() + Math.random(),
          sender: msg.sender,
          isHistorical: true // Mark as historical messages
        })) : [];
      
      // Replace current messages with historical messages
      setMessages(transformedHistory);
      setAllHistory(transformedHistory);
      setShowHistory(true);
      
      console.log('✅ Chat history loaded:', transformedHistory.length, 'messages');
      return transformedHistory;
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
      return [];
    }
  }, []);

  // Clear all messages and start fresh
  const startFreshChat = useCallback(() => {
    setMessages([]);
    setAllHistory([]);
    setShowHistory(false);
    setPendingConfirmation(null);
    setIsWaitingForConfirmation(false);
    console.log('🆕 Started fresh chat');
  }, []);

  // Send message to chat API
  const sendMessage = useCallback(async (messageText, isConfirmation = false) => {
    if (!messageText.trim() && !isConfirmation) return;

    console.log('📤 Sending message:', messageText);

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      id: Date.now(),
      sender: 'user'
    };

    // Add user message to chat immediately
    if (!isConfirmation) {
      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/aetheris/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          userId: 'tristen',
          companyId: 'Markham Investigation & Protection'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
          throw new Error('Received HTML instead of JSON - API endpoint issue');
        }
        throw new Error(`Expected JSON, got ${contentType}`);
      }

      const result = await response.json();
console.log('🔥 Chat response:', result);
console.log('🔍 Checking for dataChanges:', result.dataChanges);
console.log('🔍 DataChanges length:', result.dataChanges?.length);
      
      // NEW: Check for data changes and trigger dashboard refresh
      if (result.dataChanges && result.dataChanges.length > 0) {
        console.log('📊 Data changes detected:', result.dataChanges);
        
        // Notify dashboard to refresh with a small delay to ensure backend save is complete
        if (onDataChanged) {
          setTimeout(() => {
            console.log('🔄 Triggering dashboard refresh...');
            onDataChanged();
          }, 100);
        }
      }
      
      // Handle confirmation requests
      if (result.requiresConfirmation) {
        setPendingConfirmation(result.confirmationData);
        setIsWaitingForConfirmation(true);
        
        const confirmationMessage = {
          role: 'assistant',
          content: result.response || result.message,
          timestamp: new Date().toISOString(),
          id: Date.now() + 1,
          requiresConfirmation: true,
          sender: 'aetheris'
        };
        
        setMessages(prev => [...prev, confirmationMessage]);
      } else {
        // Regular response - handle both response and message fields
        const responseText = result.response || result.message || 'No response received';
        
        const assistantMessage = {
          role: 'assistant',
          content: responseText,
          timestamp: result.timestamp || new Date().toISOString(),
          id: Date.now() + 1,
          sender: 'aetheris',
          coresUsed: result.coresUsed || [],
          newModule: result.newModule || null,
          dataChanges: result.dataChanges || [] // Include data changes info for debugging
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Clear any pending confirmations
        setPendingConfirmation(null);
        setIsWaitingForConfirmation(false);
      }

      return result;

    } catch (error) {
      console.error('❌ Chat error:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check that your backend server is running on port 3000.`,
        timestamp: new Date().toISOString(),
        id: Date.now() + 1,
        error: true,
        sender: 'aetheris'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return { error: error.message };

    } finally {
      setIsLoading(false);
    }
  }, [onDataChanged]); // Add onDataChanged to dependencies

  // Handle confirmation responses
  const handleConfirmation = useCallback(async (confirmed) => {
    if (!pendingConfirmation) return;

    const confirmationText = confirmed ? 'yes' : 'no';
    
    // Add user's confirmation to chat
    const confirmationMessage = {
      role: 'user',
      content: `Confirmation: ${confirmationText}`,
      timestamp: new Date().toISOString(),
      id: Date.now(),
      isConfirmation: true,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Send confirmation to backend
    const result = await sendMessage(confirmationText, true);
    
    // Clear confirmation state
    setPendingConfirmation(null);
    setIsWaitingForConfirmation(false);
    
    return result;
  }, [pendingConfirmation, sendMessage]);

  // Cancel pending confirmation
  const cancelConfirmation = useCallback(() => {
    setPendingConfirmation(null);
    setIsWaitingForConfirmation(false);
    
    const cancelMessage = {
      role: 'assistant',
      content: 'Action cancelled.',
      timestamp: new Date().toISOString(),
      id: Date.now(),
      sender: 'aetheris'
    };
    
    setMessages(prev => [...prev, cancelMessage]);
  }, []);

  // Retry last message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.sender === 'user');
    
    if (lastUserMessage) {
      console.log('🔄 Retrying last message:', lastUserMessage.content);
      return sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // Test connection
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection test successful:', data);
        return { success: true, data };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    messages,
    isLoading,
    pendingConfirmation,
    isWaitingForConfirmation,
    messagesEndRef,
    showHistory,
    allHistory,
    sendMessage,
    handleConfirmation,
    cancelConfirmation,
    loadChatHistory,
    startFreshChat,
    retryLastMessage,
    testConnection,
    clearChat: startFreshChat // Alias for backward compatibility
  };
};