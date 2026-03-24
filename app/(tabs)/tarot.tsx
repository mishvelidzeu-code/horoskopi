import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
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

const { width, height } = Dimensions.get('window');

const getSpreads = (colors: any) => [
  { id: '1', title: 'დღის ენერგია', cards: 1, icon: 'sunny', color: colors.primary, desc: 'მოკლე მიმოხილვა დღევანდელი დღისთვის', route: '/spread-energy' },
  { id: '2', title: 'წარსული & მომავალი', cards: 3, icon: 'time', color: colors.primary, desc: 'კლასიკური გაშლა სიტუაციის შესაფასებლად', route: '/spread-time' },
  { id: '3', title: 'სიყვარული', cards: 5, icon: 'heart', color: '#FF3366', desc: 'პარტნიორული კავშირების ანალიზი', route: '/spread-love' },
  { id: '4', title: 'კარიერა', cards: 4, icon: 'briefcase', color: colors.primary, desc: 'პროფესიული გზა და ფინანსები', route: '/spread-career' },
];

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
  const [isReversed, setIsReversed] = useState(false); 
  
  // 🔥 ახალი: მოდალის (ფანჯრის) სთეითი
  const [modalVisible, setModalVisible] = useState(false);
  
  const [flipCount, setFlipCount] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // 🔽 მხოლოდ ეს ნაწილი შეიცვალა (handleReveal)
const handleReveal = async () => {
  if (!isPrime && flipCount >= 1) {
    router.push('/subscription' as any);
    return;
  }

  if (loading || isRevealed) return;
  setLoading(true);

  try {
    const { data, error } = await supabase.from('tarot_cards').select('*');

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn('No tarot cards found');
      return;
    }

    const randomCard = data[Math.floor(Math.random() * data.length)];
    const reversed = Math.random() > 0.7;

    setDrawnCard(randomCard);
    setIsReversed(reversed);

    Animated.timing(flipAnim, {
      toValue: 180,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setIsRevealed(true);
      setFlipCount(prev => prev + 1);
      setModalVisible(true);
    });

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setModalVisible(false);
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
      <View style={[styles.topGlow, { backgroundColor: `${colors.primary}20` }]} />

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
          {/* წინა მხარე */}
          <Animated.View style={[styles.flipCard, { transform: [{ rotateY: frontInterpolate }] }, { zIndex: isRevealed ? 0 : 1 }]}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={handleReveal} 
              style={[styles.cardCover, { borderColor: !isPrime && flipCount >= 1 ? '#FFD700' : colors.border, backgroundColor: colors.surface }]} 
              disabled={loading || isRevealed}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600' }} 
                style={styles.cardCoverImg}
                cachePolicy="disk"
              />
              <LinearGradient colors={['rgba(0,0,0,0.3)', colors.surface]} style={StyleSheet.absoluteFill} />
              <View style={styles.coverContent}>
                <View style={[styles.magicCircle, { backgroundColor: !isPrime && flipCount >= 1 ? 'rgba(255,215,0,0.1)' : `${colors.primary}10`, borderColor: !isPrime && flipCount >= 1 ? '#FFD700' : colors.primary }]}>
                  {loading ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Ionicons name={!isPrime && flipCount >= 1 ? "lock-closed" : "sparkles"} size={28} color={!isPrime && flipCount >= 1 ? '#FFD700' : colors.primary} />
                  )}
                </View>
                <Text style={[styles.revealText, { color: !isPrime && flipCount >= 1 ? '#FFD700' : colors.textMain }]}>
                  {loading ? "ვურიგებ..." : (!isPrime && flipCount >= 1 ? "საჭიროა PRIME" : "ამოირჩიე ბარათი")}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* უკანა მხარე (გამოჩენილი ბარათი მთავარ ეკრანზე) */}
          <Animated.View style={[styles.flipCard, styles.flipCardBack, { transform: [{ rotateY: backInterpolate }] }]}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => setModalVisible(true)} 
              style={[styles.revealedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.revealedImageContainer}>
                 <Image 
                    source={{ uri: drawnCard?.image_url || 'https://images.unsplash.com/photo-1607581179836-81e0507fb083?q=80&w=600' }} 
                    style={[styles.fullImage, isReversed && { transform: [{ rotate: '180deg' }] }]} 
                    contentFit="cover"
                    cachePolicy="disk"
                  />
                  <LinearGradient colors={['transparent', colors.surface]} style={styles.revealedOverlay} />
              </View>
              
              {/* მთავარ ეკრანზე ვტოვებთ მხოლოდ სახელს და ღილაკს, რომ ტექსტი არ შეიჭყლიტოს */}
              <View style={styles.cardInfoSmall}>
                <Text style={[styles.cardTitleTextSmall, { color: colors.textMain }]} numberOfLines={1}>
                  {drawnCard?.name || "უცნობი"}
                </Text>
                <View style={[styles.readMoreBtn, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="eye" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.readMoreText, { color: colors.primary }]}>სრულად ნახვა</Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleReset} style={styles.resetBtnMain}>
                <Ionicons name="refresh-circle" size={42} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 🌙 სიზმრების ბანერი */}
        <TouchableOpacity 
          style={[styles.dreamsBanner, { borderColor: colors.border, backgroundColor: colors.surface }]}
          activeOpacity={0.9}
          onPress={() => router.push('/dreams' as any)}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=600' }} 
            style={styles.dreamsBgImg} 
            cachePolicy="disk"
          />
          <LinearGradient colors={['rgba(0,0,0,0.6)', colors.surface]} start={{x:0, y:0.5}} end={{x:1, y:0.5}} style={StyleSheet.absoluteFill} />
          
          <View style={styles.dreamsContent}>
            <View style={[styles.dreamsIconBox, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="moon" size={26} color={colors.primary} />
            </View>
            <View style={styles.dreamsTextWrapper}>
              <Text style={[styles.dreamsTitle, { color: '#FFF' }]}>სიზმრების ახსნა</Text>
              <Text style={[styles.dreamsDesc, { color: 'rgba(255,255,255,0.7)' }]}>ამოიცანი ქვეცნობიერის მესიჯები</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>პოპულარული გაშლები</Text>
        <View style={styles.grid}>
          {SPREADS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem} 
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

      {/* 🔮 ახალი მოდალი (დიდი ფანჯარა კარტის განმარტებისთვის) */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]} numberOfLines={1}>
                {drawnCard?.name}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              
              <View style={styles.modalImageWrapper}>
                <Image 
                  source={{ uri: drawnCard?.image_url || 'https://images.unsplash.com/photo-1607581179836-81e0507fb083?q=80&w=600' }} 
                  style={[styles.modalImage, isReversed && { transform: [{ rotate: '180deg' }] }]} 
                  contentFit="contain"
                  cachePolicy="disk"
                />
              </View>

              <View style={styles.modalInfoBox}>
                <View style={[styles.arcanaBadge, { backgroundColor: `${colors.primary}15`, alignSelf: 'center', marginBottom: 20 }]}>
                  <Text style={[styles.arcanaText, { color: colors.primary, fontSize: 12 }]}>
                    {drawnCard?.arcana === 'Major' ? 'დიდი არკანი' : 'მცირე არკანი'} 
                    {isReversed ? ' • ამოტრიალებული' : ' • პირდაპირი'}
                  </Text>
                </View>

                <Text style={[styles.modalDescTitle, { color: colors.primary }]}>
                  <Ionicons name="sparkles" size={18} /> მნიშვნელობა:
                </Text>
                <Text style={[styles.modalDescText, { color: colors.textMain }]}>
                  {isReversed ? drawnCard?.meaning_reversed : drawnCard?.meaning_upright}
                </Text>
                
                {drawnCard?.description && (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.modalDescTitle, { color: colors.textMuted, fontSize: 16 }]}>
                      ვიზუალის აღწერა:
                    </Text>
                    <Text style={[styles.modalDescText, { color: colors.textMuted, fontSize: 15 }]}>
                      {drawnCard?.description}
                    </Text>
                  </>
                )}
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGlow: { position: 'absolute', top: -100, alignSelf: 'center', width: width, height: 300, borderRadius: 150, opacity: 0.6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 15 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 2, fontWeight: '600', opacity: 0.8 },
  historyBtn: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  scrollContent: { paddingBottom: 120 },
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 24, marginBottom: 16, marginTop: 10 },
  
  cardContainer: { height: 320, marginHorizontal: 24, marginBottom: 25 },
  flipCard: { width: '100%', height: '100%', backfaceVisibility: 'hidden', position: 'absolute' },
  flipCardBack: { backfaceVisibility: 'hidden' },
  cardCover: { flex: 1, borderRadius: 32, overflow: 'hidden', borderWidth: 2, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  cardCoverImg: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  coverContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  magicCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 20 },
  revealText: { fontSize: 15, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  
  revealedCard: { flex: 1, borderRadius: 32, overflow: 'hidden', borderWidth: 1.5, elevation: 5 },
  revealedImageContainer: { height: '70%', width: '100%' },
  fullImage: { width: '100%', height: '100%' },
  revealedOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  
  cardInfoSmall: { padding: 15, alignItems: 'center', justifyContent: 'center', flex: 1 },
  cardTitleTextSmall: { fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  readMoreText: { fontSize: 13, fontWeight: '800' },
  resetBtnMain: { position: 'absolute', top: 15, right: 15, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },

  dreamsBanner: { height: 110, marginHorizontal: 24, marginBottom: 30, borderRadius: 28, overflow: 'hidden', borderWidth: 1.5, justifyContent: 'center', elevation: 4 },
  dreamsBgImg: { ...StyleSheet.absoluteFillObject },
  dreamsContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, zIndex: 2 },
  dreamsIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  dreamsTextWrapper: { flex: 1 },
  dreamsTitle: { fontSize: 19, fontWeight: '900', marginBottom: 4 },
  dreamsDesc: { fontSize: 12, fontWeight: '600' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18 },
  gridItem: { width: '50%', padding: 6 },
  gridGradient: { padding: 16, borderRadius: 24, borderWidth: 1, minHeight: 150, elevation: 2 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  spreadDesc: { fontSize: 11, marginBottom: 12, lineHeight: 15, opacity: 0.7 },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  gridCards: { fontSize: 11, fontWeight: '800' },

  extraFeaturesContainer: { paddingHorizontal: 24, gap: 14, marginBottom: 40 },
  featureCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1 },
  featureIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  featureTextContent: { flex: 1, marginRight: 10 },
  featureTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  featureDesc: { fontSize: 12, lineHeight: 17, opacity: 0.7 },

  // 🔥 მოდალის სტაილები
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: { height: height * 0.85, borderTopLeftRadius: 36, borderTopRightRadius: 36, borderWidth: 1, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 15 },
  modalTitle: { fontSize: 24, fontWeight: '900', flex: 1, marginRight: 15 },
  closeBtn: { padding: 4 },
  modalScroll: { paddingBottom: 50 },
  modalImageWrapper: { width: '100%', height: 380, paddingHorizontal: 20, marginBottom: 20 },
  modalImage: { width: '100%', height: '100%', borderRadius: 16 },
  modalInfoBox: { paddingHorizontal: 24 },
  arcanaBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  arcanaText: { fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalDescTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  modalDescText: { fontSize: 16, lineHeight: 26, opacity: 0.95 },
  divider: { height: 1, width: '100%', marginVertical: 25, opacity: 0.5 },
});