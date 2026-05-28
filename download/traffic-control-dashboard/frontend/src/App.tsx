import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Events from './pages/Events';
import Analyze from './pages/Analyze';
import Predict from './pages/Predict';
import RulesEngine from './pages/RulesEngine';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      staleTime: 3000,
    },
  },
});

export default function App() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date().toISOString());
    queryClient.invalidateQueries();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="h-screen overflow-hidden bg-[#F6F7F8]">
          <Sidebar />
          <main className="ml-64 h-screen overflow-y-auto bg-[#F6F7F8]">
            <Header
              selectedCity={selectedCity}
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
            />
            <div className="p-6">
              <Routes>
                <Route path="/" element={<Dashboard selectedCity={selectedCity} setSelectedCity={setSelectedCity} />} />
                <Route path="/live-map" element={<LiveMap />} />
                <Route path="/events" element={<Events />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/rules-engine" element={<RulesEngine />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
);
}
