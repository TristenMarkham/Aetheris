// src/hooks/useFileUpload.js
import { useState } from 'react';

export const useFileUpload = (onFileAnalyzed) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    console.log('File dropped - placeholder functionality');
  };

  return {
    isDragging,
    isProcessing,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}; 
