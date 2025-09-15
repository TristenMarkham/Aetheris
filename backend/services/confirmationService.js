// services/confirmationService.js - COMPLETE FIXED FILE
// Load environment variables first
require('dotenv').config();

const { safeFormatNumber, safeFormatCurrency } = require('../utils/formatters');
const OpenAI = require('openai');

class ConfirmationService {
  constructor() {
    // Store pending confirmations in memory (could be moved to database for persistence)
    this.pendingConfirmations = new Map();
    
    // Debug API key loading
    console.log('🔑 OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? 'YES (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'NO');
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // CONFIRMATION CREATION
  createConfirmationRequest(type, data, calculatedData = null, userId = 'system') {
    const confirmationId = `confirm_${Date.now()}`;
    
    const confirmation = {
      id: confirmationId,
      type: type,
      data: data,
      calculatedData: calculatedData,
      timestamp: new Date(),
      status: 'pending',
      requiresManualConfirmation: true,
      userId: userId
    };
    
    this.pendingConfirmations.set(confirmationId, confirmation);
    console.log(`✅ Created confirmation ${confirmationId} for ${type} - waiting for manual approval`);
    
    return confirmation;
  }

  // CONFIRMATION MESSAGE GENERATION
  generateConfirmationMessage(confirmation) {
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

**Does this look correct?** Let me know if you'd like to proceed or make any changes.

Manual confirmation required - Will not auto-add`;
        } else {
          return `**New Client Confirmation**

**Client:** ${data.name}
**Type:** ${data.type || 'Business'}
**Monthly Revenue:** $${safeFormatCurrency(data.monthly_revenue)}
**Contact:** ${data.contact_person || 'Not specified'}

**Does this look correct?** Let me know if you'd like to proceed or make any changes.

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

**Does this look correct?** Let me know if you'd like to proceed or make any changes.

Manual confirmation required - Will not auto-add`;

      case 'update_employee_status':
        return `**Employee Status Update Confirmation**

**Employee:** ${data.employeeName || data.name}
**Current Status:** ${data.currentStatus || 'Active'}
**New Status:** ${data.newStatus}
**Reason:** ${data.reason}
**Effective:** ${data.effectiveDate ? new Date(data.effectiveDate).toLocaleString() : 'Immediately'}
${data.notes ? `**Notes:** ${data.notes}` : ''}

**Does this look correct?** Let me know if you'd like to proceed.

Manual confirmation required - Will not auto-update`;

      case 'delete_client':
        const clientNames = Array.isArray(data) ? 
          data.map(c => c.name).join(', ') : 
          data.name;
        const clientCount = Array.isArray(data) ? data.length : 1;
        
        return `**Client Deletion Confirmation**

**Warning:** You are about to delete ${clientCount} client(s): ${clientNames}

This action will:
- Remove all client data permanently
- Create an automatic backup for recovery
- Update all related financial calculations

**Are you sure you want to proceed?**

Manual confirmation required - Will not auto-delete`;

      case 'delete_employee':
        return `**Employee Deletion Confirmation**

**Warning:** You are about to delete employee: ${data.name}

This action will:
- Remove employee from active roster
- Create legal compliance backup (7-year retention)
- Update payroll calculations
- Preserve audit trail for compliance

**Are you sure you want to proceed?**

Manual confirmation required - Will not auto-delete`;

      case 'update_billing_rate':
        return `**Billing Rate Update Confirmation**

**Client:** ${data.clientName}
**Current Rate:** $${data.currentRate}/hour
**New Rate:** $${data.newRate}/hour
**Change:** ${data.newRate > data.currentRate ? '+' : ''}$${(data.newRate - data.currentRate).toFixed(2)}/hour

**Revenue Impact:**
- Current Monthly: $${safeFormatCurrency(data.currentMonthlyRevenue)}
- New Monthly: $${safeFormatCurrency(data.newMonthlyRevenue)}
- Change: ${data.newMonthlyRevenue > data.currentMonthlyRevenue ? '+' : ''}$${safeFormatCurrency(Math.abs(data.newMonthlyRevenue - data.currentMonthlyRevenue))}

**Should I proceed with this rate update?**`;

      default:
        return `Confirmation needed for ${type}. Please let me know if you'd like to proceed.`;
    }
  }

  generateSmartEmployeeConfirmation(employeeData, parseResult, corrections = null) {
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

    confirmationText += `\n\n**Does this look correct?** Let me know if you'd like to proceed or make any changes.

Manual confirmation required - Will not auto-add`;

    return confirmationText;
  }

  // SIMPLE CONFIRMATION HANDLER (Fallback when AI fails)
  async handleConfirmationResponseSimple(message) {
    const pendingCount = this.getPendingConfirmations().length;
    if (pendingCount === 0) {
      return null;
    }
    
    console.log(`🔧 SIMPLE CONFIRMATION HANDLER: "${message}" with ${pendingCount} pending confirmations`);
    
    const messageLower = message.toLowerCase().trim();
    
    // Simple approval detection (fallback when AI fails)
    const approvalWords = ['yes', 'correct', 'approve', 'confirm', 'proceed', 'ok', 'okay', 'good', 'right', 'add'];
    const rejectionWords = ['no', 'cancel', 'stop', 'wrong', 'abort'];
    
    const isApproval = approvalWords.includes(messageLower);
    const isRejection = rejectionWords.includes(messageLower);
    
    if (isApproval || isRejection) {
      const mostRecent = this.getMostRecentPendingConfirmation();
      if (mostRecent) {
        console.log(`🎯 SIMPLE ${isApproval ? 'APPROVAL' : 'REJECTION'}: ${mostRecent.id}`);
        
        mostRecent.status = isApproval ? 'approved' : 'rejected';
        mostRecent.processedAt = new Date();
        
        if (isRejection) {
          this.pendingConfirmations.delete(mostRecent.id);
          return {
            success: true,
            message: 'Action cancelled.',
            cancelled: true,
            approved: false
          };
        }
        
        return {
          success: true,
          approved: true,
          confirmation: mostRecent,  // CRITICAL: This must be included for execution
          message: `✅ ${mostRecent.type.replace('_', ' ')} approved! Processing...`
        };
      }
    }
    
    return null;
  }

  // AI-POWERED CONFIRMATION ANALYSIS
  async analyzeConfirmationIntent(message) {
    console.log(`AI analyzing confirmation intent: "${message}"`);
    
    const pendingConfirmations = this.getPendingConfirmations();
    const confirmationContext = pendingConfirmations.length > 0 
      ? `User has ${pendingConfirmations.length} pending confirmation(s): ${pendingConfirmations.map(c => c.type).join(', ')}`
      : 'No pending confirmations';

    const prompt = `Analyze this user message for confirmation intent:

Message: "${message}"
Context: ${confirmationContext}

Determine if this message is:
1. A confirmation/approval (natural language like "yes", "sounds good", "go ahead", "that's right", "proceed", "looks good", "correct", "perfect", "do it", etc.)
2. A rejection/cancellation ("no", "cancel", "don't do that", "stop", "wrong", "abort", etc.)
3. A completely new command that happens to contain confirmation-like words ("Update client ABC rate to $25/hour", "Add new employee", etc.)
4. A request for modification/correction ("Actually, change the name to...", "The rate should be...", etc.)
5. Unclear and needs clarification

IMPORTANT: Commands that start with action words like "Add", "Update", "Delete", "Create", "Change" are typically NEW COMMANDS, not confirmations, even if they contain words like "update".

Respond ONLY with JSON:
{
  "isConfirmation": true/false,
  "isRejection": true/false,
  "isNewCommand": true/false,
  "isModification": true/false,
  "needsClarification": true/false,
  "clarificationQuestion": "string or null",
  "confidence": "high|medium|low",
  "reasoning": "why you made this determination"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.1
      });

      let responseText = response.choices[0].message.content.trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(responseText);
      console.log(`AI confirmation analysis:`, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Confirmation intent analysis failed:', error.message);
      // Fallback: assume it's a new command if AI fails
      return { 
        isNewCommand: true, 
        needsClarification: false, 
        confidence: 'low',
        reasoning: 'AI analysis failed, defaulting to new command'
      };
    }
  }

  // INTELLIGENT CONFIRMATION RESPONSE HANDLING - FIXED VERSION WITH FALLBACK
  async handleConfirmationResponse(message) {
    const pendingCount = this.getPendingConfirmations().length;
    if (pendingCount === 0) {
      return null;
    }
    
    console.log(`🔍 Analyzing message "${message}" with ${pendingCount} pending confirmations`);
    
    try {
      // Try AI analysis first
      const intentAnalysis = await this.analyzeConfirmationIntent(message);
      console.log(`🤖 AI Intent Analysis:`, intentAnalysis);
      
      // If AI analysis succeeded and has high confidence, use it
      if (intentAnalysis.confidence !== 'low') {
        // Handle different intent types
        if (intentAnalysis.isNewCommand) {
          console.log(`AI determined this is a new command, not a confirmation response`);
          return null; // This is a new command, not a confirmation response
        }
        
        if (intentAnalysis.needsClarification) {
          return {
            success: true,
            message: intentAnalysis.clarificationQuestion,
            needsClarification: true
          };
        }
        
        if (intentAnalysis.isModification) {
          // Handle modifications/corrections
          const mostRecent = this.getMostRecentPendingConfirmation();
          if (mostRecent) {
            return {
              success: true,
              message: "I understand you'd like to make changes. Let me process those corrections.",
              isModification: true,
              confirmationId: mostRecent.id
            };
          }
        }
        
        if (intentAnalysis.isConfirmation || intentAnalysis.isRejection) {
          // Process the confirmation
          const mostRecent = this.getMostRecentPendingConfirmation();
          
          if (!mostRecent) {
            return {
              success: false,
              message: "I don't see any pending confirmations to respond to."
            };
          }
          
          console.log(`✅ Processing ${intentAnalysis.isConfirmation ? 'approval' : 'rejection'} for: ${mostRecent.type}`);
          
          if (intentAnalysis.isRejection) {
            // Handle rejection
            mostRecent.status = 'rejected';
            mostRecent.processedAt = new Date();
            this.pendingConfirmations.delete(mostRecent.id);
            
            return {
              success: true,
              message: `Action cancelled. The ${mostRecent.type.replace('_', ' ')} will not be processed.`,
              cancelled: true,
              approved: false
            };
          }
          
          if (intentAnalysis.isConfirmation) {
            // Handle approval - CRITICAL FIX: Mark as processed and return the confirmation for execution
            mostRecent.status = 'approved';
            mostRecent.processedAt = new Date();
            
            console.log(`🚀 CONFIRMATION APPROVED: ${mostRecent.id} - ${mostRecent.type}`);
            console.log(`📤 RETURNING CONFIRMATION FOR EXECUTION:`, {
              id: mostRecent.id,
              type: mostRecent.type,
              hasData: !!mostRecent.data
            });
            
            // CRITICAL: Return the structure that server.js expects
            return {
              success: true,
              approved: true,
              confirmation: mostRecent,  // This is what server.js needs!
              message: `✅ ${mostRecent.type.replace('_', ' ')} approved! Processing...`,
              confidence: intentAnalysis.confidence
            };
          }
        }
        
        // If AI couldn't determine intent with high confidence, ask for clarification
        if (intentAnalysis.confidence === 'medium') {
          const mostRecent = this.getMostRecentPendingConfirmation();
          return {
            success: true,
            message: `I'm not sure if you're responding to the pending ${mostRecent?.type.replace('_', ' ')} confirmation or issuing a new command. Could you clarify: are you approving the ${mostRecent?.type.replace('_', ' ')}, or do you want me to process "${message}" as a new request?`,
            needsClarification: true
          };
        }
      }
    } catch (error) {
      console.log(`⚠️ AI analysis failed: ${error.message}, using simple fallback`);
    }
    
    // Fallback to simple confirmation handling when AI fails or has low confidence
    console.log(`🔧 Using simple fallback confirmation handler`);
    return await this.handleConfirmationResponseSimple(message);
  }

  // CONFIRMATION PROCESSING
  async confirmPendingAction(confirmationId, approved = true) {
    try {
      const confirmation = this.pendingConfirmations.get(confirmationId);
      
      if (!confirmation) {
        return { success: false, error: 'Confirmation not found' };
      }
      
      if (confirmation.status !== 'pending') {
        return { success: false, error: `Confirmation already ${confirmation.status}` };
      }
      
      confirmation.status = approved ? 'approved' : 'rejected';
      confirmation.processedAt = new Date();
      
      if (!approved) {
        this.pendingConfirmations.delete(confirmationId);
        return { 
          success: true, 
          message: 'Action cancelled by user',
          cancelled: true
        };
      }
      
      // Mark as executed but don't delete yet - let the calling service handle execution
      return {
        success: true,
        executed: false, // Will be set to true by the calling service
        confirmation: confirmation,
        message: `${confirmation.type.replace('_', ' ')} approved and ready for execution`
      };
      
    } catch (error) {
      console.error('Failed to confirm action:', error.message);
      return { success: false, error: error.message };
    }
  }

  getMostRecentPendingConfirmation() {
    let mostRecent = null;
    let mostRecentTime = 0;
    
    for (const [id, confirmation] of this.pendingConfirmations) {
      if (confirmation.status === 'pending' && confirmation.timestamp.getTime() > mostRecentTime) {
        mostRecent = confirmation;
        mostRecentTime = confirmation.timestamp.getTime();
      }
    }
    
    return mostRecent;
  }

  // USER CORRECTIONS WITH AI
  async applyUserCorrection(correctionText, originalConfirmationId = null) {
    try {
      let targetConfirmation = null;
      
      if (originalConfirmationId) {
        targetConfirmation = this.pendingConfirmations.get(originalConfirmationId);
      } else {
        targetConfirmation = this.getMostRecentPendingConfirmation();
      }
      
      if (!targetConfirmation) {
        return { success: false, error: 'No pending confirmation found to correct' };
      }
      
      console.log(`Applying correction to ${targetConfirmation.type}: "${correctionText}"`);
      
      // This would integrate with the AI service for handling corrections
      const aiService = require('./aiService');
      
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
      
      const newConfirmation = this.createConfirmationRequest('add_employee', newEmployee, null, targetConfirmation.userId);
      
      const newConfirmationMessage = this.generateSmartEmployeeConfirmation(
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
  }

  // CONFIRMATION MANAGEMENT
  getPendingConfirmations(userId = null) {
    const pending = [];
    for (const [id, confirmation] of this.pendingConfirmations) {
      if (confirmation.status === 'pending' && (!userId || confirmation.userId === userId)) {
        pending.push({
          id: confirmation.id,
          type: confirmation.type,
          timestamp: confirmation.timestamp,
          userId: confirmation.userId
        });
      }
    }
    return pending.sort((a, b) => b.timestamp - a.timestamp);
  }

  getConfirmationById(confirmationId) {
    return this.pendingConfirmations.get(confirmationId);
  }

  cancelConfirmation(confirmationId) {
    const confirmation = this.pendingConfirmations.get(confirmationId);
    if (confirmation) {
      confirmation.status = 'cancelled';
      confirmation.cancelledAt = new Date();
      return { success: true, message: 'Confirmation cancelled' };
    }
    return { success: false, error: 'Confirmation not found' };
  }

  markConfirmationExecuted(confirmationId, result = null) {
    const confirmation = this.pendingConfirmations.get(confirmationId);
    if (confirmation) {
      confirmation.status = 'executed';
      confirmation.executedAt = new Date();
      confirmation.executionResult = result;
      
      console.log(`✅ MARKED CONFIRMATION ${confirmationId} AS EXECUTED:`, {
        type: confirmation.type,
        result: result?.success ? 'SUCCESS' : 'FAILED'
      });
      
      // Clean up executed confirmations after a delay
      setTimeout(() => {
        this.pendingConfirmations.delete(confirmationId);
        console.log(`🗑️ Cleaned up executed confirmation ${confirmationId}`);
      }, 60000); // Remove after 1 minute
      
      return { success: true, message: 'Confirmation marked as executed' };
    }
    return { success: false, error: 'Confirmation not found' };
  }

  // CLEANUP AND MAINTENANCE
  cleanupExpiredConfirmations(maxAgeHours = 24) {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const [id, confirmation] of this.pendingConfirmations) {
      if (confirmation.timestamp < cutoffTime) {
        this.pendingConfirmations.delete(id);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired confirmations`);
    }
    
    return { success: true, cleanedCount };
  }

  getConfirmationStatistics() {
    const stats = {
      total: this.pendingConfirmations.size,
      byStatus: { pending: 0, approved: 0, rejected: 0, cancelled: 0, executed: 0, corrected: 0 },
      byType: {},
      oldestPending: null
    };
    
    let oldestTime = Infinity;
    for (const [id, confirmation] of this.pendingConfirmations) {
      stats.byStatus[confirmation.status] = (stats.byStatus[confirmation.status] || 0) + 1;
      stats.byType[confirmation.type] = (stats.byType[confirmation.type] || 0) + 1;
      
      if (confirmation.status === 'pending' && confirmation.timestamp.getTime() < oldestTime) {
        oldestTime = confirmation.timestamp.getTime();
        stats.oldestPending = {
          id: confirmation.id,
          type: confirmation.type,
          timestamp: confirmation.timestamp
        };
      }
    }
    
    return stats;
  }

  // EMERGENCY CLEANUP METHODS
  clearAllPendingConfirmations() {
    const count = this.pendingConfirmations.size;
    this.pendingConfirmations.clear();
    console.log(`🧹 CLEARED ${count} PENDING CONFIRMATIONS`);
    return { cleared: count };
  }

  getStatus() {
    return {
      pendingCount: this.pendingConfirmations.size,
      pendingConfirmations: Array.from(this.pendingConfirmations.values()).map(c => ({
        id: c.id,
        type: c.type,
        status: c.status,
        timestamp: c.timestamp
      }))
    };
  }
}

module.exports = new ConfirmationService();