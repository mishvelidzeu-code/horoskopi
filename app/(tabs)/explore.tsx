import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppTheme } from '../../lib/ThemeContext';

const { width } = Dimensions.get('window');

const ELEMENTS = [
  { id: 'fire', name: 'ცეცხლი', signs: 'ვერძი, ლომი, მშვილდოსანი', color: '#FF3366', icon: 'flame', desc: 'ვნებიანი, დინამიური და ენერგიული' },
  { id: 'earth', name: 'მიწა', signs: 'კურო, ქალწული, თხის რქა', color: '#00E5FF', icon: 'leaf', desc: 'პრაქტიკული, სტაბილური და სანდო' },
  { id: 'air', name: 'ჰაერი', signs: 'ტყუპები, სასწორი, მერწყული', color: '#F9A826', icon: 'cloud', desc: 'ინტელექტუალური, კომუნიკაბელური' },
  { id: 'water', name: 'წყალი', signs: 'კირჩხიბი, მორიელი, თევზები', color: '#B829EA', icon: 'water', desc: 'ემოციური, ინტუიციური და მგრძნობიარე' },
];

const PLANETS = [
  { id: 'sun', name: 'მზე', role: 'ეგო და სასიცოცხლო ენერგია', icon: 'sunny', color: '#FFD700' },
  { id: 'moon', name: 'მთვარე', role: 'ემოციები და ქვეცნობიერი', icon: 'moon', color: '#E0E0E0' },
  { id: 'mercury', name: 'მერკური', role: 'კომუნიკაცია და აზროვნება', icon: 'planet', color: '#00E5FF' },
  { id: 'venus', name: 'ვენერა', role: 'სიყვარული და ჰარმონია', icon: 'heart-half', color: '#FF3366' },
];

const ElementItem = ({ el, colors }: { el: any, colors: any }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.elementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => router.push({ pathname: "/element/[id]", params: { id: el.id } })}
      >
        <View style={[styles.elementIconBox, { backgroundColor: `${el.color}15`, borderColor: `${el.color}40`, borderWidth: 1 }]}>
          <Ionicons name={el.icon as any} size={26} color={el.color} />
        </View>
        <View style={styles.elementInfo}>
          <Text style={[styles.elementName, { color: colors.textMain }]}>{el.name}</Text>
          <Text style={[styles.elementSigns, { color: colors.textMuted }]}>{el.signs}</Text>
          <Text style={[styles.elementDesc, { color: colors.primary }]}>{el.desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ExploreScreen() {
  // 🔴 შეცვლილია: ვიღებთ პირდაპირ colors და isPrime-ს
  const { colors, isPrime } = useAppTheme();
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 🔴 რადგან მხოლოდ ერთი მუქი თემა გვაქვს, სტატუსბარი სულ თეთრი იქნება */}
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
      <View style={[styles.topGlow, { backgroundColor: `${colors.primary}15` }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>აღმოაჩინე</Text>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>ასტროლოგიური სამყარო</Text>
        </View>

        {/* --- COMPATIBILITY BANNER --- */}
        <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }}>
          <TouchableOpacity 
            style={[
              styles.compatibilityBanner, 
              { backgroundColor: colors.surface, borderColor: isPrime ? colors.primary : '#FFD700' }
            ]} 
            activeOpacity={0.9}
            onPress={() => isPrime ? router.push('/compatibility') : router.push('/subscription')}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000' }}
              style={[styles.bannerImage, !isPrime && { opacity: 0.4 }]}
              contentFit="cover"
            />
            
            <LinearGradient
              colors={isPrime ? [colors.surface, 'transparent'] : ['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.bannerTextContent}>
              <View style={[
                styles.bannerBadge, 
                { 
                  backgroundColor: isPrime ? `${colors.primary}20` : 'rgba(255, 215, 0, 0.15)', 
                  borderColor: isPrime ? colors.primary : '#FFD700' 
                }
              ]}>
                <Ionicons name={isPrime ? "sparkles" : "lock-closed"} size={12} color={isPrime ? colors.primary : '#FFD700'} style={{marginRight: 4}} />
                <Text style={[styles.bannerBadgeText, { color: isPrime ? colors.primary : '#FFD700' }]}>
                  {isPrime ? "ახალი" : "PRIME"}
                </Text>
              </View>
              
              <Text style={[styles.bannerTitle, { color: isPrime ? colors.textMain : '#FFF' }]}>
                თავსებადობის ტესტი
              </Text>
              <Text style={[styles.bannerDesc, { color: isPrime ? colors.textMuted : 'rgba(255,255,255,0.7)' }]}>
                {isPrime 
                  ? "შეამოწმეთ რამდენად ეწყობით პარტნიორს ვარსკვლავების მიხედვით." 
                  : "გახსენი ეს ფუნქცია Prime გამოწერით და გაიგე მეტი შენს პარტნიორზე."}
              </Text>
              
              <View style={[
                styles.bannerAction, 
                { backgroundColor: isPrime ? colors.primary : '#FFD700' }
              ]}>
                <Text style={[styles.bannerActionText, { color: isPrime ? '#FFF' : '#000' }]}>
                  {isPrime ? "დაწყება" : "დაბლოკილია"}
                </Text>
                <Ionicons name={isPrime ? "arrow-forward" : "lock-closed"} size={16} color={isPrime ? "#FFF" : "#000"} />
              </View>
            </View>

            {!isPrime && (
              <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>ზოდიაქოს ელემენტები</Text>
        <View style={styles.elementsContainer}>
          {ELEMENTS.map((el) => (
            <ElementItem key={el.id} el={el} colors={colors} />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>მმართველი პლანეტები</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.planetsScroll}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          {PLANETS.map((planet) => (
            <TouchableOpacity key={planet.id} style={[styles.planetCard, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
              <View style={[styles.planetIconContainer, { backgroundColor: `${planet.color}10`, borderColor: `${planet.color}30` }]}>
                <Ionicons name={planet.icon as any} size={32} color={planet.color} />
              </View>
              <Text style={[styles.planetName, { color: colors.textMain }]}>{planet.name}</Text>
              <Text style={[styles.planetRole, { color: colors.textMuted }]} numberOfLines={2}>
                {planet.role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGlow: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125 },
  scrollContent: { paddingBottom: 100, paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { fontSize: 15, marginTop: 4, fontWeight: '700' },

  compatibilityBanner: {
    marginHorizontal: 24,
    height: 200,
    borderRadius: 32,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 35,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bannerImage: {
    position: 'absolute',
    right: -30,
    top: 0,
    bottom: 0,
    width: '70%',
  },
  bannerTextContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    zIndex: 10,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  bannerActionText: {
    fontSize: 13,
    fontWeight: '800',
  },

  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, paddingHorizontal: 24, letterSpacing: 0.5 },
  elementsContainer: { paddingHorizontal: 24, marginBottom: 35 },
  elementCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1 },
  elementIconBox: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  elementInfo: { flex: 1 },
  elementName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  elementSigns: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  elementDesc: { fontSize: 12, fontWeight: '500' },
  planetsScroll: { flexGrow: 0 },
  planetCard: { width: 145, padding: 20, borderRadius: 28, marginRight: 16, alignItems: 'center', borderWidth: 1 },
  planetIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1 },
  planetName: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  planetRole: { fontSize: 12, textAlign: 'center', lineHeight: 18, opacity: 0.8 },
});