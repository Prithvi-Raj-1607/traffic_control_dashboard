import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { searchCities } from '../data/mockDashboardData';
import type { CityData } from '../types';

interface CitySearchBarProps {
  onCitySelect: (city: CityData) => void;
  placeholder?: string;
}

export default function CitySearchBar({ onCitySelect, placeholder }: CitySearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setNotFound(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const found = searchCities(value);
      setResults(found);
      setShowDropdown(found.length > 0 || value.length >= 2);
      if (value.length >= 2 && found.length === 0) setNotFound(true);
    }, 300);
  };

  const handleSelect = (city: CityData) => {
    setQuery(city.name);
    setShowDropdown(false);
    setNotFound(false);
    onCitySelect(city);
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    setNotFound(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder={placeholder || 'Search city, state, or location...'}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66B800]/30 focus:border-[#66B800] transition-all"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {notFound ? (
            <div className="px-4 py-3 text-sm text-gray-500">City not found. Try a different search.</div>
          ) : (
            results.map((city) => (
              <button
                key={city.name}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-[#66B800] flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-800">{city.name}</div>
                  <div className="text-xs text-gray-500">{city.state} · Risk: {city.riskScore}/100</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
