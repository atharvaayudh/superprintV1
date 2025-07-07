import React, { useState, useRef } from 'react';
import { X, Upload, User, Package, Calendar, DollarSign, FileText, Image, Paperclip, ChevronDown } from 'lucide-react';
import { Order, SalesCoordinator, ProductCategory, ProductName, Color, SizeBreakdown } from '../types';
import { generateOrderId } from '../utils/orderUtils';
import { formatDateForInput, getCurrentDateForInput } from '../utils/dateUtils';
import { uploadFile } from '../lib/storage';

interface OrderFormProps {
  order?: Order;
  customerNames: string[];
  salesCoordinators: SalesCoordinator[];
  productCategories: ProductCategory[];
  productNames: ProductName[];
  colors: Color[];
  orders: Order[];
  onSave: (order: Partial<Order>) => void;
  onClose: () => void;
}

const placementOptions = [
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

const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

export const OrderForm: React.FC<OrderFormProps> = ({ 
  order, 
  customerNames,
  salesCoordinators,
  productCategories,
  productNames,
  colors,
  orders,
  onSave, 
  onClose 
}) => {
  const [orderId, setOrderId] = useState(order?.orderId || generateOrderId(orders));
  const [orderDate, setOrderDate] = useState(order?.orderDate || getCurrentDateForInput());
  const [deliveryDate, setDeliveryDate] = useState(order?.deliveryDate || '');
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [orderType, setOrderType] = useState<Order['orderType']>(order?.orderType || 'new');
  const [priority, setPriority] = useState<Order['priority']>(order?.priority || 'medium');
  const [salesCoordinatorId, setSalesCoordinatorId] = useState(order?.salesCoordinatorId || '');
  const [productCategoryId, setProductCategoryId] = useState(order?.productCategoryId || '');
  const [productNameId, setProductNameId] = useState(order?.productNameId || '');
  const [colorId, setColorId] = useState(order?.colorId || '');
  const [description, setDescription] = useState(order?.description || '');
  const [sizeBreakdown, setSizeBreakdown] = useState<SizeBreakdown>(order?.sizeBreakdown || {
    XS: 0, S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0
  });
  const [brandingType, setBrandingType] = useState<Order['brandingType']>(order?.brandingType || 'none');
  const [placement1, setPlacement1] = useState(order?.placement1 || '');
  const [placement1Size, setPlacement1Size] = useState(order?.placement1Size || '');
  const [placement2, setPlacement2] = useState(order?.placement2 || '');
  const [placement2Size, setPlacement2Size] = useState(order?.placement2Size || '');
  const [placement3, setPlacement3] = useState(order?.placement3 || '');
  const [placement3Size, setPlacement3Size] = useState(order?.placement3Size || '');
  const [placement4, setPlacement4] = useState(order?.placement4 || '');
  const [placement4Size, setPlacement4Size] = useState(order?.placement4Size || '');
  const [mockupFiles, setMockupFiles] = useState<string[]>(order?.mockupFiles || []);
  const [attachments, setAttachments] = useState<string[]>(order?.attachments || []);
  const [remarks, setRemarks] = useState(order?.remarks || '');
  const [costPerPc, setCostPerPc] = useState(order?.costPerPc || 0);
  const [orderStatus, setOrderStatus] = useState<Order['orderStatus']>(order?.orderStatus || 'pending-approval');
  const [edd, setEdd] = useState(order?.edd || '');
  const [uploading, setUploading] = useState(false);

  // Search states for dropdowns
  const [customerSearch, setCustomerSearch] = useState('');
  const [coordinatorSearch, setCoordinatorSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCoordinatorDropdown, setShowCoordinatorDropdown] = useState(false);

  const mockupFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  const totalQty = Object.values(sizeBreakdown).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = totalQty * costPerPc;

  // Filter product names by category
  const filteredProductNames = productNames.filter(p => p.categoryId === productCategoryId);
  
  // Filter colors by selected product
  const selectedProduct = productNames.find(p => p.id === productNameId);
  const availableColors = selectedProduct?.availableColors 
    ? colors.filter(c => selectedProduct.availableColors?.includes(c.id))
    : colors;

  // Filter customer names based on search
  const filteredCustomerNames = customerNames.filter(name =>
    name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter coordinators based on search
  const filteredCoordinators = salesCoordinators.filter(coordinator =>
    coordinator.name.toLowerCase().includes(coordinatorSearch.toLowerCase()) ||
    coordinator.email.toLowerCase().includes(coordinatorSearch.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSizeChange = (size: keyof SizeBreakdown, value: number) => {
    setSizeBreakdown(prev => ({
      ...prev,
      [size]: Math.max(0, value)
    }));
  };

  const handleMockupFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadFile(file, 'mockups', `orders/${orderId}`);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    setMockupFiles(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadFile(file, 'attachments', `orders/${orderId}`);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    setAttachments(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const removeMockupFile = (index: number) => {
    setMockupFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedSalesCoordinator = salesCoordinators.find(s => s.id === salesCoordinatorId);
    const selectedProductCategory = productCategories.find(p => p.id === productCategoryId);
    const selectedProductName = productNames.find(p => p.id === productNameId);
    const selectedColor = colors.find(c => c.id === colorId);

    if (!selectedSalesCoordinator || !selectedProductCategory || !selectedProductName || !selectedColor) {
      return;
    }

    const orderData: Partial<Order> = {
      orderId,
      orderDate,
      deliveryDate,
      customerName,
      orderType,
      priority,
      salesCoordinatorId,
      salesCoordinator: selectedSalesCoordinator,
      productCategoryId,
      productCategory: selectedProductCategory,
      productNameId,
      productName: selectedProductName,
      colorId,
      color: selectedColor,
      description,
      sizeBreakdown,
      totalQty,
      brandingType,
      placement1,
      placement1Size,
      placement2,
      placement2Size,
      placement3,
      placement3Size,
      placement4,
      placement4Size,
      mockupFiles,
      attachments,
      remarks,
      costPerPc,
      totalAmount,
      orderStatus,
      edd,
      createdAt: order?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(orderData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {order ? 'Edit Order' : 'New Order'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {order ? `Editing ${order.orderId}` : 'Create a new order'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Basic Order Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Order Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Auto-generated"
                  readOnly={!!order}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Date</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as Order['orderType'])}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="new">New</option>
                  <option value="repeat">Repeat</option>
                  <option value="sample">Sample</option>
                  <option value="rush">Rush</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Order['priority'])}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer and Sales Coordinator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Name Input with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearch || customerName}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerName(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Enter customer name..."
                  required
                />
                {showCustomerDropdown && filteredCustomerNames.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomerNames.map((name, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setCustomerName(name);
                          setCustomerSearch('');
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sales Coordinator Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sales Coordinator</label>
              <div className="relative">
                <input
                  type="text"
                  value={coordinatorSearch || salesCoordinators.find(s => s.id === salesCoordinatorId)?.name || ''}
                  onChange={(e) => {
                    setCoordinatorSearch(e.target.value);
                    setShowCoordinatorDropdown(true);
                    if (!e.target.value) setSalesCoordinatorId('');
                  }}
                  onFocus={() => setShowCoordinatorDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCoordinatorDropdown(false), 200)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Search coordinators..."
                  required
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {showCoordinatorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCoordinators.map(coordinator => (
                      <button
                        key={coordinator.id}
                        type="button"
                        onClick={() => {
                          setSalesCoordinatorId(coordinator.id);
                          setCoordinatorSearch('');
                          setShowCoordinatorDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{coordinator.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{coordinator.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Category</label>
                <select
                  value={productCategoryId}
                  onChange={(e) => {
                    setProductCategoryId(e.target.value);
                    setProductNameId('');
                    setColorId('');
                  }}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {productCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <select
                  value={productNameId}
                  onChange={(e) => {
                    setProductNameId(e.target.value);
                    setColorId('');
                  }}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                  disabled={!productCategoryId}
                >
                  <option value="">Select product</option>
                  {filteredProductNames.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <select
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                  disabled={!productNameId}
                >
                  <option value="">Select color</option>
                  {availableColors.map(color => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                rows={3}
                placeholder="Product description and specifications..."
                required
              />
            </div>
          </div>

          {/* Size Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Size Breakdown</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
              {sizeOrder.map((size) => (
                <div key={size}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{size}</label>
                  <input
                    type="number"
                    min="0"
                    value={sizeBreakdown[size]}
                    onChange={(e) => handleSizeChange(size, parseInt(e.target.value) || 0)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 font-medium">Total Quantity: {totalQty}</p>
            </div>
          </div>

          {/* Branding Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branding Type</label>
                <select
                  value={brandingType}
                  onChange={(e) => setBrandingType(e.target.value as Order['brandingType'])}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="none">No Branding</option>
                  <option value="embroidery">Embroidery</option>
                  <option value="screen-print">Screen Print</option>
                  <option value="heat-transfer">Heat Transfer</option>
                  <option value="sublimation">Sublimation</option>
                  <option value="vinyl">Vinyl</option>
                  <option value="dtf">DTF (Direct to Film)</option>
                </select>
              </div>
            </div>

            {/* Placement Details */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((num) => {
                const placementValue = num === 1 ? placement1 : num === 2 ? placement2 : num === 3 ? placement3 : placement4;
                const placementSizeValue = num === 1 ? placement1Size : num === 2 ? placement2Size : num === 3 ? placement3Size : placement4Size;
                const setPlacement = num === 1 ? setPlacement1 : num === 2 ? setPlacement2 : num === 3 ? setPlacement3 : setPlacement4;
                const setPlacementSize = num === 1 ? setPlacement1Size : num === 2 ? setPlacement2Size : num === 3 ? setPlacement3Size : setPlacement4Size;

                return (
                  <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placement {num}</label>
                      <select
                        value={placementValue}
                        onChange={(e) => setPlacement(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">Select placement</option>
                        {placementOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placement {num} Size</label>
                      <input
                        type="text"
                        value={placementSizeValue}
                        onChange={(e) => setPlacementSize(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        placeholder='e.g., 3" x 2"'
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mockup Files */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Image className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Mockup Files
              </h3>
              
              <div className="space-y-4">
                <div>
                  <input
                    ref={mockupFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMockupFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mockupFileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {uploading ? 'Uploading...' : 'Upload Mockup Images'}
                    </span>
                  </button>
                </div>

                {mockupFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</p>
                    {mockupFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center">
                          <Image className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">Mockup {index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMockupFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Attachments
              </h3>
              
              <div className="space-y-4">
                <div>
                  <input
                    ref={attachmentFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ai,.eps,.psd,.zip,.rar"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => attachmentFileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {uploading ? 'Uploading...' : 'Upload Attachments'}
                    </span>
                  </button>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</p>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">Attachment {index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost per Piece (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPerPc}
                onChange={(e) => setCostPerPc(parseFloat(e.target.value) || 0)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Amount</label>
              <input
                type="text"
                value={`₹${formatCurrency(totalAmount)}`}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as Order['orderStatus'])}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="pending-approval">Pending Approval</option>
                <option value="sticker-printing">Sticker Printing</option>
                <option value="sample-approval">Sample Approval</option>
                <option value="under-fusing">Under Fusing</option>
                <option value="under-packaging">Under Packaging</option>
                <option value="ready-to-ship">Ready to Ship</option>
                <option value="dispatched">Dispatched</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">EDD (Estimated Delivery Date)</label>
              <input
                type="date"
                value={edd}
                onChange={(e) => setEdd(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              rows={4}
              placeholder="Additional notes, special instructions, or requirements..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};