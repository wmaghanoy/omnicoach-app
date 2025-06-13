import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  BarChart3, 
  Calendar,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/habits', icon: Calendar, label: 'Habits' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 z-10 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">OC</span>
              </div>
              <span className="text-xl font-semibold">OmniCoach</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Voice Status */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-3 bg-gray-800 rounded-lg`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {!collapsed && <span className="text-sm text-gray-300">Voice Ready</span>}
          </div>
          {!collapsed && (
            <button className="p-1 rounded hover:bg-gray-700 transition-colors">
              <Mic className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;