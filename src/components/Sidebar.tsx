import React from 'react';
import { LayoutDashboard, Package, Users, FileText, BarChart3, UserCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'sales-coordinators', label: 'Sales Coordinators', icon: UserCheck },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'files', label: 'Files', icon: FileText }
  ];

  return (
    <div className="w-16 sm:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-3 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <img 
              src="https://i.postimg.cc/PfLbYgh2/6732e31fc8403c1a709ad1e0-256-1.png" 
              alt="SuperPrint Logo" 
              className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SUPERPRINT</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Branding Team</p>
          </div>
        </div>
      </div>

      <nav className="px-2 sm:px-4 pb-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-2 sm:px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium hidden sm:block">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">MA</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Created by</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mukesh Ayudh</p>
          </div>
        </div>
      </div>
    </div>
  );
};