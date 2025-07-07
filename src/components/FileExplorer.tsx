import React, { useState } from 'react';
import { Folder, File, Download, Eye, FolderOpen, Image, FileText } from 'lucide-react';
import { Order, SalesCoordinator } from '../types';
import { formatDate } from '../utils/dateUtils';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  size?: string;
  uploadDate?: string;
  url?: string;
}

interface FileExplorerProps {
  orders: Order[];
  salesCoordinators: SalesCoordinator[];
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ orders, salesCoordinators }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  // Generate file structure from real data
  const generateFileStructure = (): FileNode[] => {
    const structure: FileNode[] = [];

    // Group orders by sales coordinator
    const ordersByCoordinator = orders.reduce((acc, order) => {
      const coordinatorId = order.salesCoordinatorId;
      if (!acc[coordinatorId]) {
        acc[coordinatorId] = [];
      }
      acc[coordinatorId].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    // Create folder structure for each coordinator
    Object.entries(ordersByCoordinator).forEach(([coordinatorId, coordinatorOrders]) => {
      const coordinator = salesCoordinators.find(c => c.id === coordinatorId);
      if (!coordinator) return;

      const coordinatorFolder: FileNode = {
        id: `coordinator-${coordinatorId}`,
        name: coordinator.name,
        type: 'folder',
        children: []
      };

      // Group orders by month
      const ordersByMonth = coordinatorOrders.reduce((acc, order) => {
        const date = new Date(order.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = { name: monthName, orders: [] };
        }
        acc[monthKey].orders.push(order);
        return acc;
      }, {} as Record<string, { name: string; orders: Order[] }>);

      // Create month folders
      Object.entries(ordersByMonth).forEach(([monthKey, monthData]) => {
        const monthFolder: FileNode = {
          id: `month-${coordinatorId}-${monthKey}`,
          name: monthData.name,
          type: 'folder',
          children: []
        };

        // Create order folders
        monthData.orders.forEach(order => {
          const orderFolder: FileNode = {
            id: `order-${order.id}`,
            name: order.orderId,
            type: 'folder',
            children: []
          };

          // Create Mockup folder
          if (order.mockupFiles.length > 0) {
            const mockupFolder: FileNode = {
              id: `mockup-${order.id}`,
              name: 'Mockup',
              type: 'folder',
              children: order.mockupFiles.map((file, index) => ({
                id: `mockup-file-${order.id}-${index}`,
                name: `mockup-${index + 1}.jpg`,
                type: 'file',
                size: '2.4 MB',
                uploadDate: formatDate(order.createdAt || new Date().toISOString()),
                url: file
              }))
            };
            orderFolder.children!.push(mockupFolder);
          }

          // Create Attachments folder
          if (order.attachments.length > 0) {
            const attachmentFolder: FileNode = {
              id: `attachment-${order.id}`,
              name: 'Attachments',
              type: 'folder',
              children: order.attachments.map((file, index) => ({
                id: `attachment-file-${order.id}-${index}`,
                name: `attachment-${index + 1}.pdf`,
                type: 'file',
                size: '1.2 MB',
                uploadDate: formatDate(order.createdAt || new Date().toISOString()),
                url: file
              }))
            };
            orderFolder.children!.push(attachmentFolder);
          }

          // Only add order folder if it has files
          if (orderFolder.children!.length > 0) {
            monthFolder.children!.push(orderFolder);
          }
        });

        // Only add month folder if it has orders with files
        if (monthFolder.children!.length > 0) {
          coordinatorFolder.children!.push(monthFolder);
        }
      });

      // Only add coordinator folder if it has months with files
      if (coordinatorFolder.children!.length > 0) {
        structure.push(coordinatorFolder);
      }
    });

    return structure;
  };

  const fileStructure = generateFileStructure();

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const handleDownload = (file: FileNode) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const handlePreview = (file: FileNode) => {
    setSelectedFile(file);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {node.type === 'folder' ? (
              <button
                onClick={() => toggleFolder(node.id)}
                className="flex items-center space-x-2 text-left min-w-0 flex-1"
              >
                {expandedFolders.has(node.id) ? (
                  <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{node.name}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {getFileIcon(node.name)}
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{node.name}</span>
                {node.size && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">({node.size})</span>
                )}
              </div>
            )}
          </div>
          
          {node.type === 'file' && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
              {node.url && (
                <button
                  onClick={() => handlePreview(node)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDownload(node)}
                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {node.type === 'folder' && expandedFolders.has(node.id) && node.children && (
          <div>
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Files</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Browse and manage project files organized by Sales Coordinator → Month → Order ID
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">File Explorer</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {fileStructure.length > 0 ? (
              renderFileTree(fileStructure)
            ) : (
              <div className="text-center py-8">
                <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No files found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Files will appear here when orders with attachments are created
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{selectedFile.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedFile.size} • {selectedFile.uploadDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {selectedFile.url && (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};