// src/hooks/useBusinessData.js - Complete File with Debug Logging
import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const useBusinessData = () => {
  const [businessData, setBusinessData] = useState({
    employees: [], // Default to empty array
    clients: [],   // Default to empty array
    sites: [],     // Default to empty array
    companyInfo: {},
    platformModules: [],
    realTimeMetrics: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // SAFE: Helper function to ensure arrays exist
  const safeArrayFilter = (array, filterFn) => {
    return Array.isArray(array) ? array.filter(filterFn) : [];
  };

  const fetchBusinessData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/business-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // SAFE: Ensure all arrays exist with fallbacks
        const safeData = {
          employees: Array.isArray(result.data?.employees) ? result.data.employees : [],
          clients: Array.isArray(result.data?.clients) ? result.data.clients : [],
          sites: Array.isArray(result.data?.sites) ? result.data.sites : [],
          companyInfo: result.data?.companyInfo || {},
          platformModules: Array.isArray(result.data?.platformModules) ? result.data.platformModules : [],
          realTimeMetrics: result.data?.realTimeMetrics || {},
          summary: result.summary || {}
        };
        
        setBusinessData(safeData);
        console.log('Business data loaded safely:', {
          employees: safeData.employees.length,
          clients: safeData.clients.length,
          sites: safeData.sites.length,
          revenue: safeData.clients.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0)
        });
      } else {
        throw new Error(result.error || 'Failed to fetch business data');
      }
    } catch (err) {
      console.error('Business data fetch error:', err);
      setError(err.message);
      // SAFE: Keep existing data structure even on error
      setBusinessData(prev => ({
        employees: Array.isArray(prev.employees) ? prev.employees : [],
        clients: Array.isArray(prev.clients) ? prev.clients : [],
        sites: Array.isArray(prev.sites) ? prev.sites : [],
        companyInfo: prev.companyInfo || {},
        platformModules: Array.isArray(prev.platformModules) ? prev.platformModules : [],
        realTimeMetrics: prev.realTimeMetrics || {}
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  // SAFE: Derived metrics with array safety checks
  const derivedMetrics = {
    activeEmployees: safeArrayFilter(businessData.employees, e => e.status === 'Active'),
    totalClients: businessData.clients?.length || 0,
    activeGuards: safeArrayFilter(businessData.employees, e => 
      e.status === 'Active' && (e.role || '').toLowerCase().includes('guard')
    ),
    supervisors: safeArrayFilter(businessData.employees, e => 
      e.status === 'Active' && (e.role || '').toLowerCase().includes('supervisor')
    ),
    monthlyRevenue: Array.isArray(businessData.clients) 
      ? businessData.clients.reduce((sum, client) => sum + (client.monthly_revenue || 0), 0)
      : 0,
    averageHourlyRate: (() => {
      const activeEmp = safeArrayFilter(businessData.employees, e => e.status === 'Active' && e.hourlyRate);
      return activeEmp.length > 0 
        ? activeEmp.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / activeEmp.length 
        : 0;
    })(),
    totalModules: businessData.platformModules?.length || 3
  };

  // Create analytics structure that dashboard components expect
  const analyticsData = {
    ...businessData,
    analytics: {
      monthlyRevenue: derivedMetrics.monthlyRevenue,
      totalRevenue: derivedMetrics.monthlyRevenue,
      totalClients: derivedMetrics.totalClients,
      totalSites: businessData.sites?.length || derivedMetrics.totalClients,
      activeEmployees: derivedMetrics.activeEmployees.length,
      
      // DEBUG: Log employee statuses before calculating employeesOnLeave
      employeesOnLeave: (() => {
        console.log('Employee statuses:', businessData.employees.map(e => `${e.name}: ${e.status}`));
        const onLeaveEmployees = safeArrayFilter(businessData.employees, e => e.status === 'On Leave');
        console.log('Employees on leave:', onLeaveEmployees.map(e => e.name));
        return onLeaveEmployees.length;
      })(),
      
      averageHourlyRate: derivedMetrics.averageHourlyRate,
      
      // Calculate business health
      businessHealth: (() => {
        if (!derivedMetrics.monthlyRevenue || derivedMetrics.activeGuards.length === 0) {
          return 'Unknown';
        }
        const revenuePerGuard = derivedMetrics.monthlyRevenue / derivedMetrics.activeGuards.length;
        if (revenuePerGuard > 4000) return 'Excellent';
        if (revenuePerGuard > 2500) return 'Good';
        return 'Needs Attention';
      })(),
      
      // Calculate profit margin
      profitMargin: (() => {
        const totalLaborCost = derivedMetrics.activeEmployees
          .reduce((sum, e) => sum + ((e.hourlyRate || 25) * 160), 0);
        if (derivedMetrics.monthlyRevenue === 0) return 0;
        const profit = derivedMetrics.monthlyRevenue - totalLaborCost;
        return (profit / derivedMetrics.monthlyRevenue) * 100;
      })(),
      
      // Role breakdowns
      roleBreakdowns: {
        drivers: safeArrayFilter(businessData.employees, e => {
          const role = (e.role || '').toLowerCase();
          return e.status === 'Active' && (role.includes('patrol') || role.includes('driver') || role.includes('mobile'));
        }).length,
        staticGuards: derivedMetrics.activeGuards.length,
        supervisors: derivedMetrics.supervisors.length
      },
      
      // Client details
      clientDetails: businessData.clients?.map(client => ({
        name: client.name,
        revenue: client.monthly_revenue || 0,
        type: client.type || 'Unknown'
      })).sort((a, b) => b.revenue - a.revenue) || [],
      
      // Profit breakdown
      profitBreakdown: (() => {
        const totalRevenue = derivedMetrics.monthlyRevenue;
        const totalLaborCosts = derivedMetrics.activeEmployees
          .reduce((sum, e) => sum + ((e.hourlyRate || 25) * 160), 0);
        const grossProfit = totalRevenue - totalLaborCosts;
        const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        
        return {
          totalRevenue,
          totalLaborCosts,
          grossProfit,
          profitMargin
        };
      })(),
      
      grossProfit: (() => {
        const revenue = derivedMetrics.monthlyRevenue;
        const laborCosts = derivedMetrics.activeEmployees
          .reduce((sum, e) => sum + ((e.hourlyRate || 25) * 160), 0);
        return Math.max(0, revenue - laborCosts);
      })()
    }
  };

  const refreshData = useCallback(async () => {
    console.log('Dashboard refresh triggered - fetching fresh data...');
    await fetchBusinessData();
  }, [fetchBusinessData]);

  return {
    businessData: analyticsData,  // Pass the enhanced data with analytics
    isLoading,
    error,
    refreshData,
    derivedMetrics: {
      ...derivedMetrics,
      totalModules: businessData.platformModules?.length || 3
    },
    // SAFE: Helper methods for components
    safeEmployees: Array.isArray(businessData.employees) ? businessData.employees : [],
    safeClients: Array.isArray(businessData.clients) ? businessData.clients : [],
    safeSites: Array.isArray(businessData.sites) ? businessData.sites : []
  };
};