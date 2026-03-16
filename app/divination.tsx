import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppTheme } from '../lib/ThemeContext';

const { width, height } = Dimensions.get('window');

const GAMES = [
  { id: 'kings', title: '4 კაროლი', icon: 'browsers', color: '#FF3366', desc: 'აირჩიე კაროლი და გაიგე რას ფიქრობს ის შენზე' },
  { id: 'numerology', title: 'ცხოველების გზა', icon: 'paw', color: '#00E5FF', desc: 'ნუმეროლოგიური ტესტი დაბადების თარიღით' },
  { id: 'daisy', title: 'გვირილა', icon: 'flower', color: '#FFD700', desc: 'ვუყვარვარ თუ არა? ჰკითხე გვირილას' },
  { id: 'universal', title: 'უნივერსალური', icon: 'copy', color: '#B829EA', desc: 'მიიღე პასუხი ნებისმიერ დასმულ კითხვაზე' },
  { id: 'intentions', title: 'რა უნდა ჩემგან?', icon: 'eye', color: '#FF4B72', desc: 'გაიგე მისი ფარული ზრახვები და მიზნები' },
];

// --- მინი თამაშების პასუხების ბაზა ---
const KINGS_ANSWERS = ["ის შენზე გამუდმებით ფიქრობს.", "მისი გრძნობები ჯერ კიდევ ცივია.", "მალე პირველ ნაბიჯს გადმოდგამს.", "სხვაზე ფიქრობს, ფრთხილად იყავი."];
const UNIVERSAL_ANSWERS = ["დიახ, აუცილებლად!", "არა, ახლა ამის დრო არ არის.", "ყველაფერი შენზეა დამოკიდებული.", "დაელოდე, სიტუაცია შეიცვლება.", "ეს დიდი წარმატების მომტანი იქნება."];
const INTENTIONS_ANSWERS = ["მხოლოდ მსუბუქი ფლირტი აინტერესებს.", "სერიოზულ ურთიერთობას გეგმავს.", "მას შენი გამოყენება სურს.", "ჯერ თვითონაც ვერ გაურკვევია რა უნდა.", "შენში თავის მომავალს ხედავს."];
const ANIMALS = [
  { num: 1, name: 'ლომი', desc: 'შენ ხარ ლიდერი, ძლიერი და დამოუკიდებელი.' },
  { num: 2, name: 'მტრედი', desc: 'შენ ხარ მშვიდობისმოყვარე და ჰარმონიული პარტნიორი.' },
  { num: 3, name: 'მელია', desc: 'ხარ ეშმაკი, ჭკვიანი და მიზანდასახული.' },
  { num: 4, name: 'კუ', desc: 'შენი გზა ნელი, მაგრამ ყველაზე სტაბილურია.' },
  { num: 5, name: 'არწივი', desc: 'თავისუფლება შენთვის ყველაფერია.' },
  { num: 6, name: 'ძაღლი', desc: 'ხარ ყველაზე ერთგული და მზრუნველი.' },
  { num: 7, name: 'ბუ', desc: 'ბრძენი ხარ და ინტუიცია ყოველთვის გიბიძგებს სწორი გზისკენ.' },
  { num: 8, name: 'დელფინი', desc: 'პოზიტიური, მეგობრული და ენერგიული ხარ.' },
  { num: 9, name: 'ვეფხვი', desc: 'ვნებიანი და დაუმორჩილებელი ბუნება გაქვს.' },
];

export default function DivinationScreen() {
  const { colors } = useAppTheme();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // 1. 4 კაროლი State
  const [selectedKing, setSelectedKing] = useState<string | null>(null);

  // 2. ნუმეროლოგია State
  const [birthDate, setBirthDate] = useState('');
  const [animalResult, setAnimalResult] = useState<any>(null);

  // 3. გვირილა State
  const [petals, setPetals] = useState(10);
  const [daisyResult, setDaisyResult] = useState<string | null>(null);

  // 4 & 5. უნივერსალური და განზრახვები State
  const [targetName, setTargetName] = useState('');
  const [simpleResult, setSimpleResult] = useState<string | null>(null);

  const resetGames = () => {
    setSelectedKing(null);
    setBirthDate('');
    setAnimalResult(null);
    setPetals(10 + Math.floor(Math.random() * 5)); // 10-დან 14-მდე ფურცელი
    setDaisyResult(null);
    setTargetName('');
    setSimpleResult(null);
  };

  const openGame = (id: string) => {
    resetGames();
    setActiveGame(id);
  };

  const playKings = () => {
    setSelectedKing(KINGS_ANSWERS[Math.floor(Math.random() * KINGS_ANSWERS.length)]);
  };

  const playNumerology = () => {
    if (birthDate.length < 4) return;
    const digits = birthDate.replace(/\D/g, '');
    let sum = digits.split('').reduce((a, b) => a + parseInt(b), 0);
    while (sum > 9) {
      sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    setAnimalResult(ANIMALS.find(a => a.num === (sum || 1)));
  };

  const pluckDaisy = () => {
    if (petals > 1) {
      setPetals(petals - 1);
    } else {
      setDaisyResult(Math.random() > 0.5 ? 'უყვარხარ! ❤️' : 'არ უყვარხარ 💔');
    }
  };

  const playRandomAction = (arr: string[]) => {
    setSimpleResult(arr[Math.floor(Math.random() * arr.length)]);
  };

  // --- მოდალის შიგთავსის რენდერი თამაშის მიხედვით ---
  const renderGameContent = () => {
    switch (activeGame) {
      case 'kings':
        return (
          <View style={styles.gameArea}>
            <Text style={[styles.gameInstruction, { color: colors.textMuted }]}>აირჩიე ერთ-ერთი კაროლი</Text>
            <View style={styles.kingsContainer}>
              {[1, 2, 3, 4].map((item) => (
                <TouchableOpacity key={item} style={[styles.kingCard, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={playKings} disabled={!!selectedKing}>
                  <Ionicons name="person" size={40} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
            {selectedKing && (
              <View style={[styles.resultBox, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                <Text style={[styles.resultText, { color: colors.textMain }]}>{selectedKing}</Text>
              </View>
            )}
          </View>
        );

      case 'numerology':
        return (
          <View style={styles.gameArea}>
            <Text style={[styles.gameInstruction, { color: colors.textMuted }]}>შეიყვანე დაბადების თარიღი (მაგ: 15.08.1995)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]}
              placeholder="DD.MM.YYYY"
              placeholderTextColor={colors.textMuted}
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={playNumerology}>
              <Text style={styles.actionBtnText}>გამოთვლა</Text>
            </TouchableOpacity>
            {animalResult && (
              <View style={[styles.resultBox, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                <Text style={[styles.resultTitle, { color: colors.primary }]}>{animalResult.name}</Text>
                <Text style={[styles.resultDesc, { color: colors.textMain }]}>{animalResult.desc}</Text>
              </View>
            )}
          </View>
        );

      case 'daisy':
        return (
          <View style={styles.gameArea}>
            {!daisyResult ? (
              <>
                <Text style={[styles.gameInstruction, { color: colors.textMuted }]}>დარჩენილია {petals} ფურცელი</Text>
                <View style={[styles.daisyCenter, { backgroundColor: '#FFD700' }]}>
                  <Ionicons name="flower" size={60} color="#FFF" />
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={pluckDaisy}>
                  <Text style={styles.actionBtnText}>{petals % 2 === 0 ? 'მიყვარს' : 'არ მიყვარს'} (მოწყვიტე)</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.resultBox, { backgroundColor: daisyResult.includes('არ') ? 'rgba(255,75,114,0.2)' : 'rgba(16,185,129,0.2)', borderColor: daisyResult.includes('არ') ? '#FF4B72' : '#10B981' }]}>
                <Text style={[styles.resultTitle, { color: daisyResult.includes('არ') ? '#FF4B72' : '#10B981', fontSize: 28 }]}>{daisyResult}</Text>
              </View>
            )}
          </View>
        );

      case 'universal':
      case 'intentions':
        const isIntentions = activeGame === 'intentions';
        return (
          <View style={styles.gameArea}>
            <Text style={[styles.gameInstruction, { color: colors.textMuted }]}>
              {isIntentions ? 'ვისზე მკითხაობ? (ჩაწერე სახელი)' : 'დაუსვი კარტს კონკრეტული შეკითხვა'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]}
              placeholder={isIntentions ? "სახელი..." : "შეკითხვა..."}
              placeholderTextColor={colors.textMuted}
              value={targetName}
              onChangeText={setTargetName}
            />
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary }]} 
              onPress={() => playRandomAction(isIntentions ? INTENTIONS_ANSWERS : UNIVERSAL_ANSWERS)}
              disabled={targetName.length < 2}
            >
              <Text style={styles.actionBtnText}>{isIntentions ? 'გაგება' : 'კარტის ამოღება'}</Text>
            </TouchableOpacity>
            {simpleResult && (
              <View style={[styles.resultBox, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                <Text style={[styles.resultText, { color: colors.textMain }]}>{simpleResult}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>მკითხაობა</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        <Text style={[styles.subText, { color: colors.textMuted }]}>აირჩიე მისტიკური პრაქტიკა და იპოვე პასუხები შენს კითხვებზე.</Text>
        
        {GAMES.map((game) => (
          <TouchableOpacity 
            key={game.id} 
            style={[styles.gameCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            activeOpacity={0.8}
            onPress={() => openGame(game.id)}
          >
            <View style={[styles.gameIconBox, { backgroundColor: `${game.color}15` }]}>
              <Ionicons name={game.icon as any} size={28} color={game.color} />
            </View>
            <View style={styles.gameInfo}>
              <Text style={[styles.gameTitle, { color: colors.textMain }]}>{game.title}</Text>
              <Text style={[styles.gameDesc, { color: colors.textMuted }]} numberOfLines={2}>{game.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* --- თამაშის მოდალი --- */}
      <Modal visible={!!activeGame} animationType="slide" transparent>
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                {GAMES.find(g => g.id === activeGame)?.title}
              </Text>
              <TouchableOpacity onPress={() => setActiveGame(null)} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderGameContent()}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  listContent: { paddingHorizontal: 24, paddingBottom: 50 },
  subText: { fontSize: 14, lineHeight: 22, marginBottom: 25 },
  
  gameCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 16, borderWidth: 1 },
  gameIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  gameInfo: { flex: 1, marginRight: 10 },
  gameTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  gameDesc: { fontSize: 12, lineHeight: 18 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.75, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  gameArea: { alignItems: 'center', paddingBottom: 40 },
  gameInstruction: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  
  // Kings Game
  kingsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 30 },
  kingCard: { width: 70, height: 100, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  
  // Inputs & Buttons
  input: { width: '100%', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20, fontSize: 16 },
  actionBtn: { width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  // Results
  resultBox: { width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center', marginTop: 10 },
  resultText: { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
  resultTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  resultDesc: { fontSize: 15, textAlign: 'center', lineHeight: 24 },

  // Daisy Game
  daisyCenter: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 30, shadowColor: '#FFD700', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }
});