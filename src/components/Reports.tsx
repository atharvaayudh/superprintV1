import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Filter, DollarSign, Package, Users, Clock } from 'lucide-react';
import { Order, SalesCoordinator } from '../types';
import { formatDate } from '../utils/dateUtils';

interface ReportsProps {
  orders: Order[];
  salesCoordinators: SalesCoordinator[];
}

export const Reports: React.FC<ReportsProps> = ({ orders, salesCoordinators }) => {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(dateRange));
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate metrics with corrected monthly revenue
  const totalRevenue = filteredOrders
    .filter(order => order.orderStatus === 'dispatched')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(order => order.orderStatus === 'dispatched').length;
  const pendingOrders = filteredOrders.filter(order => order.orderStatus === 'pending-approval').length;
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Sales by coordinator
  const salesByCoordinator = salesCoordinators.map(coordinator => {
    const coordinatorOrders = filteredOrders.filter(order => order.salesCoordinatorId === coordinator.id);
    const revenue = coordinatorOrders
      .filter(order => order.orderStatus === 'dispatched')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      name: coordinator.name,
      orders: coordinatorOrders.length,
      revenue,
      completedOrders: coordinatorOrders.filter(order => order.orderStatus === 'dispatched').length
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Order status distribution
  const statusDistribution = [
    { status: 'Pending Approval', count: filteredOrders.filter(o => o.orderStatus === 'pending-approval').length, color: 'bg-yellow-500' },
    { status: 'Sticker Printing', count: filteredOrders.filter(o => o.orderStatus === 'sticker-printing').length, color: 'bg-blue-500' },
    { status: 'Sample Approval', count: filteredOrders.filter(o => o.orderStatus === 'sample-approval').length, color: 'bg-purple-500' },
    { status: 'Under Fusing', count: filteredOrders.filter(o => o.orderStatus === 'under-fusing').length, color: 'bg-orange-500' },
    { status: 'Under Packaging', count: filteredOrders.filter(o => o.orderStatus === 'under-packaging').length, color: 'bg-indigo-500' },
    { status: 'Ready to Ship', count: filteredOrders.filter(o => o.orderStatus === 'ready-to-ship').length, color: 'bg-green-500' },
    { status: 'Dispatched', count: filteredOrders.filter(o => o.orderStatus === 'dispatched').length, color: 'bg-emerald-500' },
    { status: 'Cancelled', count: filteredOrders.filter(o => o.orderStatus === 'cancelled').length, color: 'bg-red-500' }
  ].filter(item => item.count > 0);

  // Priority distribution
  const priorityDistribution = [
    { priority: 'Urgent', count: filteredOrders.filter(o => o.priority === 'urgent').length, color: 'bg-red-500' },
    { priority: 'High', count: filteredOrders.filter(o => o.priority === 'high').length, color: 'bg-orange-500' },
    { priority: 'Medium', count: filteredOrders.filter(o => o.priority === 'medium').length, color: 'bg-yellow-500' },
    { priority: 'Low', count: filteredOrders.filter(o => o.priority === 'low').length, color: 'bg-green-500' }
  ].filter(item => item.count > 0);

  // Top customers
  const topCustomers = filteredOrders.reduce((acc, order) => {
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

  const topCustomersList = Object.entries(topCustomers)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const exportReport = () => {
    const reportData = {
      dateRange: `${formatDate(startDate.toISOString())} - ${formatDate(endDate.toISOString())}`,
      summary: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        averageOrderValue
      },
      salesByCoordinator,
      statusDistribution,
      priorityDistribution,
      topCustomers: topCustomersList
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to get most popular product
  const getMostPopularProduct = () => {
    if (filteredOrders.length === 0) return 'N/A';
    
    const productCounts = filteredOrders.reduce((acc, order) => {
      acc[order.productName.name] = (acc[order.productName.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const entries = Object.entries(productCounts);
    const sortedEntries = entries.sort(([,a], [,b]) => b - a);
    return sortedEntries[0]?.[0] || 'N/A';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm sm:text-base text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="overview">Overview</option>
            <option value="sales">Sales Performance</option>
            <option value="customers">Customer Analysis</option>
            <option value="operations">Operations</option>
          </select>
          
          <button
            onClick={exportReport}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 truncate">₹{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-green-500 flex-shrink-0 ml-2">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-blue-500 flex-shrink-0 ml-2">
              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 truncate">₹{formatCurrency(averageOrderValue)}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-purple-500 flex-shrink-0 ml-2">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">
                {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-emerald-500 flex-shrink-0 ml-2">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Sales Performance */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Sales Performance by Coordinator</h3>
          <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
            {salesByCoordinator.map((coordinator, index) => (
              <div key={coordinator.name} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{coordinator.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{coordinator.orders} orders</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">₹{formatCurrency(coordinator.revenue)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{coordinator.completedOrders} completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Status Distribution</h3>
          <div className="space-y-3 sm:space-y-4">
            {statusDistribution.map((item, index) => (
              <div key={item.status} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">{item.status}</span>
                    <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{item.count} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / totalOrders) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Priority Distribution</h3>
          <div className="space-y-3 sm:space-y-4">
            {priorityDistribution.map((item, index) => (
              <div key={item.priority} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.priority}</span>
                    <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{item.count} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / totalOrders) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Top Customers</h3>
          <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
            {topCustomersList.slice(0, 5).map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-emerald-600">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{customer.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{customer.orders} orders</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">₹{formatCurrency(customer.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Business Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="text-base sm:text-lg font-medium text-blue-900 mb-2">Most Popular Product</h4>
            <p className="text-blue-700 text-sm sm:text-base">{getMostPopularProduct()}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="text-base sm:text-lg font-medium text-green-900 mb-2">Average Processing Time</h4>
            <p className="text-green-700 text-sm sm:text-base">
              {completedOrders > 0 
                ? Math.round(
                    filteredOrders
                      .filter(order => order.orderStatus === 'dispatched')
                      .reduce((sum, order) => {
                        const orderDate = new Date(order.orderDate);
                        const deliveryDate = new Date(order.deliveryDate);
                        return sum + (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
                      }, 0) / completedOrders
                  )
                : 0
              } days
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="text-base sm:text-lg font-medium text-purple-900 mb-2">Customer Retention</h4>
            <p className="text-purple-700 text-sm sm:text-base">
              {topCustomersList.length > 0 
                ? Math.round((topCustomersList.filter(customer => customer.orders > 1).length / topCustomersList.length) * 100)
                : 0
              }%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};