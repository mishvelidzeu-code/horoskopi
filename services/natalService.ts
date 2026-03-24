import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type Planet = {
  id: string;
  name: string;
  sign: string;
  signEng: string;
  degree: string;
  icon: string;
  color: string;
  house: string;
};

// 🔴 შევცვალეთ v3-ზე, რომ ძველი არასწორი ქეში (Taurus ბაგი) გასუფთავდეს
const CACHE_KEY = 'natal_cache_v3'; 

const ZODIAC_SLUGS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

const ZODIAC_SIGNS_LIST = [
  'ვერძი', 
  'კურო', 
  'ტყუპები', 
  'კირჩხიბი', 
  'ლომი', 
  'ქალწული', 
  'სასწორი', 
  'მორიელი', 
  'მშვილდოსანი', 
  'თხის რქა', 
  'მერწყული', 
  'თევზები'
];

const PLANET_DATA_CONFIG: any = {
  sun: { name: 'მზე', icon: 'white-balance-sunny', color: '#FFD700' },
  moon: { name: 'მთვარე', icon: 'moon-waxing-crescent', color: '#E0E0E0' },
  mercury: { name: 'მერკური', icon: 'weather-windy', color: '#B829EA' },
  venus: { name: 'ვენერა', icon: 'heart-outline', color: '#FF3366' },
  mars: { name: 'მარსი', icon: 'sword-cross', color: '#FF4B72' },
  jupiter: { name: 'იუპიტერი', icon: 'star-circle-outline', color: '#FF9F0A' },
  saturn: { name: 'სატურნი', icon: 'ring', color: '#A0A0A0' },
  uranus: { name: 'ურანი', icon: 'orbit', color: '#00E5FF' },
  neptune: { name: 'ნეპტუნი', icon: 'waves', color: '#32ADE6' },
  pluto: { name: 'პლუტონი', icon: 'skull-outline', color: '#7D7D7D' },
  asc: { name: 'ასცენდენტი', icon: 'arrow-up-circle-outline', color: '#4CD964' },
};

const saveCache = async (data: any) => {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );
  } catch (e) {
    console.log('❌ Cache save error', e);
  }
};

const getCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    // ქეში ვალიდურია 24 საათი
    const isValid = Date.now() - parsed.timestamp < 1000 * 60 * 60 * 24;

    if (!isValid) return null;
    if (!parsed.data?.planets || parsed.data.planets.length === 0) return null;

    return parsed.data;
  } catch (e) {
    return null;
  }
};

// 🔥 დამატებული ფუნქცია ქეშის გასასუფთავებლად
export const clearNatalCache = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('🧹 ნატალური რუკის ქეში წარმატებით წაიშალა!');
  } catch (e) {
    console.log('❌ ქეშის წაშლის შეცდომა', e);
  }
};

export const getNatalChart = async () => {
  const cached = await getCache();
  if (cached) {
    console.log('✅ Using fresh v3 cached data');
    return cached;
  }

  console.log('🌐 Fetching from server with real dynamic logic...');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('No profile');

    // 🚀 ვაგზავნით სრულ მონაცემებს Edge ფუნქციაში
    const { data, error } = await supabase.functions.invoke('calculate-natal', {
      body: {
        birth_date: profile.birth_date,
        birth_time: profile.birth_time || '12:00:00',
        lat: profile.latitude || 41.7151,
        lng: profile.longitude || 44.8271,
        timezone: profile.timezone || 4 // 👈 აუცილებელია სწორი გამოთვლისთვის
      }
    });

    if (error || !data || !data.planets) throw new Error('Invalid natal data from server');

    const planets: Planet[] = data.planets.map((p: any) => ({
      id: p.id,
      name: PLANET_DATA_CONFIG[p.id]?.name || p.id,
      sign: ZODIAC_SIGNS_LIST[p.signIndex], 
      signEng: ZODIAC_SLUGS[p.signIndex],
      degree: `${p.degree}°`,
      icon: PLANET_DATA_CONFIG[p.id]?.icon || 'star',
      color: PLANET_DATA_CONFIG[p.id]?.color || '#fff',
      house: `მე-${p.house} სახლი` // 👈 ახლა უკვე დინამიურია და სერვერიდან მოდის!
    }));

    const result = { profile, planets };
    await saveCache(result);
    return result;

  } catch (error) {
    console.log('❌ Server failed or error occurred:', error);
    const fallback = await getCache();
    if (fallback) return fallback;
    throw error;
  }
};

export const getAnalysis = async (planetId: string, sign: string) => {
  // გასაღებშიც v3 გამოვიყენოთ სინქრონისთვის
  const key = `analysis_v3_${planetId}_${sign}`; 

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const { data, error } = await supabase
      .from('natal_interpretations')
      .select('text_georgian, title')
      .eq('type', 'planet_in_sign')
      .eq('element_1', planetId)
      .eq('element_2', sign)
      .single();

    if (error) throw error;

    if (data) {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    }
    return data;

  } catch (e) {
    console.log("❌ Analysis error:", e);
    return null;
  }
};