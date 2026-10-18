import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Dashboard pages load on demand so the landing page ships a much smaller bundle
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ISSTrackerPage = lazy(() => import("./pages/ISSTrackerPage"));
const SpaceWeatherPage = lazy(() => import("./pages/SpaceWeatherPage"));
const APODPage = lazy(() => import("./pages/APODPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const MissionsPage = lazy(() => import("./pages/MissionsPage"));
const SkyEventsMapPage = lazy(() => import("./pages/SkyEventsMapPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-space-navy" />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
