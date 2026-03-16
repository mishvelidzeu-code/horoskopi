import { supabase } from './supabase';

export const horoscopeService = {
  async getDailyHoroscope(zodiacSign: string) {
    const today = new Date().toISOString().split('T')[0]; // მაგ: 2026-03-15

    const { data, error } = await supabase
      .from('horoscopes')
      .select('*')
      .eq('zodiac_sign', zodiacSign)
      .eq('date', today)
      .single();

    if (error) {
      console.log("Horoscope error:", error.message);
      return null;
    }
    return data;
  }
};