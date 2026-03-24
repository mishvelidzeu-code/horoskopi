import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2; 

// ♈ ნიშნების სია
const ZODIAC_SIGNS = [
  'ვერძი', 'კურო', 'ტყუპები', 'კირჩხიბი', 'ლომი', 'ქალწული', 
  'სასწორი', 'მორიელი', 'მშვილდოსანი', 'თხის რქა', 'მერწყული', 'თევზები'
];

const ELEMENTS = [
  { id: 'fire', name: 'ცეცხლი', signs: 'ვერძი, ლომი, მშვილდოსანი', color: '#FF3366', icon: 'flame', desc: 'ვნებიანი, დინამიური და ენერგიული' },
  { id: 'earth', name: 'მიწა', signs: 'კურო, ქალწული, თხის რქა', color: '#10B981', icon: 'leaf', desc: 'პრაქტიკული, სტაბილური და სანდო' },
  { id: 'air', name: 'ჰაერი', signs: 'ტყუპები, სასწორი, მერწყული', color: '#00E5FF', icon: 'cloud', desc: 'ინტელექტუალური, კომუნიკაბელური' },
  { id: 'water', name: 'წყალი', signs: 'კირჩხიბი, მორიელი, თევზები', color: '#B829EA', icon: 'water', desc: 'ემოციური, ინტუიციური და მგრძნობიარე' },
];

const PLANET_METADATA: any = {
  sun: { name: 'მზე', icon: 'sunny', color: '#FFD700', fallback: 'ეგო და სასიცოცხლო ენერგია' },
  moon: { name: 'მთვარე', icon: 'moon', color: '#E0E0E0', fallback: 'ემოციები და ქვეცნობიერი' },
  mercury: { name: 'მერკური', icon: 'planet', color: '#60A5FA', fallback: 'კომუნიკაცია და აზროვნება' },
  venus: { name: 'ვენერა', icon: 'heart-half', color: '#FF3366', fallback: 'სიყვარული და ჰარმონია' },
  mars: { name: 'მარსი', icon: 'flame', color: '#EF4444', fallback: 'ენერგია და მოქმედება' },
  jupiter: { name: 'იუპიტერი', icon: 'star', color: '#F9A826', fallback: 'ზრდა და იღბალი' },
  saturn: { name: 'სატურნი', icon: 'aperture', color: '#A855F7', fallback: 'დისციპლინა და კარმა' },
  uranus: { name: 'ურანი', icon: 'radio', color: '#2DD4BF', fallback: 'ინოვაცია და თავისუფლება' },
  neptune: { name: 'ნეპტუნი', icon: 'water', color: '#3B82F6', fallback: 'ინტუიცია და ოცნებები' },
  pluto: { name: 'პლუტონი', icon: 'skull', color: '#6B7280', fallback: 'ტრანსფორმაცია და ძალაუფლება' },
};

export default function ExploreScreen() {
  const { colors, isPrime } = useAppTheme();
  const float = useRef(new Animated.Value(0)).current;
  const [planetsData, setPlanetsData] = useState<any[]>([]);
  const [isLoadingPlanets, setIsLoadingPlanets] = useState(true);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
    fetchPlanetMeanings();
  }, []);

  const fetchPlanetMeanings = async () => {
    try {
      const { data } = await supabase.from('planet_meanings').select('*').eq('topic', 'about').eq('language', 'ka');
      const formatted = Object.keys(PLANET_METADATA).map(pKey => {
        const dbEntry = data?.find(d => d.planet === pKey);
        return { id: pKey, ...PLANET_METADATA[pKey], role: dbEntry ? dbEntry.meaning : PLANET_METADATA[pKey].fallback };
      });
      setPlanetsData(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPlanets(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>აღმოაჩინე</Text>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>ასტროლოგიური სამყარო</Text>
        </View>

        {/* --- COMPATIBILITY BANNER (განახლებული ლოგიკა) --- */}
        <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }}>
          <TouchableOpacity 
            style={[styles.compatibilityBanner, { backgroundColor: colors.surface, borderColor: colors.primary }]} 
            onPress={() => router.push('/compatibility' as any)} // 🔥 ახლა პირდაპირ გადადის
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000' }} 
              style={styles.bannerImage} 
              contentFit="cover" 
            />
            <LinearGradient colors={[colors.surface, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            
            <View style={styles.bannerTextContent}>
              <View style={[styles.bannerBadge, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                <Ionicons name="sparkles" size={12} color={colors.primary} style={{marginRight: 4}} />
                <Text style={[styles.bannerBadgeText, { color: colors.primary }]}>პოპულარული</Text>
              </View>
              <Text style={[styles.bannerTitle, { color: colors.textMain }]}>თავსებადობის ტესტი</Text>
              <Text style={[styles.bannerDesc, { color: colors.textMuted }]}>შეამოწმეთ რამდენად ეწყობით პარტნიორს ზოდიაქოს მიხედვით.</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ♈ ზოდიაქოს ნიშნები */}
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>ზოდიაქოს ნიშნები</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.signsScroll}>
          {ZODIAC_SIGNS.map((sign, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.signChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/sign/${sign}` as any)}
            >
              <Text style={[styles.signChipText, { color: colors.textMain }]}>{sign}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ელემენტები */}
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>ზოდიაქოს ელემენტები</Text>
        <View style={styles.elementsContainer}>
          {ELEMENTS.map((el) => (
            <TouchableOpacity key={el.id} style={[styles.elementCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push(`/element/${el.id}` as any)}>
               <View style={[styles.elementIconBox, { backgroundColor: `${el.color}15`, borderColor: `${el.color}40`, borderWidth: 1 }]}><Ionicons name={el.icon as any} size={26} color={el.color} /></View>
               <View style={{flex: 1}}><Text style={[styles.elementName, { color: colors.textMain }]}>{el.name}</Text><Text style={[styles.elementSigns, { color: colors.textMuted }]}>{el.signs}</Text></View>
               <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* პლანეტები Grid-ში */}
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>მმართველი პლანეტები</Text>
        {isLoadingPlanets ? <ActivityIndicator color={colors.primary} /> : (
          <View style={styles.planetsGrid}>
            {planetsData.map((planet) => (
              <TouchableOpacity key={planet.id} style={[styles.planetCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push(`/planet/${planet.id}` as any)}>
                <View style={[styles.planetIconContainer, { backgroundColor: `${planet.color}10`, borderColor: `${planet.color}30` }]}><Ionicons name={planet.icon as any} size={32} color={planet.color} /></View>
                <Text style={[styles.planetName, { color: colors.textMain }]}>{planet.name}</Text>
                <Text style={[styles.planetRole, { color: colors.textMuted }]} numberOfLines={2}>{planet.role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '900' },
  headerSubtitle: { fontSize: 15, marginTop: 4, fontWeight: '700' },
  compatibilityBanner: { marginHorizontal: 24, height: 180, borderRadius: 32, overflow: 'hidden', flexDirection: 'row', marginBottom: 35, borderWidth: 1.5 },
  bannerImage: { position: 'absolute', right: -30, top: 0, bottom: 0, width: '70%' },
  bannerTextContent: { flex: 1, padding: 24, justifyContent: 'center' },
  bannerBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  bannerBadgeText: { fontSize: 9, fontWeight: '900' },
  bannerTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  bannerDesc: { fontSize: 12, lineHeight: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, paddingHorizontal: 24 },
  
  signsScroll: { paddingHorizontal: 24, gap: 12, marginBottom: 35 },
  signChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1 },
  signChipText: { fontSize: 14, fontWeight: '700' },

  elementsContainer: { paddingHorizontal: 24, marginBottom: 35 },
  elementCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1 },
  elementIconBox: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  elementName: { fontSize: 17, fontWeight: '800' },
  elementSigns: { fontSize: 12 },
  planetsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 24 },
  planetCard: { width: CARD_WIDTH, padding: 16, borderRadius: 28, marginBottom: 16, alignItems: 'center', borderWidth: 1 },
  planetIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  planetName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  planetRole: { fontSize: 11, textAlign: 'center' },
});