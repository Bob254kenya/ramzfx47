// components/theme-toggle-complete.tsx - All-in-one solution
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'light' | 'dark' | 'system';

// Custom hook with all features
function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme: Theme = 'system';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('theme') as Theme | null;
      if (currentTheme === 'system' || !currentTheme) {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    let resolved: 'light' | 'dark';
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = systemPrefersDark ? 'dark' : 'light';
    } else {
      resolved = newTheme;
    }
    
    setResolvedTheme(resolved);
    
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setThemeWithStorage = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: Record<Theme, Theme> = {
      light: 'dark',
      dark: 'system',
      system: 'light'
    };
    setThemeWithStorage(nextTheme[theme]);
  };

  return { theme, resolvedTheme, toggleTheme, setTheme: setThemeWithStorage };
}

// Main component with all styles combined
export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    setIsRippling(true);
    toggleTheme();
    setTimeout(() => setIsRippling(false), 300);
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Laptop className="h-3.5 w-3.5" />;
    }
    return theme === 'light' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />;
  };

  const getTooltipText = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    return `Switch to ${nextTheme} mode (current: ${theme === 'system' ? resolvedTheme : theme})`;
  };

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <div className="relative">
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative h-9 w-9 p-0 overflow-hidden rounded-full text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-foreground"
          aria-label={getTooltipText()}
          title={getTooltipText()}
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 transition-all duration-300 ${
            isHovered ? 'from-primary/5 to-primary/10' : ''
          }`} />
          
          {/* Ripple effect */}
          {isRippling && (
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          )}
          
          {/* Icon with animations */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ 
                duration: 0.25, 
                type: 'spring', 
                stiffness: 400,
                damping: 25
              }}
              className="absolute"
            >
              {getIcon()}
            </motion.div>
          </AnimatePresence>
          
          {/* Hover overlay */}
          <div className={`absolute inset-0 rounded-full bg-current opacity-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-10' : ''
          }`} />
        </Button>
      </motion.div>
      
      {/* Pulse animation on theme change */}
      <AnimatePresence>
        {!isRippling && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full bg-primary/20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
