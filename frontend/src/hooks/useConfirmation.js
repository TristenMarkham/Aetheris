// src/hooks/useConfirmation.js
import { useState, useCallback } from 'react';

export const useConfirmation = (userName, companyName) => {
  const [activeConfirmation, setActiveConfirmation] = useState(null);
  const [pendingConfirmations, setPendingConfirmations] = useState(new Map());

  // Process confirmation responses (yes/no/corrections)
  const processConfirmationResponse = useCallback(async (message, confirmationId = null) => {
    const messageLower = message.toLowerCase().trim();
    
    const confirmKeywords = ['yes', 'confirm', 'ok', 'correct', 'looks good', 'approve', 'yep', 'yeah', 'sure', 'affirmative', 'add it', 'go ahead', 'proceed'];
    const cancelKeywords = ['no', 'cancel', 'wrong', 'incorrect', 'stop', 'nope', 'not right', 'abort'];
    const correctionPatterns = ['actually', 'change', 'update', 'fix', 'should be', 'meant to', 'correct'];
    
    const isConfirm = confirmKeywords.some(keyword => messageLower.includes(keyword));
    const isCancel = cancelKeywords.some(keyword => messageLower.includes(keyword));
    const isCorrection = correctionPatterns.some(pattern => messageLower.includes(pattern));
    
    // For now, return a simple response - you can implement full logic later
    if (!isConfirm && !isCancel) {
      return null; // Not a confirmation response
    }
    
    // Clear active confirmation
    setActiveConfirmation(null);
    
    return {
      type: isConfirm ? 'confirmed' : 'cancelled',
      message: isConfirm ? 'Confirmed' : 'Cancelled'
    };
  }, [activeConfirmation, userName, companyName]);

  // Set a new confirmation
  const setConfirmation = useCallback((confirmation) => {
    setActiveConfirmation(confirmation);
  }, []);

  // Clear current confirmation
  const clearConfirmation = useCallback(() => {
    setActiveConfirmation(null);
  }, []);

  return {
    activeConfirmation,
    processConfirmationResponse,
    setConfirmation: setConfirmation,
    clearConfirmation
  };
};