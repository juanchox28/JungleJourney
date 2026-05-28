import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Navigation />
      <div className="pt-16">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>

          <div className="mt-6">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
