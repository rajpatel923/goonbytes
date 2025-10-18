import { FloatingNav } from "@/components/layout/FloatingNav";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import AccountPage from "./pages/AccountPage";
import Index from "./pages/Index";
import MapTool from "./pages/MapTool";
import NotFound from "./pages/NotFound";
import Solutions from "./pages/Solutions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FloatingNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route
              path="/map-tool"
              element={
                <MapTool
                  navBar={true}
                  initLng={0}
                  initLat={0}
                  markerInitPos={null}
                  initZoom={1}
                  setInitLng={() => {}}
                  setInitLat={() => {}}
                  setInitMarkPos={() => {}}
                  setInitZoom={() => {}}
                />
              }
            />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
