'use client';

import React from 'react';
import {
  LayoutDashboard, Map, Calendar, BarChart3, Brain, BookOpen,
  FileText, Settings, Shield
} from 'lucide-react';

export type NavItem = 'dashboard' | 'livemap' | 'events' | 'analyze' | 'predict' | 'rules' | 'reports' | 'settings';

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'livemap', label: 'Live Map', icon: Map },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'analyze', label: 'Analyze', icon: BarChart3 },
  { id: 'predict', label: 'Predict', icon: Brain },
  { id: 'rules', label: 'Rules Engine', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#66B800] rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Traffic Control</h1>
            <p className="text-xs text-gray-500">Intelligence Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-1 ${
                isActive
                  ? 'bg-[#ecfccb] text-[#66B800] border-r-[3px] border-[#66B800]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#66B800]' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#66B800] flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">DWDM Project</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
