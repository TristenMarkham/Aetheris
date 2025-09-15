// services/employeeService.js - Complete File with AI Name Matching
// Load environment variables
require('dotenv').config();

const { safeFormatNumber } = require('../utils/formatters');
const dataService = require('./dataService');
const backupService = require('./backupService');

const EMPLOYEE_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive', 
  ON_LEAVE: 'On Leave',
  SUSPENDED: 'Suspended',
  REHIRED: 'Rehired'
};

class EmployeeService {
  // AI-POWERED NAME RESOLUTION - NEW ADDITION
  async resolveEmployeeName(companyData, nameInput) {
    const employees = companyData.employees || [];
    
    if (employees.length === 0) {
      return { success: false, error: 'No employees found in database' };
    }
    
    const employeeNames = employees.map(e => `${e.name} (ID: ${e.id})`).join(', ');
    
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const prompt = `Find the best employee match:

Input: "${nameInput}"
Available employees: ${employeeNames}

Return ONLY the employee ID number that best matches the input name. Consider:
- Spelling variations (William/Bill, Christopher/Chris)  
- Case differences (william markham/William Markham)
- Partial names (just "William" matching "William Markham")
- Common nicknames and abbreviations
- Typos and minor misspellings

If no reasonable match exists, return "NOT_FOUND".
Return only the ID number or "NOT_FOUND".`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 50
      });
      
      const result = response.choices[0].message.content.trim();
      
      if (result === "NOT_FOUND") {
        return { success: false, error: `No employee found matching "${nameInput}"` };
      }
      
      const employeeId = parseInt(result);
      const foundEmployee = employees.find(e => e.id === employeeId);
      
      if (!foundEmployee) {
        return { success: false, error: `AI returned invalid employee ID: ${result}` };
      }
      
      console.log(`AI resolved "${nameInput}" to employee: ${foundEmployee.name} (ID: ${employeeId})`);
      return { success: true, employeeId: employeeId, employee: foundEmployee };
      
    } catch (error) {
      console.error('AI name resolution failed, trying fallback matching:', error.message);
      
      // Fallback to simple matching if AI fails
      return this.fallbackEmployeeMatch(employees, nameInput);
    }
  }

  // FALLBACK MATCHING (if AI fails)
  fallbackEmployeeMatch(employees, nameInput) {
    const normalizedInput = nameInput.toLowerCase().trim();
    
    // Try exact match first
    let bestMatch = employees.find(e => 
      e.name.toLowerCase().trim() === normalizedInput
    );
    
    if (bestMatch) {
      return { success: true, employeeId: bestMatch.id, employee: bestMatch };
    }
    
    // Try partial matches with scoring
    let bestScore = 0;
    for (const employee of employees) {
      const empName = employee.name.toLowerCase();
      
      // Simple scoring: how much of the input appears in the employee name
      const words = normalizedInput.split(' ');
      let score = 0;
      
      words.forEach(word => {
        if (empName.includes(word) && word.length > 1) {
          score += word.length;
        }
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = employee;
      }
    }
    
    // Only return if we have a reasonable match (at least 3 characters matched)
    if (bestScore >= 3 && bestMatch) {
      return { success: true, employeeId: bestMatch.id, employee: bestMatch };
    }
    
    return { success: false, error: `No employee found matching "${nameInput}"` };
  }

  // NEW: DIRECT BYPASS METHOD FOR WILLIAM MARKHAM FIX
  async addEmployeeDirectly(companyId, message) {
    try {
      console.log('EMPLOYEESERVICE: DIRECT EMPLOYEE ADD - Bypassing confirmation system');
      console.log(`EMPLOYEESERVICE: Processing: "${message}" for company: ${companyId}`);
      
      // Smart parsing of employee data from natural language
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const parsePrompt = `Parse this employee information and return ONLY a JSON object:
      
Input: "${message}"

Extract:
- name (required)
- role (default: "Security Guard")  
- hourlyRate (default: 23, extract any $ amount mentioned)
- site (default: "Unassigned")
- status (default: "Active")
- phone (if mentioned)
- schedule (if mentioned)

Return only valid JSON with these exact keys.`;

      const parseResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: parsePrompt }],
        temperature: 0.1
      });

      let parsedData;
      try {
        parsedData = JSON.parse(parseResponse.choices[0].message.content);
      } catch {
        // Fallback parsing
        parsedData = {
          name: message.includes(' ') ? message.split(' ').slice(0, 2).join(' ') : message,
          role: "Security Guard",
          hourlyRate: 23,
          site: "Unassigned",
          status: "Active"
        };
      }

      console.log('EMPLOYEESERVICE: AI Parsed:', parsedData);

      // Load current company data using dataService (FIXED PATH)
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Check for existing employee
      const existingEmployee = companyData.employees.find(e => 
        e.name.toLowerCase().trim() === parsedData.name.toLowerCase().trim()
      );
      
      if (existingEmployee) {
        console.log('EMPLOYEESERVICE: Employee already exists');
        return { 
          success: false, 
          error: `Employee ${parsedData.name} already exists`,
          existingEmployee 
        };
      }

      // Create new employee object
      const newEmployee = {
        id: Math.max(...companyData.employees.map(e => e.id), 0) + 1,
        name: parsedData.name.trim(),
        role: parsedData.role || "Security Guard",
        status: parsedData.status || "Active",
        site: parsedData.site || "Unassigned", 
        hourlyRate: parsedData.hourlyRate || 23,
        phone: parsedData.phone || null,
        schedule: parsedData.schedule || null,
        dateHired: new Date().toISOString(),
        statusHistory: [{
          timestamp: new Date().toISOString(),
          previousStatus: null,
          newStatus: parsedData.status || 'Active',
          reason: 'Direct hire - bypass confirmation',
          notes: 'Added directly via AI assistant',
          changedBy: 'aetheris_direct',
          changeId: Date.now()
        }],
        eligibleForRehire: true,
        lastStatusChange: new Date().toISOString(),
        performanceMetrics: {
          punctualityScore: 100,
          reliabilityScore: 100,
          qualityScore: 100,
          clientSatisfactionScore: 100
        }
      };

      // Add employee to company data
      companyData.employees.push(newEmployee);

      // Save to database immediately using dataService (FIXED PATH)
      await dataService.saveCompanyData(companyId, companyData);

      console.log(`EMPLOYEESERVICE: SUCCESS - Added ${newEmployee.name} directly to database`);

      return {
        success: true,
        employee: newEmployee,
        message: `Successfully added ${newEmployee.name} as ${newEmployee.role} at $${newEmployee.hourlyRate}/hour`,
        bypassed: true,
        directAdd: true
      };

    } catch (error) {
      console.error('EMPLOYEESERVICE: Direct employee add failed:', error);
      return {
        success: false,
        error: `Failed to add employee directly: ${error.message}`
      };
    }
  }

  // EMPLOYEE CREATION AND MANAGEMENT (EXISTING METHODS)
  async addEmployee(companyId, employeeData) {
    try {
      console.log(`EMPLOYEESERVICE: Adding employee ${employeeData.name} to ${companyId}`);
      
      // FIXED: Use dataService which has correct paths
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Check for existing employee (more robust checking)
      const existingEmployee = companyData.employees.find(e => 
        e.name.toLowerCase().trim() === employeeData.name.toLowerCase().trim()
      );
      
      if (existingEmployee) {
        console.log(`EMPLOYEESERVICE: Employee ${employeeData.name} already exists`);
        return { success: false, error: `Employee ${employeeData.name} already exists`, existingEmployee };
      }
      
      const newEmployee = {
        id: Math.max(...companyData.employees.map(e => e.id), 0) + 1,
        name: employeeData.name.trim(), // Ensure clean name
        role: employeeData.role || 'Security Guard',
        status: employeeData.status || 'Active',
        site: employeeData.site || 'Unassigned',
        hourlyRate: safeFormatNumber(employeeData.hourlyRate, 18.50),
        phone: employeeData.phone || null,
        schedule: employeeData.schedule || null,
        dateHired: new Date().toISOString(),
        statusHistory: [{
          timestamp: new Date().toISOString(),
          previousStatus: null,
          newStatus: employeeData.status || 'Active',
          reason: 'Initial hire',
          notes: 'New employee added to system',
          changedBy: employeeData.changedBy || 'system',
          changeId: Date.now()
        }],
        eligibleForRehire: true,
        lastStatusChange: new Date().toISOString()
      };
      
      console.log(`EMPLOYEESERVICE: Created employee object for ${newEmployee.name}`);
      return { 
        success: true, 
        employee: newEmployee
      };
      
    } catch (error) {
      console.error(`EMPLOYEESERVICE: Failed to prepare employee addition:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async executeAddEmployee(companyId, employeeData) {
    try {
      console.log(`EMPLOYEESERVICE: Executing add employee ${employeeData.name} to ${companyId}`);
      
      // FIXED: Use dataService which has correct paths
      const companyData = await dataService.loadCompanyData(companyId);
      companyData.employees.push(employeeData);
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`EMPLOYEESERVICE: SUCCESS - Added employee ${employeeData.name} to ${companyId}`);
      return { success: true, employee: employeeData };
    } catch (error) {
      console.error(`EMPLOYEESERVICE: Failed to add employee:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // ENHANCED EMPLOYEE STATUS MANAGEMENT WITH AI NAME RESOLUTION
  async updateEmployeeStatus(companyId, employeeIdentifier, newStatus, reason = '', notes = '', changedBy = 'system') {
    try {
      console.log(`EMPLOYEESERVICE: Updating employee status: "${employeeIdentifier}" -> ${newStatus}`);
      
      const companyData = await dataService.loadCompanyData(companyId);
      
      // NEW: Use AI-powered name resolution for flexible matching
      let employee = null;
      let resolvedEmployeeId = null;
      
      // If it's already a number, try direct ID lookup first
      if (!isNaN(employeeIdentifier)) {
        employee = companyData.employees.find(e => e.id === parseInt(employeeIdentifier));
        resolvedEmployeeId = parseInt(employeeIdentifier);
        console.log(`EMPLOYEESERVICE: Direct ID lookup: ${employee ? 'Found' : 'Not found'}`);
      }
      
      // If not found by ID or input wasn't numeric, use AI resolution
      if (!employee) {
        console.log(`EMPLOYEESERVICE: Using AI name resolution for: "${employeeIdentifier}"`);
        const resolutionResult = await this.resolveEmployeeName(companyData, employeeIdentifier);
        
        if (resolutionResult.success) {
          employee = resolutionResult.employee;
          resolvedEmployeeId = resolutionResult.employeeId;
          console.log(`EMPLOYEESERVICE: AI resolved to: ${employee.name} (ID: ${resolvedEmployeeId})`);
        } else {
          console.log(`EMPLOYEESERVICE: AI resolution failed: ${resolutionResult.error}`);
          return { 
            success: false, 
            error: resolutionResult.error,
            availableEmployees: companyData.employees.map(e => `${e.name} (ID: ${e.id})`)
          };
        }
      }
      
      if (!employee) {
        return { 
          success: false, 
          error: `Employee not found: "${employeeIdentifier}"`,
          availableEmployees: companyData.employees.map(e => `${e.name} (ID: ${e.id})`)
        };
      }
      
      console.log(`EMPLOYEESERVICE: Processing status update for: ${employee.name} (ID: ${employee.id})`);
      
      // Validate new status
      if (!this.isValidStatus(newStatus)) {
        return { 
          success: false, 
          error: `Invalid status: ${newStatus}. Valid statuses: ${this.getValidStatuses().join(', ')}`
        };
      }
      
      const statusChange = {
        timestamp: new Date().toISOString(),
        previousStatus: employee.status,
        newStatus: newStatus,
        reason: reason,
        notes: notes,
        changedBy: changedBy,
        changeId: Date.now()
      };
      
      if (!employee.statusHistory) {
        employee.statusHistory = [];
      }
      
      employee.statusHistory.push(statusChange);
      
      const oldStatus = employee.status;
      employee.status = newStatus;
      employee.lastStatusChange = statusChange.timestamp;
      
      // Handle special status transitions
      if (newStatus === EMPLOYEE_STATUSES.INACTIVE) {
        employee.terminationDate = new Date().toISOString();
        employee.terminationReason = reason;
        employee.eligibleForRehire = !reason.toLowerCase().includes('terminated for cause');
        employee.legalRetentionUntil = new Date(Date.now() + (7 * 365 * 24 * 60 * 60 * 1000)).toISOString();
        
        await this.createEmployeeBackup(companyId, employee, 'status_change_to_inactive');
      }
      
      if (newStatus === EMPLOYEE_STATUSES.ACTIVE && oldStatus === EMPLOYEE_STATUSES.INACTIVE) {
        employee.rehireDate = new Date().toISOString();
        employee.rehireCount = (employee.rehireCount || 0) + 1;
        employee.status = EMPLOYEE_STATUSES.REHIRED;
      }
      
      // Save updated data
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`EMPLOYEESERVICE: SUCCESS - ${employee.name} status: ${oldStatus} → ${newStatus}`);
      
      return { 
        success: true, 
        employee: employee,
        statusChange: statusChange,
        auditTrail: employee.statusHistory,
        resolvedFrom: employeeIdentifier !== employee.id ? `"${employeeIdentifier}" resolved to ${employee.name}` : null
      };
    } catch (error) {
      console.error('EMPLOYEESERVICE: Failed to update employee status:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createEmployeeBackup(companyId, employee, backupReason) {
    try {
      const backupData = {
        ...employee,
        backupReason: backupReason,
        backupDate: new Date().toISOString(),
        legalRetentionUntil: new Date(Date.now() + (7 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        complianceNotes: 'Employee record preserved for legal compliance - 7 year retention'
      };
      
      const backup = await backupService.createBackup(
        companyId,
        'employee_record',
        backupData,
        `Legal compliance backup: ${employee.name} - ${backupReason}`
      );
      
      console.log(`EMPLOYEESERVICE: Employee compliance backup created for ${employee.name}`);
      return backup;
    } catch (error) {
      console.error('EMPLOYEESERVICE: Failed to create employee backup:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getEmployeesByStatus(companyId, statusFilter = 'all', includeAuditTrail = false) {
    try {
      console.log(`EMPLOYEESERVICE: Getting employees by status for ${companyId}, filter: ${statusFilter}`);
      
      // FIXED: Use dataService which has correct paths
      const companyData = await dataService.loadCompanyData(companyId);
      let employees = companyData.employees || [];
      
      if (statusFilter !== 'all') {
        employees = employees.filter(e => e.status === statusFilter);
      }
      
      const responseEmployees = employees.map(employee => {
        const cleanEmployee = { ...employee };
        if (!includeAuditTrail) {
          delete cleanEmployee.statusHistory;
        }
        return cleanEmployee;
      });
      
      console.log(`EMPLOYEESERVICE: Returning ${responseEmployees.length} employees`);
      
      return {
        success: true,
        employees: responseEmployees,
        summary: {
          total: companyData.employees.length,
          active: companyData.employees.filter(e => e.status === 'Active').length,
          inactive: companyData.employees.filter(e => e.status === 'Inactive').length,
          onLeave: companyData.employees.filter(e => e.status === 'On Leave').length,
          suspended: companyData.employees.filter(e => e.status === 'Suspended').length,
          rehired: companyData.employees.filter(e => e.status === 'Rehired').length
        },
        statusFilter: statusFilter
      };
    } catch (error) {
      console.error('EMPLOYEESERVICE: Failed to get employees by status:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getEmployeeAuditTrail(companyId, employeeIdentifier) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Use AI resolution for flexible employee lookup
      let employee = null;
      
      if (!isNaN(employeeIdentifier)) {
        employee = companyData.employees.find(e => e.id === parseInt(employeeIdentifier));
      }
      
      if (!employee) {
        const resolutionResult = await this.resolveEmployeeName(companyData, employeeIdentifier);
        if (resolutionResult.success) {
          employee = resolutionResult.employee;
        }
      }
      
      if (!employee) {
        return { success: false, error: `Employee not found: "${employeeIdentifier}"` };
      }
      
      return {
        success: true,
        employee: { id: employee.id, name: employee.name, currentStatus: employee.status },
        auditTrail: employee.statusHistory || [],
        complianceInfo: {
          dateHired: employee.dateHired,
          terminationDate: employee.terminationDate || null,
          eligibleForRehire: employee.eligibleForRehire !== false,
          rehireCount: employee.rehireCount || 0,
          legalRetentionRequired: true,
          retentionPeriod: '7 years from termination',
          legalRetentionUntil: employee.legalRetentionUntil || null
        }
      };
    } catch (error) {
      console.error('EMPLOYEESERVICE: Failed to get employee audit trail:', error.message);
      return { success: false, error: error.message };
    }
  }

  // EMPLOYEE UPDATES
  async updateEmployee(companyId, employeeIdentifier, updates) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Use AI resolution for flexible employee lookup
      let employee = null;
      let employeeIndex = -1;
      
      if (!isNaN(employeeIdentifier)) {
        employeeIndex = companyData.employees.findIndex(e => e.id === parseInt(employeeIdentifier));
        if (employeeIndex !== -1) {
          employee = companyData.employees[employeeIndex];
        }
      }
      
      if (!employee) {
        const resolutionResult = await this.resolveEmployeeName(companyData, employeeIdentifier);
        if (resolutionResult.success) {
          employee = resolutionResult.employee;
          employeeIndex = companyData.employees.findIndex(e => e.id === employee.id);
        }
      }
      
      if (employeeIndex === -1) {
        return { success: false, error: `Employee not found: "${employeeIdentifier}"` };
      }
      
      if (updates.status) {
        return { success: false, error: 'Use updateEmployeeStatus function for status changes to maintain audit trail' };
      }
      
      Object.assign(companyData.employees[employeeIndex], updates);
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`EMPLOYEESERVICE: Updated employee ${employee.name} in ${companyId}`);
      return { success: true, employee: companyData.employees[employeeIndex] };
    } catch (error) {
      console.error(`EMPLOYEESERVICE: Failed to update employee:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // ENHANCED EMPLOYEE DELETION WITH AI RESOLUTION
  async deleteEmployee(companyId, employeeIdentifier) {
    try {
      console.log(`EMPLOYEESERVICE: Starting deletion process for: "${employeeIdentifier}" in company: ${companyId}`);
      
      const companyData = await dataService.loadCompanyData(companyId);
      console.log(`EMPLOYEESERVICE: Company data loaded. Current employees: ${companyData.employees.length}`);
      
      // Use AI-powered name resolution for flexible matching
      let employeeToDelete = null;
      let resolvedEmployeeId = null;
      let searchMethod = '';
      
      // Try direct ID lookup first if numeric
      if (!isNaN(employeeIdentifier)) {
        employeeToDelete = companyData.employees.find(e => e.id === parseInt(employeeIdentifier));
        resolvedEmployeeId = parseInt(employeeIdentifier);
        searchMethod = 'Direct ID';
        console.log(`EMPLOYEESERVICE: Direct ID search: ${employeeToDelete ? 'Found' : 'Not found'}`);
      }
      
      // Use AI resolution if not found by direct ID
      if (!employeeToDelete) {
        console.log(`EMPLOYEESERVICE: Using AI name resolution for: "${employeeIdentifier}"`);
        const resolutionResult = await this.resolveEmployeeName(companyData, employeeIdentifier);
        
        if (resolutionResult.success) {
          employeeToDelete = resolutionResult.employee;
          resolvedEmployeeId = resolutionResult.employeeId;
          searchMethod = 'AI Resolution';
          console.log(`EMPLOYEESERVICE: AI resolved to: ${employeeToDelete.name} (ID: ${resolvedEmployeeId})`);
        }
      }
      
      if (!employeeToDelete) {
        console.log(`EMPLOYEESERVICE: No employee found matching "${employeeIdentifier}"`);
        return { 
          success: false, 
          error: `No employee found matching "${employeeIdentifier}"`,
          searchAttempts: ['Direct ID', 'AI Resolution'],
          availableEmployees: companyData.employees.map(e => `${e.name} (ID: ${e.id})`)
        };
      }
      
      console.log(`EMPLOYEESERVICE: Found employee via ${searchMethod}: ${employeeToDelete.name} (ID: ${employeeToDelete.id})`);
      
      // Create backup before deletion (with error handling)
      let backupResult = { success: false };
      try {
        backupResult = await this.createEmployeeBackup(companyId, employeeToDelete, 'employee_deletion');
        console.log(`EMPLOYEESERVICE: Backup result:`, backupResult.success ? 'Success' : 'Failed');
      } catch (backupError) {
        console.log(`EMPLOYEESERVICE: Backup failed but continuing with deletion:`, backupError.message);
      }
      
      // Store counts before deletion
      const originalCount = companyData.employees.length;
      const employeeIdToDelete = employeeToDelete.id;
      const employeeNameToDelete = employeeToDelete.name;
      
      // Delete from array with verification
      console.log(`EMPLOYEESERVICE: Removing employee ID ${employeeIdToDelete} from array...`);
      companyData.employees = companyData.employees.filter(e => e.id !== employeeIdToDelete);
      
      const newCount = companyData.employees.length;
      console.log(`EMPLOYEESERVICE: Array counts: ${originalCount} → ${newCount}`);
      
      // Verify deletion actually happened
      if (originalCount === newCount) {
        console.log(`EMPLOYEESERVICE: ERROR - Array size didn't change - deletion failed`);
        return { 
          success: false, 
          error: `Deletion failed - employee may not have been removed from array`,
          originalCount,
          newCount,
          employeeToDelete: { id: employeeIdToDelete, name: employeeNameToDelete }
        };
      }
      
      // Verify employee is actually gone
      const stillExists = companyData.employees.find(e => e.id === employeeIdToDelete);
      if (stillExists) {
        console.log(`EMPLOYEESERVICE: ERROR - Employee still exists in array after deletion`);
        return { 
          success: false, 
          error: `Employee still exists after deletion attempt`,
          stillExists
        };
      }
      
      // Save changes with dataService
      console.log(`EMPLOYEESERVICE: Saving company data...`);
      await dataService.saveCompanyData(companyId, companyData);
      
      // Verify save by reloading data
      console.log(`EMPLOYEESERVICE: Verifying deletion by reloading data...`);
      const verificationData = await dataService.loadCompanyData(companyId);
      const finalCount = verificationData.employees.length;
      const employeeStillExists = verificationData.employees.find(e => e.id === employeeIdToDelete);
      
      console.log(`EMPLOYEESERVICE: Final verification: ${finalCount} employees, employee exists: ${!!employeeStillExists}`);
      
      if (employeeStillExists) {
        console.log(`EMPLOYEESERVICE: CRITICAL ERROR - Employee still exists after save and reload!`);
        return { 
          success: false, 
          error: `CRITICAL: Employee still exists after deletion and save`,
          employeeStillExists,
          counts: { original: originalCount, afterDeletion: newCount, afterSave: finalCount }
        };
      }
      
      console.log(`EMPLOYEESERVICE: SUCCESS - Employee ${employeeNameToDelete} successfully deleted`);
      
      return { 
        success: true, 
        message: `Successfully deleted employee: ${employeeNameToDelete}`,
        deletedEmployee: employeeToDelete,
        searchMethod: searchMethod,
        resolvedFrom: employeeIdentifier !== employeeToDelete.name ? `"${employeeIdentifier}" resolved to ${employeeToDelete.name}` : null,
        backupCreated: backupResult.success,
        backupFile: backupResult.backupFile || null,
        counts: {
          before: originalCount,
          after: finalCount
        },
        verification: {
          employeeRemoved: true,
          dataReloaded: true,
          finalEmployeeCount: finalCount
        }
      };
      
    } catch (error) {
      console.error(`EMPLOYEESERVICE: CRITICAL ERROR in deleteEmployee:`, error);
      return { 
        success: false, 
        error: `Critical deletion error: ${error.message}`,
        stack: error.stack
      };
    }
  }

  // ADDITIONAL HELPER METHODS FOR DEBUGGING
  async verifyEmployeeDeletion(companyId, employeeId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const employee = companyData.employees.find(e => e.id === parseInt(employeeId));
      
      return {
        success: true,
        exists: !!employee,
        totalEmployees: companyData.employees.length,
        employee: employee || null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listAllEmployees(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      return {
        success: true,
        employees: companyData.employees.map(e => ({
          id: e.id,
          name: e.name,
          status: e.status,
          role: e.role
        })),
        totalCount: companyData.employees.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // EMPLOYEE SEARCH AND FILTERING (Updated to use AI resolution)
  async findEmployeeByIdentifier(companyId, identifier) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Try by ID first if numeric
      if (!isNaN(identifier)) {
        const employeeById = companyData.employees.find(e => e.id === parseInt(identifier));
        if (employeeById) return { success: true, employee: employeeById };
      }
      
      // Use AI resolution for name-based search
      const resolutionResult = await this.resolveEmployeeName(companyData, identifier);
      if (resolutionResult.success) {
        return { success: true, employee: resolutionResult.employee };
      }
      
      return { success: false, error: `No employee found matching "${identifier}"` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getActiveEmployees(companyId) {
    try {
      const result = await this.getEmployeesByStatus(companyId, 'Active');
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getEmployeesByRole(companyId, role) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const employees = companyData.employees.filter(e => 
        e.role.toLowerCase().includes(role.toLowerCase()) && e.status === 'Active'
      );
      
      return {
        success: true,
        employees: employees,
        role: role,
        count: employees.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // EMPLOYEE STATISTICS
  async getEmployeeStatistics(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const employees = companyData.employees || [];
      
      const stats = {
        total: employees.length,
        byStatus: {
          active: employees.filter(e => e.status === 'Active').length,
          inactive: employees.filter(e => e.status === 'Inactive').length,
          onLeave: employees.filter(e => e.status === 'On Leave').length,
          suspended: employees.filter(e => e.status === 'Suspended').length,
          rehired: employees.filter(e => e.status === 'Rehired').length
        },
        byRole: {},
        averageHourlyRate: 0,
        totalPayrollCost: 0
      };
      
      // Calculate role distribution
      employees.forEach(emp => {
        const role = emp.role || 'Unassigned';
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      });
      
      // Calculate financial metrics
      const activeEmployees = employees.filter(e => e.status === 'Active');
      if (activeEmployees.length > 0) {
        const totalHourlyRates = activeEmployees.reduce((sum, e) => sum + safeFormatNumber(e.hourlyRate, 0), 0);
        stats.averageHourlyRate = Math.round((totalHourlyRates / activeEmployees.length) * 100) / 100;
        
        // Estimate monthly payroll (assume 173.33 hours per month average)
        stats.totalPayrollCost = Math.round(totalHourlyRates * 173.33);
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

  // VALIDATION HELPERS
  isValidStatus(status) {
    return Object.values(EMPLOYEE_STATUSES).includes(status);
  }

  getValidStatuses() {
    return Object.values(EMPLOYEE_STATUSES);
  }
}

module.exports = new EmployeeService();