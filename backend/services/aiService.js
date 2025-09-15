const OpenAI = require('openai');
const Papa = require('papaparse');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-key-here'
    });
  }

  // AI-powered file analysis
  async analyzeFileData(fileContent, fileName, fileType) {
    console.log(`🧠 AI analyzing file: ${fileName} (${fileType})`);
    
    try {
      let parsedData;
      let preview;
      
      // Parse different file types
      if (fileType === 'csv' || fileType === 'txt') {
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        
        parsedData = parseResult.data;
        preview = parsedData.slice(0, 5); // First 5 rows
      } else if (fileType === 'json') {
        parsedData = JSON.parse(fileContent);
        preview = Array.isArray(parsedData) ? parsedData.slice(0, 5) : [parsedData];
      }
      
      if (!parsedData || parsedData.length === 0) {
        return { success: false, error: 'No data found in file' };
      }
      
      // AI analysis prompt
      const analysisPrompt = `Analyze this data file intelligently:

Filename: "${fileName}"
Data Preview: ${JSON.stringify(preview, null, 2)}
Total Records: ${Array.isArray(parsedData) ? parsedData.length : 1}

SMART ANALYSIS TASKS:
1. Identify the data type (employees, clients, inventory, etc.)
2. List all available fields/columns
3. Determine which fields are essential vs optional
4. Suggest appropriate module name and type
5. Identify any data quality issues
6. Recommend data structure improvements

RESPONSE FORMAT (JSON only):
{
  "dataType": "employees|clients|inventory|locations|other",
  "suggestedModuleName": "specific name based on content",
  "confidence": "high|medium|low",
  "detectedFields": [
    {
      "fieldName": "exact_field_name",
      "dataType": "string|number|date|email|phone",
      "sampleValues": ["sample1", "sample2"],
      "essential": true|false,
      "description": "what this field contains"
    }
  ],
  "moduleStructure": {
    "primaryFields": ["list of essential fields"],
    "optionalFields": ["list of optional fields"],
    "suggestedAdditions": ["fields that would improve the module"]
  },
  "dataQualityIssues": ["list of issues found"],
  "businessInsights": {
    "recordCount": number,
    "completenessScore": "percentage of filled fields",
    "recommendations": ["list of recommendations"]
  }
}`;

      const analysisResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: analysisPrompt }],
        max_tokens: 1000,
        temperature: 0.1
      });

      let analysisText = analysisResponse.choices[0].message.content.trim();
      analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(analysisText);
      
      return {
        success: true,
        analysis: analysis,
        rawData: parsedData,
        preview: preview,
        fileName: fileName,
        recordCount: Array.isArray(parsedData) ? parsedData.length : 1
      };
      
    } catch (error) {
      console.error('File analysis failed:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: {
          dataType: 'unknown',
          suggestedModuleName: fileName.replace(/\.[^/.]+$/, '') + ' Data',
          detectedFields: [],
          recommendations: ['Manual review required - AI analysis failed']
        }
      };
    }
  }

  // AI-powered client update intent parsing
  async parseClientUpdateIntent(userMessage, availableClients) {
    console.log(`🧠 Parsing client update intent: "${userMessage}"`);
    
    const parsePrompt = `Parse this client update request intelligently:

User message: "${userMessage}"
Available clients: ${availableClients.map(c => `"${c.name}" (ID: ${c.id})`).join(', ')}

Extract:
1. Which client they want to update (by name or reference)
2. What they want to change (billing rate, contact info, etc.)
3. The new value

Examples:
- "change client A rate to $55" → client: "Client A", update: {billingRate: 55}
- "update client B hourly rate to 45" → client: "Client B", update: {billingRate: 45}
- "set McDonald's rate to $30" → client: "McDonald's", update: {billingRate: 30}

Respond ONLY with JSON:
{
  "success": true,
  "clientIdentifier": "exact client name or ID",
  "updates": {"billingRate": number},
  "reasoning": "what you understood from the message"
}

OR if unclear:
{
  "success": false,
  "error": "description of what's unclear",
  "suggestions": ["possible interpretations"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: parsePrompt }],
        max_tokens: 200,
        temperature: 0.1
      });

      let responseText = response.choices[0].message.content.trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      
      console.log(`🧠 Client update intent parsed:`, parsed);
      return parsed;
      
    } catch (error) {
      console.error('Client update parsing failed:', error.message);
      return {
        success: false,
        error: 'Could not understand the update request',
        suggestion: `Available clients: ${availableClients.map(c => c.name).join(', ')}`
      };
    }
  }

  // Smart employee input parsing
  async parseEmployeeInput(inputText) {
    console.log(`🧠 Smart parsing employee input: "${inputText}"`);
    
    const parsePrompt = `Parse this employee information intelligently:

Input: "${inputText}"

EXAMPLE: "Michael Lynne Markham Patrol 253 304 9482 m-f 9-5 32"
Should extract:
- Name: "Michael Lynne Markham" (first three words are full name)
- Role: "Patrol Driver" (Patrol = Patrol Driver) 
- Phone: "(253) 304-9482" (numbers with spaces)
- Schedule: "Monday-Friday 9AM-5PM" (m-f 9-5)
- Rate: 32 (last number is hourly rate)

Rules:
- First 2-3 words = full name (until you hit a role keyword)
- "Patrol" = "Patrol Driver" (be specific)
- Phone numbers: "253 304 9482" → "(253) 304-9482"
- Schedules: "m-f 9-5" → "Monday-Friday 9AM-5PM"
- Last number = hourly rate

Respond ONLY with JSON:
{
  "name": "Full Name",
  "role": "Specific Role",
  "phone": "(XXX) XXX-XXXX or null",
  "schedule": "Readable schedule or null",
  "hourlyRate": number,
  "site": "Site name or Unassigned"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: parsePrompt }],
        max_tokens: 300,
        temperature: 0.1
      });

      let responseText = response.choices[0].message.content.trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      
      return {
        success: true,
        parsed: parsed,
        needsClarification: parsed.needsClarification?.length > 0,
        clarificationNeeded: parsed.needsClarification || [],
        suggestions: parsed.suggestions || []
      };
      
    } catch (error) {
      console.error('Smart parsing failed:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: {
          name: inputText.split(' ')[0] || 'Unknown',
          role: 'Security Guard',
          needsClarification: ['All fields need clarification'],
          suggestions: ['Please provide: Name, Role, Phone, Schedule, Rate, Site']
        }
      };
    }
  }

  // Handle user corrections
  async handleUserCorrection(originalData, correctionText) {
    console.log(`🔧 Processing user correction: "${correctionText}"`);
    
    const correctionPrompt = `The user is correcting employee information:

Original Data: ${JSON.stringify(originalData, null, 2)}
User Correction: "${correctionText}"

Apply the correction and provide updated information. Parse corrections like:
- "she is a patrol driver" → role = "Patrol Driver"
- "her site is patrol 1" → site = "Patrol 1"
- "the phone number is wrong" → flag phone for clarification
- "she works weekends too" → update schedule

Respond ONLY with JSON of corrected data:
{
  "name": "corrected name",
  "role": "corrected role", 
  "phone": "corrected phone",
  "schedule": "corrected schedule",
  "hourlyRate": corrected_rate,
  "site": "corrected site",
  "corrections": ["list of what was corrected"],
  "stillNeedsClarification": ["remaining unclear items"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: correctionPrompt }],
        max_tokens: 300,
        temperature: 0.1
      });

      let responseText = response.choices[0].message.content.trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const corrected = JSON.parse(responseText);
      
      return {
        success: true,
        correctedData: corrected,
        corrections: corrected.corrections || [],
        stillNeedsClarification: corrected.stillNeedsClarification || []
      };
      
    } catch (error) {
      console.error('Correction processing failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Parse contract details
  async parseContractDetails(contractDescription, clientName, hourlyRate) {
    console.log(`🧮 Parsing contract: "${contractDescription}" for ${clientName} at $${hourlyRate}/hr`);
    
    try {
      const parsePrompt = `Parse this security contract description and extract the work schedule:

Contract: "${contractDescription}"
Client: ${clientName}
Rate: $${hourlyRate}/hour

Extract:
1. Days per week (number)
2. Hours per weekday 
3. Hours per weekend day
4. Any special coverage requirements

Respond ONLY with JSON:
{
  "weekdays": number,
  "weekdayHours": number,
  "weekendDays": number, 
  "weekendHours": number,
  "totalWeeklyHours": number,
  "specialRequirements": "string"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: parsePrompt }],
        max_tokens: 200,
        temperature: 0.1
      });

      let responseText = response.choices[0].message.content.trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      
      const weeklyRevenue = parsed.totalWeeklyHours * hourlyRate;
      const monthlyRevenue = Math.round(weeklyRevenue * 4.33);
      
      const calculationBreakdown = {
        weekdays: `${parsed.weekdays} weekdays × ${parsed.weekdayHours} hours = ${parsed.weekdays * parsed.weekdayHours} hours`,
        weekends: `${parsed.weekendDays} weekend days × ${parsed.weekendHours} hours = ${parsed.weekendDays * parsed.weekendHours} hours`,
        total: `Total: ${parsed.totalWeeklyHours} hours/week`,
        revenue: `${parsed.totalWeeklyHours} hours × $${hourlyRate}/hr = $${weeklyRevenue.toLocaleString()}/week`,
        monthly: `$${weeklyRevenue.toLocaleString()}/week × 4.33 weeks = $${monthlyRevenue.toLocaleString()}/month`
      };

      return {
        success: true,
        parsed,
        weeklyRevenue,
        monthlyRevenue,
        calculationBreakdown,
        hoursBreakdown: {
          weekdayHours: parsed.weekdays * parsed.weekdayHours,
          weekendHours: parsed.weekendDays * parsed.weekendHours,
          totalWeeklyHours: parsed.totalWeeklyHours
        }
      };
      
    } catch (error) {
      console.error('Contract parsing failed:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: {
          weeklyRevenue: hourlyRate * 40,
          monthlyRevenue: Math.round(hourlyRate * 40 * 4.33),
          calculationBreakdown: {
            total: 'Default: 40 hours/week (parsing failed)',
            revenue: `40 hours × $${hourlyRate}/hr = $${hourlyRate * 40}/week`,
            monthly: `$${hourlyRate * 40}/week × 4.33 weeks = $${Math.round(hourlyRate * 40 * 4.33)}/month`
          }
        }
      };
    }
  }

  // Parse module deletion intent
  parseModuleDeletionIntent(userMessage, availableModules) {
    console.log(`🧠 Analyzing deletion intent: "${userMessage}"`);
    
    const messageLower = userMessage.toLowerCase();
    
    // Look for specific module names in the message
    const mentionedModule = availableModules.find(module => 
      messageLower.includes(module.name.toLowerCase()) ||
      messageLower.includes(module.name.toLowerCase().replace(' ', '')) ||
      messageLower.includes('camera') && module.name.toLowerCase().includes('camera') ||
      messageLower.includes('fence') && module.name.toLowerCase().includes('fence') ||
      messageLower.includes('sched') && module.name.toLowerCase().includes('sched')
    );
    
    // Patterns that indicate single module deletion vs. mass deletion
    const singleModulePatterns = [
      /delete.*camera.*module/,
      /remove.*camera.*module/,
      /delete.*fence.*module/,
      /delete.*sched.*module/,
      /delet.*camer.*mod/,
      /delete.*module.*exactly/,
      /delete.*named/
    ];
    
    const massDeletePatterns = [
      /delete all/,
      /remove all/,
      /clear all/,
      /delete everything/,
      /remove everything/
    ];
    
    const isSingleModuleRequest = singleModulePatterns.some(pattern => pattern.test(messageLower)) || mentionedModule;
    const isMassDeleteRequest = massDeletePatterns.some(pattern => pattern.test(messageLower));
    
    return {
      shouldDeleteSingleModule: isSingleModuleRequest,
      shouldDeleteAll: isMassDeleteRequest,
      targetModule: mentionedModule,
      reasoning: isSingleModuleRequest ? `User wants to delete specific module: ${mentionedModule?.name || 'detected'}` :
                 isMassDeleteRequest ? 'User explicitly requested mass deletion' :
                 'Unclear deletion intent - ask for clarification',
      availableModules: availableModules.map(m => m.name),
      recommendedAction: isSingleModuleRequest ? 'delete_single_module' :
                        isMassDeleteRequest ? 'delete_all_modules' :
                        'request_specific_deletion_target'
    };
  }

  // Build dynamic system prompt
  buildDynamicSystemPrompt(companyData, realTimeMetrics, safeClients, safeEmployees, drivers) {
    // AI thinking: Let the system learn from actual data patterns
    const businessContext = {
      hasClients: safeClients.length > 0,
      hasEmployees: safeEmployees.length > 0,
      hasDrivers: drivers.length > 0,
      hasRevenue: realTimeMetrics.monthlyRevenue > 0,
      businessSize: safeEmployees.length < 5 ? 'small' : safeEmployees.length < 20 ? 'medium' : 'large',
      primaryRoles: [...new Set(safeEmployees.map(e => e.role))],
      clientTypes: [...new Set(safeClients.map(c => c.type))],
      avgHourlyRate: safeEmployees.length > 0 ? 
        Math.round(safeEmployees.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / safeEmployees.length) : 0
    };

    // Dynamic: Current state summary for AI context
    const currentState = `
BUSINESS INTELLIGENCE CONTEXT:
Company: ${companyData.companyInfo.name}
Industry: ${companyData.companyInfo.industry || 'security'}
Size: ${businessContext.businessSize} (${safeEmployees.length} employees)
Revenue Status: ${businessContext.hasRevenue ? `$${realTimeMetrics.monthlyRevenue.toLocaleString()}/month` : 'No revenue yet'}
Employee Types: ${businessContext.primaryRoles.join(', ') || 'None'}
Client Types: ${businessContext.clientTypes.join(', ') || 'None'}
Average Pay: $${businessContext.avgHourlyRate}/hr

CURRENT DATA INVENTORY:
- Clients: ${safeClients.length} (${safeClients.map(c => c.name).join(', ') || 'None'})
- Active Guards: ${realTimeMetrics.activeGuards} (${safeEmployees.filter(e => e.status === 'Active').map(e => e.name).join(', ') || 'None'})
- Drivers: ${drivers.length} (${drivers.map(d => d.name).join(', ') || 'None'})
- Sites: ${realTimeMetrics.totalSites}
- Modules: ${realTimeMetrics.totalModules}`;

    return `You are Aetheris, your AI assistant for ${companyData.companyInfo.name}.

🧠 BUSINESS INTELLIGENCE: You have complete access to live business data through functions.

${currentState}

🎯 CORE PRINCIPLE: ALWAYS CALL FUNCTIONS FOR BUSINESS QUESTIONS
- Any question about guards, clients, revenue, profit, employees → MUST call get_business_data()
- Never guess or estimate - always get real data first
- Use the query parameter to describe what specific data you need

💰 PROFIT CALCULATIONS NOW AVAILABLE:
- "profit", "gross profit", "calculate profit" → get_business_data("profit analysis")
- System automatically calculates: Total Revenue - Total Labor Costs = Gross Profit
- Shows per-client breakdowns and profit margins
- Handles complex contract hour calculations

🔧 CLIENT UPDATES NOW WORK:
- "change [client name] rate to $X" → update_client(clientName, {billingRate: X})
- "update billing rate" → automatically recalculates monthly revenue
- Finds clients by name or ID flexibly

🚨 SMART DELETION SYSTEM - FIXED TO AVOID DUPLICATES:
- "Delete Camera Module" → calls delete_single_module() NOT delete_employee()
- AI analyzes intent: single module vs all modules vs employee
- NEVER call delete_employee() for module names
- Use delete_single_module() for specific modules
- Use delete_all_modules() only for explicit "delete all" requests

🧠 DYNAMIC RESPONSE STRATEGY:
- Adapt your language to the business size and context
- Use actual client/employee names in responses, not generic examples
- Reference real revenue figures and profit margins
- Adjust complexity based on business maturity

🎯 LEARNING APPROACH:
- When users ask for capabilities the system doesn't have yet, acknowledge and suggest workarounds
- Learn from user corrections and preferences
- Adapt to industry-specific terminology
- Remember context within the conversation

CONFIRMATION SYSTEM:
- Manual confirmations required for additions/changes
- Process confirmations when user says yes/no/confirm/cancel
- Handle corrections intelligently with follow-up confirmations

🧠 THINK BEFORE ACTING:
- Understand user intent from context
- Consider business impact of actions
- Ask clarifying questions when ambiguous
- Use current business data to inform all responses

The AI should think dynamically, use variables, and adapt to the actual business state rather than following rigid patterns.`;
  }
}

module.exports = new AIService();
