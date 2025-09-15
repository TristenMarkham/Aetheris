// src/components/FileUpload/FileDropZone.js
import React from 'react';
import { Loader } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';

const FileDropZone = ({ onFileAnalyzed, className, style }) => {
  const {
    isDragging,
    isProcessing,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useFileUpload(onFileAnalyzed);

  return (
    <div 
      style={{
        border: isDragging ? '2px solid #3b82f6' : '2px dashed rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        background: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)',
        transition: 'all 0.3s ease',
        margin: '16px 0',
        ...style
      }}
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isProcessing ? (
        <div>
          <Loader size={32} className="animate-spin" style={{ color: '#3b82f6', marginBottom: '12px' }} />
          <p style={{ color: '#94a3b8' }}>AI analyzing your file...</p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
          <h4 style={{ color: '#e2e8f0', marginBottom: '8px' }}>
            Drop your file here for AI analysis
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '12px' }}>
            Supports CSV, Excel, JSON, TXT files
          </p>
        </div>
      )}
    </div>
  );
};

export default FileDropZone; 
