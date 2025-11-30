import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cartContext";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomePage from "@/pages/HomePage";
import ToursPage from "@/pages/ToursPage";
import TourDetailPage from "@/pages/TourDetailPage";
import AccommodationsPage from "@/pages/AccommodationsPage";
import AccommodationDetailPage from "@/pages/AccommodationDetailPage";
import HotelBookingPage from "@/pages/HotelBookingPage";
import TourBookingPage from "@/pages/TourBookingPage";
import BoatTicketsPage from "@/pages/BoatTicketsPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AdministratorPage from "@/pages/AdministratorPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/accommodations" component={AccommodationsPage} />
      <Route path="/accommodation/:id" component={AccommodationDetailPage} />
      <Route path="/reservar" component={HotelBookingPage} />
      <Route path="/hotel-booking" component={HotelBookingPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/administrador" component={AdministratorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Router />
          <WhatsAppButton />
          <Toaster />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
