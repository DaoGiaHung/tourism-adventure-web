
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Itinerary from "./pages/Itinerary";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { ItineraryProvider } from "./context/ItineraryContext";
import { LocationProvider } from "./context/LocationContext";
import { CheckpointDiscovery } from "./pages/CheckpointDiscovery";
import { TravelHistory } from "./pages/TravelHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LocationProvider>
        <ItineraryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/explore" element={<Layout><Explore /></Layout>} />
                <Route path="/itinerary" element={<Layout><Itinerary /></Layout>} />
                <Route path="/checkpoint-discovery" element={<Layout><CheckpointDiscovery /></Layout>} />
                <Route path="/travel-history" element={<Layout><TravelHistory /></Layout>} />
                <Route path="/premium" element={<Layout><Premium /></Layout>} />
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ItineraryProvider>
      </LocationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
