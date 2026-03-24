import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
  View
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../lib/ThemeContext';

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
  const { colors, isPrime } = useAppTheme();
  const [mySign, setMySign] = useState<any>(null);
  const [userGender, setUserGender] = useState<string>('');
  const [partnerSign, setPartnerSign] = useState<any>(null);
  const [partnerDate, setPartnerDate] = useState({ day: 1, month: 0, year: 2000 });
  const [isCalculated, setIsCalculated] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'love' | 'work' | 'friendship' | 'sex'>('love');

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
        const { data: profile } = await supabase.from('profiles').select('zodiac_sign, gender').eq('id', user.id).single();
        if (profile) {
          setMySign(ZODIAC_SIGNS.find(s => s.name === profile.zodiac_sign));
          setUserGender(profile.gender);
        }
        fetchHistory(user.id);
      }
    } catch (err) { console.log(err); }
    finally { Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }
  };

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase.from('compatibility_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
    setHistory(data || []);
  };

  const getSignFromDate = (day: number, month: number) => {
    const dates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    const signs = ['თხის რქა', 'მერწყული', 'თევზები', 'ვერძი', 'კურო', 'ტყუპები', 'კირჩხიბი', 'ლომი', 'ქალწული', 'სასწორი', 'მორიელი', 'მშვილდოსანი'];
    const index = day > dates[month] ? (month + 1) % 12 : month;
    return ZODIAC_SIGNS.find(s => s.name === signs[index]);
  };

  const calculateMatch = async () => {
    if (!mySign || !partnerSign) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('zodiac_compatibility').select('*')
        .or(`and(sign1.eq.${mySign.name},sign2.eq.${partnerSign.name}),and(sign1.eq.${partnerSign.name},sign2.eq.${mySign.name})`).single();
      
      setResultData(data);
      setIsCalculated(true);

      if (user) {
        await supabase.from('compatibility_history').insert([{ user_id: user.id, my_sign: mySign.name, partner_sign: partnerSign.name, score: data?.score || 0 }]);
        fetchHistory(user.id);
      }
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>თავსებადობა</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!isCalculated ? (
          <Animated.View style={[styles.mainSection, { opacity: fadeAnim }]}>
            <View style={styles.heroImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000' }} style={styles.heroImage} />
              <LinearGradient colors={['transparent', colors.background]} style={StyleSheet.absoluteFill} />
            </View>
            
            <View style={styles.selectionCards}>
              <View style={[styles.signCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.signIconBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary, borderWidth: 1 }]}>
                  <Text style={styles.selectedIcon}>{mySign?.icon || '?'}</Text>
                </View>
                <Text style={[styles.signCardLabel, { color: colors.textMuted }]}>თქვენ</Text>
                <Text style={[styles.signCardValue, { color: colors.textMain }]}>{mySign?.name || '...'}</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: heartScale }] }}><Ionicons name="heart" size={32} color={colors.primary} /></Animated.View>

              <TouchableOpacity style={[styles.signCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
                <View style={[styles.signIconBox, { backgroundColor: partnerSign ? '#00E5FF20' : 'rgba(255,255,255,0.03)', borderColor: partnerSign ? '#00E5FF' : colors.border, borderWidth: 1 }]}>
                  {partnerSign ? <Text style={styles.selectedIcon}>{partnerSign.icon}</Text> : <Ionicons name="calendar-outline" size={30} color={colors.primary} />}
                </View>
                <Text style={[styles.signCardLabel, { color: colors.textMuted }]}>პარტნიორი</Text>
                <Text style={[styles.signCardValue, { color: partnerSign ? colors.textMain : colors.textMuted }]}>{partnerSign ? partnerSign.name : 'აირჩიე'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity disabled={!partnerSign || loading} onPress={calculateMatch} style={styles.calcBtnWrapper}>
              <LinearGradient colors={!partnerSign ? ['#252538', '#252538'] : [colors.primary, '#6C63FF']} style={styles.calculateBtn}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.calculateBtnText}>ანალიზის მიღება</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {history.length > 0 && (
              <View style={styles.historySection}>
                <Text style={[styles.historyTitle, { color: colors.textMain }]}>ბოლო შემოწმებები</Text>
                {history.map((item, idx) => (
                  <View key={idx} style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={styles.historySigns}>{ZODIAC_SIGNS.find(s=>s.name===item.my_sign)?.icon} + {ZODIAC_SIGNS.find(s=>s.name===item.partner_sign)?.icon}</Text>
                    <Text style={[styles.historyNames, { color: colors.textMuted }]}>{item.my_sign} & {item.partner_sign}</Text>
                    <View style={styles.historyScoreBox}><Text style={[styles.historyScoreText, { color: colors.primary }]}>{item.score}%</Text></View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.resultSection}>
            <View style={styles.resultMatchHeader}>
              <Text style={[styles.resultNames, { color: colors.primary }]}>{mySign.name} + {partnerSign.name}</Text>
              <View style={[styles.scoreContainer, { borderColor: colors.primary }]}>
                <Text style={[styles.scoreText, { color: colors.textMain }]}>{resultData?.score}%</Text>
                <Text style={styles.scoreLabel}>თავსებადობა</Text>
              </View>
            </View>

            <View style={styles.tabContainer}>
              {(['love', 'friendship', 'work', 'sex'] as const).map((tab) => (
                <TouchableOpacity 
                  key={tab} 
                  onPress={() => setActiveTab(tab)} 
                  style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.tabText, activeTab === tab ? { color: '#FFF' } : { color: colors.textMuted }]}>
                    {tab === 'love' ? 'სიყვარული' : 
                     tab === 'friendship' ? 'მეგობრობა' : 
                     tab === 'work' ? 'საქმე' : 'ინტიმი 🔞'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.descriptionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* 🔥 ახლა ყველა ტაბი დაბლოკილია Free იუზერისთვის */}
              {!isPrime ? (
                <View style={styles.lockedContainer}>
                  <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                  <Ionicons name="lock-closed" size={32} color="#FFD700" />
                  <Text style={styles.lockedTitle}>PRIME სექცია</Text>
                  <Text style={styles.lockedSubtitle}>
                    დეტალური {activeTab === 'love' ? 'სასიყვარულო' : 
                             activeTab === 'friendship' ? 'მეგობრული' : 
                             activeTab === 'work' ? 'საქმიანი' : 'ინტიმური'} თავსებადობის სანახავად გააქტიურე Prime.
                  </Text>
                  <TouchableOpacity style={styles.unlockBtn} onPress={() => router.push('/subscription')}>
                    <Text style={styles.unlockBtnText}>Unlock Prime</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={[styles.descriptionText, { color: colors.textMain }]}>
                  {activeTab === 'love' ? resultData?.love_meaning : 
                   activeTab === 'friendship' ? resultData?.friendship_meaning : 
                   activeTab === 'work' ? resultData?.work_meaning : 
                   resultData?.sex_meaning}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={() => setIsCalculated(false)}>
              <Ionicons name="refresh" size={20} color={colors.textMuted} /><Text style={[styles.resetBtnText, { color: colors.textMuted }]}>თავიდან არჩევა</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* DATE PICKER MODAL */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.modalTitle, { color: colors.textMain }]}>პარტნიორის დაბადების თარიღი</Text>
            <View style={styles.datePickerRow}>
              <View style={styles.pickerCol}><Text style={styles.pickerLabel}>დღე</Text><ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>{Array.from({length: 31}, (_, i) => i + 1).map(d => (
                <TouchableOpacity key={d} onPress={() => setPartnerDate({...partnerDate, day: d})} style={[styles.pItem, partnerDate.day === d && { backgroundColor: `${colors.primary}40` }]}><Text style={styles.pText}>{d}</Text></TouchableOpacity>
              ))}</ScrollView></View>
              <View style={styles.pickerCol}><Text style={styles.pickerLabel}>თვე</Text><ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>{MONTHS.map((m, i) => (
                <TouchableOpacity key={m} onPress={() => setPartnerDate({...partnerDate, month: i})} style={[styles.pItem, partnerDate.month === i && { backgroundColor: `${colors.primary}40` }]}><Text style={styles.pText}>{m.substring(0,3)}</Text></TouchableOpacity>
              ))}</ScrollView></View>
              <View style={styles.pickerCol}><Text style={styles.pickerLabel}>წელი</Text><ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>{YEARS.map(y => (
                <TouchableOpacity key={y} onPress={() => setPartnerDate({...partnerDate, year: y})} style={[styles.pItem, partnerDate.year === y && { backgroundColor: `${colors.primary}40` }]}><Text style={styles.pText}>{y}</Text></TouchableOpacity>
              ))}</ScrollView></View>
            </View>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={() => {setPartnerSign(getSignFromDate(partnerDate.day, partnerDate.month)); setShowDatePicker(false);}}><Text style={styles.confirmBtnText}>არჩევა</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15 },
  backButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scrollContent: { paddingBottom: 40 },
  mainSection: { paddingHorizontal: 24, alignItems: 'center' },
  heroImageWrapper: { width: '100%', height: 180, borderRadius: 32, marginBottom: 20, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', opacity: 0.5 },
  selectionCards: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 30, gap: 15 },
  signCard: { flex: 1, borderRadius: 28, padding: 20, alignItems: 'center', borderWidth: 1 },
  signIconBox: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  selectedIcon: { fontSize: 32 },
  signCardLabel: { fontSize: 12, marginBottom: 4 },
  signCardValue: { fontSize: 16, fontWeight: '800' },
  calcBtnWrapper: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 40 },
  calculateBtn: { paddingVertical: 18, alignItems: 'center' },
  calculateBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  historySection: { width: '100%' },
  historyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 24, marginBottom: 10, borderWidth: 1 },
  historySigns: { color: '#FFF', fontSize: 18 },
  historyNames: { fontSize: 13, flex: 1, marginLeft: 10 },
  historyScoreBox: { backgroundColor: 'rgba(184, 41, 234, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  historyScoreText: { fontWeight: '800' },
  resultSection: { paddingHorizontal: 24, paddingTop: 10 },
  resultMatchHeader: { alignItems: 'center', marginBottom: 25 },
  resultNames: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 15 },
  scoreContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, backgroundColor: 'rgba(184, 41, 234, 0.05)', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 44, fontWeight: '900' },
  scoreLabel: { color: '#00E5FF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tabContainer: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', paddingHorizontal: 4 },
  tabText: { fontSize: 10, fontWeight: '700' },
  descriptionBox: { padding: 24, borderRadius: 28, borderWidth: 1, minHeight: 200, justifyContent: 'center', overflow: 'hidden' },
  descriptionText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
  lockedContainer: { alignItems: 'center', gap: 10 },
  lockedTitle: { color: '#FFD700', fontSize: 18, fontWeight: '800' },
  lockedSubtitle: { color: '#A0A0B0', fontSize: 12, textAlign: 'center', paddingHorizontal: 10 },
  unlockBtn: { marginTop: 15, backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  unlockBtnText: { color: '#000', fontWeight: '800' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  resetBtnText: { fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 32, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  datePickerRow: { flexDirection: 'row', height: 220, gap: 8 },
  pickerCol: { flex: 1 },
  pickerLabel: { color: '#6C63FF', fontSize: 11, textAlign: 'center', marginBottom: 10, fontWeight: '700' },
  pickerScroll: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 },
  pItem: { padding: 10, alignItems: 'center' },
  pText: { color: '#FFF', fontSize: 14 },
  confirmBtn: { padding: 16, borderRadius: 16, marginTop: 20, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});