import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

// პლანეტების ვიზუალური მეტამონაცემები
const PLANET_UI: any = {
  sun: { name: 'მზე', color: '#FFD700', icon: 'sunny' },
  moon: { name: 'მთვარე', color: '#E0E0E0', icon: 'moon' },
  mercury: { name: 'მერკური', color: '#60A5FA', icon: 'planet' },
  venus: { name: 'ვენერა', color: '#FF3366', icon: 'heart-half' },
  mars: { name: 'მარსი', color: '#EF4444', icon: 'flame' },
  jupiter: { name: 'იუპიტერი', color: '#F9A826', icon: 'star' },
  saturn: { name: 'სატურნი', color: '#A855F7', icon: 'aperture' },
  uranus: { name: 'ურანი', color: '#2DD4BF', icon: 'radio' },
  neptune: { name: 'ნეპტუნი', color: '#3B82F6', icon: 'water' },
  pluto: { name: 'პლუტონი', color: '#6B7280', icon: 'skull' },
};

export default function PlanetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [meaning, setMeaning] = useState('');
  
  const planetUI = PLANET_UI[id as string] || PLANET_UI.sun;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPlanetDetail();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [id]);

  const fetchPlanetDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('planet_meanings')
        .select('meaning')
        .eq('planet', id)
        .eq('topic', 'about')
        .single();

      if (data) setMeaning(data.meaning);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#070711', '#141028']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>პლანეტის ენერგია</Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.ScrollView contentContainerStyle={styles.scrollContent} style={{ opacity: fadeAnim }}>
        <View style={[styles.iconCircle, { borderColor: `${planetUI.color}40`, shadowColor: planetUI.color }]}>
          <Ionicons name={planetUI.icon} size={80} color={planetUI.color} />
        </View>

        <Text style={[styles.planetName, { color: planetUI.color }]}>{planetUI.name.toUpperCase()}</Text>
        
        <View style={styles.contentCard}>
          {loading ? (
            <ActivityIndicator color={planetUI.color} />
          ) : (
            <Text style={styles.descriptionText}>{meaning || 'ინფორმაცია მალე დაემატება...'}</Text>
          )}
        </View>

        <View style={styles.glassInfo}>
           <Text style={styles.infoTitle}>რაზე აგებს პასუხს?</Text>
           <Text style={styles.infoSubtitle}>ეს პლანეტა მართავს თქვენს შინაგან მისწრაფებებს და განსაზღვრავს ბედისწერის გარკვეულ ასპექტებს.</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070711' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 24 },
  backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scrollContent: { alignItems: 'center', paddingBottom: 50 },
  iconCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginTop: 40, borderWidth: 2, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  planetName: { fontSize: 32, fontWeight: '900', marginTop: 25, letterSpacing: 2 },
  contentCard: { padding: 25, width: width * 0.9, marginTop: 30 },
  descriptionText: { color: '#D1D1E0', fontSize: 17, lineHeight: 28, textAlign: 'center' },
  glassInfo: { width: width * 0.85, padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  infoTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  infoSubtitle: { color: '#A0A0B0', fontSize: 14, lineHeight: 20 }
});