import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import ToursPage from "@/pages/ToursPage";
import TourDetailPage from "@/pages/TourDetailPage";
import AccommodationsPage from "@/pages/AccommodationsPage";
import AccommodationDetailPage from "@/pages/AccommodationDetailPage";
import HotelBookingPage from "@/pages/HotelBookingPage";
import TourBookingPage from "@/pages/TourBookingPage";
import BoatTicketsPage from "@/pages/BoatTicketsPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/tours" component={ToursPage} />
      <Route path="/tour/:id" component={TourDetailPage} />
      <Route path="/accommodations" component={AccommodationsPage} />
      <Route path="/accommodation/:id" component={AccommodationDetailPage} />
      <Route path="/hotel-booking" component={HotelBookingPage} />
      <Route path="/tour-booking" component={TourBookingPage} />
      <Route path="/boat-tickets" component={BoatTicketsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
