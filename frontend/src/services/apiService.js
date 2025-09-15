// src/services/apiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Business Data APIs
  async getBusinessData() {
    return this.request('/api/business-data');
  }

  async updateBusinessData(data) {
    return this.request('/api/business-data', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Employee APIs
  async getEmployees() {
    return this.request('/api/employees');
  }

  async createEmployee(employeeData) {
    return this.request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(id) {
    return this.request(`/api/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat APIs
  async sendChatMessage(message) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChatHistory() {
    return this.request('/api/chat/history');
  }

  // Module APIs
  async getModules() {
    return this.request('/api/modules');
  }

  async createModule(moduleData) {
    return this.request('/api/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  }

  async deleteModule(id) {
    return this.request(`/api/modules/${id}`, {
      method: 'DELETE',
    });
  }

  // File Upload APIs
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Analytics APIs
  async getAnalytics() {
    return this.request('/api/analytics');
  }

  async getPerformanceMetrics() {
    return this.request('/api/metrics');
  }
}

// Export singleton instance
export default new ApiService(); 
