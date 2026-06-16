import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import HospitalDashboard from "./pages/HospitalDashboard.tsx";
import BloodBankDashboard from "./pages/BloodBankDashboard.tsx";
import DonorDashboard from "./pages/DonorDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hospital/login" element={<AuthPage role="hospital" roleLabel="HOSPITAL" />} />
          <Route path="/bloodbank/login" element={<AuthPage role="blood_bank" roleLabel="BLOOD BANK" />} />
          <Route path="/user/login" element={<AuthPage role="donor" roleLabel="DONOR" />} />
          <Route path="/hospital/*" element={<HospitalDashboard />} />
          <Route path="/bloodbank/*" element={<BloodBankDashboard />} />
          <Route path="/donor/*" element={<DonorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
