import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { getAnalysis, getNatalChart, Planet } from '../services/natalService';

export const useNatalChart = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [fetchingAnalysis, setFetchingAnalysis] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    loadData();

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getNatalChart();
      if (result && result.planets) {
        setPlanets(result.planets);
      }
    } catch (e) {
      console.log('❌ Load data error:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 ფუნქცია 1: ერთი კონკრეტული პლანეტის ანალიზისთვის (როცა ბარათს აწვებიან)
   */
  const loadAnalysis = async (planetId: string, sign: string) => {
    try {
      setFetchingAnalysis(true);
      setAnalysis(null); 
      const data = await getAnalysis(planetId, sign);
      setAnalysis(data);
    } catch (e) {
      console.log('❌ Single analysis error:', e);
    } finally {
      setFetchingAnalysis(false);
    }
  };

  /**
   * 🔥 ფუნქცია 2: სრული ანალიზისთვის (როცა მთავარ ოქროსფერ ბარათს აწვებიან)
   * აგროვებს ყველა პლანეტის ტექსტს და აერთიანებს
   */
  const loadFullAnalysis = async () => {
    if (!planets || planets.length === 0) return;

    try {
      setFetchingAnalysis(true);
      setAnalysis(null);

      let fullTextCombined = "";

      // სათითაოდ ვიღებთ ყველა პლანეტის ტექსტს ბაზიდან
      // ვიყენებთ for...of ციკლს, რომ თანმიმდევრობა დაიცვას
      for (const planet of planets) {
        const data = await getAnalysis(planet.id, planet.sign);
        
        if (data && data.text_georgian) {
          // ვამატებთ სათაურს და ტექსტს საერთო ცვლადში
          fullTextCombined += `✨ ${data.title}\n${data.text_georgian}\n\n`;
        }
      }

      setAnalysis({
        title: "სრული პერსონალური ანალიზი",
        text_georgian: fullTextCombined || "ინფორმაცია მუშავდება..."
      });

    } catch (e) {
      console.log('❌ Full analysis error:', e);
    } finally {
      setFetchingAnalysis(false);
    }
  };

  return {
    planets,
    loading,
    analysis,
    fetchingAnalysis,
    loadAnalysis,
    loadFullAnalysis, // აუცილებლად ვაექსპორტებთ, რომ ეკრანმა დაინახოს
    isOffline
  };
};