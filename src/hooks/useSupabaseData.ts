import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order, SalesCoordinator, ProductCategory, ProductName, Color, RecentActivity, PriorityDistribution, Customer } from '../types';
import { getOrderStatusAction, getTimeAgo } from '../utils/orderUtils';
import { formatDateTime } from '../utils/dateUtils';

export const useSupabaseData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesCoordinators, setSalesCoordinators] = useState<SalesCoordinator[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productNames, setProductNames] = useState<ProductName[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sales coordinators
      const { data: salesCoordinatorsData, error: salesCoordinatorsError } = await supabase
        .from('sales_coordinators')
        .select('*')
        .order('name');

      if (salesCoordinatorsError) throw salesCoordinatorsError;

      // Fetch product categories
      const { data: productCategoriesData, error: productCategoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (productCategoriesError) throw productCategoriesError;

      // Fetch product names
      const { data: productNamesData, error: productNamesError } = await supabase
        .from('product_names')
        .select('*')
        .order('name');

      if (productNamesError) throw productNamesError;

      // Fetch colors
      const { data: colorsData, error: colorsError } = await supabase
        .from('colors')
        .select('*')
        .order('name');

      if (colorsError) throw colorsError;

      // Fetch orders with related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          sales_coordinator:sales_coordinators(*),
          product_category:product_categories(*),
          product_name:product_names(*),
          color:colors(*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transform data to match frontend types
      const transformedSalesCoordinators: SalesCoordinator[] = salesCoordinatorsData.map(coordinator => ({
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phone
      }));

      const transformedProductCategories: ProductCategory[] = productCategoriesData.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description
      }));

      const transformedProductNames: ProductName[] = productNamesData.map(product => ({
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        basePrice: product.base_price,
        availableColors: colorsData.map(c => c.id) // For now, all colors are available for all products
      }));

      const transformedColors: Color[] = colorsData.map(color => ({
        id: color.id,
        name: color.name,
        hexCode: color.hex_code
      }));

      const transformedOrders: Order[] = ordersData.map(order => ({
        id: order.id,
        orderId: order.order_id,
        orderDate: order.order_date,
        deliveryDate: order.delivery_date,
        customerName: order.customer_name,
        orderType: order.order_type as Order['orderType'],
        priority: (order.priority || 'medium') as Order['priority'],
        salesCoordinatorId: order.sales_coordinator_id,
        salesCoordinator: {
          id: order.sales_coordinator.id,
          name: order.sales_coordinator.name,
          email: order.sales_coordinator.email,
          phone: order.sales_coordinator.phone
        },
        productCategoryId: order.product_category_id,
        productCategory: {
          id: order.product_category.id,
          name: order.product_category.name,
          description: order.product_category.description
        },
        productNameId: order.product_name_id,
        productName: {
          id: order.product_name.id,
          name: order.product_name.name,
          categoryId: order.product_name.category_id,
          basePrice: order.product_name.base_price
        },
        colorId: order.color_id,
        color: {
          id: order.color.id,
          name: order.color.name,
          hexCode: order.color.hex_code
        },
        description: order.description,
        sizeBreakdown: order.size_breakdown as any,
        totalQty: order.total_qty,
        brandingType: order.branding_type as Order['brandingType'],
        placement1: order.placement1 || '',
        placement1Size: order.placement1_size || '',
        placement2: order.placement2 || '',
        placement2Size: order.placement2_size || '',
        placement3: order.placement3 || '',
        placement3Size: order.placement3_size || '',
        placement4: order.placement4 || '',
        placement4Size: order.placement4_size || '',
        mockupFiles: order.mockup_files || [],
        attachments: order.attachments || [],
        remarks: order.remarks || '',
        costPerPc: order.cost_per_pc,
        totalAmount: order.total_amount,
        orderStatus: order.order_status as Order['orderStatus'],
        edd: order.edd || '',
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }));

      // Generate customers from orders
      const customerMap = new Map<string, Customer>();
      transformedOrders.forEach(order => {
        if (order.customerName && order.customerName.trim() !== '') {
          const customerName = order.customerName.trim();
          if (!customerMap.has(customerName)) {
            customerMap.set(customerName, {
              id: customerName, // Using name as ID for now
              name: customerName,
              email: '', // Not available in current schema
              phone: '', // Not available in current schema
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.orderDate,
              status: 'active'
            });
          }
          
          const customer = customerMap.get(customerName)!;
          customer.totalOrders += 1;
          customer.totalSpent += order.totalAmount;
          
          // Update last order date if this order is more recent
          if (new Date(order.orderDate) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.orderDate;
          }
        }
      });

      const transformedCustomers = Array.from(customerMap.values()).sort((a, b) => a.name.localeCompare(b.name));

      setSalesCoordinators(transformedSalesCoordinators);
      setProductCategories(transformedProductCategories);
      setProductNames(transformedProductNames);
      setColors(transformedColors);
      setOrders(transformedOrders);
      setCustomers(transformedCustomers);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get recent activity from orders
  const getRecentActivity = (): RecentActivity[] => {
    return orders
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        action: `Order ${order.orderId} ${getOrderStatusAction(order.orderStatus)}`,
        orderId: order.orderId,
        timestamp: order.updatedAt || order.createdAt || new Date().toISOString(),
        status: order.orderStatus,
        user: order.salesCoordinator.name
      }));
  };

  // Get priority distribution for non-dispatched orders
  const getPriorityDistribution = (): PriorityDistribution[] => {
    const nonDispatchedOrders = orders.filter(order => order.orderStatus !== 'dispatched');
    const total = nonDispatchedOrders.length;
    
    if (total === 0) return [];

    const priorityCounts = nonDispatchedOrders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { priority: 'urgent', count: priorityCounts.urgent || 0, percentage: ((priorityCounts.urgent || 0) / total) * 100 },
      { priority: 'high', count: priorityCounts.high || 0, percentage: ((priorityCounts.high || 0) / total) * 100 },
      { priority: 'medium', count: priorityCounts.medium || 0, percentage: ((priorityCounts.medium || 0) / total) * 100 },
      { priority: 'low', count: priorityCounts.low || 0, percentage: ((priorityCounts.low || 0) / total) * 100 }
    ];
  };

  // Get unique customer names for autocomplete
  const getCustomerNames = (): string[] => {
    const uniqueNames = [...new Set(orders.map(order => order.customerName))];
    return uniqueNames.filter(name => name && name.trim() !== '').sort();
  };

  // Get customer order count
  const getCustomerOrderCount = (customerName: string): number => {
    return orders.filter(order => order.customerName === customerName).length;
  };

  // Add order
  const addOrder = async (orderData: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_id: orderData.orderId!,
          order_date: orderData.orderDate!,
          delivery_date: orderData.deliveryDate!,
          customer_name: orderData.customerName!,
          order_type: orderData.orderType!,
          priority: orderData.priority || 'medium',
          sales_coordinator_id: orderData.salesCoordinatorId!,
          product_category_id: orderData.productCategoryId!,
          product_name_id: orderData.productNameId!,
          color_id: orderData.colorId!,
          description: orderData.description!,
          size_breakdown: orderData.sizeBreakdown!,
          total_qty: orderData.totalQty!,
          branding_type: orderData.brandingType!,
          placement1: orderData.placement1,
          placement1_size: orderData.placement1Size,
          placement2: orderData.placement2,
          placement2_size: orderData.placement2Size,
          placement3: orderData.placement3,
          placement3_size: orderData.placement3Size,
          placement4: orderData.placement4,
          placement4_size: orderData.placement4Size,
          mockup_files: orderData.mockupFiles || [],
          attachments: orderData.attachments || [],
          remarks: orderData.remarks,
          cost_per_pc: orderData.costPerPc!,
          total_amount: orderData.totalAmount!,
          order_status: orderData.orderStatus!,
          edd: orderData.edd
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh all data to get the complete order with relations
      await fetchData();
      return data;
    } catch (err) {
      console.error('Error adding order:', err);
      throw err;
    }
  };

  // Update order
  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          order_id: orderData.orderId,
          order_date: orderData.orderDate,
          delivery_date: orderData.deliveryDate,
          customer_name: orderData.customerName,
          order_type: orderData.orderType,
          priority: orderData.priority,
          sales_coordinator_id: orderData.salesCoordinatorId,
          product_category_id: orderData.productCategoryId,
          product_name_id: orderData.productNameId,
          color_id: orderData.colorId,
          description: orderData.description,
          size_breakdown: orderData.sizeBreakdown,
          total_qty: orderData.totalQty,
          branding_type: orderData.brandingType,
          placement1: orderData.placement1,
          placement1_size: orderData.placement1Size,
          placement2: orderData.placement2,
          placement2_size: orderData.placement2Size,
          placement3: orderData.placement3,
          placement3_size: orderData.placement3Size,
          placement4: orderData.placement4,
          placement4_size: orderData.placement4Size,
          mockup_files: orderData.mockupFiles,
          attachments: orderData.attachments,
          remarks: orderData.remarks,
          cost_per_pc: orderData.costPerPc,
          total_amount: orderData.totalAmount,
          order_status: orderData.orderStatus,
          edd: orderData.edd,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Refresh data to get updated order with relations
      await fetchData();
      return data;
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  // Add sales coordinator
  const addSalesCoordinator = async (coordinatorData: Omit<SalesCoordinator, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('sales_coordinators')
        .insert({
          name: coordinatorData.name,
          email: coordinatorData.email,
          phone: coordinatorData.phone
        })
        .select()
        .single();

      if (error) throw error;

      const newCoordinator: SalesCoordinator = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone
      };

      setSalesCoordinators(prev => [...prev, newCoordinator]);
      return newCoordinator;
    } catch (err) {
      console.error('Error adding sales coordinator:', err);
      throw err;
    }
  };

  // Update sales coordinator
  const updateSalesCoordinator = async (coordinatorId: string, coordinatorData: Partial<SalesCoordinator>) => {
    try {
      const { data, error } = await supabase
        .from('sales_coordinators')
        .update({
          name: coordinatorData.name,
          email: coordinatorData.email,
          phone: coordinatorData.phone
        })
        .eq('id', coordinatorId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSalesCoordinators(prev => 
          prev.map(coordinator => 
            coordinator.id === coordinatorId 
              ? { ...coordinator, ...coordinatorData }
              : coordinator
          )
        );
      }

      return data;
    } catch (err) {
      console.error('Error updating sales coordinator:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
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
    refetch: fetchData,
    getRecentActivity,
    getPriorityDistribution,
    getCustomerNames,
    getCustomerOrderCount
  };
};