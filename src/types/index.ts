export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
}

export interface SalesCoordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export interface ProductName {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  availableColors?: string[]; // Array of color IDs
}

export interface Color {
  id: string;
  name: string;
  hexCode: string;
}

export interface SizeBreakdown {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  '2XL': number;
  '3XL': number;
  '4XL': number;
  '5XL': number;
}

export interface Order {
  id: string;
  orderId: string;
  orderDate: string;
  deliveryDate: string;
  customerName: string; // Simplified to just name
  orderType: 'new' | 'repeat' | 'sample' | 'rush';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  salesCoordinatorId: string;
  salesCoordinator: SalesCoordinator;
  productCategoryId: string;
  productCategory: ProductCategory;
  productNameId: string;
  productName: ProductName;
  colorId: string;
  color: Color;
  description: string;
  sizeBreakdown: SizeBreakdown;
  totalQty: number;
  brandingType: 'embroidery' | 'screen-print' | 'heat-transfer' | 'sublimation' | 'vinyl' | 'dtf' | 'none';
  placement1: string;
  placement1Size: string;
  placement2: string;
  placement2Size: string;
  placement3: string;
  placement3Size: string;
  placement4: string;
  placement4Size: string;
  mockupFiles: string[];
  attachments: string[];
  remarks: string;
  costPerPc: number;
  totalAmount: number;
  orderStatus: 'pending-approval' | 'sticker-printing' | 'sample-approval' | 'under-fusing' | 'under-packaging' | 'ready-to-ship' | 'dispatched' | 'cancelled';
  edd: string; // Estimated Delivery Date
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgress: number;
  completedThisMonth: number;
  revenue: number;
  averageOrderValue: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  orderId: string;
  timestamp: string;
  status: Order['orderStatus'];
  user?: string;
}

export interface PriorityDistribution {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  count: number;
  percentage: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  orders: number;
  revenue: number;
}