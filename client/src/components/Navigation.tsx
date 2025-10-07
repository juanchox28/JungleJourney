import { Button } from "@/components/ui/button";
import { Leaf, Menu, User, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface NavigationProps {
  transparent?: boolean;
  onMenuClick?: () => void;
}

export default function Navigation({ transparent = false, onMenuClick }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
            <Leaf className={`w-8 h-8 ${textClass}`} />
            <span className={`font-serif text-2xl font-bold ${textClass}`}>
              Amazonas
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              data-testid="link-tours"
              className={`${textClass} hover:text-primary transition-colors font-medium`}
              onClick={() => console.log('Navigate to tours')}
            >
              Tours
            </button>
            <button 
              data-testid="link-destinations"
              className={`${textClass} hover:text-primary transition-colors font-medium`}
              onClick={() => console.log('Navigate to destinations')}
            >
              Destinations
            </button>
            <button 
              data-testid="link-about"
              className={`${textClass} hover:text-primary transition-colors font-medium`}
              onClick={() => console.log('Navigate to about')}
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-2">
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
