const { safeFormatNumber, safeFormatCurrency } = require('../utils/formatters');
const dataService = require('./dataService');
const backupService = require('./backupService');
const aiService = require('./aiService');

class ClientService {
  // NEW: DIRECT BYPASS METHOD FOR REAL RAIL FIX
  async addClientDirectly(companyId, message) {
    try {
      console.log('🔧 DIRECT CLIENT ADD - Bypassing confirmation system');
      console.log(`Processing: "${message}" for company: ${companyId}`);
      
      // Enhanced AI-powered client parsing with revenue calculation
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const parsePrompt = `Analyze this client information and calculate monthly revenue:

Input: "${message}"

Tasks:
1. Extract client name
2. Extract hourly rate (look for $/hour amounts)
3. Parse work schedule (hours per shift, days per week)
4. Calculate monthly revenue: (hours per shift × days per week × hourly rate × 4.33 weeks)

Return JSON with:
{
  "name": "client name",
  "hourlyRate": number,
  "hoursPerWeek": number,
  "monthlyRevenue": number,
  "calculationBreakdown": "detailed explanation",
  "contractDescription": "original schedule text"
}`;

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
          name: message.split(' ').slice(0, 2).join(' '),
          hourlyRate: 25,
          hoursPerWeek: 40,
          monthlyRevenue: 4330,
          calculationBreakdown: "Standard 40hr/week calculation",
          contractDescription: message
        };
      }

      console.log('🧠 AI Parsed:', parsedData);

      // Load current company data
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Check for existing client
      const existingClient = companyData.clients.find(c => 
        c.name.toLowerCase().trim() === parsedData.name.toLowerCase().trim()
      );
      
      if (existingClient) {
        console.log('⚠️ Client already exists');
        return { 
          success: false, 
          error: `Client ${parsedData.name} already exists`,
          existingClient 
        };
      }

      // Create new client object
      const newClient = {
        id: Math.max(...companyData.clients.map(c => c.id), 0) + 1,
        name: parsedData.name,
        type: "Business",
        monthly_revenue: Math.round(parsedData.monthlyRevenue || 0),
        contact_person: "Unknown",
        status: "Active",
        contract_start: new Date().toISOString(),
        contract_details: {
          hourlyRate: parsedData.hourlyRate,
          hoursPerWeek: parsedData.hoursPerWeek,
          calculationBreakdown: parsedData.calculationBreakdown,
          originalDescription: parsedData.contractDescription,
          weeklyRevenue: Math.round(parsedData.monthlyRevenue / 4.33),
          totalWeeklyHours: parsedData.hoursPerWeek
        }
      };

      // Add client to company data
      companyData.clients.push(newClient);

      // Save to database immediately
      await dataService.saveCompanyData(companyId, companyData);

      console.log(`✅ SUCCESS: Added ${newClient.name} with $${newClient.monthly_revenue}/month revenue`);

      return {
        success: true,
        client: newClient,
        calculatedData: {
          monthlyRevenue: newClient.monthly_revenue,
          calculationBreakdown: parsedData.calculationBreakdown,
          weeklyRevenue: Math.round(parsedData.monthlyRevenue / 4.33),
          totalWeeklyHours: parsedData.hoursPerWeek
        },
        message: `✅ Successfully added ${newClient.name}!\n\n📊 Contract Details:\n${parsedData.calculationBreakdown}\n💰 Monthly Revenue: $${newClient.monthly_revenue.toLocaleString()}`,
        bypassed: true,
        directAdd: true,
        calculatedRevenue: newClient.monthly_revenue
      };

    } catch (error) {
      console.error('❌ Direct client add failed:', error);
      return {
        success: false,
        error: `Failed to add client directly: ${error.message}`
      };
    }
  }

  // CLIENT CREATION AND MANAGEMENT (EXISTING METHODS)
  async addClient(companyId, clientData) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
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
      
      return { 
        success: true, 
        client: newClient,
        calculatedData: calculatedData
      };
      
    } catch (error) {
      console.error(`Failed to prepare client addition:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async executeAddClient(companyId, clientData, calculatedData = null) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
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
      await dataService.saveCompanyData(companyId, companyData);
      
      console.log(`Added client ${clientData.name} to ${companyId} with ${safeFormatCurrency(clientData.monthly_revenue)}/month`);
      return { success: true, client: clientData };
    } catch (error) {
      console.error(`Failed to add client:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // CLIENT UPDATES
  async updateClient(companyId, clientId, updates) {
    try {
      console.log(`AI updating client: ${clientId} with:`, updates);
      
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Find client by ID (number) or name (string)
      let clientIndex = -1;
      
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
      await dataService.saveCompanyData(companyId, companyData);
      
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
  }

  // CLIENT DELETION
  async deleteClient(companyId, clientIdentifier) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
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
      const backup = await backupService.createBackup(companyId, 'multiple_clients', clientsToDelete, 
        `Deleted ${clientsToDelete.length} clients matching: ${clientIdentifier}`);
      
      // Delete from array
      const idsToRemove = clientsToDelete.map(c => c.id);
      const originalCount = companyData.clients.length;
      companyData.clients = companyData.clients.filter(c => !idsToRemove.includes(c.id));
      const newCount = companyData.clients.length;
      
      // Save changes
      await dataService.saveCompanyData(companyId, companyData);
      
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
  }

  // CLIENT SEARCH AND FILTERING
  async findClientByIdentifier(companyId, identifier) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      
      // Try by ID first
      if (!isNaN(identifier)) {
        const clientById = companyData.clients.find(c => c.id === parseInt(identifier));
        if (clientById) return { success: true, client: clientById };
      }
      
      // Try by name (partial match)
      const clientByName = companyData.clients.find(c => 
        c.name.toLowerCase().includes(identifier.toLowerCase())
      );
      
      if (clientByName) {
        return { success: true, client: clientByName };
      }
      
      return { success: false, error: `No client found matching "${identifier}"` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getActiveClients(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const activeClients = companyData.clients.filter(c => c.status === 'Active');
      
      return {
        success: true,
        clients: activeClients,
        count: activeClients.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getClientsByType(companyId, clientType) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const clients = companyData.clients.filter(c => 
        c.type.toLowerCase().includes(clientType.toLowerCase())
      );
      
      return {
        success: true,
        clients: clients,
        type: clientType,
        count: clients.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // CLIENT STATISTICS AND ANALYSIS
  async getClientStatistics(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const clients = companyData.clients || [];
      
      const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'Active').length,
        inactive: clients.filter(c => c.status !== 'Active').length,
        totalRevenue: clients.reduce((sum, c) => sum + safeFormatNumber(c.monthly_revenue, 0), 0),
        averageRevenue: 0,
        byType: {},
        topClients: [],
        contractDetails: {
          withContracts: 0,
          averageHourlyRate: 0,
          totalWeeklyHours: 0
        }
      };
      
      if (clients.length > 0) {
        stats.averageRevenue = Math.round(stats.totalRevenue / clients.length);
        
        // Calculate type distribution
        clients.forEach(client => {
          const type = client.type || 'Unknown';
          if (!stats.byType[type]) {
            stats.byType[type] = { count: 0, revenue: 0 };
          }
          stats.byType[type].count += 1;
          stats.byType[type].revenue += safeFormatNumber(client.monthly_revenue, 0);
        });
        
        // Top 5 clients by revenue
        stats.topClients = clients
          .sort((a, b) => safeFormatNumber(b.monthly_revenue, 0) - safeFormatNumber(a.monthly_revenue, 0))
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            revenue: safeFormatNumber(c.monthly_revenue, 0),
            type: c.type
          }));
        
        // Contract analysis
        const clientsWithContracts = clients.filter(c => c.contract_details);
        stats.contractDetails.withContracts = clientsWithContracts.length;
        
        if (clientsWithContracts.length > 0) {
          const totalHourlyRates = clientsWithContracts.reduce((sum, c) => 
            sum + safeFormatNumber(c.contract_details.hourlyRate, 0), 0);
          const totalWeeklyHours = clientsWithContracts.reduce((sum, c) => 
            sum + safeFormatNumber(c.contract_details.weeklyHours, 0), 0);
          
          stats.contractDetails.averageHourlyRate = Math.round((totalHourlyRates / clientsWithContracts.length) * 100) / 100;
          stats.contractDetails.totalWeeklyHours = totalWeeklyHours;
        }
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

  // CONTRACT MANAGEMENT
  async updateClientContract(companyId, clientId, contractDetails) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const client = companyData.clients.find(c => c.id === parseInt(clientId) || c.name.toLowerCase() === clientId.toLowerCase());
      
      if (!client) {
        return { success: false, error: 'Client not found' };
      }
      
      // Update contract details
      client.contract_details = {
        ...client.contract_details,
        ...contractDetails,
        lastUpdated: new Date().toISOString()
      };
      
      // Recalculate revenue if hourly rate or hours changed
      if (contractDetails.hourlyRate || contractDetails.weeklyHours) {
        const hourlyRate = contractDetails.hourlyRate || client.contract_details.hourlyRate || 0;
        const weeklyHours = contractDetails.weeklyHours || client.contract_details.weeklyHours || 0;
        
        if (hourlyRate && weeklyHours) {
          const weeklyRevenue = hourlyRate * weeklyHours;
          const monthlyRevenue = Math.round(weeklyRevenue * 4.33);
          
          client.contract_details.weeklyRevenue = weeklyRevenue;
          client.monthly_revenue = monthlyRevenue;
        }
      }
      
      await dataService.saveCompanyData(companyId, companyData);
      
      return {
        success: true,
        client: client,
        message: `Contract updated for ${client.name}`,
        newMonthlyRevenue: client.monthly_revenue
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getClientsWithoutContracts(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const clientsWithoutContracts = companyData.clients.filter(c => !c.contract_details);
      
      return {
        success: true,
        clients: clientsWithoutContracts,
        count: clientsWithoutContracts.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // CLIENT REVENUE ANALYSIS
  async analyzeClientProfitability(companyId) {
    try {
      const companyData = await dataService.loadCompanyData(companyId);
      const clients = companyData.clients || [];
      
      const analysis = clients.map(client => {
        const revenue = safeFormatNumber(client.monthly_revenue, 0);
        const contractDetails = client.contract_details || {};
        const weeklyHours = safeFormatNumber(contractDetails.weeklyHours, 0);
        const hourlyRate = safeFormatNumber(contractDetails.hourlyRate, 0);
        
        // Estimate labor costs (simplified calculation)
        const estimatedMonthlyCost = weeklyHours * 4.33 * 18.50; // Assume $18.50/hr guard cost
        const estimatedProfit = revenue - estimatedMonthlyCost;
        const profitMargin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;
        
        return {
          clientName: client.name,
          revenue: revenue,
          estimatedCost: Math.round(estimatedMonthlyCost),
          estimatedProfit: Math.round(estimatedProfit),
          profitMargin: Math.round(profitMargin * 100) / 100,
          hourlyRate: hourlyRate,
          weeklyHours: weeklyHours,
          profitabilityRating: profitMargin > 50 ? 'High' : profitMargin > 25 ? 'Medium' : profitMargin > 0 ? 'Low' : 'Loss'
        };
      }).sort((a, b) => b.profitMargin - a.profitMargin);
      
      return {
        success: true,
        analysis: analysis,
        summary: {
          totalClients: clients.length,
          profitable: analysis.filter(a => a.estimatedProfit > 0).length,
          highMargin: analysis.filter(a => a.profitMargin > 50).length,
          lowMargin: analysis.filter(a => a.profitMargin > 0 && a.profitMargin <= 25).length,
          unprofitable: analysis.filter(a => a.estimatedProfit <= 0).length
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ClientService();