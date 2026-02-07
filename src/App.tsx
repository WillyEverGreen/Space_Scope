import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ISSTrackerPage from "./pages/ISSTrackerPage";
import SpaceWeatherPage from "./pages/SpaceWeatherPage";
import APODPage from "./pages/APODPage";
import NewsPage from "./pages/NewsPage";
import MissionsPage from "./pages/MissionsPage";
import SkyEventsMapPage from "./pages/SkyEventsMapPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/iss" element={<ISSTrackerPage />} />
          <Route path="/dashboard/weather" element={<SpaceWeatherPage />} />
          <Route path="/dashboard/apod" element={<APODPage />} />
          <Route path="/dashboard/news" element={<NewsPage />} />
          <Route path="/dashboard/missions" element={<MissionsPage />} />
          <Route path="/dashboard/skymap" element={<SkyEventsMapPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
