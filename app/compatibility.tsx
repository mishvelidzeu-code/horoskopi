import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
const YEARS = Array.from({ length: 77 }, (_, i) => 2026 - i);
const ZODIAC_SIGNS = [
  { name: 'ვერძი', icon: '♈' }, { name: 'კურო', icon: '♉' }, { name: 'ტყუპები', icon: '♊' },
  { name: 'კირჩხიბი', icon: '♋' }, { name: 'ლომი', icon: '♌' }, { name: 'ქალწული', icon: '♍' },
  { name: 'სასწორი', icon: '♎' }, { name: 'მორიელი', icon: '♏' }, { name: 'მშვილდოსანი', icon: '♐' },
  { name: 'თხის რქა', icon: '♑' }, { name: 'მერწყული', icon: '♒' }, { name: 'თევზები', icon: '♓' },
];

export default function CompatibilityScreen() {
  const [mySign, setMySign] = useState<any>(null);
  const [userGender, setUserGender] = useState<string>('');
  const [partnerSign, setPartnerSign] = useState<any>(null);
  const [partnerDate, setPartnerDate] = useState({ day: 1, month: 0, year: 2000 });
  const [isCalculated, setIsCalculated] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [resultData, setResultData] = useState<any>(null);

  const heartScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInitialData();
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // პროფილის წამოღება
        const { data: profile } = await supabase.from('profiles').select('zodiac_sign, gender').eq('id', user.id).single();
        if (profile) {
          setMySign(ZODIAC_SIGNS.find(s => s.name === profile.zodiac_sign));
          setUserGender(profile.gender);
        }
        // ისტორიის წამოღება
        fetchHistory(user.id);
      }
    } catch (err) { console.log(err); }
    finally { Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }
  };

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase.from('compatibility_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    setHistory(data || []);
  };

  const getSignFromDate = (day: number, month: number) => {
    const dates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    const signs = ['თხის რქა', 'მერწყული', 'თევზები', 'ვერძი', 'კურო', 'ტყუპები', 'კირჩხიბი', 'ლომი', 'ქალწული', 'სასწორი', 'მორიელი', 'მშვილდოსანი'];
    const index = day > dates[month] ? (month + 1) % 12 : month;
    return ZODIAC_SIGNS.find(s => s.name === signs[index]);
  };

  const handleDateConfirm = () => {
    setPartnerSign(getSignFromDate(partnerDate.day, partnerDate.month));
    setShowDatePicker(false);
  };

  const calculateMatch = async () => {
    if (!mySign || !partnerSign) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('zodiac_compatibility').select('*')
        .or(`and(sign1.eq.${mySign.name},sign2.eq.${partnerSign.name}),and(sign1.eq.${partnerSign.name},sign2.eq.${mySign.name})`).single();
      
      const score = data?.score || 75;
      setResultData(data || { score, love_meaning: "თქვენი ვარსკვლავები საინტერესო კავშირს ქმნიან." });
      setIsCalculated(true);

      // ისტორიაში შენახვა
      if (user) {
        await supabase.from('compatibility_history').insert([
          { user_id: user.id, my_sign: mySign.name, partner_sign: partnerSign.name, score }
        ]);
        fetchHistory(user.id);
      }
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#070711', '#141028', '#0A0A1A']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={styles.headerTitle}>თავსებადობა</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!isCalculated ? (
          <Animated.View style={[styles.mainSection, { opacity: fadeAnim }]}>
            <View style={styles.heroImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000' }} style={styles.heroImage} />
              <LinearGradient colors={['transparent', '#070711']} style={StyleSheet.absoluteFill} />
            </View>
            
            <View style={styles.selectionCards}>
              {/* უჩას ბარათი */}
              <View style={[styles.signCard, styles.myCard]}>
                <View style={[styles.signIconBox, styles.signIconBoxActive]}>
                  <Text style={styles.selectedIcon}>{mySign?.icon || '?'}</Text>
                  <View style={styles.genderBadge}><Ionicons name={userGender === 'მამრობითი' ? "man" : "woman"} size={12} color="#FFF" /></View>
                </View>
                <Text style={styles.signCardLabel}>უჩა</Text>
                <Text style={styles.signCardValue}>{mySign?.name || '...'}</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: heartScale }] }}><Ionicons name="heart" size={32} color="#FF3366" /></Animated.View>

              {/* პარტნიორის ბარათი */}
              <TouchableOpacity style={styles.signCard} onPress={() => setShowDatePicker(true)}>
                <View style={[styles.signIconBox, partnerSign && styles.signIconBoxActivePartner]}>
                  {partnerSign ? <Text style={styles.selectedIcon}>{partnerSign.icon}</Text> : <Ionicons name="calendar-outline" size={30} color="#B829EA" />}
                  <View style={[styles.genderBadge, { backgroundColor: '#00E5FF' }]}><Ionicons name={userGender === 'მამრობითი' ? "woman" : "man"} size={12} color="#FFF" /></View>
                </View>
                <Text style={styles.signCardLabel}>პარტნიორი</Text>
                <Text style={[styles.signCardValue, !partnerSign && { color: '#8A8A9D' }]}>{partnerSign ? partnerSign.name : 'აირჩიე'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity disabled={!partnerSign || loading} onPress={calculateMatch} style={styles.calcBtnWrapper}>
              <LinearGradient colors={!partnerSign ? ['#252538', '#252538'] : ['#B829EA', '#6C63FF']} style={styles.calculateBtn}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.calculateBtnText}>ანალიზის მიღება</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* --- ისტორიის სექცია --- */}
            {history.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>ბოლო შემოწმებები</Text>
                {history.map((item, idx) => (
                  <View key={idx} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historySigns}>{ZODIAC_SIGNS.find(s=>s.name===item.my_sign)?.icon} + {ZODIAC_SIGNS.find(s=>s.name===item.partner_sign)?.icon}</Text>
                      <Text style={styles.historyNames}>{item.my_sign} & {item.partner_sign}</Text>
                    </View>
                    <View style={styles.historyScoreBox}><Text style={styles.historyScoreText}>{item.score}%</Text></View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.resultSection}>
             <View style={styles.resultMatchHeader}>
              <Text style={styles.resultNames}>{mySign.name} + {partnerSign.name}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{resultData?.score}%</Text>
                <Text style={styles.scoreLabel}>თავსებადობა</Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              {[{ label: 'სიყვარული', val: resultData?.score || 70, color: '#FF3366' }, { label: 'კომუნიკაცია', val: 85, color: '#00E5FF' }, { label: 'ნდობა', val: 80, color: '#00D09E' }].map((stat, i) => (
                <View key={i} style={styles.statRow}>
                  <View style={styles.statLabelRow}><Text style={styles.statLabel}>{stat.label}</Text><Text style={styles.statValue}>{stat.val}%</Text></View>
                  <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${stat.val}%`, backgroundColor: stat.color }]} /></View>
                </View>
              ))}
            </View>
            <View style={styles.descriptionBox}><Text style={styles.descriptionText}>{resultData?.love_meaning}</Text></View>
            <TouchableOpacity style={styles.resetBtn} onPress={() => setIsCalculated(false)}>
              <Ionicons name="refresh" size={20} color="#A0A0B0" /><Text style={styles.resetBtnText}>თავიდან არჩევა</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* --- DATE PICKER MODAL --- */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>პარტნიორის დაბადების თარიღი</Text>
            <View style={styles.datePickerRow}>
              <View style={styles.pickerCol}><Text style={styles.pickerLabel}>დღე</Text><ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>{Array.from({length: 31}, (_, i) => i + 1).map(d => (
                <TouchableOpacity key={d} onPress={() => setPartnerDate({...partnerDate, day: d})} style={[styles.pItem, partnerDate.day === d && styles.pItemActive]}><Text style={styles.pText}>{d}</Text></TouchableOpacity>
              ))}</ScrollView></View>
              <View style={styles.pickerCol}><Text style={styles.pickerLabel}>თვე</Text><ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>{MONTHS.map((m, i) => (
                <TouchableOpacity key={m} onPress={() => setPartnerDate({...partnerDate, month: i})} style={[styles.pItem, partnerDate.month === i && styles.pItemActive]}><Text style={styles.pText}>{m.substring(0,3)}</Text></TouchableOpacity>
              ))}</ScrollView></View>
              <View style={styles.pickerCol}><Text style={styles.pickerLabel}>წელი</Text><ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>{YEARS.map(y => (
                <TouchableOpacity key={y} onPress={() => setPartnerDate({...partnerDate, year: y})} style={[styles.pItem, partnerDate.year === y && styles.pItemActive]}><Text style={styles.pText}>{y}</Text></TouchableOpacity>
              ))}</ScrollView></View>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleDateConfirm}><Text style={styles.confirmBtnText}>არჩევა</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070711' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15 },
  backButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  scrollContent: { paddingBottom: 40 },
  mainSection: { paddingHorizontal: 24, alignItems: 'center' },
  heroImageWrapper: { width: '100%', height: 180, borderRadius: 32, marginBottom: 20, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', opacity: 0.5 },
  heroText: { color: '#D1D1E0', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  selectionCards: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  signCard: { flex: 1, backgroundColor: 'rgba(20, 16, 40, 0.6)', borderRadius: 28, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  myCard: { backgroundColor: 'rgba(184, 41, 234, 0.05)' },
  signIconBox: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  signIconBoxActive: { backgroundColor: 'rgba(184, 41, 234, 0.15)', borderColor: '#B829EA', borderWidth: 1 },
  signIconBoxActivePartner: { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderColor: '#00E5FF', borderWidth: 1 },
  genderBadge: { position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#B829EA', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#070711' },
  selectedIcon: { fontSize: 32 },
  signCardLabel: { color: '#A0A0B0', fontSize: 12, marginBottom: 4 },
  signCardValue: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  calcBtnWrapper: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 40 },
  calculateBtn: { paddingVertical: 18, alignItems: 'center' },
  calculateBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  
  // History Styles
  historySection: { width: '100%' },
  historyTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 15 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 24, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyInfo: { flex: 1 },
  historySigns: { color: '#FFF', fontSize: 18, marginBottom: 4 },
  historyNames: { color: '#A0A0B0', fontSize: 13 },
  historyScoreBox: { backgroundColor: 'rgba(184, 41, 234, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  historyScoreText: { color: '#B829EA', fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#141028', borderRadius: 32, padding: 20, borderWidth: 1, borderColor: 'rgba(184, 41, 234, 0.3)' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  datePickerRow: { flexDirection: 'row', height: 220, gap: 8 },
  pickerCol: { flex: 1 },
  pickerLabel: { color: '#6C63FF', fontSize: 11, textAlign: 'center', marginBottom: 10, fontWeight: '700' },
  pickerScroll: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 },
  pItem: { padding: 10, alignItems: 'center' },
  pItemActive: { backgroundColor: 'rgba(184, 41, 234, 0.3)', borderRadius: 8 },
  pText: { color: '#FFF', fontSize: 14 },
  confirmBtn: { backgroundColor: '#B829EA', padding: 16, borderRadius: 16, marginTop: 20, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  
  resultSection: { paddingHorizontal: 24, paddingTop: 10 },
  resultMatchHeader: { alignItems: 'center', marginBottom: 35 },
  resultNames: { color: '#B829EA', fontSize: 16, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: 20 },
  scoreContainer: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: '#B829EA', backgroundColor: 'rgba(184, 41, 234, 0.05)', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  scoreText: { color: '#FFF', fontSize: 48, fontWeight: '900' },
  scoreLabel: { color: '#00E5FF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  statsContainer: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 25 },
  statRow: { marginBottom: 18 },
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { color: '#D1D1E0', fontSize: 14, fontWeight: '600' },
  statValue: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  descriptionBox: { backgroundColor: 'rgba(184, 41, 234, 0.03)', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(184, 41, 234, 0.1)', marginBottom: 30 },
  descriptionText: { color: '#D1D1E0', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  resetBtnText: { color: '#A0A0B0', fontSize: 15, fontWeight: '700' },
});