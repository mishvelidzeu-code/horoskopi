import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface AstrologyContextType {
  userNatalData: any;
  isLoading: boolean;
  refreshNatalData: () => Promise<void>;
}

const AstrologyContext = createContext<AstrologyContextType | null>(null);

export const AstrologyProvider = ({ children }: { children: React.ReactNode }) => {
  const [userNatalData, setUserNatalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNatalData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. ჯერ ვიღებთ პროფილს კოორდინატებისთვის
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && profile.birth_date) {
          // 2. ვიძახებთ ჩვენს Edge Function-ს
          const { data, error } = await supabase.functions.invoke('calculate-natal', {
            body: { 
              birth_date: profile.birth_date,
              birth_time: profile.birth_time || '12:00:00',
              lat: profile.latitude || 41.7151,
              lng: profile.longitude || 44.8271
            }
          });

          if (data) setUserNatalData(data);
        }
      }
    } catch (error) {
      console.error("Astrology Context Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNatalData();
  }, []);

  return (
    <AstrologyContext.Provider value={{ userNatalData, isLoading, refreshNatalData: fetchNatalData }}>
      {children}
    </AstrologyContext.Provider>
  );
};

export const useAstrology = () => {
  const context = useContext(AstrologyContext);
  if (!context) throw new Error('useAstrology must be used within AstrologyProvider');
  return context;
};