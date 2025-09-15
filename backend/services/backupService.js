const fs = require('fs').promises;
const path = require('path');

const BACKEND_PATH = __dirname.replace('/services', '');
const BACKUPS_DIR = path.join(BACKEND_PATH, 'backups');

class BackupService {
  // INITIALIZATION
  async ensureBackupDir() {
    try {
      await fs.mkdir(BACKUPS_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create backup directory:', error.message);
    }
  }

  // BACKUP CREATION
  async createBackup(companyId, backupType, data, description = '') {
    try {
      await this.ensureBackupDir();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${companyId}_${backupType}_${timestamp}.json`;
      const backupFilePath = path.join(BACKUPS_DIR, backupFileName);
      
      const backupData = {
        companyId,
        backupType,
        description,
        timestamp: new Date().toISOString(),
        createdBy: 'system', // Could be passed as parameter if needed
        data: data
      };
      
      await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2));
      
      console.log(`Backup created: ${backupFileName}`);
      return { 
        success: true, 
        backupFile: backupFileName,
        backupPath: backupFilePath,
        timestamp 
      };
    } catch (error) {
      console.error('Failed to create backup:', error.message);
      return { success: false, error: error.message };
    }
  }

  // BACKUP LISTING
  async listBackups(companyId = null) {
    try {
      await this.ensureBackupDir();
      
      const backupFiles = await fs.readdir(BACKUPS_DIR);
      const backups = [];
      
      for (const file of backupFiles) {
        if (file.endsWith('.json') && (!companyId || file.startsWith(companyId))) {
          try {
            const backupPath = path.join(BACKUPS_DIR, file);
            const backupContent = await fs.readFile(backupPath, 'utf8');
            const backupData = JSON.parse(backupContent);
            
            backups.push({
              fileName: file,
              companyId: backupData.companyId,
              backupType: backupData.backupType,
              description: backupData.description,
              timestamp: backupData.timestamp,
              createdBy: backupData.createdBy,
              itemCount: Array.isArray(backupData.data) ? backupData.data.length : 1,
              fileSizeBytes: await this.getFileSize(backupPath)
            });
          } catch (parseError) {
            console.warn(`Skipping invalid backup file: ${file}`);
          }
        }
      }
      
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { success: true, backups };
    } catch (error) {
      console.error('Failed to list backups:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // BACKUP RESTORATION
  async restoreFromBackup(backupFileName, mergeWithExisting = true) {
    try {
      const backupPath = path.join(BACKUPS_DIR, backupFileName);
      
      // Check if backup file exists
      try {
        await fs.access(backupPath);
      } catch (error) {
        return { success: false, error: 'Backup file not found' };
      }
      
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);
      
      // Import dataService here to avoid circular dependency
      const dataService = require('./dataService');
      const companyData = await dataService.loadCompanyData(backupData.companyId);
      
      let restoredCount = 0;
      let message = '';
      
      if (backupData.backupType === 'modules') {
        if (mergeWithExisting) {
          const existingModuleIds = companyData.platformModules.map(m => m.id);
          const restoredModules = backupData.data.filter(module => 
            !existingModuleIds.includes(module.id)
          );
          
          companyData.platformModules.push(...restoredModules);
          restoredCount = restoredModules.length;
          message = `Restored ${restoredModules.length} modules (merged with existing)`;
        } else {
          companyData.platformModules = backupData.data;
          restoredCount = backupData.data.length;
          message = `Restored ${backupData.data.length} modules (replaced existing)`;
        }
        
        await dataService.saveCompanyData(backupData.companyId, companyData);
        
        return { 
          success: true, 
          message: message,
          restoredCount: restoredCount,
          mergeMode: mergeWithExisting
        };
      } else if (backupData.backupType === 'employee_record') {
        // Handle single employee record restoration
        const employee = backupData.data;
        const existingEmployeeIndex = companyData.employees.findIndex(e => e.id === employee.id);
        
        if (existingEmployeeIndex >= 0 && mergeWithExisting) {
          return { success: false, error: 'Employee already exists. Use replace mode to overwrite.' };
        } else if (existingEmployeeIndex >= 0) {
          companyData.employees[existingEmployeeIndex] = employee;
          message = `Restored employee: ${employee.name} (replaced existing)`;
        } else {
          companyData.employees.push(employee);
          message = `Restored employee: ${employee.name} (added to company)`;
        }
        
        await dataService.saveCompanyData(backupData.companyId, companyData);
        
        return {
          success: true,
          message: message,
          restoredCount: 1,
          mergeMode: mergeWithExisting
        };
      } else if (backupData.backupType === 'multiple_clients' || backupData.backupType === 'single_client') {
        // Handle client restoration
        const clientsToRestore = Array.isArray(backupData.data) ? backupData.data : [backupData.data];
        
        if (mergeWithExisting) {
          const existingClientIds = companyData.clients.map(c => c.id);
          const newClients = clientsToRestore.filter(client => 
            !existingClientIds.includes(client.id)
          );
          
          companyData.clients.push(...newClients);
          restoredCount = newClients.length;
          message = `Restored ${newClients.length} clients (merged with existing)`;
        } else {
          clientsToRestore.forEach(client => {
            const existingIndex = companyData.clients.findIndex(c => c.id === client.id);
            if (existingIndex >= 0) {
              companyData.clients[existingIndex] = client;
            } else {
              companyData.clients.push(client);
            }
          });
          restoredCount = clientsToRestore.length;
          message = `Restored ${clientsToRestore.length} clients (replaced where existing)`;
        }
        
        await dataService.saveCompanyData(backupData.companyId, companyData);
        
        return {
          success: true,
          message: message,
          restoredCount: restoredCount,
          mergeMode: mergeWithExisting
        };
      }
      
      return { success: false, error: 'Unsupported backup type' };
    } catch (error) {
      console.error('Failed to restore backup:', error.message);
      return { success: false, error: error.message };
    }
  }

  // BACKUP DELETION
  async deleteBackup(backupFileName) {
    try {
      const backupPath = path.join(BACKUPS_DIR, backupFileName);
      
      // Check if backup exists
      try {
        await fs.access(backupPath);
      } catch (error) {
        return { success: false, error: 'Backup file not found' };
      }
      
      await fs.unlink(backupPath);
      
      console.log(`Deleted backup: ${backupFileName}`);
      return { 
        success: true, 
        message: `Backup deleted: ${backupFileName}` 
      };
    } catch (error) {
      console.error('Failed to delete backup:', error.message);
      return { success: false, error: error.message };
    }
  }

  // BACKUP VALIDATION
  async validateBackup(backupFileName) {
    try {
      const backupPath = path.join(BACKUPS_DIR, backupFileName);
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);
      
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        info: {
          companyId: backupData.companyId,
          backupType: backupData.backupType,
          timestamp: backupData.timestamp,
          itemCount: Array.isArray(backupData.data) ? backupData.data.length : 1
        }
      };
      
      // Check required fields
      if (!backupData.companyId) {
        validation.errors.push('Missing companyId');
        validation.isValid = false;
      }
      
      if (!backupData.backupType) {
        validation.errors.push('Missing backupType');
        validation.isValid = false;
      }
      
      if (!backupData.data) {
        validation.errors.push('Missing data');
        validation.isValid = false;
      }
      
      // Check data structure based on backup type
      if (backupData.backupType === 'modules' && Array.isArray(backupData.data)) {
        backupData.data.forEach((module, index) => {
          if (!module.id) {
            validation.warnings.push(`Module at index ${index} missing id`);
          }
          if (!module.name) {
            validation.warnings.push(`Module at index ${index} missing name`);
          }
        });
      }
      
      if (backupData.backupType === 'employee_record' && backupData.data) {
        if (!backupData.data.id) {
          validation.warnings.push('Employee record missing id');
        }
        if (!backupData.data.name) {
          validation.warnings.push('Employee record missing name');
        }
      }
      
      return { success: true, validation };
    } catch (error) {
      return { 
        success: false, 
        validation: { 
          isValid: false, 
          errors: [`Failed to parse backup: ${error.message}`] 
        } 
      };
    }
  }

  // BACKUP STATISTICS
  async getBackupStatistics(companyId = null) {
    try {
      const backupsResult = await this.listBackups(companyId);
      if (!backupsResult.success) {
        return backupsResult;
      }
      
      const backups = backupsResult.backups;
      const stats = {
        total: backups.length,
        totalSizeBytes: 0,
        byType: {},
        byCompany: {},
        oldestBackup: null,
        newestBackup: null,
        thisWeek: 0,
        thisMonth: 0
      };
      
      if (backups.length > 0) {
        const now = new Date();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        backups.forEach(backup => {
          // Total size
          stats.totalSizeBytes += backup.fileSizeBytes;
          
          // Count by type
          stats.byType[backup.backupType] = (stats.byType[backup.backupType] || 0) + 1;
          
          // Count by company
          stats.byCompany[backup.companyId] = (stats.byCompany[backup.companyId] || 0) + 1;
          
          // Count recent backups
          const backupDate = new Date(backup.timestamp);
          if (backupDate >= weekStart) {
            stats.thisWeek++;
          }
          if (backupDate >= monthStart) {
            stats.thisMonth++;
          }
        });
        
        // Find oldest and newest
        const sortedByDate = backups.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        stats.oldestBackup = {
          fileName: sortedByDate[0].fileName,
          timestamp: sortedByDate[0].timestamp,
          type: sortedByDate[0].backupType
        };
        stats.newestBackup = {
          fileName: sortedByDate[sortedByDate.length - 1].fileName,
          timestamp: sortedByDate[sortedByDate.length - 1].timestamp,
          type: sortedByDate[sortedByDate.length - 1].backupType
        };
        
        // Format total size
        stats.totalSizeMB = Math.round(stats.totalSizeBytes / 1024 / 1024 * 100) / 100;
      }
      
      return {
        success: true,
        statistics: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // BACKUP CLEANUP
  async cleanupOldBackups(companyId, keepRecentDays = 30, keepMinimum = 10) {
    try {
      const backupsResult = await this.listBackups(companyId);
      if (!backupsResult.success) {
        return backupsResult;
      }
      
      const backups = backupsResult.backups;
      const cutoffDate = new Date(Date.now() - keepRecentDays * 24 * 60 * 60 * 1000);
      
      // Sort by timestamp (newest first)
      const sortedBackups = backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Keep minimum number of backups and all recent ones
      const backupsToDelete = sortedBackups
        .slice(keepMinimum)
        .filter(backup => new Date(backup.timestamp) < cutoffDate);
      
      let deletedCount = 0;
      const deletedFiles = [];
      
      for (const backup of backupsToDelete) {
        const deleteResult = await this.deleteBackup(backup.fileName);
        if (deleteResult.success) {
          deletedCount++;
          deletedFiles.push(backup.fileName);
        }
      }
      
      return {
        success: true,
        message: `Cleaned up ${deletedCount} old backups`,
        deletedCount: deletedCount,
        deletedFiles: deletedFiles,
        remainingBackups: backups.length - deletedCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // EXPORT BACKUP
  async exportBackup(backupFileName, exportFormat = 'json') {
    try {
      const backupPath = path.join(BACKUPS_DIR, backupFileName);
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);
      
      if (exportFormat === 'json') {
        return {
          success: true,
          data: backupData,
          format: 'json'
        };
      } else if (exportFormat === 'csv' && Array.isArray(backupData.data)) {
        // Simple CSV export for array data
        const csvContent = this.convertToCSV(backupData.data);
        return {
          success: true,
          data: csvContent,
          format: 'csv'
        };
      }
      
      return { success: false, error: 'Unsupported export format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }
}

module.exports = new BackupService();