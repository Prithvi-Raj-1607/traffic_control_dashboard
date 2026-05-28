'use client';

import React from 'react';
import { Search, MapPin, X, Wifi, WifiOff, RefreshCw, Filter } from 'lucide-react';
import { citiesData } from '@/lib/dashboard-data';
import { useCityStore } from '@/lib/city-store';

interface HeaderProps {
  isOnline: boolean;
  lastUpdated: string;
}

export default function Header({ isOnline, lastUpdated }: HeaderProps) {
  const { selectedCity, setSelectedCity } = useCityStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredCities = React.useMemo(() => {
    if (!searchTerm) return citiesData;
    const term = searchTerm.toLowerCase();
    return citiesData.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.state.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setSearchTerm('');
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const clearSelection = () => {
    setSelectedCity('All India');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const isAllIndia = !selectedCity || selectedCity === 'All India';
  const currentCityData = citiesData.find(c => c.name === selectedCity);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {/* City Search Bar - Prominent */}
        <div className="relative" ref={dropdownRef}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
            isFocused ? 'border-[#66B800] bg-white shadow-sm shadow-[#66B800]/10' : 'border-gray-200 bg-[#F6F7F8]'
          } w-80`}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city... (e.g. Mumbai, Delhi)"
              value={isFocused ? searchTerm : (isAllIndia ? '' : selectedCity)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!showDropdown) setShowDropdown(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowDropdown(true);
                setSearchTerm('');
              }}
              onBlur={() => {
                // Delay to allow click on dropdown items
                setTimeout(() => setIsFocused(false), 200);
              }}
              className="flex-1 bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            {!isAllIndia && (
              <button
                onClick={clearSelection}
                className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              {/* All India option */}
              <button
                onClick={() => handleSelectCity('All India')}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 ${
                  isAllIndia ? 'bg-[#ecfccb] text-[#66B800] font-medium' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  All India
                </span>
                <span className="text-xs text-gray-400">Overview</span>
              </button>
              <div className="max-h-64 overflow-y-auto">
                {filteredCities.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">No cities found</div>
                ) : (
                  filteredCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSelectCity(city.name)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        selectedCity === city.name ? 'bg-[#ecfccb] text-[#66B800] font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{city.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{city.state}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          city.riskScore >= 80 ? 'bg-red-500' : city.riskScore >= 60 ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current City Badge */}
        {!isAllIndia && currentCityData && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ecfccb] rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-[#66B800]" />
            <span className="text-xs font-semibold text-[#66B800]">{selectedCity}</span>
            <span className="text-xs text-[#66B800]/70">Risk: {currentCityData.riskScore}/100</span>
          </div>
        )}

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
