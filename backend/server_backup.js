const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const multer = require('multer');
const { safeFormatDate, safeFormatNumber, safeFormatCurrency } = require('./utils/formatters');
const aiService = require('./services/aiService');

const app = express();

// Enhanced middleware for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// File upload configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, JSON, and TXT files are allowed'));
    }
  }
});

require('dotenv').config();

const PROJECT_ROOT = path.join(__dirname, '..');
const FRONTEND_PATH = path.join(PROJECT_ROOT, 'frontend');
const BACKEND_PATH = __dirname;
const COMPANIES_DIR = path.join(BACKEND_PATH, 'companies');
const BACKUPS_DIR = path.join(BACKEND_PATH, 'backups');

const EMPLOYEE_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive', 
  ON_LEAVE: 'On Leave',
  SUSPENDED: 'Suspended',
  REHIRED: 'Rehired'
};

let currentSession = {
  userId: 'tristen',
  companyId: 'markham_investigation',
  userName: 'Tristen Markham',
  userRole: 'CEO',
  location: 'Seattle, WA',
  chatHistory: [],
  lastActivity: new Date(),
  pendingConfirmations: new Map()
};

// UTILITY FUNCTIONS
const getCompanyDir = (companyId) => path.join(COMPANIES_DIR, companyId);
const getCompanyDataFile = (companyId) => path.join(getCompanyDir(companyId), 'company_data.json');
const getUserChatFile = (companyId, userId) => path.join(getCompanyDir(companyId), 'users', `${userId}_chat.json`);

// MODULE CONFLICT RESOLUTION
const checkModuleConflicts = async (companyId, suggestedName, dataType) => {
  console.log(`Checking module conflicts for: ${suggestedName} (${dataType})`);
  
  const companyData = await loadCompanyData(companyId);
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
};

// PROFIT CALCULATION FUNCTIONS
const calculateGrossProfit = (companyData) => {
  console.log('AI calculating gross profit...');
  
  const safeClients = companyData.clients || [];
  const safeEmployees = companyData.employees || [];
  
  let totalRevenue = 0;
  let totalLaborCosts = 0;
  let profitBreakdown = [];
  
  // Calculate revenue and labor costs for each client
  safeClients.forEach(client => {
    const clientRevenue = safeFormatNumber(client.monthly_revenue, 0);
    totalRevenue += clientRevenue;
    
    // Get contract details if available
    const contractDetails = client.contract_details || {};
    const weeklyHours = safeFormatNumber(contractDetails.weeklyHours, 40); // Default 40 hours
    const monthlyHours = weeklyHours * 4.33; // Average weeks per month
    
    // Find guards assigned to this client (distribute proportionally for now)
    const activeGuards = safeEmployees.filter(e => e.status === 'Active');
    let clientLaborCost = 0;
    
    if (activeGuards.length > 0) {
      // Distribute hours among active guards
      const hoursPerGuard = monthlyHours / activeGuards.length;
      
      activeGuards.forEach(guard => {
        const guardHourlyRate = safeFormatNumber(guard.hourlyRate, 18.50);
        const guardMonthlyCost = hoursPerGuard * guardHourlyRate;
        clientLaborCost += guardMonthlyCost;
      });
    }
    
    totalLaborCosts += clientLaborCost;
    
    const clientProfit = clientRevenue - clientLaborCost;
    const clientMargin = clientRevenue > 0 ? ((clientProfit / clientRevenue) * 100) : 0;
    
    profitBreakdown.push({
      clientName: client.name,
      revenue: clientRevenue,
      laborCost: Math.round(clientLaborCost),
      profit: Math.round(clientProfit),
      marginPercent: Math.round(clientMargin * 100) / 100,
      hoursPerMonth: Math.round(monthlyHours),
      guardsAssigned: activeGuards.length,
      billingRate: contractDetails.hourlyRate || 0,
      averageGuardCost: activeGuards.length > 0 ? 
        Math.round(activeGuards.reduce((sum, g) => sum + safeFormatNumber(g.hourlyRate, 0), 0) / activeGuards.length) : 0
    });
  });
  
  const grossProfit = totalRevenue - totalLaborCosts;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
  
  const profitSummary = {
    totalRevenue: Math.round(totalRevenue),
    totalLaborCosts: Math.round(totalLaborCosts),
    grossProfit: Math.round(grossProfit),
    profitMargin: Math.round(profitMargin * 100) / 100,
    clientBreakdowns: profitBreakdown,
    calculation: {
      formula: "Gross Profit = Total Revenue - Total Labor Costs",
      totalRevenue: `$${safeFormatCurrency(totalRevenue)}`,
      totalLaborCosts: `$${safeFormatCurrency(totalLaborCosts)}`,
      grossProfit: `$${safeFormatCurrency(grossProfit)}`,
      profitMargin: `${Math.round(profitMargin * 100) / 100}%`
    }
  };
  
  console.log('AI profit calculation complete:', profitSummary);
  return profitSummary;
};

// Advanced financial analysis with AI insights
const getFinancialAnalysis = (companyData) => {
  const profitData = calculateGrossProfit(companyData);
  const safeEmployees = companyData.employees || [];
  const activeGuards = safeEmployees.filter(e => e.status === 'Active');
  
  // Calculate business insights
  const avgGuardRate = activeGuards.length > 0 
    ? activeGuards.reduce((sum, g) => sum + safeFormatNumber(g.hourlyRate, 0), 0) / activeGuards.length 
    : 0;
  
  // Estimate additional costs
  const estimatedOverhead = profitData.totalRevenue * 0.15; // 15% overhead estimate
  const netProfit = profitData.grossProfit - estimatedOverhead;
  
  // Performance metrics
  const performanceMetrics = {
    averageGuardRate: Math.round(avgGuardRate * 100) / 100,
    estimatedOverhead: Math.round(estimatedOverhead),
    estimatedNetProfit: Math.round(netProfit),
    revenuePerGuard: activeGuards.length > 0 ? Math.round(profitData.totalRevenue / activeGuards.length) : 0,
    laborCostPercentage: profitData.totalRevenue > 0 ? Math.round((profitData.totalLaborCosts / profitData.totalRevenue) * 100) : 0,
    profitPerGuard: activeGuards.length > 0 ? Math.round(profitData.grossProfit / activeGuards.length) : 0,
    breakEvenRate: profitData.totalLaborCosts > 0 ? Math.round((profitData.totalRevenue / profitData.totalLaborCosts) * 100) / 100 : 0
  };
  
  return {
    ...profitData,
    additionalAnalysis: performanceMetrics,
    businessInsights: {
      healthScore: profitData.profitMargin > 20 ? 'excellent' : 
                   profitData.profitMargin > 10 ? 'good' : 
                   profitData.profitMargin > 0 ? 'break-even' : 'loss',
      recommendations: generateBusinessRecommendations(profitData, performanceMetrics)
    }
  };
};

// Business recommendations based on profit analysis
const generateBusinessRecommendations = (profitData, performanceMetrics) => {
  const recommendations = [];
  
  if (profitData.profitMargin < 10) {
    recommendations.push('Consider increasing billing rates - profit margin is below 10%');
  }
  
  if (performanceMetrics.laborCostPercentage > 80) {
    recommendations.push('Labor costs are high (>80% of revenue) - optimize scheduling or increase rates');
  }
  
  if (profitData.clientBreakdowns.length > 0) {
    const unprofitableClients = profitData.clientBreakdowns.filter(c => c.marginPercent < 5);
    if (unprofitableClients.length > 0) {
      recommendations.push(`Low-margin clients: ${unprofitableClients.map(c => c.clientName).join(', ')} - consider rate adjustments`);
    }
  }
  
  if (performanceMetrics.revenuePerGuard < 3000) {
    recommendations.push('Revenue per guard is low - consider adding more clients or increasing utilization');
  }
  
  return recommendations;
};

// CONFIRMATION SYSTEM
const createConfirmationRequest = (type, data, calculatedData = null) => {
  const confirmationId = `confirm_${Date.now()}`;
  
  const confirmation = {
    id: confirmationId,
    type: type,
    data: data,
    calculatedData: calculatedData,
    timestamp: new Date(),
    status: 'pending',
    requiresManualConfirmation: true
  };
  
  currentSession.pendingConfirmations.set(confirmationId, confirmation);
  console.log(`Created confirmation ${confirmationId} for ${type} - waiting for manual approval`);
  
  return confirmation;
};

// Confirmation message generation
const generateConfirmationMessage = (confirmation) => {
  const { type, data, calculatedData } = confirmation;
  
  switch (type) {
    case 'add_client':
      if (calculatedData && calculatedData.success) {
        return `**New Contract Confirmation**

**Client:** ${data.name}
**Type:** ${data.type || 'Business'}
**Contact:** ${data.contact_person || 'Not specified'}

**Revenue Calculation:**
${calculatedData.calculationBreakdown.weekdays || ''}
${calculatedData.calculationBreakdown.weekends || ''}
${calculatedData.calculationBreakdown.total}
${calculatedData.calculationBreakdown.revenue}
${calculatedData.calculationBreakdown.monthly}

**Final Monthly Revenue:** $${safeFormatCurrency(calculatedData.monthlyRevenue)}

**Does this look correct?** Reply with:
- "Yes", "Confirm", "Correct", "Add it" to add this contract  
- "No", "Cancel", "Wrong" to cancel

Manual confirmation required - Will not auto-add`;
      } else {
        return `**New Client Confirmation**

**Client:** ${data.name}
**Type:** ${data.type || 'Business'}
**Monthly Revenue:** $${safeFormatCurrency(data.monthly_revenue)}
**Contact:** ${data.contact_person || 'Not specified'}

**Does this look correct?** Reply with:
- "Yes", "Confirm", "Correct", "Add it" to confirm
- "No", "Cancel", "Wrong" to cancel

Manual confirmation required - Will not auto-add`;
      }
      
    case 'add_employee':
      return `**New Employee Confirmation**

**Name:** ${data.name}
**Role:** ${data.role || 'Security Guard'}
**Site:** ${data.site || 'Unassigned'}
**Phone:** ${data.phone || 'Not provided'}
**Schedule:** ${data.schedule || 'Not specified'}
**Hourly Rate:** $${safeFormatNumber(data.hourlyRate, 18.50)}/hour
**Status:** ${data.status || 'Active'}

**Does this look correct?** Reply with:
- "Yes", "Confirm", "Correct", "Add it" to confirm
- "No", "Cancel", "Wrong" to cancel
- Or make corrections: "Actually, she is a patrol driver..."

Manual confirmation required - Will not auto-add`;
      
    default:
      return `Confirmation needed for ${type}. Reply "Yes" to confirm or "No" to cancel.`;
  }
};

const generateSmartEmployeeConfirmation = (employeeData, parseResult, corrections = null) => {
  const { parsed } = parseResult;
  
  let confirmationText = `**${corrections ? 'Corrected' : 'New'} Employee Confirmation**

**Name:** ${parsed.name}
**Role:** ${parsed.role}`;

  if (parsed.phone) {
    confirmationText += `\n**Phone:** ${parsed.phone}`;
  }
  
  if (parsed.schedule) {
    confirmationText += `\n**Schedule:** ${parsed.schedule}`;
  }
  
  confirmationText += `\n**Site:** ${parsed.site}
**Hourly Rate:** $${safeFormatNumber(parsed.hourlyRate, 18.50)}/hour
**Status:** Active`;

  if (corrections && corrections.length > 0) {
    confirmationText += `\n\n**Corrections Applied:**\n${corrections.map(c => `- ${c}`).join('\n')}`;
  }

  if (parsed.needsClarification && parsed.needsClarification.length > 0) {
    confirmationText += `\n\n**May Need Clarification:**\n${parsed.needsClarification.map(c => `- ${c}`).join('\n')}`;
  }

  confirmationText += `\n\n**Does this look correct?** Reply with:
- "Yes", "Confirm", "Correct", "Add it" to add this employee
- "No", "Cancel", "Wrong" to cancel
- Or make corrections: "Actually, the site should be..."

Manual confirmation required - Will not auto-add`;

  return confirmationText;
};

const applyUserCorrection = async (correctionText, originalConfirmationId = null) => {
  try {
    let targetConfirmation = null;
    
    if (originalConfirmationId) {
      targetConfirmation = currentSession.pendingConfirmations.get(originalConfirmationId);
    } else {
      let mostRecentTime = 0;
      for (const [id, confirmation] of currentSession.pendingConfirmations) {
        if (confirmation.status === 'pending' && confirmation.timestamp.getTime() > mostRecentTime) {
          targetConfirmation = confirmation;
          mostRecentTime = confirmation.timestamp.getTime();
        }
      }
    }
    
    if (!targetConfirmation) {
      return { success: false, error: 'No pending confirmation found to correct' };
    }
    
    console.log(`Applying correction to ${targetConfirmation.type}: "${correctionText}"`);
    
    let correctedData;
    if (targetConfirmation.type === 'add_employee') {
      const correctionResult = await aiService.handleUserCorrection(targetConfirmation.data, correctionText);
      if (!correctionResult.success) {
        return { success: false, error: 'Failed to process correction' };
      }
      correctedData = correctionResult.correctedData;
    } else {
      return { success: false, error: 'Corrections not supported for this type yet' };
    }
    
    targetConfirmation.status = 'corrected';
    
    const newEmployee = {
      ...targetConfirmation.data,
      name: correctedData.name,
      role: correctedData.role,
      phone: correctedData.phone,
      schedule: correctedData.schedule,
      site: correctedData.site,
      hourlyRate: safeFormatNumber(correctedData.hourlyRate, 18.50)
    };
    
    const newConfirmation = createConfirmationRequest('add_employee', newEmployee);
    
    const newConfirmationMessage = generateSmartEmployeeConfirmation(
      newEmployee,
      { parsed: correctedData },
      correctedData.corrections
    );
    
    return {
      success: true,
      newConfirmation: true,
      newConfirmationId: newConfirmation.id,
      newConfirmationMessage: newConfirmationMessage,
      corrections: correctedData.corrections || [],
      oldConfirmationCancelled: targetConfirmation.id
    };
    
  } catch (error) {
    console.error('Failed to apply correction:', error.message);
    return { success: false, error: error.message };
  }
};

// BACKUP FUNCTIONS
const ensureBackupDir = async () => {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create backup directory:', error.message);
  }
};

const createBackup = async (companyId, backupType, data, description = '') => {
  try {
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${companyId}_${backupType}_${timestamp}.json`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);
    
    const backupData = {
      companyId,
      backupType,
      description,
      timestamp: new Date().toISOString(),
      createdBy: currentSession.userId,
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
};

const listBackups = async (companyId = null) => {
  try {
    await ensureBackupDir();
    
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
            itemCount: Array.isArray(backupData.data) ? backupData.data.length : 1
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
};

const restoreFromBackup = async (backupFileName, mergeWithExisting = true) => {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupFileName);
    const backupContent = await fs.readFile(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    const companyData = await loadCompanyData(backupData.companyId);
    
    if (backupData.backupType === 'modules') {
      if (mergeWithExisting) {
        const existingModuleIds = companyData.platformModules.map(m => m.id);
        const restoredModules = backupData.data.filter(module => 
          !existingModuleIds.includes(module.id)
        );
        
        companyData.platformModules.push(...restoredModules);
        await saveCompanyData(backupData.companyId, companyData);
        
        return { 
          success: true, 
          message: `Restored ${restoredModules.length} modules`,
          restoredCount: restoredModules.length,
          mergeMode: true
        };
      } else {
        companyData.platformModules = backupData.data;
        await saveCompanyData(backupData.companyId, companyData);
        
        return { 
          success: true, 
          message: `Restored ${backupData.data.length} modules`,
          restoredCount: backupData.data.length,
          mergeMode: false
        };
      }
    }
    
    return { success: false, error: 'Unsupported backup type' };
  } catch (error) {
    console.error('Failed to restore backup:', error.message);
    return { success: false, error: error.message };
  }
};

// DEFAULT COMPANY DATA CREATION
const createDefaultCompanyData = (companyId) => {
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
};

// DATA MANAGEMENT FUNCTIONS
const loadCompanyData = async (companyId) => {
  try {
    const companyDataFile = getCompanyDataFile(companyId);
    const data = await fs.readFile(companyDataFile, 'utf8');
    const parsedData = JSON.parse(data);
    
    console.log(`Loaded company data: ${parsedData.employees?.length || 0} employees, ${parsedData.clients?.length || 0} clients`);
    return parsedData;
  } catch (error) {
    console.log(`Creating new dynamic company data for: ${companyId}`);
    // Use dynamic default data instead of hard-coded
    const defaultData = createDefaultCompanyData(companyId);
    await saveCompanyData(companyId, defaultData);
    return defaultData;
  }
};

const saveCompanyData = async (companyId, data) => {
  try {
    const companyDir = getCompanyDir(companyId);
    await fs.mkdir(companyDir, { recursive: true });
    
    const companyDataFile = getCompanyDataFile(companyId);
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(companyDataFile, JSON.stringify(data, null, 2));
    console.log(`Saved company data for: ${companyId}`);
  } catch (error) {
    console.error(`Failed to save company data for ${companyId}:`, error.message);
  }
};

const loadUserChat = async (companyId, userId) => {
  try {
    const userChatFile = getUserChatFile(companyId, userId);
    const data = await fs.readFile(userChatFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      userId, companyId, chatHistory: [], personalInfo: {}, preferences: {}, lastActivity: new Date().toISOString()
    };
  }
};

const saveUserChat = async (companyId, userId, chatData) => {
  try {
    const companyDir = getCompanyDir(companyId);
    const usersDir = path.join(companyDir, 'users');
    await fs.mkdir(usersDir, { recursive: true });
    
    const userChatFile = getUserChatFile(companyId, userId);
    chatData.lastActivity = new Date().toISOString();
    await fs.writeFile(userChatFile, JSON.stringify(chatData, null, 2));
  } catch (error) {
    console.error(`Failed to save chat for ${userId}:`, error.message);
  }
};

// EMPLOYEE STATUS FUNCTIONS
const updateEmployeeStatus = async (companyId, employeeId, newStatus, reason = '', notes = '') => {
  try {
    const companyData = await loadCompanyData(companyId);
    const employee = companyData.employees.find(e => e.id === parseInt(employeeId));
    
    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }
    
    const statusChange = {
      timestamp: new Date().toISOString(),
      previousStatus: employee.status,
      newStatus: newStatus,
      reason: reason,
      notes: notes,
      changedBy: currentSession.userId,
      changeId: Date.now()
    };
    
    if (!employee.statusHistory) {
      employee.statusHistory = [];
    }
    
    employee.statusHistory.push(statusChange);
    
    const oldStatus = employee.status;
    employee.status = newStatus;
    employee.lastStatusChange = statusChange.timestamp;
    
    if (newStatus === EMPLOYEE_STATUSES.INACTIVE) {
      employee.terminationDate = new Date().toISOString();
      employee.terminationReason = reason;
      employee.eligibleForRehire = !reason.toLowerCase().includes('terminated for cause');
      employee.legalRetentionUntil = new Date(Date.now() + (7 * 365 * 24 * 60 * 60 * 1000)).toISOString();
      
      await createEmployeeBackup(companyId, employee, 'status_change_to_inactive');
    }
    
    if (newStatus === EMPLOYEE_STATUSES.ACTIVE && oldStatus === EMPLOYEE_STATUSES.INACTIVE) {
      employee.rehireDate = new Date().toISOString();
      employee.rehireCount = (employee.rehireCount || 0) + 1;
      employee.status = EMPLOYEE_STATUSES.REHIRED;
    }
    
    await saveCompanyData(companyId, companyData);
    
    console.log(`Employee ${employee.name} status changed: ${oldStatus} → ${newStatus}`);
    
    return { 
      success: true, 
      employee: employee,
      statusChange: statusChange,
      auditTrail: employee.statusHistory
    };
  } catch (error) {
    console.error('Failed to update employee status:', error.message);
    return { success: false, error: error.message };
  }
};

const createEmployeeBackup = async (companyId, employee, backupReason) => {
  try {
    const backupData = {
      ...employee,
      backupReason: backupReason,
      backupDate: new Date().toISOString(),
      legalRetentionUntil: new Date(Date.now() + (7 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      complianceNotes: 'Employee record preserved for legal compliance - 7 year retention'
    };
    
    const backup = await createBackup(
      companyId,
      'employee_record',
      backupData,
      `Legal compliance backup: ${employee.name} - ${backupReason}`
    );
    
    console.log(`Employee compliance backup created for ${employee.name}`);
    return backup;
  } catch (error) {
    console.error('Failed to create employee backup:', error.message);
    return { success: false, error: error.message };
  }
};

const getEmployeesByStatus = async (companyId, statusFilter = 'all', includeAuditTrail = false) => {
  try {
    const companyData = await loadCompanyData(companyId);
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
    console.error('Failed to get employees by status:', error.message);
    return { success: false, error: error.message };
  }
};

const getEmployeeAuditTrail = async (companyId, employeeId) => {
  try {
    const companyData = await loadCompanyData(companyId);
    const employee = companyData.employees.find(e => e.id === parseInt(employeeId));
    
    if (!employee) {
      return { success: false, error: 'Employee not found' };
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
    console.error('Failed to get employee audit trail:', error.message);
    return { success: false, error: error.message };
  }
};

// MODULE FUNCTIONS
const deleteAllModules = async (companyId) => {
  try {
    const companyData = await loadCompanyData(companyId);
    const modulesToDelete = [...companyData.platformModules];
    const deletedCount = modulesToDelete.length;
    
    if (deletedCount === 0) {
      return { success: true, message: 'No modules to delete', deletedCount: 0 };
    }
    
    const backup = await createBackup(companyId, 'modules', modulesToDelete, `Backup before deleting all ${deletedCount} modules`);
    
    companyData.platformModules = [];
    await saveCompanyData(companyId, companyData);
    
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
};

// Single module deletion function
const deleteSingleModule = async (companyId, moduleId) => {
  try {
    console.log(`Attempting to delete module: ${moduleId} from company: ${companyId}`);
    
    const companyData = await loadCompanyData(companyId);
    const moduleToDelete = companyData.platformModules.find(m => 
      m.id === moduleId || m.name.toLowerCase() === moduleId.toLowerCase()
    );
    
    if (!moduleToDelete) {
      console.error(`Module not found: ${moduleId}`);
      return { success: false, error: 'Module not found' };
    }
    
    console.log(`Found module to delete: ${moduleToDelete.name}`);
    
    // Create backup before deletion
    const backup = await createBackup(companyId, 'single_module', moduleToDelete, `Backup of module: ${moduleToDelete.name}`);
    
    // Remove module from array
    const originalCount = companyData.platformModules.length;
    companyData.platformModules = companyData.platformModules.filter(m => 
      m.id !== moduleToDelete.id && m.name.toLowerCase() !== moduleId.toLowerCase()
    );
    const newCount = companyData.platformModules.length;
    
    console.log(`Module count: ${originalCount} → ${newCount}`);
    
    // Save updated data
    await saveCompanyData(companyId, companyData);
    
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
};

// PERSONAL INFO FUNCTIONS
const updateUserPersonalInfo = async (companyId, userId, info_type, info_key, info_value) => {
  try {
    const userChatData = await loadUserChat(companyId, userId);
    
    if (!userChatData.personalInfo) userChatData.personalInfo = {};
    if (!userChatData.personalInfo[info_type]) userChatData.personalInfo[info_type] = {};
    
    userChatData.personalInfo[info_type][info_key] = info_value;
    await saveUserChat(companyId, userId, userChatData);
    
    console.log(`Updated personal info for ${userId}: ${info_type}.${info_key} = ${info_value}`);
    return { success: true, personalInfo: userChatData.personalInfo };
  } catch (error) {
    console.error(`Failed to update personal info:`, error.message);
    return { success: false, error: error.message };
  }
};

const getUserPersonalInfo = async (companyId, userId) => {
  try {
    const userChatData = await loadUserChat(companyId, userId);
    return { 
      success: true, 
      personalInfo: userChatData.personalInfo || {},
      preferences: userChatData.preferences || {},
      uiPreferences: userChatData.uiPreferences || {}
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateUIPreferences = async (companyId, userId, uiSettings) => {
  try {
    const userChatData = await loadUserChat(companyId, userId);
    if (!userChatData.uiPreferences) userChatData.uiPreferences = {};
    Object.assign(userChatData.uiPreferences, uiSettings);
    await saveUserChat(companyId, userId, userChatData);
    return { success: true, uiPreferences: userChatData.uiPreferences };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// BUSINESS FUNCTIONS
const addEmployee = async (companyId, employeeData) => {
  try {
    const companyData = await loadCompanyData(companyId);
    
    // Check for existing employee
    const existingEmployee = companyData.employees.find(e => 
      e.name.toLowerCase() === employeeData.name.toLowerCase()
    );
    
    if (existingEmployee) {
      return { success: false, error: `Employee ${employeeData.name} already exists`, existingEmployee };
    }
    
    const newEmployee = {
      id: Math.max(...companyData.employees.map(e => e.id), 0) + 1,
      name: employeeData.name,
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
        changedBy: currentSession.userId,
        changeId: Date.now()
      }],
      eligibleForRehire: true,
      lastStatusChange: new Date().toISOString()
    };
    
    const confirmation = createConfirmationRequest('add_employee', newEmployee);
    
    return { 
      success: true, 
      requiresConfirmation: true,
      confirmationId: confirmation.id,
      confirmationMessage: generateConfirmationMessage(confirmation),
      previewEmployee: newEmployee
    };
    
  } catch (error) {
    console.error(`Failed to prepare employee addition:`, error.message);
    return { success: false, error: error.message };
  }
};

const confirmPendingAction = async (confirmationId, approved = true) => {
  try {
    const confirmation = currentSession.pendingConfirmations.get(confirmationId);
    
    if (!confirmation) {
      return { success: false, error: 'Confirmation not found' };
    }
    
    if (confirmation.status !== 'pending') {
      return { success: false, error: `Confirmation already ${confirmation.status}` };
    }
    
    confirmation.status = approved ? 'approved' : 'rejected';
    
    if (!approved) {
      currentSession.pendingConfirmations.delete(confirmationId);
      return { 
        success: true, 
        message: 'Action cancelled by user',
        cancelled: true
      };
    }
    
    let result;
    switch (confirmation.type) {
      case 'add_employee':
        result = await executeAddEmployee(currentSession.companyId, confirmation.data);
        break;
      case 'add_client':
        result = await executeAddClient(currentSession.companyId, confirmation.data, confirmation.calculatedData);
        break;
      default:
        return { success: false, error: 'Unknown confirmation type' };
    }
    
    currentSession.pendingConfirmations.delete(confirmationId);
    
    return {
      success: true,
      executed: true,
      result: result,
      message: `${confirmation.type} completed successfully`
    };
    
  } catch (error) {
    console.error('Failed to confirm action:', error.message);
    return { success: false, error: error.message };
  }
};

const executeAddEmployee = async (companyId, employeeData) => {
  try {
    const companyData = await loadCompanyData(companyId);
    companyData.employees.push(employeeData);
    await saveCompanyData(companyId, companyData);
    
    console.log(`Added employee ${employeeData.name} to ${companyId}`);
    return { success: true, employee: employeeData };
  } catch (error) {
    console.error(`Failed to add employee:`, error.message);
    return { success: false, error: error.message };
  }
};

const executeAddClient = async (companyId, clientData, calculatedData = null) => {
  try {
    const companyData = await loadCompanyData(companyId);
    
    if (calculatedData && calculatedData.success) {
      clientData.monthly_revenue = calculatedData.monthlyRevenue;
      clientData.contract_details = {
        hourlyRate: calculatedData.hourlyRate,
        weeklyHours: calculatedData.hoursBreakdown.totalWeeklyHours,
        weeklyRevenue: calculatedData.weeklyRevenue,
        calculationBreakdown: calculatedData.calculationBreakdown
      };
    }
    
    companyData.clients.push(clientData);
    await saveCompanyData(companyId, companyData);
    
    console.log(`Added client ${clientData.name} to ${companyId} with ${safeFormatCurrency(clientData.monthly_revenue)}/month`);
    return { success: true, client: clientData };
  } catch (error) {
    console.error(`Failed to add client:`, error.message);
    return { success: false, error: error.message };
  }
};

const addClient = async (companyId, clientData) => {
  try {
    const companyData = await loadCompanyData(companyId);
    
    const newClient = {
      id: Math.max(...companyData.clients.map(c => c.id), 0) + 1,
      name: clientData.name,
      type: clientData.type || 'Business',
      monthly_revenue: safeFormatNumber(clientData.monthly_revenue, 0),
      contract_start: clientData.contract_start || new Date().toISOString(),
      contact_person: clientData.contact_person || 'Unknown',
      status: 'Active',
      ...clientData
    };
    
    let calculatedData = null;
    if (clientData.contractDescription && clientData.hourlyRate) {
      calculatedData = await aiService.parseContractDetails(
        clientData.contractDescription, 
        clientData.name, 
        clientData.hourlyRate
      );
      
      if (calculatedData.success) {
        newClient.monthly_revenue = calculatedData.monthlyRevenue;
      }
    }
    
    const confirmation = createConfirmationRequest('add_client', newClient, calculatedData);
    
    return { 
      success: true, 
      requiresConfirmation: true,
      confirmationId: confirmation.id,
      confirmationMessage: generateConfirmationMessage(confirmation),
      previewClient: newClient,
      calculatedRevenue: calculatedData?.monthlyRevenue
    };
    
  } catch (error) {
    console.error(`Failed to prepare client addition:`, error.message);
    return { success: false, error: error.message };
  }
};

const updateEmployee = async (companyId, employeeId, updates) => {
  try {
    const companyData = await loadCompanyData(companyId);
    const employeeIndex = companyData.employees.findIndex(e => e.id === parseInt(employeeId));
    
    if (employeeIndex === -1) {
      return { success: false, error: 'Employee not found' };
    }
    
    if (updates.status) {
      return { success: false, error: 'Use update_employee_status function for status changes to maintain audit trail' };
    }
    
    Object.assign(companyData.employees[employeeIndex], updates);
    await saveCompanyData(companyId, companyData);
    
    console.log(`Updated employee ${employeeId} in ${companyId}`);
    return { success: true, employee: companyData.employees[employeeIndex] };
  } catch (error) {
    console.error(`Failed to update employee:`, error.message);
    return { success: false, error: error.message };
  }
};

// AI-powered client update function
const updateClient = async (companyId, clientId, updates) => {
  try {
    console.log(`AI updating client: ${clientId} with:`, updates);
    
    const companyData = await loadCompanyData(companyId);
    
    // Find client by ID (number) or name (string)
    let clientIndex = -1;
    let searchValue = clientId;
    
    // Try finding by ID first (if numeric)
    if (!isNaN(clientId)) {
      clientIndex = companyData.clients.findIndex(c => c.id === parseInt(clientId));
    }
    
    // If not found by ID, try by name (case insensitive)
    if (clientIndex === -1) {
      clientIndex = companyData.clients.findIndex(c => 
        c.name.toLowerCase() === clientId.toLowerCase()
      );
    }
    
    if (clientIndex === -1) {
      console.error(`Client not found: ${clientId}`);
      return { success: false, error: `Client not found: ${clientId}` };
    }
    
    const client = companyData.clients[clientIndex];
    console.log(`Found client: ${client.name} (ID: ${client.id})`);
    
    // Handle billing rate updates with automatic revenue recalculation
    if (updates.billingRate || updates.hourlyRate) {
      const newRate = updates.billingRate || updates.hourlyRate;
      console.log(`Updating billing rate to: ${newRate}/hr`);
      
      // Update contract details if they exist
      if (client.contract_details) {
        const weeklyHours = client.contract_details.weeklyHours || 40;
        const newWeeklyRevenue = weeklyHours * newRate;
        const newMonthlyRevenue = Math.round(newWeeklyRevenue * 4.33);
        
        client.contract_details.hourlyRate = newRate;
        client.contract_details.weeklyRevenue = newWeeklyRevenue;
        client.monthly_revenue = newMonthlyRevenue;
        
        console.log(`Recalculated: ${weeklyHours}hrs/week × ${newRate}/hr = ${newMonthlyRevenue}/month`);
      } else {
        // Create new contract details with default estimation
        const defaultWeeklyHours = 40;
        const newWeeklyRevenue = defaultWeeklyHours * newRate;
        const newMonthlyRevenue = Math.round(newWeeklyRevenue * 4.33);
        
        client.contract_details = {
          hourlyRate: newRate,
          weeklyHours: defaultWeeklyHours,
          weeklyRevenue: newWeeklyRevenue
        };
        client.monthly_revenue = newMonthlyRevenue;
        
        console.log(`Created contract: ${defaultWeeklyHours}hrs/week × ${newRate}/hr = ${newMonthlyRevenue}/month`);
      }
    }
    
    // Apply other updates
    Object.assign(client, updates);
    
    // Save changes
    await saveCompanyData(companyId, companyData);
    
    console.log(`Updated client ${client.name} successfully`);
    
    return { 
      success: true, 
      client: client,
      message: `Client ${client.name} updated successfully`,
      updatedFields: Object.keys(updates),
      newMonthlyRevenue: client.monthly_revenue
    };
  } catch (error) {
    console.error(`Failed to update client:`, error.message);
    return { success: false, error: error.message };
  }
};

// Enhanced deleteClient function for multiple matches
const deleteClient = async (companyId, clientIdentifier) => {
  try {
    const companyData = await loadCompanyData(companyId);
    
    // Find ALL matching clients (by ID or name)
    let clientsToDelete = [];
    
    // Search by ID if numeric
    if (!isNaN(clientIdentifier)) {
      const clientById = companyData.clients.find(c => c.id === parseInt(clientIdentifier));
      if (clientById) clientsToDelete.push(clientById);
    }
    
    // Search by name (partial, case insensitive)
    const clientsByName = companyData.clients.filter(c => 
      c.name.toLowerCase().includes(clientIdentifier.toLowerCase())
    );
    
    // Combine and deduplicate
    const allMatches = [...clientsToDelete, ...clientsByName];
    clientsToDelete = allMatches.filter((client, index, self) => 
      index === self.findIndex(c => c.id === client.id)
    );
    
    if (clientsToDelete.length === 0) {
      return { success: false, error: `No clients found matching "${clientIdentifier}"` };
    }
    
    console.log(`Found ${clientsToDelete.length} clients to delete:`, clientsToDelete.map(c => `${c.name} (ID: ${c.id})`));
    
    // Create backup
    const backup = await createBackup(companyId, 'multiple_clients', clientsToDelete, 
      `Deleted ${clientsToDelete.length} clients matching: ${clientIdentifier}`);
    
    // Delete from array
    const idsToRemove = clientsToDelete.map(c => c.id);
    const originalCount = companyData.clients.length;
    companyData.clients = companyData.clients.filter(c => !idsToRemove.includes(c.id));
    const newCount = companyData.clients.length;
    
    // Save changes
    await saveCompanyData(companyId, companyData);
    
    const deletedNames = clientsToDelete.map(c => c.name).join(', ');
    console.log(`Deleted ${clientsToDelete.length} clients: ${deletedNames}`);
    
    return { 
      success: true, 
      message: `Successfully deleted ${clientsToDelete.length} client(s): ${deletedNames}`,
      deletedClients: clientsToDelete,
      deletedCount: clientsToDelete.length,
      backupCreated: backup.success,
      backupFile: backup.backupFile,
      beforeCount: originalCount,
      afterCount: newCount
    };
  } catch (error) {
    console.error(`Failed to delete clients:`, error.message);
    return { success: false, error: error.message };
  }
};

// Employee deletion function
const deleteEmployee = async (companyId, employeeIdentifier) => {
  try {
    const companyData = await loadCompanyData(companyId);
    
    // Find employee by ID or name
    let employeeToDelete = null;
    
    // Search by ID if numeric
    if (!isNaN(employeeIdentifier)) {
      employeeToDelete = companyData.employees.find(e => e.id === parseInt(employeeIdentifier));
    }
    
    // Search by name if no ID match
    if (!employeeToDelete) {
      employeeToDelete = companyData.employees.find(e => 
        e.name.toLowerCase().includes(employeeIdentifier.toLowerCase())
      );
    }
    
    if (!employeeToDelete) {
      return { success: false, error: `No employee found matching "${employeeIdentifier}"` };
    }
    
    console.log(`Found employee to delete: ${employeeToDelete.name} (ID: ${employeeToDelete.id})`);
    
    // Create backup before deletion
    const backup = await createEmployeeBackup(companyId, employeeToDelete, 'employee_deletion');
    
    // Delete from array
    const originalCount = companyData.employees.length;
    companyData.employees = companyData.employees.filter(e => e.id !== employeeToDelete.id);
    const newCount = companyData.employees.length;
    
    // Save changes
    await saveCompanyData(companyId, companyData);
    
    console.log(`Deleted employee: ${employeeToDelete.name} (${originalCount} → ${newCount})`);
    
    return { 
      success: true, 
      message: `Successfully deleted employee: ${employeeToDelete.name}`,
      deletedEmployee: employeeToDelete,
      backupCreated: backup.success,
      backupFile: backup.backupFile,
      beforeCount: originalCount,
      afterCount: newCount
    };
  } catch (error) {
    console.error(`Failed to delete employee:`, error.message);
    return { success: false, error: error.message };
  }
};

const getCompanyUsers = async (companyId) => {
  try {
    const companyDir = getCompanyDir(companyId);
    const usersDir = path.join(companyDir, 'users');
    
    try {
      const userFiles = await fs.readdir(usersDir);
      const users = [];
      
      for (const file of userFiles) {
        if (file.endsWith('_chat.json')) {
          const userId = file.replace('_chat.json', '');
          const userData = await loadUserChat(companyId, userId);
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
    console.error(`Failed to get company users:`, error.message);
    return { success: false, error: error.message };
  }
};

// Smart business data analysis
const getBusinessData = async (query) => {
  console.log(`AI analyzing business query: "${query}" for ${currentSession.companyId}`);
  
  const companyData = await loadCompanyData(currentSession.companyId);
  
  // Safe data access
  const safeClients = companyData.clients || [];
  const safeEmployees = companyData.employees || [];
  const safeSites = companyData.sites || [];
  const safeModules = companyData.platformModules || [];
  
  // Real-time metric calculation
  const realTimeMetrics = {
    monthlyRevenue: safeClients.reduce((sum, c) => sum + safeFormatNumber(c.monthly_revenue, 0), 0),
    activeGuards: safeEmployees.filter(e => e.status === 'Active').length,
    totalEmployees: safeEmployees.length,
    totalClients: safeClients.length,
    totalSites: safeSites.length,
    totalModules: safeModules.length,
    guardsOnLeave: safeEmployees.filter(e => e.status === 'On Leave').length,
    inactiveEmployees: safeEmployees.filter(e => e.status === 'Inactive').length,
    suspendedEmployees: safeEmployees.filter(e => e.status === 'Suspended').length,
    averageHourlyRate: safeEmployees.length > 0 ? 
      safeEmployees.reduce((sum, e) => sum + safeFormatNumber(e.hourlyRate, 0), 0) / safeEmployees.length : 0,
    lastUpdated: companyData.lastUpdated
  };

  // Role-based categorization
  const drivers = safeEmployees.filter(e => {
    const role = (e.role || '').toLowerCase();
    return (role.includes('patrol') || 
            role.includes('driver') || 
            role === 'mobile patrol') && 
           e.status === 'Active';
  });
  
  const staticGuards = safeEmployees.filter(e => 
    e.role === 'Security Guard' && e.status === 'Active'
  );
  
  const supervisors = safeEmployees.filter(e => {
    const role = (e.role || '').toLowerCase();
    return (role.includes('supervisor') || role.includes('manager')) && 
           e.status === 'Active';
  });

  // Financial intelligence with profit analysis
  const financialAnalysis = getFinancialAnalysis(companyData);

  // Business intelligence summary
  const businessIntelligence = {
    companySize: safeEmployees.length < 5 ? 'small startup' : 
                 safeEmployees.length < 20 ? 'growing business' : 'established company',
    healthScore: realTimeMetrics.monthlyRevenue > 0 ? 
                 (financialAnalysis.profitMargin > 20 ? 'excellent' : 
                  financialAnalysis.profitMargin > 10 ? 'good' : 'needs improvement') : 'startup phase',
    growthIndicators: {
      revenuePerEmployee: safeEmployees.length > 0 ? Math.round(realTimeMetrics.monthlyRevenue / safeEmployees.length) : 0,
      clientToGuardRatio: realTimeMetrics.activeGuards > 0 ? Math.round(realTimeMetrics.totalClients / realTimeMetrics.activeGuards * 100) / 100 : 0,
      averageClientValue: realTimeMetrics.totalClients > 0 ? Math.round(realTimeMetrics.monthlyRevenue / realTimeMetrics.totalClients) : 0
    }
  };

  // Dashboard metrics with intelligence
  const dashboardMetrics = {
    monthlyRevenue: realTimeMetrics.monthlyRevenue,
    formattedRevenue: `${safeFormatCurrency(realTimeMetrics.monthlyRevenue)}`,
    activeGuards: realTimeMetrics.activeGuards,
    totalClients: realTimeMetrics.totalClients,
    totalSites: realTimeMetrics.totalSites,
    totalModules: realTimeMetrics.totalModules,
    guardsOnLeave: realTimeMetrics.guardsOnLeave,
    averageHourlyRate: realTimeMetrics.averageHourlyRate.toFixed(2),
    lastUpdated: realTimeMetrics.lastUpdated,
    // Profit information
    grossProfit: financialAnalysis.grossProfit,
    profitMargin: financialAnalysis.profitMargin,
    totalLaborCosts: financialAnalysis.totalLaborCosts,
    businessHealth: businessIntelligence.healthScore,
    // Display values that adapt to context
    dashboardDisplays: {
      "Monthly Revenue": `${realTimeMetrics.monthlyRevenue.toLocaleString()}`,
      "Active Guards": `${realTimeMetrics.activeGuards} ${realTimeMetrics.activeGuards === 1 ? 'guard' : 'guards'}`,
      "Client Sites": `${realTimeMetrics.totalSites} ${realTimeMetrics.totalSites === 1 ? 'site' : 'sites'}`, 
      "Total Clients": `${realTimeMetrics.totalClients} ${realTimeMetrics.totalClients === 1 ? 'client' : 'clients'}`,
      "Gross Profit": `${financialAnalysis.grossProfit.toLocaleString()} (${financialAnalysis.profitMargin}% margin)`,
      "Business Health": businessIntelligence.healthScore
    }
  };
  
  // Response data based on what user is asking for
  const responseData = {
    success: true,
    companyInfo: companyData.companyInfo,
    employees: safeEmployees,
    clients: safeClients,
    sites: safeSites,
    platformModules: safeModules,
    realTimeMetrics: realTimeMetrics,
    
    // Dashboard access
    dashboardData: dashboardMetrics,
    dashboardValues: dashboardMetrics.dashboardDisplays,
    
    // Financial intelligence
    financialAnalysis: financialAnalysis,
    profitData: {
      grossProfit: financialAnalysis.grossProfit,
      profitMargin: financialAnalysis.profitMargin,
      totalRevenue: financialAnalysis.totalRevenue,
      totalLaborCosts: financialAnalysis.totalLaborCosts,
      clientBreakdowns: financialAnalysis.clientBreakdowns,
      calculation: financialAnalysis.calculation,
      additionalAnalysis: financialAnalysis.additionalAnalysis
    },
    
    // Business intelligence insights
    businessIntelligence: businessIntelligence,
    
    // Adaptive data lists
    activeGuardsList: safeEmployees.filter(e => e.status === 'Active').map(g => 
      `${g.name} (${g.role}) at ${g.site || 'Unassigned'} - ${safeFormatNumber(g.hourlyRate, 18.50)}/hr`
    ),
    
    guardsOnLeaveList: safeEmployees.filter(e => e.status === 'On Leave').map(g => 
      `${g.name} (${g.role}) - ${g.leaveType || 'Leave'} since ${safeFormatDate(g.leaveStartDate, 'Unknown date')}`
    ),
    
    driversList: drivers.map(d => 
      `${d.name} (${d.role}) at ${d.site || 'Multiple Locations'} - ${safeFormatNumber(d.hourlyRate, 20.00)}/hr`
    ),
    
    clientsList: safeClients.map(c => 
      `${c.name} - ${safeFormatCurrency(c.monthly_revenue)}/month (${c.type}) - Billing: ${c.contract_details?.hourlyRate || 'TBD'}/hr`
    ),
    
    contractsList: safeClients.map(c => ({
      id: c.id,
      name: c.name,
      monthlyRevenue: c.monthly_revenue,
      type: c.type,
      billingRate: c.contract_details?.hourlyRate || 0,
      weeklyHours: c.contract_details?.weeklyHours || 0,
      displayText: `${c.name} - ${safeFormatCurrency(c.monthly_revenue)}/month (${c.type}) - ${c.contract_details?.hourlyRate || 'TBD'}/hr`
    })),
    
    sitesList: safeSites.map(s => 
      `${s.name} - needs ${safeFormatNumber(s.guards_needed, 0)} guards, currently has ${safeFormatNumber(s.current_guards, 0)}`
    ),
    
    // Role-based arrays
    drivers: drivers,
    staticGuards: staticGuards,
    supervisors: supervisors,
    
    // Contextual summaries
    summary: {
      businessOverview: `${companyData.companyInfo.name} is a ${businessIntelligence.companySize} with ${realTimeMetrics.activeGuards} active guards serving ${realTimeMetrics.totalClients} clients, generating ${safeFormatCurrency(realTimeMetrics.monthlyRevenue)} monthly revenue with ${safeFormatCurrency(financialAnalysis.grossProfit)} gross profit (${financialAnalysis.profitMargin}% margin). Business health: ${businessIntelligence.healthScore}.`,
      
      dashboardSummary: `Dashboard shows: ${realTimeMetrics.monthlyRevenue.toLocaleString()} monthly revenue, ${realTimeMetrics.activeGuards} active guards, ${realTimeMetrics.totalClients} clients, ${realTimeMetrics.totalSites} sites, ${financialAnalysis.grossProfit.toLocaleString()} gross profit.`,
      
      profitSummary: `Financial analysis: ${financialAnalysis.totalRevenue.toLocaleString()} revenue - ${financialAnalysis.totalLaborCosts.toLocaleString()} labor costs = ${financialAnalysis.grossProfit.toLocaleString()} gross profit (${financialAnalysis.profitMargin}% margin).`,
      
      // Context-aware details
      activeGuards: realTimeMetrics.activeGuards,
      totalClients: realTimeMetrics.totalClients,
      monthlyRevenue: realTimeMetrics.monthlyRevenue,
      grossProfit: financialAnalysis.grossProfit,
      profitMargin: financialAnalysis.profitMargin,
      
      // Detailed breakdowns when needed
      employeeDetails: safeEmployees.filter(e => e.status === 'Active').length > 0 
        ? `Active: ${safeEmployees.filter(e => e.status === 'Active').map(g => g.name).join(', ')}` 
        : 'No active employees',
      
      clientDetails: safeClients.length > 0 
        ? safeClients.map(c => `${c.name} (${safeFormatCurrency(c.monthly_revenue)}/month)`).join(', ')
        : 'No clients yet',
      
      driversDetails: drivers.length > 0 
        ? drivers.map(d => d.name).join(', ')
        : 'No drivers',
      
      contractDetails: safeClients.length > 0 
        ? safeClients.map(c => `${c.name}: ${c.contract_details?.hourlyRate || 'TBD'}/hr for ${c.contract_details?.weeklyHours || 'TBD'} hours/week`).join(', ')
        : 'No contracts yet'
    },
    query: query,
    timestamp: new Date().toISOString()
  };
  
  return responseData;
};

const createModuleData = async (name, description, features = []) => {
  console.log(`Creating module for ${currentSession.companyId}: ${name}`);
  
  const companyData = await loadCompanyData(currentSession.companyId);
  
  const newModule = {
    id: Date.now().toString(),
    name,
    description,
    features,
    created: new Date().toISOString(),
    createdBy: currentSession.userId,
    type: 'ai_generated'
  };
  
  companyData.platformModules.push(newModule);
  await saveCompanyData(currentSession.companyId, companyData);
  
  return { success: true, module: newModule };
};

// UTILITY FUNCTIONS
const getWeatherData = async (location) => {
  return new Promise((resolve) => {
    try {
      let cleanLocation = location.trim();
      if (cleanLocation.toLowerCase() === 'current' || cleanLocation.toLowerCase() === 'near me') {
        cleanLocation = currentSession.location;
      }
      
      const weatherUrl = `https://wttr.in/${encodeURIComponent(cleanLocation)}?format=j1`;
      
      https.get(weatherUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          try {
            const weatherData = JSON.parse(data);
            const current = weatherData.current_condition[0];
            const area = weatherData.nearest_area[0];
            
            resolve({
              success: true,
              location: `${area.areaName[0].value}, ${area.region[0].value || area.country[0].value}`,
              temperature: Math.round(current.temp_F),
              condition: current.weatherDesc[0].value,
              humidity: current.humidity,
              windSpeed: `${current.windspeedMiles} mph`,
              feelsLike: Math.round(current.FeelsLikeF),
              businessImpact: getWeatherBusinessImpact(current.weatherDesc[0].value, current.temp_F)
            });
          } catch (parseError) {
            resolve({ success: false, error: 'Weather parsing failed' });
          }
        });
      }).on('error', () => {
        resolve({ success: false, error: 'Weather service unavailable' });
      });
    } catch (error) {
      resolve({ success: false, error: 'Weather request failed' });
    }
  });
};

const getWeatherBusinessImpact = (condition, temp) => {
  const tempNum = parseInt(temp);
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('storm')) {
    return 'Wet weather - increase indoor patrols, check equipment protection';
  } else if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
    return 'Winter conditions - ensure safe pathways, monitor access points';  
  } else if (tempNum > 90) {
    return 'Hot weather - ensure guard hydration, consider break rotations';
  } else if (tempNum < 35) {
    return 'Cold weather - verify equipment function, check heating systems';
  } else {
    return 'Favorable conditions for all security operations';
  }
};

const getCurrentTime = () => {
  const now = new Date();
  return {
    timestamp: now.toISOString(),
    localTime: now.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: true,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    timezone: 'America/Los_Angeles',
    businessContext: getTimeBusinessContext(now)
  };
};

const getTimeBusinessContext = (date) => {
  const hour = date.getHours();
  const day = date.getDay();
  
  if (day === 0 || day === 6) {
    return 'Weekend - reduced staffing, monitor key sites closely';
  } else if (hour >= 22 || hour <= 6) {
    return 'Night shift - peak security demand, all sites should be covered';
  } else if (hour >= 9 && hour <= 17) {
    return 'Business hours - standard operations, coordinate with client schedules';
  } else {
    return 'Evening transition - prepare for night shift changeover';
  }
};

// DEBUG FUNCTIONS
const debugCompanyData = async (companyId) => {
  try {
    console.log(`DEBUG: Loading company data for ${companyId}`);
    
    const companyDataFile = getCompanyDataFile(companyId);
    const rawData = await fs.readFile(companyDataFile, 'utf8');
    const parsedData = JSON.parse(rawData);
    
    console.log(`Employees found: ${parsedData.employees?.length || 0}`);
    console.log(`Clients found: ${parsedData.clients?.length || 0}`);
    
    if (parsedData.employees?.length > 0) {
      console.log(`First employee: ${parsedData.employees[0].name}`);
    }
    
    if (parsedData.clients?.length > 0) {
      console.log(`First client: ${parsedData.clients[0].name}`);
    }
    
    return {
      success: true,
      debug: {
        employeeCount: parsedData.employees?.length || 0,
        clientCount: parsedData.clients?.length || 0,
        employees: parsedData.employees?.map(e => ({ id: e.id, name: e.name, status: e.status })) || [],
        clients: parsedData.clients?.map(c => ({ id: c.id, name: c.name, revenue: safeFormatNumber(c.monthly_revenue, 0) })) || []
      }
    };
  } catch (error) {
    console.error('DEBUG: Failed to load company data:', error.message);
    return { success: false, error: error.message };
  }
};

// CONFIRMATION HANDLING
const handleConfirmationResponse = async (message) => {
  const messageLower = message.toLowerCase().trim();
  
  const confirmKeywords = ['yes', 'confirm', 'ok', 'correct', 'looks good', 'approve', 'yep', 'yeah', 'sure', 'affirmative', 'add it', 'go ahead', 'proceed'];
  const cancelKeywords = ['no', 'cancel', 'wrong', 'incorrect', 'stop', 'nope', 'not right', 'abort'];
  
  const isConfirm = confirmKeywords.some(keyword => messageLower.includes(keyword));
  const isCancel = cancelKeywords.some(keyword => messageLower.includes(keyword));
  
  if (!isConfirm && !isCancel) {
    return null;
  }
  
  let mostRecentConfirmation = null;
  let mostRecentTime = 0;
  
  console.log(`Checking ${currentSession.pendingConfirmations.size} pending confirmations...`);
  
  for (const [id, confirmation] of currentSession.pendingConfirmations) {
    console.log(`Confirmation ${id}: ${confirmation.type} - ${confirmation.status}`);
    if (confirmation.status === 'pending' && confirmation.timestamp.getTime() > mostRecentTime) {
      mostRecentConfirmation = confirmation;
      mostRecentTime = confirmation.timestamp.getTime();
    }
  }
  
  if (!mostRecentConfirmation) {
    console.log(`No pending confirmations found`);
    return {
      message: "I don't see any pending confirmations. What would you like me to help you with?"
    };
  }
  
  console.log(`Processing confirmation for: ${mostRecentConfirmation.type}`);
  
  const result = await confirmPendingAction(mostRecentConfirmation.id, isConfirm);
  
  if (result.success && result.executed) {
    return {
      message: `**Confirmed!** ${mostRecentConfirmation.type.replace('_', ' ')} has been ${isConfirm ? 'added' : 'cancelled'} successfully.${result.result?.client ? ` Monthly revenue updated to ${safeFormatCurrency(result.result.client.monthly_revenue)}.` : ''}`,
      dataChanges: [{ type: 'confirmation_executed', data: result.result }]
    };
  } else if (result.cancelled) {
    return {
      message: `**Cancelled.** The ${mostRecentConfirmation.type.replace('_', ' ')} was not added.`
    };
  } else {
    return {
      message: `**Error:** ${result.error || 'Could not process confirmation'}`
    };
  }
};

// FILE UPLOAD AND ANALYSIS ENDPOINT
app.post('/api/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = path.extname(fileName).toLowerCase().substring(1);
    
    console.log(`Processing uploaded file: ${fileName}`);
    
    // Read file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Clean up uploaded file
    await fs.unlink(filePath);
    
    // AI analysis
    const analysisResult = await aiService.analyzeFileData(fileContent, fileName, fileType);
    
    if (!analysisResult.success) {
      return res.json(analysisResult);
    }
    
    // Check for module conflicts
    const conflicts = await checkModuleConflicts(
      currentSession.companyId, 
      analysisResult.analysis.suggestedModuleName,
      analysisResult.analysis.dataType
    );
    
    res.json({
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
    });
    
  } catch (error) {
    console.error('File analysis error:', error);
    res.json({ success: false, error: error.message });
  }
});

// AI CHAT ENDPOINT - ENHANCED WITH AI SERVICE
app.post('/api/aetheris/chat', async (req, res) => {
  try {
    const { message, userId, companyId, fileAnalysisContext } = req.body;

    if (userId) currentSession.userId = userId;
    if (companyId) currentSession.companyId = companyId;

    const userChatData = await loadUserChat(currentSession.companyId, currentSession.userId);
    userChatData.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });

    console.log(`User ${currentSession.userId}@${currentSession.companyId}: ${message}`);

    // Check for confirmation responses first
    const confirmationResponse = await handleConfirmationResponse(message);
    if (confirmationResponse) {
      userChatData.chatHistory.push({ role: 'assistant', content: confirmationResponse.message, timestamp: new Date() });
      await saveUserChat(currentSession.companyId, currentSession.userId, userChatData);
      
      return res.json({ 
        response: confirmationResponse.message,
        dataChanges: confirmationResponse.dataChanges || [],
        userName: currentSession.userId,
        companyName: (await loadCompanyData(currentSession.companyId)).companyInfo.name
      });
    }

    // Enhanced file analysis responses
    if (fileAnalysisContext) {
      const filePrompt = `The user has uploaded a file and the AI analysis suggests:

File: ${fileAnalysisContext.fileName}
Data Type: ${fileAnalysisContext.dataType}
Records: ${fileAnalysisContext.recordCount}
Suggested Module: ${fileAnalysisContext.suggestedModuleName}
Conflicts: ${fileAnalysisContext.hasConflicts ? 'Yes' : 'No'}

User message: "${message}"

Provide a helpful response about how to handle this file data. Ask specific questions about:
1. Whether they want to create a new module or update existing
2. Which fields they want to include
3. How to handle any conflicts
4. Any customization they want

Be conversational and helpful, not technical.`;

      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const fileResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: 'system', content: 'You are Aetheris, an AI assistant helping with file data analysis and module creation.' },
          { role: 'user', content: filePrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = fileResponse.choices[0].message.content;
      userChatData.chatHistory.push({ role: 'assistant', content: response, timestamp: new Date() });
      await saveUserChat(currentSession.companyId, currentSession.userId, userChatData);

      return res.json({
        response: response,
        fileContext: true,
        userName: currentSession.userId,
        companyName: (await loadCompanyData(currentSession.companyId)).companyInfo.name
      });
    }

    // Load fresh company data for each chat
    const companyData = await loadCompanyData(currentSession.companyId);
    const userPersonalData = await getUserPersonalInfo(currentSession.companyId, currentSession.userId);

    // Safe metric calculations using current data
    const safeClients = companyData.clients || [];
    const safeEmployees = companyData.employees || [];
    const safeSites = companyData.sites || [];
    const safeModules = companyData.platformModules || [];

    const realTimeMetrics = {
      monthlyRevenue: safeClients.reduce((sum, c) => sum + safeFormatNumber(c.monthly_revenue, 0), 0),
      activeGuards: safeEmployees.filter(e => e.status === 'Active').length,
      totalEmployees: safeEmployees.length,
      guardsOnLeave: safeEmployees.filter(e => e.status === 'On Leave').length,
      inactiveEmployees: safeEmployees.filter(e => e.status === 'Inactive').length,
      totalClients: safeClients.length,
      totalSites: safeSites.length,
      totalModules: safeModules.length
    };

    // Role-based filtering using current employee data
    const staticGuards = safeEmployees.filter(e => 
      e.role === 'Security Guard' && e.status === 'Active'
    );
    
    const drivers = safeEmployees.filter(e => {
      const role = (e.role || '').toLowerCase();
      return (role.includes('patrol') || 
              role.includes('driver') || 
              role === 'mobile patrol') && 
             e.status === 'Active';
    });
    
    const supervisors = safeEmployees.filter(e => {
      const role = (e.role || '').toLowerCase();
      return (role.includes('supervisor') || role.includes('manager')) && 
             e.status === 'Active';
    });

    console.log(`CURRENT METRICS: Revenue: ${realTimeMetrics.monthlyRevenue}, Guards: ${realTimeMetrics.activeGuards}, Drivers: ${drivers.length}, Clients: ${realTimeMetrics.totalClients}, Modules: ${realTimeMetrics.totalModules}`);

    // Build system prompt from current database state
    const systemPrompt = aiService.buildDynamicSystemPrompt(companyData, realTimeMetrics, safeClients, safeEmployees, drivers);

    // Complete tools array with all functions
    const tools = [
      { type: "function", function: { name: 'get_weather', parameters: { type: 'object', properties: { location: { type: 'string' } }, required: ['location'] } } },
      { type: "function", function: { name: 'get_business_data', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
      { type: "function", function: { name: 'add_employee', parameters: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, site: { type: 'string' }, hourlyRate: { type: 'number' }, status: { type: 'string' } }, required: ['name'] } } },
      { type: "function", function: { name: 'add_client', parameters: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' }, monthly_revenue: { type: 'number' }, contact_person: { type: 'string' }, contractDescription: { type: 'string' }, hourlyRate: { type: 'number' } }, required: ['name'] } } },
      { type: "function", function: { name: 'update_employee', parameters: { type: 'object', properties: { employeeId: { type: 'string' }, updates: { type: 'object' } }, required: ['employeeId', 'updates'] } } },
      { type: "function", function: { name: 'update_employee_status', parameters: { type: 'object', properties: { employeeId: { type: 'string' }, newStatus: { type: 'string', enum: ['Active', 'Inactive', 'On Leave', 'Suspended', 'Rehired'] }, reason: { type: 'string' }, notes: { type: 'string' } }, required: ['employeeId', 'newStatus', 'reason'] } } },
      { type: "function", function: { name: 'get_employees_by_status', parameters: { type: 'object', properties: { statusFilter: { type: 'string', enum: ['all', 'Active', 'Inactive', 'On Leave', 'Suspended', 'Rehired'] }, includeAuditTrail: { type: 'boolean' } } } } },
      { type: "function", function: { name: 'get_employee_audit_trail', parameters: { type: 'object', properties: { employeeId: { type: 'string' } }, required: ['employeeId'] } } },
      { type: "function", function: { name: 'update_client', parameters: { type: 'object', properties: { clientId: { type: 'string' }, updates: { type: 'object' } }, required: ['clientId', 'updates'] } } },
      { type: "function", function: { name: 'create_module', parameters: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, features: { type: 'array', items: { type: 'string' } } }, required: ['name', 'description'] } } },
      { type: "function", function: { name: 'delete_all_modules', parameters: { type: 'object', properties: {}, required: [] } } },
      { type: "function", function: { name: 'delete_single_module', parameters: { type: 'object', properties: { moduleId: { type: 'string', description: 'Module ID or name to delete' } }, required: ['moduleId'] } } },
      { type: "function", function: { name: 'list_backups', parameters: { type: 'object', properties: { backupType: { type: 'string' } } } } },
      { type: "function", function: { name: 'restore_backup', parameters: { type: 'object', properties: { backupFileName: { type: 'string' }, mergeWithExisting: { type: 'boolean' } }, required: ['backupFileName'] } } },
      { type: "function", function: { name: 'get_current_time', parameters: { type: 'object', properties: {}, required: [] } } },
      { type: "function", function: { name: 'update_personal_info', parameters: { type: 'object', properties: { info_type: { type: 'string' }, info_key: { type: 'string' }, info_value: { type: 'string' } }, required: ['info_type', 'info_key', 'info_value'] } } },
      { type: "function", function: { name: 'confirm_action', parameters: { type: 'object', properties: { confirmationId: { type: 'string' }, approved: { type: 'boolean' } }, required: ['confirmationId', 'approved'] } } },
      { type: "function", function: { name: 'debug_company_data', parameters: { type: 'object', properties: {}, required: [] } } },
      { type: "function", function: { name: 'delete_client', parameters: { type: 'object', properties: { clientId: { type: 'string' } }, required: ['clientId'] } } },
      { type: "function", function: { name: 'delete_employee', parameters: { type: 'object', properties: { employeeId: { type: 'string' } }, required: ['employeeId'] } } },
      { type: "function", function: { name: 'apply_correction', parameters: { type: 'object', properties: { correctionText: { type: 'string' }, originalConfirmationId: { type: 'string' } }, required: ['correctionText'] } } },
      { type: "function", function: { name: 'analyze_uploaded_file', parameters: { type: 'object', properties: { fileName: { type: 'string' }, analysisRequest: { type: 'string' } }, required: ['fileName'] } } },
      { type: "function", function: { name: 'check_module_conflicts', parameters: { type: 'object', properties: { suggestedName: { type: 'string' }, dataType: { type: 'string' } }, required: ['suggestedName', 'dataType'] } } }
    ];

    const cleanMessages = userChatData.chatHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant');
    const recentMessages = cleanMessages.length > 12 ? cleanMessages.slice(-12) : cleanMessages;
    
    const conversationHistory = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    // Function requirement detection
    const requiresFunction = (message) => {
      const messageLower = message.toLowerCase();
      
      // Context-aware keyword detection
      const businessQueryPatterns = [
        /who are my|list my|show me my|what are my|how many/,
        /guards|clients|employees|revenue|sites|modules|drivers/,
        /profit|gross profit|calculate|billing rate|hourly rate/,
        /build|create|add|delete|remove/,
        /dashboard|metrics|contracts|financial/,
        /update.*client|change.*rate|edit.*client/
      ];
      
      // Look for business intent, not just keywords
      const hasBusinessIntent = businessQueryPatterns.some(pattern => pattern.test(messageLower));
      
      // Exclude obvious non-business queries
      const nonBusinessPatterns = [
        /hello|hi|thanks|thank you/,
        /weather/,
        /time|date/,
        /how are you|what's up/
      ];
      
      const isNonBusiness = nonBusinessPatterns.some(pattern => pattern.test(messageLower));
      
      return hasBusinessIntent && !isNonBusiness;
    };

    const shouldForceFunction = requiresFunction(message);
    console.log(`AI thinks message requires function: ${shouldForceFunction} - "${message}"`);

    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      tools: tools,
      tool_choice: shouldForceFunction ? "required" : "auto",
      temperature: 0.7,
      max_tokens: 1000
    });

    let finalResponse = '';
    let newModule = null;
    let dataChanges = [];

    if (completion.choices[0].message.tool_calls) {
      const toolCall = completion.choices[0].message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      console.log(`AI calling: ${functionName}`, functionArgs);
      
      let functionResult;
      
      switch (functionName) {
        case 'get_weather':
          const weatherLocation = functionArgs.location === 'Markham' || 
                                functionArgs.location.toLowerCase().includes('markham') ? 
                                'Seattle, WA' : functionArgs.location;
          console.log(`Getting weather for: ${weatherLocation} (original: ${functionArgs.location})`);
          functionResult = await getWeatherData(weatherLocation);
          break;
        case 'get_business_data':
          console.log(`Getting business data for ${currentSession.companyId}: ${functionArgs.query}`);
          functionResult = await getBusinessData(functionArgs.query);
          break;
        case 'add_employee':
          functionResult = await addEmployee(currentSession.companyId, functionArgs);
          if (functionResult.requiresConfirmation) {
            finalResponse = functionResult.confirmationMessage;
            userChatData.chatHistory.push({ role: 'assistant', content: finalResponse, timestamp: new Date() });
            await saveUserChat(currentSession.companyId, currentSession.userId, userChatData);
            return res.json({ 
              response: finalResponse,
              requiresConfirmation: true,
              confirmationId: functionResult.confirmationId,
              userName: currentSession.userId,
              companyName: companyData.companyInfo.name
            });
          }
          if (functionResult.success) dataChanges.push({ type: 'employee_added', data: functionResult.employee });
          break;
        case 'add_client':
          functionResult = await addClient(currentSession.companyId, functionArgs);
          if (functionResult.requiresConfirmation) {
            finalResponse = functionResult.confirmationMessage;
            userChatData.chatHistory.push({ role: 'assistant', content: finalResponse, timestamp: new Date() });
            await saveUserChat(currentSession.companyId, currentSession.userId, userChatData);
            return res.json({ 
              response: finalResponse,
              requiresConfirmation: true,
              confirmationId: functionResult.confirmationId,
              calculatedRevenue: functionResult.calculatedRevenue,
              userName: currentSession.userId,
              companyName: companyData.companyInfo.name
            });
          }
          if (functionResult.success) dataChanges.push({ type: 'client_added', data: functionResult.client });
          break;
        case 'update_employee':
          functionResult = await updateEmployee(currentSession.companyId, functionArgs.employeeId, functionArgs.updates);
          if (functionResult.success) dataChanges.push({ type: 'employee_updated', data: functionResult.employee });
          break;
        case 'update_employee_status':
          functionResult = await updateEmployeeStatus(currentSession.companyId, functionArgs.employeeId, functionArgs.newStatus, functionArgs.reason, functionArgs.notes || '');
          if (functionResult.success) dataChanges.push({ type: 'employee_status_updated', data: functionResult.employee, statusChange: functionResult.statusChange });
          break;
        case 'get_employees_by_status':
          functionResult = await getEmployeesByStatus(currentSession.companyId, functionArgs.statusFilter || 'all', functionArgs.includeAuditTrail || false);
          break;
        case 'get_employee_audit_trail':
          functionResult = await getEmployeeAuditTrail(currentSession.companyId, functionArgs.employeeId);
          break;
        case 'update_client':
          console.log(`AI processing client update request: "${message}"`);
          
          // Parse the user's intent from their message
          const updateIntent = await aiService.parseClientUpdateIntent(message, safeClients);
          
          if (updateIntent.success) {
            console.log(`Parsed update:`, updateIntent);
            functionResult = await updateClient(currentSession.companyId, updateIntent.clientIdentifier, updateIntent.updates);
            if (functionResult.success) dataChanges.push({ type: 'client_updated', data: functionResult.client });
          } else {
            functionResult = { 
              success: false, 
              error: updateIntent.error,
              suggestion: `Available clients: ${safeClients.map(c => c.name).join(', ')}`
            };
          }
          break;
        case 'create_module':
          functionResult = await createModuleData(functionArgs.name, functionArgs.description, functionArgs.features);
          if (functionResult.success) newModule = functionResult.module;
          break;
        case 'delete_all_modules':
          console.log(`AI analyzing deletion request: "${message}"`);
          
          // Analyze user intent instead of blindly executing
          const deletionIntent = aiService.parseModuleDeletionIntent(message, safeModules);
          console.log(`Deletion analysis:`, deletionIntent);
          
          if (deletionIntent.shouldDeleteSingleModule && deletionIntent.targetModule) {
            console.log(`Redirecting to single module deletion: ${deletionIntent.targetModule.name}`);
            functionResult = await deleteSingleModule(currentSession.companyId, deletionIntent.targetModule.name);
            if (functionResult.success) dataChanges.push({ 
              type: 'single_module_deleted', 
              data: functionResult.deletedModule 
            });
          } else if (deletionIntent.shouldDeleteAll) {
            console.log(`Confirmed mass deletion request`);
            functionResult = await deleteAllModules(currentSession.companyId);
            if (functionResult.success) dataChanges.push({ 
              type: 'all_modules_deleted', 
              count: functionResult.deletedCount, 
              backupFile: functionResult.backupFile 
            });
          } else {
            console.log(`PREVENTED unclear deletion request`);
            functionResult = { 
              success: false, 
              error: `I need clarification on what to delete.`,
              suggestion: `Available modules: ${safeModules.map(m => m.name).join(', ')}. Please specify which module to delete, or say "delete all modules" to remove everything.`,
              reasoning: deletionIntent.reasoning,
              availableModules: deletionIntent.availableModules
            };
          }
          break;
        case 'delete_single_module':
          console.log(`AI requesting single module deletion: ${functionArgs.moduleId}`);
          functionResult = await deleteSingleModule(currentSession.companyId, functionArgs.moduleId);
          if (functionResult.success) dataChanges.push({ 
            type: 'single_module_deleted', 
            data: functionResult.deletedModule 
          });
          break;
        case 'list_backups':
          functionResult = await listBackups(currentSession.companyId);
          break;
        case 'restore_backup':
          functionResult = await restoreFromBackup(functionArgs.backupFileName, functionArgs.mergeWithExisting !== false);
          if (functionResult.success) dataChanges.push({ type: 'backup_restored', count: functionResult.restoredCount, mergeMode: functionResult.mergeMode });
          break;
        case 'get_current_time':
          functionResult = getCurrentTime();
          break;
        case 'update_personal_info':
          functionResult = await updateUserPersonalInfo(currentSession.companyId, currentSession.userId, functionArgs.info_type, functionArgs.info_key, functionArgs.info_value);
          if (functionResult.success) dataChanges.push({ type: 'personal_info_updated', data: functionResult.personalInfo });
          break;
        case 'confirm_action':
          functionResult = await confirmPendingAction(functionArgs.confirmationId, functionArgs.approved);
          if (functionResult.success && functionResult.executed) {
            dataChanges.push({ type: 'confirmation_executed', data: functionResult.result });
          }
          break;
        case 'debug_company_data':
          functionResult = await debugCompanyData(currentSession.companyId);
          break;
        case 'delete_client':
          functionResult = await deleteClient(currentSession.companyId, functionArgs.clientId);
          if (functionResult.success) dataChanges.push({ type: 'client_deleted', data: functionResult.deletedClients });
          break;
        case 'delete_employee':
          functionResult = await deleteEmployee(currentSession.companyId, functionArgs.employeeId);
          if (functionResult.success) dataChanges.push({ type: 'employee_deleted', data: functionResult.deletedEmployee });
          break;
        case 'apply_correction':
          functionResult = await applyUserCorrection(functionArgs.correctionText, functionArgs.originalConfirmationId);
          if (functionResult.success && functionResult.newConfirmation) {
            userChatData.chatHistory.push({ role: 'assistant', content: functionResult.newConfirmationMessage, timestamp: new Date() });
            await saveUserChat(currentSession.companyId, currentSession.userId, userChatData);
            return res.json({ 
              response: functionResult.newConfirmationMessage,
              requiresConfirmation: true,
              confirmationId: functionResult.newConfirmationId,
              correction: true,
              userName: currentSession.userId,
              companyName: companyData.companyInfo.name
            });
          }
          break;
        case 'analyze_uploaded_file':
          // Handle file analysis requests
          functionResult = { success: true, message: "File analysis feature ready - please upload files through the drag-and-drop interface" };
          break;
        case 'check_module_conflicts':
          functionResult = await checkModuleConflicts(currentSession.companyId, functionArgs.suggestedName, functionArgs.dataType);
          break;
        default:
          functionResult = { error: 'Unknown function' };
      }
      
      userChatData.chatHistory.push({
        role: 'assistant',
        content: '',
        tool_calls: completion.choices[0].message.tool_calls,
        timestamp: new Date()
      });
      
      userChatData.chatHistory.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(functionResult),
        timestamp: new Date()
      });
      
      // AI-powered follow-up that thinks contextually
      const followUpCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: 'system', 
            content: `You are Aetheris, ${currentSession.userName}'s AI assistant for ${companyData.companyInfo.name}. 

Think dynamically: Analyze the function result and respond naturally based on what actually happened.

BUSINESS CONTEXT YOU KNOW:
- Company: ${companyData.companyInfo.name}
- Your Role: AI business assistant
- User: ${currentSession.userName} (${currentSession.userRole || 'Business Owner'})
- Current Revenue: ${realTimeMetrics.monthlyRevenue.toLocaleString()}
- Active Guards: ${realTimeMetrics.activeGuards}
- Total Clients: ${realTimeMetrics.totalClients}

RESPONSE STRATEGY:
1. ANALYZE the function result data
2. EXTRACT relevant business insights
3. RESPOND conversationally with actual numbers/names
4. SUGGEST logical next steps when appropriate

PROFIT RESPONSES (if function returned profit data):
- Show the actual calculation: "$X revenue - $Y labor costs = $Z profit (W% margin)"
- Mention per-client breakdowns if available
- Highlight profitable vs. less profitable clients
- Suggest optimizations based on margins

UPDATE RESPONSES (if function updated something):
- Confirm what was actually changed
- Show before/after values
- Mention business impact of the change
- Calculate new totals if relevant

ERROR RESPONSES (if function failed):
- Explain what went wrong in business terms
- Suggest alternative approaches
- Ask clarifying questions to resolve the issue

DELETION PREVENTION (if deletion was prevented):
- Explain why mass deletion was prevented
- Clarify what the user can do instead
- Offer specific deletion options

CRITICAL: Use ACTUAL data from the function result. Don't make up numbers or names.
CRITICAL: Respond in natural business language, not technical jargon.
CRITICAL: Think about what the user actually wants to accomplish.

Function result to analyze: ${JSON.stringify(functionResult, null, 2)}
User's original message: "${message}"

Think about what they're trying to accomplish and respond helpfully with real data.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      finalResponse = followUpCompletion.choices[0].message.content;
    } else {
      finalResponse = completion.choices[0].message.content;
    }

    userChatData.chatHistory.push({ role: 'assistant', content: finalResponse, timestamp: new Date() });
    await saveUserChat(currentSession.companyId, currentSession.userId, userChatData);

    res.json({ 
      response: finalResponse,
      newModule,
      dataChanges,
      userName: currentSession.userId,
      companyName: companyData.companyInfo.name
    });

  } catch (error) {
    console.error('AI error:', error);
    res.json({ response: `Error: ${error.message}. Please try again!`, error: error.message });
  }
});

// API ENDPOINTS
app.get('/api/modules', async (req, res) => {
  try {
    const companyData = await loadCompanyData(currentSession.companyId);
    res.json({ success: true, modules: companyData.platformModules, userName: currentSession.userId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/sync-frontend-state', async (req, res) => {
  try {
    const { currentModules, pageRefresh, userId } = req.body;
    console.log(`Frontend sync: ${currentModules.length} modules, pageRefresh: ${pageRefresh}`);
    
    // Update current session to match frontend state
    if (userId) currentSession.userId = userId;
    
    const companyData = await loadCompanyData(currentSession.companyId);
    
    res.json({ 
      success: true, 
      message: `Synced with ${companyData.platformModules.length} backend modules`,
      backendModules: companyData.platformModules.length,
      frontendModules: currentModules.length,
      synchronized: true
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.delete('/api/modules/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    console.log(`DELETE REQUEST received for module: ${moduleId}`);
    
    if (!moduleId) {
      return res.json({ success: false, error: 'Module ID is required' });
    }
    
    const result = await deleteSingleModule(currentSession.companyId, moduleId);
    
    console.log(`DELETE RESULT:`, result);
    
    res.json(result);
  } catch (error) {
    console.error(`DELETE ENDPOINT ERROR:`, error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/business-metrics', async (req, res) => {
  try {
    const companyData = await loadCompanyData(currentSession.companyId);
    
    // Metrics calculation using actual current data
    const safeClients = companyData.clients || [];
    const safeEmployees = companyData.employees || [];
    const safeSites = companyData.sites || [];
    
    const metrics = {
      monthlyRevenue: safeClients.reduce((sum, c) => sum + safeFormatNumber(c.monthly_revenue, 0), 0),
      activeGuards: safeEmployees.filter(e => e.status === 'Active').length,
      totalEmployees: safeEmployees.length,
      totalClients: safeClients.length,
      totalSites: safeSites.length,
      guardsOnLeave: safeEmployees.filter(e => e.status === 'On Leave').length,
      inactiveEmployees: safeEmployees.filter(e => e.status === 'Inactive').length,
      averageHourlyRate: safeEmployees.length > 0 ? 
        safeEmployees.reduce((sum, e) => sum + safeFormatNumber(e.hourlyRate, 0), 0) / safeEmployees.length : 0,
      lastUpdated: companyData.lastUpdated
    };
    
    // Add AI-powered profit calculations to metrics
    const financialAnalysis = getFinancialAnalysis(companyData);
    metrics.grossProfit = financialAnalysis.grossProfit;
    metrics.profitMargin = financialAnalysis.profitMargin;
    metrics.totalLaborCosts = financialAnalysis.totalLaborCosts;
    metrics.businessHealth = financialAnalysis.businessInsights.healthScore;
    
    res.json({ success: true, metrics: metrics, companyName: companyData.companyInfo.name });
  } catch (error) {
    console.error('Business metrics error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const { status = 'all', includeInactive = false, includeAuditTrail = false } = req.query;
    const result = await getEmployeesByStatus(currentSession.companyId, status, includeAuditTrail === 'true');
    
    if (!includeInactive && result.success) {
      result.employees = result.employees.filter(e => e.status !== 'Inactive');
    }
    
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.put('/api/employees/:employeeId/status', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { newStatus, reason, notes } = req.body;
    
    if (!Object.values(EMPLOYEE_STATUSES).includes(newStatus)) {
      return res.json({ success: false, error: 'Invalid status', validStatuses: Object.values(EMPLOYEE_STATUSES) });
    }
    
    const result = await updateEmployeeStatus(currentSession.companyId, employeeId, newStatus, reason, notes);
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// AI-powered client billing rate update endpoint
app.put('/api/clients/:clientId/billing-rate', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { billingRate } = req.body;
    
    if (!billingRate || isNaN(billingRate)) {
      return res.json({ success: false, error: 'Valid billing rate is required' });
    }
    
    const result = await updateClient(currentSession.companyId, clientId, { billingRate: parseFloat(billingRate) });
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// AI-powered profit analysis endpoint
app.get('/api/profit-analysis', async (req, res) => {
  try {
    const companyData = await loadCompanyData(currentSession.companyId);
    const profitAnalysis = getFinancialAnalysis(companyData);
    
    res.json({ 
      success: true, 
      profitAnalysis: profitAnalysis,
      companyName: companyData.companyInfo.name 
    });
  } catch (error) {
    console.error('Profit analysis error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/backups', async (req, res) => {
  try {
    const result = await listBackups(currentSession.companyId);
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/restore-backup', async (req, res) => {
  try {
    const { backupFileName, mergeWithExisting = true } = req.body;
    const result = await restoreFromBackup(backupFileName, mergeWithExisting);
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'AI-POWERED BUSINESS SYSTEM - READY!',
    aiCapabilities: [
      'INTELLIGENT: AI thinks and uses variables instead of hard-coded responses',
      'CONTEXTUAL: System adapts to actual business data and patterns',
      'PREDICTIVE: AI analyzes user intent before taking actions',
      'FINANCIAL: Advanced profit calculations with per-client breakdowns',
      'SAFETY: Intelligent deletion prevention based on context analysis',
      'ADAPTIVE: Responses change based on business size and health',
      'LEARNING: AI parses natural language for complex updates',
      'FILE ANALYSIS: Drag-and-drop CSV/Excel analysis with smart module creation',
      'SMART MODULES: Intelligent conflict resolution and subdivision support'
    ],
    aiExamples: [
      '"change client A rate to $55" → AI parses intent → finds client → updates rate → recalculates revenue',
      '"what\'s my profit?" → AI calculates revenue - labor costs → shows detailed breakdown',
      '"Delete Camera Module" → AI calls delete_single_module() NOT delete_employee()',
      'Dashboard adapts: "2 guards" vs "1 guard" (proper grammar)',
      'Business health: "excellent" vs "needs improvement" based on actual margins',
      'Drag CSV file → AI detects employees → asks "Update existing Employee module?"'
    ],
    currentSession: currentSession,
    pendingConfirmations: currentSession.pendingConfirmations.size,
    aiEngineStatus: 'All AI cores operational and thinking dynamically',
    fileAnalysisStatus: 'Ready for drag-and-drop file analysis',
    timestamp: new Date().toISOString()
  });
});

// SERVER STARTUP
const startServer = async () => {
  await fs.mkdir(COMPANIES_DIR, { recursive: true });
  await fs.mkdir('uploads', { recursive: true }); // Ensure uploads directory exists
  await ensureBackupDir();
  await loadCompanyData(currentSession.companyId);
  
  console.log('ENHANCED AI-POWERED BUSINESS SYSTEM - READY!');
  console.log('INTELLIGENT: AI thinks and uses variables instead of hard-coded responses');
  console.log('CONTEXTUAL: System adapts to actual business data and patterns');
  console.log('PREDICTIVE: AI analyzes user intent before taking actions');
  console.log('FINANCIAL: Advanced profit calculations with per-client breakdowns');
  console.log('SAFETY: Intelligent deletion prevention based on context analysis');
  console.log('ADAPTIVE: Responses change based on business size and health');
  console.log('LEARNING: AI parses natural language for complex updates');
  console.log('FILE ANALYSIS: Drag-and-drop CSV/Excel analysis with smart module creation');
  console.log('SMART MODULES: Intelligent conflict resolution and subdivision support');
  console.log('');
  console.log('AI THINKING EXAMPLES:');
  console.log('  "change client A rate to $55" → AI parses intent → finds client → updates rate → recalculates revenue');
  console.log('  "what\'s my profit?" → AI calculates revenue - labor costs → shows detailed breakdown');
  console.log('  "Delete Camera Module" → AI calls delete_single_module() NOT delete_employee()');
  console.log('  Dashboard adapts: "2 guards" vs "1 guard" (proper grammar)');
  console.log('  Business health: "excellent" vs "needs improvement" based on actual margins');
  console.log('  Drag CSV file → AI detects employees → asks "Update existing Employee module?"');
  
  app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log(`Session: ${currentSession.userId}@${currentSession.companyId}`);
    console.log('AI ENGINE: System now thinks with variables and adapts to your business');
    console.log('FILE SYSTEM: Ready for intelligent file analysis and module creation');
  });
};

startServer();