const fs = require('fs').promises;
const path = require('path');

// FIXED: Properly go up one directory level from services/ to backend/
const BACKEND_PATH = path.join(__dirname, '..');
const COMPANIES_DIR = path.join(BACKEND_PATH, 'companies');

class DataService {
  // UTILITY FUNCTIONS
  getCompanyDir(companyId) {
    return path.join(COMPANIES_DIR, companyId);
  }

  getCompanyDataFile(companyId) {
    return path.join(this.getCompanyDir(companyId), 'company_data.json');
  }

  getUserChatFile(companyId, userId) {
    return path.join(this.getCompanyDir(companyId), 'users', `${userId}_chat.json`);
  }

  // DEFAULT COMPANY DATA CREATION
  createDefaultCompanyData(companyId) {
    const companyInfo = {
      id: companyId,
      name: companyId === 'markham_investigation' ? 'Markham Investigation & Protection' : 
            companyId.includes('security') ? `${companyId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Security` :
            `${companyId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      industry: companyId.includes('security') ? 'security' : 'general',
      founded: new Date().toISOString(),
      settings: {}
    };

    // Start with empty data - no hard-coded employees/clients
    return {
      companyInfo,
      employees: [], // Start empty - let users add their actual data
      clients: [],   // Start empty - let users add their actual clients
      sites: [],     // Start empty - let users add their actual sites
      platformModules: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // ENHANCED COMPANY DATA MANAGEMENT - FIXED VERSION
  async loadCompanyData(companyId) {
    try {
      const companyDataFile = this.getCompanyDataFile(companyId);
      console.log(`DATASERVICE: Attempting to load company data from: ${companyDataFile}`);
      
      // Check if file exists first
      try {
        await fs.access(companyDataFile);
        console.log(`DATASERVICE: File exists: ${companyDataFile}`);
      } catch (accessError) {
        console.log(`DATASERVICE: File does not exist: ${companyDataFile}`);
        console.log(`DATASERVICE: Creating new company data for: ${companyId}`);
        const defaultData = this.createDefaultCompanyData(companyId);
        await this.saveCompanyData(companyId, defaultData);
        return defaultData;
      }
      
      // Try to read the file
      const data = await fs.readFile(companyDataFile, 'utf8');
      console.log(`DATASERVICE: Successfully read file, size: ${data.length} characters`);
      
      // Try to parse JSON
      const parsedData = JSON.parse(data);
      console.log(`DATASERVICE: Successfully parsed JSON`);
      console.log(`DATASERVICE: Loaded company data: ${parsedData.employees?.length || 0} employees, ${parsedData.clients?.length || 0} clients`);
      
      // Validate the data structure
      if (!parsedData.employees) {
        console.log(`DATASERVICE: Warning - No employees array found, adding empty array`);
        parsedData.employees = [];
      }
      if (!parsedData.clients) {
        console.log(`DATASERVICE: Warning - No clients array found, adding empty array`);
        parsedData.clients = [];
      }
      if (!parsedData.sites) {
        console.log(`DATASERVICE: Warning - No sites array found, adding empty array`);
        parsedData.sites = [];
      }
      if (!parsedData.platformModules) {
        console.log(`DATASERVICE: Warning - No platformModules array found, adding empty array`);
        parsedData.platformModules = [];
      }
      
      return parsedData;
      
    } catch (error) {
      console.error(`DATASERVICE: CRITICAL ERROR loading company data for ${companyId}:`);
      console.error(`DATASERVICE: Error type: ${error.name}`);
      console.error(`DATASERVICE: Error message: ${error.message}`);
      console.error(`DATASERVICE: File path attempted: ${this.getCompanyDataFile(companyId)}`);
      
      // Only create default data if we're absolutely sure the file doesn't exist
      // or is completely corrupted
      if (error.code === 'ENOENT') {
        console.log(`DATASERVICE: File not found, creating new default data for: ${companyId}`);
        const defaultData = this.createDefaultCompanyData(companyId);
        await this.saveCompanyData(companyId, defaultData);
        return defaultData;
      } else {
        // For other errors (permission, parsing, etc.), throw them so we can debug
        console.error(`DATASERVICE: Refusing to create default data due to unexpected error`);
        throw error;
      }
    }
  }

  async saveCompanyData(companyId, data) {
    try {
      const companyDir = this.getCompanyDir(companyId);
      console.log(`DATASERVICE: Ensuring company directory exists: ${companyDir}`);
      await fs.mkdir(companyDir, { recursive: true });
      
      const companyDataFile = this.getCompanyDataFile(companyId);
      data.lastUpdated = new Date().toISOString();
      
      console.log(`DATASERVICE: Saving company data to: ${companyDataFile}`);
      await fs.writeFile(companyDataFile, JSON.stringify(data, null, 2));
      console.log(`DATASERVICE: Successfully saved company data for: ${companyId}`);
      console.log(`DATASERVICE: Data saved: ${data.employees?.length || 0} employees, ${data.clients?.length || 0} clients`);
    } catch (error) {
      console.error(`DATASERVICE: FAILED to save company data for ${companyId}:`);
      console.error(`DATASERVICE: Error: ${error.message}`);
      console.error(`DATASERVICE: File path: ${this.getCompanyDataFile(companyId)}`);
      throw error; // Re-throw so calling code knows save failed
    }
  }

  // USER CHAT DATA MANAGEMENT
  async loadUserChat(companyId, userId) {
    try {
      const userChatFile = this.getUserChatFile(companyId, userId);
      const data = await fs.readFile(userChatFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {
        userId, 
        companyId, 
        chatHistory: [], 
        personalInfo: {}, 
        preferences: {}, 
        lastActivity: new Date().toISOString()
      };
    }
  }

  async saveUserChat(companyId, userId, chatData) {
    try {
      const companyDir = this.getCompanyDir(companyId);
      const usersDir = path.join(companyDir, 'users');
      await fs.mkdir(usersDir, { recursive: true });
      
      const userChatFile = this.getUserChatFile(companyId, userId);
      chatData.lastActivity = new Date().toISOString();
      await fs.writeFile(userChatFile, JSON.stringify(chatData, null, 2));
    } catch (error) {
      console.error(`DATASERVICE: Failed to save chat for ${userId}:`, error.message);
    }
  }

  // PERSONAL INFO FUNCTIONS
  async updateUserPersonalInfo(companyId, userId, info_type, info_key, info_value) {
    try {
      const userChatData = await this.loadUserChat(companyId, userId);
      
      if (!userChatData.personalInfo) userChatData.personalInfo = {};
      if (!userChatData.personalInfo[info_type]) userChatData.personalInfo[info_type] = {};
      
      userChatData.personalInfo[info_type][info_key] = info_value;
      await this.saveUserChat(companyId, userId, userChatData);
      
      console.log(`DATASERVICE: Updated personal info for ${userId}: ${info_type}.${info_key} = ${info_value}`);
      return { success: true, personalInfo: userChatData.personalInfo };
    } catch (error) {
      console.error(`DATASERVICE: Failed to update personal info:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async getUserPersonalInfo(companyId, userId) {
    try {
      const userChatData = await this.loadUserChat(companyId, userId);
      return { 
        success: true, 
        personalInfo: userChatData.personalInfo || {},
        preferences: userChatData.preferences || {},
        uiPreferences: userChatData.uiPreferences || {}
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUIPreferences(companyId, userId, uiSettings) {
    try {
      const userChatData = await this.loadUserChat(companyId, userId);
      if (!userChatData.uiPreferences) userChatData.uiPreferences = {};
      Object.assign(userChatData.uiPreferences, uiSettings);
      await this.saveUserChat(companyId, userId, userChatData);
      return { success: true, uiPreferences: userChatData.uiPreferences };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // COMPANY USERS MANAGEMENT
  async getCompanyUsers(companyId) {
    try {
      const companyDir = this.getCompanyDir(companyId);
      const usersDir = path.join(companyDir, 'users');
      
      try {
        const userFiles = await fs.readdir(usersDir);
        const users = [];
        
        for (const file of userFiles) {
          if (file.endsWith('_chat.json')) {
            const userId = file.replace('_chat.json', '');
            const userData = await this.loadUserChat(companyId, userId);
            users.push({
              userId,
              lastActivity: userData.lastActivity,
              messageCount: userData.chatHistory?.length || 0,
              personalInfo: userData.personalInfo || {}
            });
          }
        }
        
        return { success: true, users };
      } catch (error) {
        return { success: true, users: [] };
      }
    } catch (error) {
      console.error(`DATASERVICE: Failed to get company users:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // DEBUG FUNCTIONS
  async debugCompanyData(companyId) {
    try {
      console.log(`DATASERVICE: DEBUG - Loading company data for ${companyId}`);
      
      const companyDataFile = this.getCompanyDataFile(companyId);
      console.log(`DATASERVICE: DEBUG - File path: ${companyDataFile}`);
      
      const rawData = await fs.readFile(companyDataFile, 'utf8');
      console.log(`DATASERVICE: DEBUG - Raw data length: ${rawData.length}`);
      
      const parsedData = JSON.parse(rawData);
      
      console.log(`DATASERVICE: Employees found: ${parsedData.employees?.length || 0}`);
      console.log(`DATASERVICE: Clients found: ${parsedData.clients?.length || 0}`);
      
      if (parsedData.employees?.length > 0) {
        console.log(`DATASERVICE: First employee: ${parsedData.employees[0].name}`);
        console.log(`DATASERVICE: All employees:`, parsedData.employees.map(e => `${e.name} (ID: ${e.id})`));
      }
      
      if (parsedData.clients?.length > 0) {
        console.log(`DATASERVICE: First client: ${parsedData.clients[0].name}`);
      }
      
      return {
        success: true,
        debug: {
          filePath: companyDataFile,
          fileSize: rawData.length,
          employeeCount: parsedData.employees?.length || 0,
          clientCount: parsedData.clients?.length || 0,
          employees: parsedData.employees?.map(e => ({ id: e.id, name: e.name, status: e.status })) || [],
          clients: parsedData.clients?.map(c => ({ id: c.id, name: c.name, revenue: c.monthly_revenue || 0 })) || []
        }
      };
    } catch (error) {
      console.error('DATASERVICE: DEBUG - Failed to load company data:', error.message);
      return { success: false, error: error.message, filePath: this.getCompanyDataFile(companyId) };
    }
  }

  // INITIALIZATION
  async ensureDirectoriesExist() {
    try {
      await fs.mkdir(COMPANIES_DIR, { recursive: true });
      console.log('DATASERVICE: Data service directories initialized');
      console.log(`DATASERVICE: Companies directory: ${COMPANIES_DIR}`);
      console.log(`DATASERVICE: Backend path: ${BACKEND_PATH}`);
    } catch (error) {
      console.error('DATASERVICE: Failed to create data directories:', error.message);
    }
  }
}

module.exports = new DataService();