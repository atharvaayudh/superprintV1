import { Customer, Order, SalesCoordinator, ProductCategory, ProductName, Color, DashboardStats } from '../types';

export const mockSalesCoordinators: SalesCoordinator[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '(555) 100-1001'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    phone: '(555) 100-1002'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    phone: '(555) 100-1003'
  }
];

export const mockProductCategories: ProductCategory[] = [
  {
    id: '1',
    name: 'T-Shirts',
    description: 'Basic and premium t-shirts'
  },
  {
    id: '2',
    name: 'Polo Shirts',
    description: 'Professional polo shirts'
  },
  {
    id: '3',
    name: 'Hoodies',
    description: 'Hooded sweatshirts'
  },
  {
    id: '4',
    name: 'Caps',
    description: 'Baseball caps and beanies'
  },
  {
    id: '5',
    name: 'Jackets',
    description: 'Windbreakers and fleece jackets'
  }
];

export const mockProductNames: ProductName[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    categoryId: '1',
    basePrice: 1299
  },
  {
    id: '2',
    name: 'Basic Cotton T-Shirt',
    categoryId: '1',
    basePrice: 799
  },
  {
    id: '3',
    name: 'Performance Polo',
    categoryId: '2',
    basePrice: 1999
  },
  {
    id: '4',
    name: 'Classic Polo',
    categoryId: '2',
    basePrice: 1599
  },
  {
    id: '5',
    name: 'Pullover Hoodie',
    categoryId: '4',
    basePrice: 2799
  }
  {
    id: '6',
      name: 'Classic cap',
      categoryId: '4',
      basePrice: 0
  }
];

export const mockColors: Color[] = [
  { id: '1', name: 'White', hexCode: '#FFFFFF' },
  { id: '2', name: 'Black', hexCode: '#000000' },
  { id: '3', name: 'Navy Blue', hexCode: '#1E3A8A' },
  { id: '4', name: 'Red', hexCode: '#DC2626' },
  { id: '5', name: 'Forest Green', hexCode: '#166534' },
  { id: '6', name: 'Royal Blue', hexCode: '#2563EB' },
  { id: '7', name: 'Charcoal Gray', hexCode: '#374151' },
  { id: '8', name: 'Maroon', hexCode: '#7C2D12' }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@techstartup.com',
    phone: '(555) 123-4567',
    company: 'Tech Startup Inc.',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@localrestaurant.com',
    phone: '(555) 234-5678',
    company: 'Local Restaurant Group',
    address: '456 Main Street',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201'
  },
  {
    id: '3',
    name: 'Jennifer Martinez',
    email: 'jennifer@fitnessclub.com',
    phone: '(555) 345-6789',
    company: 'Elite Fitness Club',
    address: '789 Wellness Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderId: 'ORD-2024-001',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    customerId: '1',
    customer: mockCustomers[0],
    orderType: 'new',
    salesCoordinatorId: '1',
    salesCoordinator: mockSalesCoordinators[0],
    productCategoryId: '1',
    productCategory: mockProductCategories[0],
    productNameId: '1',
    productName: mockProductNames[0],
    colorId: '3',
    color: mockColors[2],
    description: 'Premium cotton t-shirts for company event with custom logo embroidery',
    sizeBreakdown: {
      XS: 2,
      S: 8,
      M: 15,
      L: 20,
      XL: 10,
      '2XL': 3,
      '3XL': 1,
      '4XL': 0,
      '5XL': 0
    },
    totalQty: 59,
    brandingType: 'embroidery',
    placement1: 'Left Chest',
    placement1Size: '3" x 2"',
    placement2: 'Back Center',
    placement2Size: '8" x 6"',
    placement3: '',
    placement3Size: '',
    placement4: '',
    placement4Size: '',
    mockupFiles: ['https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=800'],
    attachments: ['logo-vector.ai', 'brand-guidelines.pdf'],
    remarks: 'Rush order for conference. High-quality embroidery required.',
    costPerPc: 1485,
    totalAmount: 87615,
    orderStatus: 'in-production',
    edd: '2024-01-24'
  },
  {
    id: '2',
    orderId: 'ORD-2024-002',
    orderDate: '2024-01-16',
    deliveryDate: '2024-01-30',
    customerId: '2',
    customer: mockCustomers[1],
    orderType: 'repeat',
    salesCoordinatorId: '2',
    salesCoordinator: mockSalesCoordinators[1],
    productCategoryId: '2',
    productCategory: mockProductCategories[1],
    productNameId: '3',
    productName: mockProductNames[2],
    colorId: '1',
    color: mockColors[0],
    description: 'Performance polo shirts for restaurant staff uniforms',
    sizeBreakdown: {
      XS: 0,
      S: 12,
      M: 18,
      L: 15,
      XL: 8,
      '2XL': 2,
      '3XL': 0,
      '4XL': 0,
      '5XL': 0
    },
    totalQty: 55,
    brandingType: 'screen-print',
    placement1: 'Left Chest',
    placement1Size: '4" x 3"',
    placement2: '',
    placement2Size: '',
    placement3: '',
    placement3Size: '',
    placement4: '',
    placement4Size: '',
    mockupFiles: ['https://images.pexels.com/photos/8532618/pexels-photo-8532618.jpeg?auto=compress&cs=tinysrgb&w=800'],
    attachments: ['restaurant-logo.eps'],
    remarks: 'Standard delivery timeline. Match previous order colors exactly.',
    costPerPc: 2145,
    totalAmount: 117975,
    orderStatus: 'confirmed',
    edd: '2024-01-28'
  }
];

export const mockStats: DashboardStats = {
  totalOrders: 48,
  pendingOrders: 12,
  inProduction: 18,
  completedThisMonth: 156,
  revenue: 7156000,
  averageOrderValue: 99950
};

export const placementOptions = [
  'Left Chest',
  'Right Chest',
  'Front Center',
  'Back Center',
  'Left Sleeve',
  'Right Sleeve',
  'Back Yoke',
  'Front Bottom',
  'Back Bottom',
  'Collar',
  'Cuff',
  'Pocket'
];