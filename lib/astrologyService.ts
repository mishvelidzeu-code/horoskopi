import { supabase } from './supabase';

export const astrologyService = {
  /**
   * აბრუნებს თავსებადობის მონაცემებს ორ ზოდიაქოს ნიშანს შორის.
   * ფილტრი მუშაობს ორმხრივად (A+B ან B+A).
   */
  async getCompatibility(sign1: string, sign2: string) {
    const { data, error } = await supabase
      .from('zodiac_compatibility')
      .select('*')
      .or(`and(sign1.eq.${sign1},sign2.eq.${sign2}),and(sign1.eq.${sign2},sign2.eq.${sign1})`)
      .single();

    if (error) {
      // თუ ჩანაწერი არ არსებობს, კონსოლში გამოვიტანთ ინფოს და დავაბრუნებთ null-ს
      console.log("Compatibility data not found for these signs:", error.message);
      return null;
    }

    return data;
  }
};