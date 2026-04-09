import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { useAdSense } from "@/hooks/useAdSense";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Doctors from "@/pages/Doctors";
import DoctorProfile from "@/pages/DoctorProfile";
import BookAppointment from "@/pages/BookAppointment";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import FarmerDashboard from "@/pages/FarmerDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DoctorRegister from "@/pages/DoctorRegister";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import Mission from "@/pages/Mission";

setAuthTokenGetter(() => getToken());
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL as string);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/doctors" component={Doctors} />
      <Route path="/doctors/:id" component={DoctorProfile} />
      <Route path="/book/:doctorId" component={BookAppointment} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={FarmerDashboard} />
      <Route path="/doctor/dashboard" component={DoctorDashboard} />
      <Route path="/doctor/register" component={DoctorRegister} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/about" component={AboutUs} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/mission" component={Mission} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  useAdSense();
  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
