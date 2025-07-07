import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderDetail } from './components/OrderDetail';
import { OrderForm } from './components/OrderForm';
import { SalesCoordinatorList } from './components/SalesCoordinatorList';
import { CustomerList } from './components/CustomerList';
import { FileExplorer } from './components/FileExplorer';
import { Reports } from './components/Reports';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useNotification } from './contexts/NotificationContext';
import { Order, SalesCoordinator } from './types';
import { Plus } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { broadcastNotification } = useNotification();

  const {
    orders,
    salesCoordinators,
    productCategories,
    productNames,
    colors,
    customers,
    loading,
    error,
    addOrder,
    updateOrder,
    addSalesCoordinator,
    updateSalesCoordinator,
    getRecentActivity,
    getPriorityDistribution,
    getCustomerNames,
    getCustomerOrderCount
  } = useSupabaseData();

  // Calculate dashboard stats with corrected monthly revenue and in progress
  const dashboardStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.orderStatus === 'pending-approval').length,
    inProgress: orders.filter(order => 
      ['sticker-printing', 'under-fusing'].includes(order.orderStatus)
    ).length,
    completedThisMonth: orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear() &&
             order.orderStatus === 'dispatched';
    }).length,
    revenue: orders
      .filter(order => {
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear() &&
               order.orderStatus === 'dispatched';
      })
      .reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: orders.length > 0 
      ? orders
          .filter(order => order.orderStatus === 'dispatched')
          .reduce((sum, order) => sum + order.totalAmount, 0) / 
        Math.max(orders.filter(order => order.orderStatus === 'dispatched').length, 1)
      : 0
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleOrderEdit = (order: Order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleOrderSave = async (orderData: Partial<Order>) => {
    try {
      const previousStatus = editingOrder?.orderStatus;
      
      if (editingOrder) {
        // Update existing order
        await updateOrder(editingOrder.id, orderData);
        
        // Show notification for status change
        if (previousStatus !== orderData.orderStatus) {
          const statusMessages = {
            'dispatched': { 
              title: 'Order Dispatched!', 
              message: `Order ${orderData.orderId} has been dispatched successfully.`,
              sound: 'clap' as const,
              type: 'success' as const
            },
            'cancelled': { 
              title: 'Order Cancelled', 
              message: `Order ${orderData.orderId} has been cancelled.`,
              sound: 'error' as const,
              type: 'error' as const
            }
          };
          
          const statusMessage = statusMessages[orderData.orderStatus as keyof typeof statusMessages];
          if (statusMessage) {
            await broadcastNotification(statusMessage);
          } else {
            await broadcastNotification({
              type: 'info',
              title: 'Order Status Updated',
              message: `Order ${orderData.orderId} status changed to ${getStatusLabel(orderData.orderStatus || '')}`,
              sound: 'notification'
            });
          }
        }
      } else {
        // Create new order
        await addOrder(orderData);
        await broadcastNotification({
          type: 'success',
          title: 'New Order Created',
          message: `Order ${orderData.orderId} has been created successfully.`,
          sound: 'notification'
        });
      }
      
      setShowOrderForm(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Error saving order:', error);
      await broadcastNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save order. Please try again.',
        sound: 'error'
      });
    }
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

  const handleNewOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const handleSalesCoordinatorsUpdate = async (coordinatorData: Omit<SalesCoordinator, 'id'>, coordinatorId?: string) => {
    try {
      if (coordinatorId) {
        await updateSalesCoordinator(coordinatorId, coordinatorData);
        await broadcastNotification({
          type: 'success',
          title: 'Coordinator Updated',
          message: `${coordinatorData.name} has been updated successfully.`,
          sound: 'ding'
        });
      } else {
        await addSalesCoordinator(coordinatorData);
        await broadcastNotification({
          type: 'success',
          title: 'Coordinator Added',
          message: `${coordinatorData.name} has been added successfully.`,
          sound: 'ding'
        });
      }
    } catch (error) {
      console.error('Error updating sales coordinator:', error);
      await broadcastNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update sales coordinator. Please try again.',
        sound: 'error'
      });
    }
  };

  const handleCustomerUpdate = async (customerData: any, customerId?: string) => {
    // Placeholder function for customer updates
    // This would be implemented when customer persistence is added
    console.log('Customer update:', customerData, customerId);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <p className="text-gray-600 dark:text-gray-400">Please make sure Supabase is properly configured.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={dashboardStats} 
            recentActivity={getRecentActivity()}
            priorityDistribution={getPriorityDistribution()}
            orders={orders}
          />
        );
      case 'orders':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div></div>
              <button
                onClick={handleNewOrder}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </button>
            </div>
            <OrderList
              orders={orders}
              onOrderSelect={handleOrderSelect}
              onOrderEdit={handleOrderEdit}
            />
          </div>
        );
      case 'customers':
        return (
          <CustomerList
            customers={customers}
            onCustomersUpdate={handleCustomerUpdate}
            getCustomerOrderCount={getCustomerOrderCount}
          />
        );
      case 'sales-coordinators':
        return (
          <SalesCoordinatorList
            salesCoordinators={salesCoordinators}
            onUpdate={handleSalesCoordinatorsUpdate}
            orders={orders}
          />
        );
      case 'reports':
        return (
          <Reports 
            orders={orders}
            salesCoordinators={salesCoordinators}
          />
        );
      case 'files':
        return <FileExplorer orders={orders} salesCoordinators={salesCoordinators} />;
      default:
        return (
          <Dashboard 
            stats={dashboardStats} 
            recentActivity={getRecentActivity()}
            priorityDistribution={getPriorityDistribution()}
            orders={orders}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {showOrderForm && (
        <OrderForm
          order={editingOrder || undefined}
          customerNames={getCustomerNames()}
          salesCoordinators={salesCoordinators}
          productCategories={productCategories}
          productNames={productNames}
          colors={colors}
          orders={orders}
          onSave={handleOrderSave}
          onClose={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
}

export default App;