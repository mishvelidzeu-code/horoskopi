import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

// 1. ფიქსირებული ფერების პალიტრა (Mystic Night)
export const COLORS = {
  background: '#070711',
  surface: '#141028',
  primary: '#B829EA',
  textMain: '#FFFFFF',
  textMuted: '#A0A0B0',
  border: 'rgba(255,255,255,0.1)',
  status: {
    error: '#FF4C4C',
    success: '#00E676',
  }
};

interface ThemeContextType {
  colors: typeof COLORS; // პირდაპირ ფერებს ვაწვდით
  isPrime: boolean;
  isLoading: boolean;
  activeTheme: string; // 👈 დაემატა ეს ხაზი
  checkSubscription: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPrime, setIsPrime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();

    // ვუსმენთ სესიის ცვლილებას
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) checkSubscription();
      else setIsPrime(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_prime')
          .eq('id', session.user.id)
          .single();
        setIsPrime(data?.is_prime || false);
      }
    } catch (err) {
      console.error('Subscription check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({ 
      colors: COLORS, 
      isPrime, 
      isLoading, 
      activeTheme: 'dark', // 👈 დაემატა ეს მნიშვნელობა (რადგან COLORS მუქი პალიტრაა)
      checkSubscription 
    }),
    [isPrime, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};