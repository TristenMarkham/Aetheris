const { safeFormatNumber, safeFormatCurrency, safeFormatDate } = require('../utils/formatters');

class BusinessService {
  // PROFIT CALCULATION FUNCTIONS
  calculateGrossProfit(companyData) {
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
  }

  // Advanced financial analysis with AI insights
  getFinancialAnalysis(companyData) {
    const profitData = this.calculateGrossProfit(companyData);
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
        recommendations: this.generateBusinessRecommendations(profitData, performanceMetrics)
      }
    };
  }

  // Business recommendations based on profit analysis
  generateBusinessRecommendations(profitData, performanceMetrics) {
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
  }

  // Smart business data analysis
  async getBusinessData(query, companyData) {
    console.log(`AI analyzing business query: "${query}"`);
    
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
    const financialAnalysis = this.getFinancialAnalysis(companyData);

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
  }

  // Business metrics calculation
  calculateBusinessMetrics(companyData) {
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
    const financialAnalysis = this.getFinancialAnalysis(companyData);
    metrics.grossProfit = financialAnalysis.grossProfit;
    metrics.profitMargin = financialAnalysis.profitMargin;
    metrics.totalLaborCosts = financialAnalysis.totalLaborCosts;
    metrics.businessHealth = financialAnalysis.businessInsights.healthScore;
    
    return metrics;
  }
}

module.exports = new BusinessService();