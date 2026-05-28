'use client';

import React from 'react';
import { Server, Clock, Palette, Bell, Database, Save } from 'lucide-react';

export default function SettingsView() {
  const [refreshInterval, setRefreshInterval] = React.useState(5);
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Configure dashboard preferences and connections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Server className="w-5 h-5 text-[#66B800]" /><h3 className="text-sm font-bold text-gray-900">API Configuration</h3></div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">API Base URL</label>
              <input type="text" defaultValue="http://localhost:8000/api" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#66B800]/30 focus:border-[#66B800]" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Data Source</label>
              <select defaultValue="mock" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#66B800]/30 focus:border-[#66B800]">
                <option value="mock">Mock Data (Offline)</option>
                <option value="api">Live API</option>
                <option value="hybrid">Hybrid Mode</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-[#66B800]" /><h3 className="text-sm font-bold text-gray-900">Refresh Settings</h3></div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Auto-Refresh Interval: {refreshInterval} seconds</label>
              <input type="range" min="1" max="30" value={refreshInterval} onChange={(e) => setRefreshInterval(parseInt(e.target.value))} className="w-full accent-[#66B800]" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1s</span><span>15s</span><span>30s</span></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Enable Auto-Refresh</span>
              <button className="w-10 h-5 bg-[#66B800] rounded-full relative"><span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" /></button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-[#66B800]" /><h3 className="text-sm font-bold text-gray-900">Theme Settings</h3></div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Color Theme</label>
              <div className="flex items-center gap-2">
                {[{ name: 'Green', color: '#66B800' }, { name: 'Blue', color: '#3B82F6' }, { name: 'Purple', color: '#8B5CF6' }, { name: 'Teal', color: '#14B8A6' }].map((theme) => (
                  <button key={theme.name} className={`w-8 h-8 rounded-full border-2 ${theme.color === '#66B800' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: theme.color }} title={theme.name} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-[#66B800]" /><h3 className="text-sm font-bold text-gray-900">Notifications</h3></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-600">Push Notifications</p><p className="text-xs text-gray-400">Get alerts for critical events</p></div>
              <button onClick={() => setNotifications(!notifications)} className={`w-10 h-5 rounded-full relative ${notifications ? 'bg-[#66B800]' : 'bg-gray-300'}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notifications ? 'right-0.5' : 'left-0.5'}`} /></button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-600">Email Alerts</p><p className="text-xs text-gray-400">Daily summary reports</p></div>
              <button onClick={() => setEmailAlerts(!emailAlerts)} className={`w-10 h-5 rounded-full relative ${emailAlerts ? 'bg-[#66B800]' : 'bg-gray-300'}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${emailAlerts ? 'right-0.5' : 'left-0.5'}`} /></button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-[#66B800]" /><h3 className="text-sm font-bold text-gray-900">Data Source Information</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Database</p><p className="text-sm font-bold text-gray-900">SQLite + Mock Data</p></div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Last Sync</p><p className="text-sm font-bold text-gray-900">{new Date().toLocaleString('en-IN')}</p></div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Records</p><p className="text-sm font-bold text-gray-900">96,200+</p></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-green-600 font-medium">Settings saved successfully!</span>}
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#66B800] text-white text-sm font-medium rounded-lg hover:bg-[#5ca300] transition-colors">
          <Save className="w-4 h-4" />Save Settings
        </button>
      </div>
    </div>
  );
}
