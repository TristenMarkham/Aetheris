const dataService = require('./dataService');
const backupService = require('./backupService');
const aiService = require('./aiService');

class ModuleService {
  // MODULE CREATION
  async createModuleData(companyId, name, description, features = [], userId = 'system') {
    try {
      console.log(`Creating module for ${companyId}: ${name}`);
      
      const companyData = await dataService.loadCompanyData(companyId);
      
      const newModule = {
        id: Date.now().toString(),
        name,
        description,
        features,
        created: new Date().toISOString(),
        createdBy: userId,
        type: 'ai_generated'
      };
      
      companyData.platformModules.push(newModule);
      await dataService.saveCompanyData(companyId, companyData);
      
      return { success: true, module: newModule };
    } catch (error) {
      console.error('Failed to create module:', error.message);
      return { success: false, error: error.message };
    }
  }

  // MODULE CONFLICT RESOLUTION
  async checkModuleConflicts(companyId, suggestedName, dataType) {
    try {
      console.log(`Checking module conflicts for: ${suggestedName} (${dataType})`);
      
      const companyData = await dataService.loadCompanyData(companyId);
      const existingModules = companyData.platformModules || [];
      
      // Find existing modules of same type
      const sameTypeModules = existingModules.filter(m => 
        m.moduleType === dataType || 
        m.name.toLowerCase().includes(dataType.toLowerCase())
      );
      
      // Find modules with similar names
      const similarNameModules = existingModules.filter(m => 
        m.name.toLowerCase().includes(suggestedName.toLowerCase()) ||
        suggestedName.toLowerCase().includes(m.name.toLowerCase())
      );
      
      const conflictAnalysis = {
        hasConflicts: sameTypeModules.length > 0 || similarNameModules.length > 0,
        existingModulesOfType: sameTypeModules,
        similarNamedModules: similarNameModules,
        recommendations: []
      };
      
      if (conflictAnalysis.hasConflicts) {
        conflictAnalysis.recommendations = [
          `Create subdivision: "${suggestedName}"`,
          `Update existing "${sameTypeModules[0]?.name}" module`,
          `Merge data with existing module`,
          `Create as separate specialized module`
        ];
      }
      
      return conflictAnalysis;
    } catch (error) {
      console.error('Failed to check module conflicts:', error.message);
      return { hasConflicts: false, error: error.message };
    }
  }

  // MODULE DELETION
  async deleteAllModules(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const modulesToDelete = [...companyData.platformModules];
      const deletedCount = modulesToDelete.length;
      
      if (deletedCount === 0) {
        return { success: true, message: 'No modules to delete', deletedCount: 0 };
      }
      
      const backup = await backupService.createBackup(companyId, 'modules', modulesToDelete, `Backup before deleting all ${deletedCount} modules`);
      
      companyData.platformModules = [];
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`Deleted ${deletedCount} modules for ${companyId} (backup: ${backup.backupFile})`);
      
      return { 
        success: true, 
        message: `Successfully deleted ${deletedCount} modules. Backup created: ${backup.backupFile}`,
        deletedCount: deletedCount,
        backupCreated: backup.success,
        backupFile: backup.backupFile
      };
    } catch (error) {
      console.error(`Failed to delete all modules:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteSingleModule(companyId, moduleId) {
    try {
      console.log(`Attempting to delete module: ${moduleId} from company: ${companyId}`);
      
      const companyData = await dataService.loadCompanyData(companyId);
      const moduleToDelete = companyData.platformModules.find(m => 
        m.id === moduleId || m.name.toLowerCase() === moduleId.toLowerCase()
      );
      
      if (!moduleToDelete) {
        console.error(`Module not found: ${moduleId}`);
        return { success: false, error: 'Module not found' };
      }
      
      console.log(`Found module to delete: ${moduleToDelete.name}`);
      
      // Create backup before deletion
      const backup = await backupService.createBackup(companyId, 'single_module', moduleToDelete, `Backup of module: ${moduleToDelete.name}`);
      
      // Remove module from array
      const originalCount = companyData.platformModules.length;
      companyData.platformModules = companyData.platformModules.filter(m => 
        m.id !== moduleToDelete.id && m.name.toLowerCase() !== moduleId.toLowerCase()
      );
      const newCount = companyData.platformModules.length;
      
      console.log(`Module count: ${originalCount} → ${newCount}`);
      
      // Save updated data
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`Module "${moduleToDelete.name}" deleted successfully`);
      
      return { 
        success: true, 
        message: `Module "${moduleToDelete.name}" deleted successfully`,
        deletedModule: moduleToDelete,
        backupCreated: backup.success,
        moduleId: moduleId,
        modulesRemaining: newCount
      };
    } catch (error) {
      console.error(`Failed to delete module ${moduleId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // INTELLIGENT MODULE DELETION WITH INTENT ANALYSIS
  async handleModuleDeletionRequest(companyId, userMessage, availableModules) {
    try {
      console.log(`AI analyzing deletion request: "${userMessage}"`);
      
      // Use AI service to analyze user intent
      const deletionIntent = aiService.parseModuleDeletionIntent(userMessage, availableModules);
      console.log(`Deletion analysis:`, deletionIntent);
      
      if (deletionIntent.shouldDeleteSingleModule && deletionIntent.targetModule) {
        console.log(`Redirecting to single module deletion: ${deletionIntent.targetModule.name}`);
        return await this.deleteSingleModule(companyId, deletionIntent.targetModule.name);
      } else if (deletionIntent.shouldDeleteAll) {
        console.log(`Confirmed mass deletion request`);
        return await this.deleteAllModules(companyId);
      } else {
        console.log(`PREVENTED unclear deletion request`);
        return { 
          success: false, 
          error: `I need clarification on what to delete.`,
          suggestion: `Available modules: ${availableModules.map(m => m.name).join(', ')}. Please specify which module to delete, or say "delete all modules" to remove everything.`,
          reasoning: deletionIntent.reasoning,
          availableModules: deletionIntent.availableModules
        };
      }
    } catch (error) {
      console.error('Failed to handle module deletion request:', error.message);
      return { success: false, error: error.message };
    }
  }

  // MODULE RETRIEVAL AND SEARCH
  async getAllModules(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      return { 
        success: true, 
        modules: companyData.platformModules || [],
        count: companyData.platformModules?.length || 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async findModuleByIdentifier(companyId, identifier) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const modules = companyData.platformModules || [];
      
      // Try by ID first
      let module = modules.find(m => m.id === identifier);
      
      // Try by name (case insensitive)
      if (!module) {
        module = modules.find(m => 
          m.name.toLowerCase() === identifier.toLowerCase()
        );
      }
      
      // Try partial name match
      if (!module) {
        module = modules.find(m => 
          m.name.toLowerCase().includes(identifier.toLowerCase())
        );
      }
      
      if (module) {
        return { success: true, module: module };
      }
      
      return { success: false, error: `No module found matching "${identifier}"` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getModulesByType(companyId, moduleType) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const modules = companyData.platformModules || [];
      
      const filteredModules = modules.filter(m => 
        m.type === moduleType || 
        m.moduleType === moduleType ||
        m.name.toLowerCase().includes(moduleType.toLowerCase())
      );
      
      return {
        success: true,
        modules: filteredModules,
        type: moduleType,
        count: filteredModules.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // MODULE UPDATES
  async updateModule(companyId, moduleId, updates) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const moduleIndex = companyData.platformModules.findIndex(m => 
        m.id === moduleId || m.name.toLowerCase() === moduleId.toLowerCase()
      );
      
      if (moduleIndex === -1) {
        return { success: false, error: 'Module not found' };
      }
      
      // Update module with new data
      const updatedModule = {
        ...companyData.platformModules[moduleIndex],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      companyData.platformModules[moduleIndex] = updatedModule;
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`Updated module ${moduleId} for ${companyId}`);
      return { success: true, module: updatedModule };
    } catch (error) {
      console.error(`Failed to update module:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // MODULE STATISTICS
  async getModuleStatistics(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const modules = companyData.platformModules || [];
      
      const stats = {
        total: modules.length,
        byType: {},
        byCreator: {},
        createdThisMonth: 0,
        createdThisWeek: 0,
        oldestModule: null,
        newestModule: null
      };
      
      if (modules.length > 0) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        modules.forEach(module => {
          // Count by type
          const type = module.type || 'unknown';
          stats.byType[type] = (stats.byType[type] || 0) + 1;
          
          // Count by creator
          const creator = module.createdBy || 'unknown';
          stats.byCreator[creator] = (stats.byCreator[creator] || 0) + 1;
          
          // Count recent creations
          const createdDate = new Date(module.created);
          if (createdDate >= monthStart) {
            stats.createdThisMonth++;
          }
          if (createdDate >= weekStart) {
            stats.createdThisWeek++;
          }
        });
        
        // Find oldest and newest
        const sortedByDate = modules.sort((a, b) => new Date(a.created) - new Date(b.created));
        stats.oldestModule = {
          name: sortedByDate[0].name,
          created: sortedByDate[0].created
        };
        stats.newestModule = {
          name: sortedByDate[sortedByDate.length - 1].name,
          created: sortedByDate[sortedByDate.length - 1].created
        };
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

  // MODULE FILE ANALYSIS INTEGRATION
  async analyzeUploadedFile(companyId, fileContent, fileName, fileType) {
    try {
      console.log(`Processing uploaded file: ${fileName}`);
      
      // Use AI service to analyze the file
      const analysisResult = await aiService.analyzeFileData(fileContent, fileName, fileType);
      
      if (!analysisResult.success) {
        return analysisResult;
      }
      
      // Check for module conflicts
      const conflicts = await this.checkModuleConflicts(
        companyId, 
        analysisResult.analysis.suggestedModuleName,
        analysisResult.analysis.dataType
      );
      
      return {
        success: true,
        analysis: analysisResult.analysis,
        conflicts: conflicts,
        preview: analysisResult.preview,
        recordCount: analysisResult.recordCount,
        fileName: fileName,
        requiresUserDecision: conflicts.hasConflicts,
        possibleActions: conflicts.hasConflicts ? [
          'Create new specialized module',
          'Update existing module',
          'Merge with existing data',
          'Create as subdivision'
        ] : ['Create new module']
      };
    } catch (error) {
      console.error('File analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // MODULE BACKUP AND RESTORE
  async backupAllModules(companyId, description = '') {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const modules = companyData.platformModules || [];
      
      if (modules.length === 0) {
        return { success: false, error: 'No modules to backup' };
      }
      
      const backup = await backupService.createBackup(
        companyId, 
        'modules', 
        modules, 
        description || `Manual backup of ${modules.length} modules`
      );
      
      return {
        success: true,
        message: `Backed up ${modules.length} modules`,
        backupFile: backup.backupFile,
        moduleCount: modules.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async duplicateModule(companyId, moduleId, newName = null) {
    try {
      const findResult = await this.findModuleByIdentifier(companyId, moduleId);
      if (!findResult.success) {
        return findResult;
      }
      
      const originalModule = findResult.module;
      const duplicatedModule = {
        ...originalModule,
        id: Date.now().toString(),
        name: newName || `${originalModule.name} (Copy)`,
        created: new Date().toISOString(),
        type: 'duplicated',
        originalId: originalModule.id
      };
      
      const companyData = await dataService.loadCompanyData(companyId);
      companyData.platformModules.push(duplicatedModule);
      await dataService.saveCompanyData(companyId, companyData);
      
      return {
        success: true,
        message: `Module duplicated: ${duplicatedModule.name}`,
        module: duplicatedModule,
        original: originalModule
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ModuleService();