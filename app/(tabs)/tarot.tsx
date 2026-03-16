import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
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

// 🔴 დამატებულია route-ები, რომ გაშლების გვერდები ავამუშავოთ
const getSpreads = (colors: any) => [
  { id: '1', title: 'დღის ენერგია', cards: 1, icon: 'sunny', color: colors.primary, desc: 'მოკლე მიმოხილვა დღევანდელი დღისთვის', route: '/spread-energy' },
  { id: '2', title: 'წარსული & მომავალი', cards: 3, icon: 'time', color: colors.primary, desc: 'კლასიკური გაშლა სიტუაციის შესაფასებლად', route: '/spread-time' },
  { id: '3', title: 'სიყვარული', cards: 5, icon: 'heart', color: colors.status?.error || '#FF3366', desc: 'პარტნიორული კავშირების ანალიზი', route: '/spread-love' },
  { id: '4', title: 'კარიერა', cards: 4, icon: 'briefcase', color: colors.primary, desc: 'პროფესიული გზა და ფინანსები', route: '/spread-career' },
];

// 🔴 სიზმრები ამოღებულია აქედან, რადგან ცალკე დიდ ბანერად დავსვით ზევით
const getExtraFeatures = (colors: any) => [
  { id: 'four-kings', title: '4 კაროლი', icon: 'people', color: '#B829EA', desc: 'რას გრძნობს 4 სხვადასხვა ადამიანი თქვენზე', route: '/four-kings' },
  { id: 'numerology', title: 'ნუმეროლოგია', icon: 'calculator', color: '#FF9F0A', desc: 'რიცხვების მაგია და ბედის კოდი', route: '/numerology' },
  { id: 'daisy', title: 'გვირილა', icon: 'flower-outline', color: '#32ADE6', desc: 'უყვარვარ, არ ვუყვარვარ... გაიგე სიმართლე', route: '/daisy' },
  { id: 'universal', title: 'უნივერსალური', icon: 'planet', color: '#FF375F', desc: 'სწრაფი პასუხები თქვენს ნებისმიერ კითხვაზე', route: '/universal' },
  { id: 'haircut', title: 'თმის შეჭრის კალენდარი', icon: 'cut', color: '#FF3366', desc: 'მთვარის ფაზები და საუკეთესო დღეები', route: '/haircut' },
];

export default function TarotScreen() {
  const { colors, isPrime } = useAppTheme(); 
  const SPREADS = getSpreads(colors);
  const EXTRA_FEATURES = getExtraFeatures(colors);

  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drawnCard, setDrawnCard] = useState<any>(null);
  
  const [flipCount, setFlipCount] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleReveal = async () => {
    if (!isPrime && flipCount >= 1) {
      router.push('/subscription');
      return;
    }

    if (loading || isRevealed) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.from('tarot_cards').select('*');
      if (data && data.length > 0) {
        const randomCard = data[Math.floor(Math.random() * data.length)];
        setDrawnCard(randomCard);
        
        Animated.timing(flipAnim, {
          toValue: 180,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setIsRevealed(true);
          setLoading(false);
          setFlipCount(prev => prev + 1);
        });
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleReset = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setIsRevealed(false);
      setDrawnCard(null);
    });
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
      <View style={[styles.topGlow, { backgroundColor: `${colors.primary}15` }]} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>ტარო</Text>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>ამოიცანი სამყაროს ნიშნები</Text>
        </View>
        <TouchableOpacity style={[styles.historyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="journal-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>დღის არკანი</Text>
        
        <View style={styles.cardContainer}>
          <Animated.View style={[styles.flipCard, { transform: [{ rotateY: frontInterpolate }] }, { zIndex: isRevealed ? 0 : 1 }]}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={handleReveal} 
              style={[styles.cardCover, { borderColor: !isPrime && flipCount >= 1 ? '#FFD700' : colors.border, backgroundColor: colors.surface }]} 
              disabled={loading || isRevealed}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop' }} 
                style={styles.cardCoverImg}
              />
              <LinearGradient colors={[`${colors.primary}20`, colors.surface]} style={StyleSheet.absoluteFill} />
              <View style={styles.coverContent}>
                <View style={[styles.magicCircle, { backgroundColor: !isPrime && flipCount >= 1 ? 'rgba(255,215,0,0.1)' : `${colors.primary}10`, borderColor: !isPrime && flipCount >= 1 ? '#FFD700' : colors.primary }]}>
                  {loading ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Ionicons name={!isPrime && flipCount >= 1 ? "lock-closed" : "sparkles"} size={24} color={!isPrime && flipCount >= 1 ? '#FFD700' : colors.primary} />
                  )}
                </View>
                <Text style={[styles.revealText, { color: !isPrime && flipCount >= 1 ? '#FFD700' : colors.primary }]}>
                  {loading ? "ვურიგებ..." : (!isPrime && flipCount >= 1 ? "საჭიროა PRIME" : "ამოირჩიე ბარათი")}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.flipCard, styles.flipCardBack, { transform: [{ rotateY: backInterpolate }] }]}>
            <View style={[styles.revealedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Image 
                source={{ uri: drawnCard?.image_url || 'https://images.unsplash.com/photo-1607581179836-81e0507fb083?q=80&w=600&auto=format&fit=crop' }} 
                style={styles.fullImage}
                contentFit="cover"
              />
              <LinearGradient colors={['transparent', colors.surface]} style={StyleSheet.absoluteFill} />
              
              <View style={styles.cardInfo}>
                <View style={styles.row}>
                  <View style={[styles.arcanaBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.arcanaText, { color: colors.primary }]}>{drawnCard?.arcana === 'Major' ? 'დიდი არკანი' : 'მცირე არკანი'}</Text>
                  </View>
                  <TouchableOpacity onPress={handleReset} style={styles.refreshIcon}>
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cardTitleText, { color: colors.textMain }]}>{drawnCard?.name || "უცნობი"}</Text>
                <Text style={[styles.keywords, { color: colors.primary }]}>{drawnCard?.suit ? `${drawnCard.suit} • ` : ''}ინტუიცია • ენერგია</Text>
                <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={3}>{drawnCard?.meaning_upright}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* 🔴 სიზმრების ახალი, გამორჩეული ბანერი დღის არკანის ქვეშ */}
        <TouchableOpacity 
          style={[styles.dreamsBanner, { borderColor: colors.border, backgroundColor: colors.surface }]}
          activeOpacity={0.9}
          onPress={() => router.push('/dreams')}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.dreamsBgImg} 
          />
          <LinearGradient colors={[`${colors.primary}40`, colors.surface]} style={StyleSheet.absoluteFill} />
          
          <View style={styles.dreamsContent}>
            <View style={[styles.dreamsIconBox, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="moon" size={26} color={colors.primary} />
            </View>
            <View style={styles.dreamsTextWrapper}>
              <Text style={[styles.dreamsTitle, { color: colors.textMain }]}>სიზმრების ახსნა</Text>
              <Text style={[styles.dreamsDesc, { color: colors.textMuted }]}>ამოიცანი რას გეუბნება ქვეცნობიერი</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </View>
        </TouchableOpacity>


        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>პოპულარული გაშლები</Text>
        <View style={styles.grid}>
          {SPREADS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem} 
              // 🔴 აქ უკვე პირდაპირ შესაბამის ფაილში გადავა (მაგ: /spread-love)
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.gridGradient, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={[styles.gridTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[styles.spreadDesc, { color: colors.textMuted }]} numberOfLines={2}>{item.desc}</Text>
                <View style={styles.gridFooter}>
                  <Text style={[styles.gridCards, { color: colors.primary }]}>{item.cards} ბარათი</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMain, marginTop: 25 }]}>მისტიკური პრაქტიკები</Text>
        <View style={styles.extraFeaturesContainer}>
          {EXTRA_FEATURES.map((feature) => (
            <TouchableOpacity 
              key={feature.id} 
              style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              activeOpacity={0.8}
              onPress={() => router.push(feature.route as any)}
            >
              <View style={[styles.featureIconBox, { backgroundColor: `${feature.color}15` }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={[styles.featureTitle, { color: colors.textMain }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted }]} numberOfLines={2}>{feature.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGlow: { position: 'absolute', top: -50, alignSelf: 'center', width: width * 0.9, height: 250, borderRadius: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 15 },
  headerTitle: { fontSize: 32, fontWeight: '900' },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  historyBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  scrollContent: { paddingBottom: 120 },
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 24, marginBottom: 16, marginTop: 5 },
  
  cardContainer: { height: 280, marginHorizontal: 24, marginBottom: 15 },
  flipCard: { width: '100%', height: '100%', backfaceVisibility: 'hidden', position: 'absolute' },
  flipCardBack: { backfaceVisibility: 'hidden' },
  cardCover: { flex: 1, borderRadius: 28, overflow: 'hidden', borderWidth: 1.5 },
  cardCoverImg: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  magicCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, marginBottom: 15 },
  revealText: { fontSize: 16, fontWeight: '800', letterSpacing: 1.2 },
  revealedCard: { flex: 1, borderRadius: 28, overflow: 'hidden', borderWidth: 1 },
  fullImage: { width: '100%', height: '55%' },
  imageOverlay: { position: 'absolute', top: '35%', left: 0, right: 0, height: '30%' },
  cardInfo: { padding: 18, flex: 1, justifyContent: 'flex-end' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  arcanaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  arcanaText: { fontSize: 10, fontWeight: '800' },
  cardTitleText: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  keywords: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  description: { fontSize: 12, lineHeight: 18, opacity: 0.8 },
  refreshIcon: { padding: 5 },

  // 🔴 სიზმრების ახალი ბანერის სტილები
  dreamsBanner: { height: 100, marginHorizontal: 24, marginBottom: 25, borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, justifyContent: 'center' },
  dreamsBgImg: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
  dreamsContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, width: '100%' },
  dreamsIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  dreamsTextWrapper: { flex: 1 },
  dreamsTitle: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  dreamsDesc: { fontSize: 12, fontWeight: '600' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  gridItem: { width: '50%', padding: 6 },
  gridGradient: { padding: 14, borderRadius: 20, borderWidth: 1, minHeight: 140 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  gridTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  spreadDesc: { fontSize: 10, marginBottom: 10, lineHeight: 14 },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  gridCards: { fontSize: 11, fontWeight: '700' },

  extraFeaturesContainer: { paddingHorizontal: 24, gap: 12 },
  featureCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1 },
  featureIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featureTextContent: { flex: 1, marginRight: 10 },
  featureTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  featureDesc: { fontSize: 12, lineHeight: 16 },
});