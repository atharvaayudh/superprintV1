import React, { useState } from 'react';
import { Search, Plus, User, Phone, Mail, Upload, Edit, Trash2 } from 'lucide-react';
import { SalesCoordinator, Order } from '../types';

interface SalesCoordinatorListProps {
  salesCoordinators: SalesCoordinator[];
  onUpdate: (coordinatorData: Omit<SalesCoordinator, 'id'>, coordinatorId?: string) => void;
  orders: Order[];
}

export const SalesCoordinatorList: React.FC<SalesCoordinatorListProps> = ({ 
  salesCoordinators, 
  onUpdate,
  orders
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState<SalesCoordinator | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });

  const filteredCoordinators = salesCoordinators.filter(coordinator =>
    coordinator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCoordinatorOrderCount = (coordinatorId: string): number => {
    return orders.filter(order => order.salesCoordinatorId === coordinatorId).length;
  };

  const handleImageUpload = async (coordinatorId: string, file: File) => {
    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    
    // Find the coordinator and update with new avatar
    const coordinator = salesCoordinators.find(c => c.id === coordinatorId);
    if (coordinator) {
      onUpdate({
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phone,
        avatar: imageUrl
      }, coordinatorId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCoordinator) {
      // Update existing coordinator
      onUpdate(formData, editingCoordinator.id);
    } else {
      // Create new coordinator
      onUpdate(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', avatar: '' });
    setEditingCoordinator(null);
    setShowForm(false);
  };

  const handleEdit = (coordinator: SalesCoordinator) => {
    setFormData({
      name: coordinator.name,
      email: coordinator.email,
      phone: coordinator.phone,
      avatar: coordinator.avatar || ''
    });
    setEditingCoordinator(coordinator);
    setShowForm(true);
  };

  const handleDelete = (coordinatorId: string) => {
    if (window.confirm('Are you sure you want to delete this coordinator?')) {
      // This would typically call a delete function
      console.log('Delete coordinator:', coordinatorId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Sales Coordinators</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your sales team • Total: {salesCoordinators.length} coordinators</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search coordinators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Coordinator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCoordinators.map((coordinator) => (
          <div
            key={coordinator.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
                    {coordinator.avatar ? (
                      <img 
                        src={coordinator.avatar} 
                        alt={coordinator.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <User className={`h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 ${coordinator.avatar ? 'hidden' : ''}`} />
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(coordinator.id, file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{coordinator.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Sales Coordinator</p>
                </div>
              </div>
              
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleEdit(coordinator)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(coordinator.id)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{coordinator.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{coordinator.phone}</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active Orders</span>
                <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                  {getCoordinatorOrderCount(coordinator.id)} orders
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCoordinators.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No coordinators found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first sales coordinator.'}
          </p>
        </div>
      )}

      {/* Coordinator Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCoordinator ? 'Edit Coordinator' : 'Add New Coordinator'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCoordinator ? 'Update Coordinator' : 'Create Coordinator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};