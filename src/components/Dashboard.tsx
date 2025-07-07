import React from 'react';
import { Package, Clock, Wrench, CheckCircle, DollarSign, TrendingUp, BarChart3, PieChart, Calendar, Users } from 'lucide-react';
import { DashboardStats, RecentActivity, PriorityDistribution, ChartData, MonthlyData } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface DashboardProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  priorityDistribution: PriorityDistribution[];
  orders: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, recentActivity, priorityDistribution, orders }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending-approval': 'bg-yellow-500',
      'sticker-printing': 'bg-blue-500',
      'sample-approval': 'bg-purple-500',
      'under-fusing': 'bg-orange-500',
      'under-packaging': 'bg-indigo-500',
      'ready-to-ship': 'bg-green-500',
      'dispatched': 'bg-emerald-500',
      'cancelled': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'urgent': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending-approval': 'Pending Approval',
      'sticker-printing': 'Sticker Printing',
      'sample-approval': 'Sample Approval',
      'under-fusing': 'Under Fusing',
      'under-packaging': 'Under Packaging',
      'ready-to-ship': 'Ready to Ship',
      'dispatched': 'Dispatched',
      'cancelled': 'Cancelled'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Calculate monthly data for charts
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyStats: { [key: string]: { orders: number; revenue: number } } = {};
    
    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { orders: 0, revenue: 0 };
      }
      
      monthlyStats[monthKey].orders += 1;
      if (order.orderStatus === 'dispatched') {
        monthlyStats[monthKey].revenue += order.totalAmount;
      }
    });

    return Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          orders: data.orders,
          revenue: data.revenue
        };
      });
  };

  // Calculate order type distribution
  const getOrderTypeDistribution = (): ChartData[] => {
    const distribution = orders.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'new': '#3B82F6',
      'repeat': '#10B981',
      'sample': '#8B5CF6',
      'rush': '#EF4444'
    };

    return Object.entries(distribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: colors[type as keyof typeof colors]
    }));
  };

  // Calculate top customers
  const getTopCustomers = (): ChartData[] => {
    const customerStats = orders.reduce((acc, order) => {
      const customer = order.customerName;
      if (!acc[customer]) {
        acc[customer] = { orders: 0, revenue: 0 };
      }
      acc[customer].orders += 1;
      if (order.orderStatus === 'dispatched') {
        acc[customer].revenue += order.totalAmount;
      }
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    return Object.entries(customerStats)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        value: data.revenue
      }));
  };

  const monthlyData = getMonthlyData();
  const orderTypeData = getOrderTypeDistribution();
  const topCustomers = getTopCustomers();

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Wrench,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Completed This Month',
      value: stats.completedThisMonth,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${formatCurrency(stats.revenue)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Avg Order Value',
      value: `₹${formatCurrency(stats.averageOrderValue)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Overview of your order management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{card.title}</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">{card.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${card.color} flex-shrink-0 ml-2`}>
                <card.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Monthly Orders & Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Monthly Performance
          </h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {data.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min((data.orders / Math.max(...monthlyData.map(d => d.orders))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{data.orders} orders</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  ₹{formatCurrency(data.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Order Type Distribution
          </h3>
          <div className="space-y-3">
            {orderTypeData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{item.value} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: item.color,
                        width: `${(item.value / orders.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)} flex-shrink-0 mt-2`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.action}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(activity.timestamp)}</p>
                      {activity.user && (
                        <>
                          <span className="hidden sm:inline text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">by {activity.user}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Top Customers
          </h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{customer.name}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">₹{formatCurrency(customer.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Priority Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityDistribution.length > 0 ? (
            priorityDistribution.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-12 h-12 rounded-full ${getPriorityColor(item.priority)} mx-auto mb-2 flex items-center justify-center`}>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{item.priority}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No active orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};