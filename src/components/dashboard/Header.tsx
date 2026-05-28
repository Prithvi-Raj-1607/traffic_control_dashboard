'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw, Filter } from 'lucide-react';
import { citiesData } from '@/lib/dashboard-data';

interface HeaderProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  isOnline: boolean;
  lastUpdated: string;
}

export default function Header({ selectedCity, onCityChange, isOnline, lastUpdated }: HeaderProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filteredCities = citiesData.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F6F7F8] rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#66B800]" />
            {selectedCity || 'Select City'}
          </button>
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border-0 outline-none focus:ring-2 focus:ring-[#66B800]"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      onCityChange(city.name);
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      selectedCity === city.name ? 'bg-[#ecfccb] text-[#66B800] font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-xs text-gray-400">{city.state}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Online Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-[#66B800]" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${isOnline ? 'text-[#66B800]' : 'text-red-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <span className="text-xs text-gray-400">
          Updated: {new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
          <Filter className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
