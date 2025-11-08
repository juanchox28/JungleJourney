import { Button } from "@/components/ui/button";
import { Leaf, Menu, User, Moon, Sun, Languages, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Tour } from "@shared/schema";

interface NavigationProps {
  transparent?: boolean;
  onMenuClick?: () => void;
}

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export default function Navigation({ transparent = false, onMenuClick }: NavigationProps) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState('es');

  // Fetch tours for location dropdown
  const { data: tours = [] } = useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tours`);
      if (!response.ok) throw new Error("Failed to fetch tours");
      return response.json() as Promise<Tour[]>;
    },
  });

  // Get unique locations from tours
  const locations = Array.from(new Set(tours.map(tour => tour.location).filter(Boolean))).sort();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    console.log('Dark mode:', newDarkMode);
  };

  const bgClass = transparent && !scrolled 
    ? "bg-transparent" 
    : "bg-background/95 backdrop-blur-md border-b border-border";

  const textClass = transparent && !scrolled 
    ? "text-white" 
    : "text-foreground";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Paraíso Ayahuasca Logo"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback to leaf icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.classList.remove('hidden');
                }}
              />
              <Leaf className={`w-8 h-8 ${textClass} hidden`} />
              <span className={`font-serif text-2xl font-bold ${textClass}`}>
                Paraíso Ayahuasca
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/hotel-booking"
              className={`${textClass} hover:text-primary transition-colors font-medium`}
            >
              {t('nav.accommodations')}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`${textClass} hover:text-primary transition-colors font-medium flex items-center gap-1`}
                >
                  {t('nav.tours')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem asChild>
                  <Link href="/tours" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver Todos los Tours
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {locations.map((location) => {
                  const locationTours = tours.filter(tour => tour.location === location);
                  return (
                    <DropdownMenuItem key={location} asChild>
                      <Link href={`/tours?location=${location}`} className="w-full">
                        <MapPin className="w-4 h-4 mr-2" />
                        {location === 'leticia' ? 'Leticia' : location === 'puerto-narino' ? 'Puerto Nariño' : location === 'mocagua' ? 'Mocagua' : location}
                        <span className="ml-auto text-xs text-muted-foreground">
                          ({locationTours.length})
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              data-testid="link-about"
              className={`${textClass} hover:text-primary transition-colors font-medium`}
              onClick={() => console.log('Navigate to about')}
            >
              {t('nav.about')}
            </button>
            <button
              data-testid="link-contact"
              className={`${textClass} hover:text-primary transition-colors font-medium`}
              onClick={() => console.log('Navigate to contact')}
            >
              {t('nav.contact')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid="button-language"
                  variant="ghost"
                  size="icon"
                  className={transparent && !scrolled ? "text-white hover:text-white" : ""}
                >
                  <Languages className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    data-testid={`language-${lang.code}`}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      i18n.changeLanguage(lang.code);
                      console.log('Language changed to:', lang.code);
                    }}
                    className={currentLang === lang.code ? 'bg-accent' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              data-testid="button-theme-toggle"
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={transparent && !scrolled ? "text-white hover:text-white" : ""}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              data-testid="button-user"
              variant="ghost"
              size="icon"
              onClick={() => console.log('User profile clicked')}
              className={transparent && !scrolled ? "text-white hover:text-white" : ""}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              data-testid="button-menu"
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className={`md:hidden ${transparent && !scrolled ? "text-white hover:text-white" : ""}`}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
