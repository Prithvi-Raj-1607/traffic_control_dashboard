import { Bell, RefreshCw, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  selectedCity: string | null;
  onRefresh: () => void;
  lastUpdated: string;
}

export default function Header({ selectedCity, onRefresh, lastUpdated }: HeaderProps) {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F7F8]/95 backdrop-blur border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Location */}
          <div className="flex items-center gap-2">
            {selectedCity ? (
              <span className="text-sm font-semibold text-gray-800">
                📍 {selectedCity}, India
              </span>
            ) : (
              <span className="text-sm font-semibold text-gray-800">
                📍 India — All Cities
              </span>
            )}
          </div>

          {/* Online Status */}
          <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>

          {/* Last Updated */}
          <span className="text-xs text-gray-400">
            Updated: {formatTime(lastUpdated)}
          </span>

          {/* Tabs - only on Dashboard */}
          {isDashboard && (
            <div className="flex items-center gap-1 ml-4 bg-gray-100 rounded-lg p-0.5">
              <button className="px-3 py-1.5 text-xs font-medium bg-white rounded-md shadow-sm text-gray-900">
                Overview
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md">
                Device Log
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md">
                Settings
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Last 3 Hours
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-[#66B800] text-white rounded-lg">
              Last 24 Hours
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Direction
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Road Type
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#66B800] hover:border-[#66B800] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notification */}
          <button className="relative p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              3
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#66B800] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
