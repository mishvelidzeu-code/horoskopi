import { supabase } from './supabase';

export const tarotService = {
  async getAllCards() {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getRandomCard() {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*');
    if (error) throw error;
    if (!data || data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }
};