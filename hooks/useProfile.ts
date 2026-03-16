import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error) setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(true);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, refresh: fetchProfile };
}