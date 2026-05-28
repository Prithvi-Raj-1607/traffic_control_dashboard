'use client';

import React from 'react';
import Sidebar, { type NavItem } from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DashboardView from '@/components/dashboard/DashboardView';
import LiveMapView from '@/components/dashboard/LiveMapView';
import EventsView from '@/components/dashboard/EventsView';
import AnalyzeView from '@/components/dashboard/AnalyzeView';
import PredictView from '@/components/dashboard/PredictView';
import RulesEngineView from '@/components/dashboard/RulesEngineView';
import ReportsView from '@/components/dashboard/ReportsView';
import SettingsView from '@/components/dashboard/SettingsView';
import { useCityStore } from '@/lib/city-store';

export default function Home() {
  const [activeNav, setActiveNav] = React.useState<NavItem>('dashboard');
  const { selectedCity, setSelectedCity } = useCityStore();
  const [isOnline] = React.useState(true);
  const [lastUpdated] = React.useState(new Date().toISOString());

  const renderView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView selectedCity={selectedCity} onCityChange={setSelectedCity} onSwitchToLiveMap={() => setActiveNav('livemap')} />;
      case 'livemap':
        return <LiveMapView selectedCity={selectedCity} onCityChange={setSelectedCity} />;
      case 'events':
        return <EventsView selectedCity={selectedCity} />;
      case 'analyze':
        return <AnalyzeView selectedCity={selectedCity} />;
      case 'predict':
        return <PredictView selectedCity={selectedCity} />;
      case 'rules':
        return <RulesEngineView selectedCity={selectedCity} />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView selectedCity={selectedCity} onCityChange={setSelectedCity} onSwitchToLiveMap={() => setActiveNav('livemap')} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F6F7F8]">
      {/* Fixed Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Header */}
        <Header isOnline={isOnline} lastUpdated={lastUpdated} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
