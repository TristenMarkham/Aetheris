// src/components/Dashboard/BusinessMetrics.js
import React, { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const BusinessMetrics = ({ data, onRefresh }) => {
  const metrics = useMemo(() => {
    const baseMetrics = [
      {
        label: 'Monthly Revenue',
        value: data?.analytics?.monthlyRevenue ? formatCurrency(data.analytics.monthlyRevenue) : '$0',
        change: data?.analytics?.profitBreakdown?.profitMargin > 0 ? 
          `${data.analytics.profitBreakdown.profitMargin.toFixed(1)}% margin` : '+0%',
        icon: '💰',
        color: '#22c55e',
        gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
        details: data?.analytics?.profitBreakdown ? 
          `Gross Profit: ${formatCurrency(data.analytics.profitBreakdown.grossProfit)}` : null
      },
      {
        label: 'Active Employees',
        value: formatNumber(data?.employees?.length || 0),
        change: data?.analytics?.roleBreakdowns ? 
          `${data.analytics.roleBreakdowns.drivers} drivers, ${data.analytics.roleBreakdowns.staticGuards} static` : 
          data?.employees?.length > 0 ? '+7.1%' : '+0%',
        icon: '👮',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
        details: data?.analytics?.roleBreakdowns ? 
          `${data.analytics.roleBreakdowns.supervisors} supervisors` : null
      },
      {
        label: 'Client Sites',
        value: formatNumber(data?.analytics?.totalSites || 0),
        change: data?.analytics?.totalClients > 0 ? 
          `${data.analytics.totalClients} clients` : '+0%',
        icon: '🏢',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))',
        details: data?.analytics?.clientDetails?.length > 0 ? 
          `Top: ${data.analytics.clientDetails[0]?.name}` : null
      },
      {
        label: 'Business Health',
        value: data?.analytics?.businessHealth || 'Unknown',
        change: data?.analytics?.profitMargin > 20 ? 'Excellent' : 
               data?.analytics?.profitMargin > 10 ? 'Good' : 'Needs Attention',
        icon: '📊',
        color: data?.analytics?.profitMargin > 20 ? '#22c55e' : 
               data?.analytics?.profitMargin > 10 ? '#f59e0b' : '#ef4444',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
        details: data?.analytics?.profitBreakdown ? 
          `Labor: ${((data.analytics.profitBreakdown.totalLaborCosts / data.analytics.profitBreakdown.totalRevenue) * 100).toFixed(0)}%` : null
      }
    ];

    return baseMetrics;
  }, [data]);

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 style={{ 
          color: '#e2e8f0', 
          fontSize: '24px', 
          margin: 0,
          fontWeight: '600' 
        }}>
          📈 Business Metrics
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#3b82f6',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
            title="Refresh metrics"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px'
      }}>
        {metrics.map((metric, index) => (
          <div key={index} style={{
            padding: '28px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 12px 35px ${metric.color}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: metric.gradient,
              opacity: 0.5
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '12px' 
              }}>
                <div style={{ fontSize: '32px' }}>{metric.icon}</div>
                <div style={{ 
                  padding: '4px 8px',
                  background: metric.change.includes('%') && !metric.change.includes('0%')
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(107, 114, 128, 0.2)',
                  borderRadius: '12px',
                  color: metric.change.includes('%') && !metric.change.includes('0%')
                    ? '#22c55e'
                    : '#6b7280',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {metric.change}
                </div>
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: metric.color, 
                marginBottom: '8px' 
              }}>
                {metric.value}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>
                {metric.label}
              </div>
              {metric.details && (
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                  {metric.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessMetrics; 
