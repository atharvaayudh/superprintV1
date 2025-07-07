import React from 'react';
import { X, User, Package, Calendar, DollarSign, FileText, Clock, MapPin, Phone, Mail, Palette, Image, Download, Printer, FileDown } from 'lucide-react';
import { Order } from '../types';
import { formatDate } from '../utils/dateUtils';
import { exportToPDF, exportToJPG, exportToCSV } from '../utils/exportUtils';
import { downloadFile } from '../lib/storage';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose }) => {
  const getStatusColor = (status: Order['orderStatus']) => {
    const colors = {
      'pending-approval': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
      'sticker-printing': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
      'sample-approval': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
      'under-fusing': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
      'under-packaging': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700',
      'ready-to-ship': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      'dispatched': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700',
      'cancelled': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
    };
    return colors[status];
  };

  const getOrderTypeColor = (orderType: Order['orderType']) => {
    const colors = {
      'new': 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900 dark:border-blue-700',
      'repeat': 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900 dark:border-green-700',
      'sample': 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900 dark:border-purple-700',
      'rush': 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900 dark:border-red-700'
    };
    return colors[orderType];
  };

  const getPriorityColor = (priority: Order['priority']) => {
    const colors = {
      'low': 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900 dark:border-green-700',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900 dark:border-yellow-700',
      'high': 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900 dark:border-orange-700',
      'urgent': 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900 dark:border-red-700'
    };
    return colors[priority];
  };

  const getStatusLabel = (status: Order['orderStatus']) => {
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
    return labels[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    await exportToPDF('order-detail-content', `order-${order.orderId}.pdf`);
  };

  const handleExportJPG = async () => {
    await exportToJPG('order-detail-content', `order-${order.orderId}.jpg`);
  };

  const handleExportCSV = () => {
    const exportData = {
      orderId: order.orderId,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      customerName: order.customerName,
      salesCoordinator: order.salesCoordinator.name,
      productCategory: order.productCategory.name,
      productName: order.productName.name,
      color: order.color.name,
      totalQty: order.totalQty,
      costPerPc: order.costPerPc,
      totalAmount: order.totalAmount,
      status: order.orderStatus,
      priority: order.priority
    };
    exportToCSV(exportData, `order-${order.orderId}.csv`);
  };

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    await downloadFile(fileUrl, fileName);
  };

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{order.orderId}</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Order Details</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <div className="relative group">
              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={handleExportPDF}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportJPG}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Export as JPG
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div id="order-detail-content" className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Order Status, Type, and Priority */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}
            >
              {getStatusLabel(order.orderStatus)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getOrderTypeColor(order.orderType)}`}
            >
              {order.orderType} Order
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getPriorityColor(order.priority)}`}
            >
              {order.priority} Priority
            </span>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{order.customerName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Coordinator */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Coordinator</h3>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{order.salesCoordinator.name}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm break-all">{order.salesCoordinator.email}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{order.salesCoordinator.phone}</p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Product Details
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-gray-900 dark:text-white font-medium">{order.productCategory.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{order.productName.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</p>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: order.color.hexCode }}
                      />
                      <span className="text-gray-900 dark:text-white font-medium">{order.color.name}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
                <p className="text-gray-900 dark:text-white">{order.description}</p>
              </div>

              {/* Size Breakdown */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Size Breakdown</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3">
                  {sizeOrder.map((size) => (
                    <div key={size} className="text-center">
                      <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-2 sm:p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{size}</p>
                        <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{order.sizeBreakdown[size]}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Total Quantity: {order.totalQty}</p>
                </div>
              </div>

              {/* Branding Information */}
              {order.brandingType !== 'none' && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Branding Details</p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                      {order.brandingType.replace('-', ' ')}
                    </p>
                    <div className="space-y-2">
                      {order.placement1 && (
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Placement 1:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{order.placement1} ({order.placement1Size})</span>
                        </div>
                      )}
                      {order.placement2 && (
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Placement 2:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{order.placement2} ({order.placement2Size})</span>
                        </div>
                      )}
                      {order.placement3 && (
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Placement 3:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{order.placement3} ({order.placement3Size})</span>
                        </div>
                      )}
                      {order.placement4 && (
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Placement 4:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{order.placement4} ({order.placement4Size})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(order.deliveryDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">EDD</p>
                  <p className="text-gray-900 dark:text-white">{order.edd ? formatDate(order.edd) : 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">₹{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Cost per Piece:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{formatCurrency(order.costPerPc)}</span>
              </div>
            </div>
          </div>

          {/* Mockup Images */}
          {order.mockupFiles.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Image className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Mockup Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.mockupFiles.map((imageUrl, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={imageUrl}
                      alt={`Mockup ${index + 1}`}
                      className="w-full h-32 sm:h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    <div className="p-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mockup {index + 1}</p>
                      <button
                        onClick={() => handleDownloadFile(imageUrl, `mockup-${index + 1}.jpg`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files & Attachments */}
          {order.attachments.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Attachments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-sm truncate">Attachment {index + 1}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadFile(file, `attachment-${index + 1}`)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 flex-shrink-0 ml-2"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          {order.remarks && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Remarks</h3>
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="text-blue-800 dark:text-blue-200" dangerouslySetInnerHTML={{ __html: order.remarks.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};