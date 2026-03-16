import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../lib/ThemeContext';

const { width, height } = Dimensions.get('window');

// გაშლის პოზიციების დასახელებები
const POSITIONS: any = {
  '2': ['წარსული', 'აწმყო', 'მომავალი'],
  '3': ['სიყვარული', 'პრობლემა', 'გამოსავალი', 'მომავალი', 'შედეგი'],
  '4': ['ამჟამინდელი გზა', 'დაბრკოლება', 'ფინანსური პოტენციალი', 'შედეგი'],
};

export default function TarotSpreadScreen() {
  const { type, title, count }: any = useLocalSearchParams();
  const { activeTheme } = useAppTheme();
  const colors = activeTheme.colors;

  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbCards, setDbCards] = useState<any[]>([]);

  const cardCount = parseInt(count);
  const positions = POSITIONS[type] || Array(cardCount).fill('პოზიცია');

  // ანიმაციები
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCards();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const fetchCards = async () => {
    const { data } = await supabase.from('tarot_cards').select('*');
    if (data) setDbCards(data);
  };

  const pickCard = (index: number) => {
    if (selectedCards.length >= cardCount || selectedCards.includes(index)) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCards([...selectedCards, index]);
  };

  const revealAll = () => {
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setIsRevealed(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* პოზიციები (სლოტები) */}
        <View style={styles.slotsContainer}>
          {positions.map((posName: string, i: number) => (
            <View key={i} style={styles.slotWrapper}>
              <View style={[styles.cardSlot, { borderColor: selectedCards[i] !== undefined ? colors.primary : colors.border, backgroundColor: colors.surface }]}>
                {selectedCards[i] !== undefined ? (
                  <View style={styles.cardFilled}>
                     {isRevealed ? (
                        <Image source={{ uri: dbCards[selectedCards[i]]?.image_url }} style={styles.cardImg} contentFit="cover" />
                     ) : (
                        <Ionicons name="sparkles" size={30} color={colors.primary} />
                     )}
                  </View>
                ) : (
                  <Text style={[styles.slotNumber, { color: colors.border }]}>{i + 1}</Text>
                )}
              </View>
<Text style={[styles.posName, { color: colors.textMuted }]}>{posName}</Text>            </View>
          ))}
        </View>

        {!isRevealed ? (
          <>
            <Text style={[styles.instruction, { color: colors.textMuted }]}>
              {selectedCards.length < cardCount 
                ? `ამოირჩიე კიდევ ${cardCount - selectedCards.length} ბარათი`
                : "ყველა ბარათი არჩეულია. მზად ხარ გასახსნელად?"}
            </Text>

           {/* დასტა (Deck) */}
<View style={styles.deck}>
  {Array(12).fill(0).map((_, i) => (
    <TouchableOpacity
      key={i}
      onPress={() => pickCard(i)}
      activeOpacity={0.7}
      style={[
        styles.deckCard,
        { 
          left: i * 15, 
          // 🔴 scale გადავიტანეთ transform-ში და დავამატეთ პირობა
          transform: [
            { rotate: `${(i - 6) * 4}deg` },
            { scale: selectedCards.includes(i) ? 0 : 1 }
          ],
          // 🔴 opacity-ზეც ასე ჯობია პირობის დაწერა
          opacity: selectedCards.includes(i) ? 0 : 1
        }
      ]}
    >
      <LinearGradient colors={[colors.primary, colors.surface]} style={styles.deckCardInner}>
        <Ionicons name="moon" size={20} color="rgba(255,255,255,0.3)" />
      </LinearGradient>
    </TouchableOpacity>
  ))}
</View>

            {selectedCards.length === cardCount && (
              <TouchableOpacity style={[styles.revealBtn, { backgroundColor: colors.primary }]} onPress={revealAll} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.revealBtnText}>ბარათების გახსნა</Text>}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Animated.View style={[styles.results, { opacity: fadeAnim }]}>
             {selectedCards.map((cardIdx, i) => (
               <View key={i} style={[styles.resultItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.resultPos, { color: colors.primary }]}>{positions[i]}</Text>
                  <Text style={[styles.resultName, { color: colors.textMain }]}>{dbCards[cardIdx]?.name}</Text>
                  <Text style={[styles.resultDesc, { color: colors.textMuted }]}>{dbCards[cardIdx]?.meaning_upright}</Text>
               </View>
             ))}
             <TouchableOpacity style={[styles.resetBtn, { borderColor: colors.primary }]} onPress={() => router.back()}>
                <Text style={[styles.resetBtnText, { color: colors.primary }]}>დასრულება</Text>
             </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  scrollContent: { paddingBottom: 100, alignItems: 'center' },
  
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginVertical: 30, paddingHorizontal: 20 },
  slotWrapper: { alignItems: 'center', width: (width - 80) / 3 },
  cardSlot: { width: '100%', height: 120, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  slotNumber: { fontSize: 24, fontWeight: '800' },
  cardFilled: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  cardImg: { width: '100%', height: '100%' },
  posName: { fontSize: 11, fontWeight: '700', marginTop: 8, textAlign: 'center' },

  instruction: { fontSize: 15, fontWeight: '600', marginBottom: 40 },
  
  deck: { height: 180, width: width * 0.8, position: 'relative', marginBottom: 50 },
  deckCard: { position: 'absolute', width: 80, height: 120, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  deckCardInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  revealBtn: { width: width * 0.8, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  revealBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  results: { width: '100%', paddingHorizontal: 24, marginTop: 20 },
  resultItem: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 15 },
  resultPos: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 5 },
  resultName: { fontSize: 20, fontWeight: '900', marginBottom: 10 },
  resultDesc: { fontSize: 14, lineHeight: 22 },
  resetBtn: { marginTop: 20, padding: 18, borderRadius: 20, borderWidth: 2, alignItems: 'center' },
  resetBtnText: { fontSize: 16, fontWeight: '800' }
});