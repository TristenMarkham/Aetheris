 
// src/utils/constants.js

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
};

export const CHAT_CONFIG = {
  DEFAULT_WIDTH: 450,
  DEFAULT_HEIGHT: 600,
  MIN_WIDTH: 400,
  MAX_WIDTH: 800,
  MIN_HEIGHT: 400,
  MAX_HEIGHT_VH: 80
};

export const DEFAULT_MODULES = [
  { 
    id: 'dashboard', 
    name: 'Executive Dashboard', 
    type: 'core', 
    status: 'active',
    description: 'Real-time business metrics and AI insights'
  },
  { 
    id: 'business-setup', 
    name: 'AI Business Setup', 
    type: 'ai', 
    status: 'active',
    description: 'Aetheris-powered business configuration wizard'
  },
  { 
    id: 'module-library', 
    name: 'Module Library', 
    type: 'system', 
    status: 'active',
    description: 'Manage and deploy AI-built business modules'
  },
  { 
    id: 'ai-assistant', 
    name: 'AI Business Assistant', 
    type: 'ai', 
    status: 'active',
    description: 'Advanced AI features and business intelligence'
  }
];

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444'
};