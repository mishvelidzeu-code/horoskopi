import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// შენი Supabase მონაცემები
const supabaseUrl = 'https://xbwetrxtjimikaofpzkl.supabase.co';
const supabaseAnonKey = 'sb_publishable_y2mvfyMDAZCs-KAByLaQ-g_E9zN9YKl'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});