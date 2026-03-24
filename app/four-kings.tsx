import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppTheme } from '../lib/ThemeContext'; // შენი თემის იმპორტი
// 🔥 შემოვიტანეთ PrimeLock კომპონენტი
import { PrimeLock } from '../components/PrimeLock';

const { width } = Dimensions.get('window');

// 🃏 1. ჩვენი ხელოვნური ინტელექტის მიერ გენერირებული 32 კარტის ბაზა!
const CARDS_DB = [
    { id: '6H', rank: '6', suit: '♥️', color: '#FF3B30', name: 'გულის 6', meaning: 'მას თქვენთან შეხვედრა და რომანტიკული პაემანი სურს. ხშირად ფიქრობს თქვენზე.' },
    { id: '7H', rank: '7', suit: '♥️', color: '#FF3B30', name: 'გულის 7', meaning: 'მალე სასიამოვნო სიურპრიზს ან სასიყვარულო შეტყობინებას მიიღებთ მისგან.' },
    { id: '8H', rank: '8', suit: '♥️', color: '#FF3B30', name: 'გულის 8', meaning: 'მას თქვენთან გულახდილი საუბარი სურს, ბევრი რამ აქვს სათქმელი და გასარკვევი.' },
    { id: '9H', rank: '9', suit: '♥️', color: '#FF3B30', name: 'გულის 9', meaning: 'ის ყურებამდეა შეყვარებული. ეს ნამდვილი, ძლიერი გრძნობაა! მზადაა ყველაფრისთვის.' },
    { id: '10H', rank: '10', suit: '♥️', color: '#FF3B30', name: 'გულის 10', meaning: 'მას თქვენთან სერიოზული გეგმები აქვს, შესაძლოა სამომავლო, მყარ ურთიერთობაზეც ფიქრობს.' },
    { id: 'JH', rank: 'J', suit: '♥️', color: '#FF3B30', name: 'გულის ვალეტი', meaning: 'ის გამუდმებით თქვენზე ფიქრობს, მაგრამ ჯერ თამამი ნაბიჯის გადმოდგმას ვერ ბედავს.' },
    { id: 'QH', rank: 'Q', suit: '♥️', color: '#FF3B30', name: 'გულის დამა', meaning: 'ბინგო! ❤️ ეს სწორედ ის ადამიანია, რომელიც თქვენი ბედი და მომავალი პარტნიორი გახდება!' },
    { id: 'AH', rank: 'A', suit: '♥️', color: '#FF3B30', name: 'გულის ტუზი', meaning: 'უდიდესი სიყვარული და ვნება. მისი გული და სახლი თქვენთვის ყოველთვის ღიაა.' },

    { id: '6D', rank: '6', suit: '♦️', color: '#FF3B30', name: 'აგურის 6', meaning: 'მას თქვენთან ერთად სადმე გამგზავრება ან დროის უბრალოდ მხიარულად გატარება უნდა.' },
    { id: '7D', rank: '7', suit: '♦️', color: '#FF3B30', name: 'აგურის 7', meaning: 'ის მსუბუქად ფლირტაობს თქვენთან, მაგრამ ჯერ სერიოზულად ჩამოყალიბებული არ არის.' },
    { id: '8D', rank: '8', suit: '♦️', color: '#FF3B30', name: 'აგურის 8', meaning: 'საერთო ინტერესები გაკავშირებთ, მაგრამ მისი გრძნობები ამ ეტაპზე უფრო მეგობრულია.' },
    { id: '9D', rank: '9', suit: '♦️', color: '#FF3B30', name: 'აგურის 9', meaning: 'დიდი სიმპათია აქვს თქვენს მიმართ, მალე თავის გრძნობებს უფრო ღიად გამოხატავს.' },
    { id: '10D', rank: '10', suit: '♦️', color: '#FF3B30', name: 'აგურის 10', meaning: 'თქვენს მიმართ უფრო მატერიალური ან პრაგმატული ინტერესი აქვს.' },
    { id: 'JD', rank: 'J', suit: '♦️', color: '#FF3B30', name: 'აგურის ვალეტი', meaning: 'ის ჯერ კიდევ ეჭვებშია და ვერ გადაუწყვეტია რა სურს რეალურად.' },
    { id: 'QD', rank: 'Q', suit: '♦️', color: '#FF3B30', name: 'აგურის დამა', meaning: 'ფრთხილად, მის ცხოვრებაში შესაძლოა სხვა ქალიც ფიგურირებს.' },
    { id: 'AD', rank: 'A', suit: '♦️', color: '#FF3B30', name: 'აგურის ტუზი', meaning: 'მალე მისგან ძალიან მნიშვნელოვან და სასიხარულო სიახლეს გაიგებთ.' },

    { id: '6C', rank: '6', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის 6', meaning: 'ის ძალიან დაკავებულია თავისი საქმეებით და სიყვარულისთვის დრო ნაკლებად რჩება.' },
    { id: '7C', rank: '7', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის 7', meaning: 'საქმიანი საუბარი გელოდებათ, რომანტიკა მასთან ამ ეტაპზე ნაკლებად არის მოსალოდნელი.' },
    { id: '8C', rank: '8', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის 8', meaning: 'ის პატივს გცემთ როგორც პიროვნებას, მაგრამ ვნება და ცეცხლი აკლია ამ ურთიერთობას.' },
    { id: '9C', rank: '9', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის 9', meaning: 'ძლიერი მიჯაჭვულობა აქვს, მაგრამ რაღაც გარეშე გარემოებები უშლის ხელს.' },
    { id: '10C', rank: '10', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის 10', meaning: 'ის თქვენში კარგ პარტნიორს ხედავს, მაგრამ მისი გრძნობები ზედმეტად ცივი და რაციონალურია.' },
    { id: 'JC', rank: 'J', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის ვალეტი', meaning: 'მას მხოლოდ საკუთარი პრობლემები ადარდებს, თქვენთვის დიდად არ სცალია.' },
    { id: 'QC', rank: 'Q', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის დამა', meaning: 'გამოიჩინეთ სიფრთხილე, შესაძლოა თქვენს მიმართ არაკეთილსინდისიერი მიზნები ჰქონდეს.' },
    { id: 'AC', rank: 'A', suit: '♣️', color: '#1C1C1E', name: 'ჯვრის ტუზი', meaning: 'სტაბილური, მაგრამ ცოტა მოსაწყენი ურთიერთობა გელოდებათ მასთან.' },

    { id: '6S', rank: '6', suit: '♠️', color: '#1C1C1E', name: 'ყვავის 6', meaning: 'ეს ურთიერთობა შორს არ წავა, თქვენი გზები დიდი ალბათობით გაიყოფა.' },
    { id: '7S', rank: '7', suit: '♠️', color: '#1C1C1E', name: 'ყვავის 7', meaning: 'მასში ეჭვიანობა და ბრაზი დუღს. ფრთხილად იყავით მასთან კომუნიკაციისას.' },
    { id: '8S', rank: '8', suit: '♠️', color: '#1C1C1E', name: 'ყვავის 8', meaning: 'უთანხმოება და კამათია მოსალოდნელი. მას რაღაცაზე ძლიერად სწყდება გული.' },
    { id: '9S', rank: '9', suit: '♠️', color: '#1C1C1E', name: 'ყვავის 9', meaning: 'მას გული ტკივა ან ძლიერად იტანჯება თქვენი ურთიერთობის გამო.' },
    { id: '10S', rank: '10', suit: '♠️', color: '#1C1C1E', name: 'ყვავის 10', meaning: 'იმედგაცრუება. მისი გეგმები თქვენთან მიმართებაში ჩაიშალა.' },
    { id: 'JS', rank: 'J', suit: '♠️', color: '#1C1C1E', name: 'ყვავის ვალეტი', meaning: 'ცარიელი დაპირებები და ილუზიები. ნუ ენდობით მის ლამაზ სიტყვებს.' },
    { id: 'QS', rank: 'Q', suit: '♠️', color: '#1C1C1E', name: 'ყვავის დამა', meaning: 'თქვენს შორის ბოროტი ენა ან ინტრიგანი ადამიანი დგას, რომელიც ხელს გიშლით.' },
    { id: 'AS', rank: 'A', suit: '♠️', color: '#1C1C1E', name: 'ყვავის ტუზი', meaning: 'ძლიერი ფიზიკური ლტოლვა და ვნება გაკავშირებთ, თუმცა სულიერი კავშირი სუსტია.' },
];

export default function FourKingsScreen() {
    const { colors, isPrime } = useAppTheme(); // 🔥 დავამატეთ isPrime-ის ამოღება

    const [names, setNames] = useState(['', '', '', '']);
    const [results, setResults] = useState<any[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);

    // სახელის შეყვანის ჰენდლერი
    const handleNameChange = (text: string, index: number) => {
        const newNames = [...names];
        newNames[index] = text;
        setNames(newNames);
    };

    // მთავარი ლოგიკა: კარტების აჩეხვა და 4 შემთხვევითი კარტის ამოღება
    const startFortuneTelling = () => {
        // ვამოწმებთ, რომ ოთხივე ველი შევსებულია
        if (names.some(name => name.trim() === '')) {
            Alert.alert("შეცდომა", "გთხოვთ, შეიყვანოთ ოთხივე ადამიანის სახელი.");
            return;
        }

        // 1. ვაკოპირებთ ბაზას
        let deck = [...CARDS_DB];
        
        // 2. ვურევთ კარტებს (Shuffle)
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // 3. ვიღებთ პირველ 4 კარტს და ვუწყვილებთ სახელებს
        const newResults = names.map((name, index) => ({
            name: name,
            card: deck[index]
        }));

        setResults(newResults);
        setIsRevealed(true);
    };

    const resetGame = () => {
        setNames(['', '', '', '']);
        setResults([]);
        setIsRevealed(false);
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: colors.background }]} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>4 კაროლი</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isRevealed ? (
                    <View style={styles.inputSection}>
                        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                            <Ionicons name="information-circle" size={24} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.infoText, { color: colors.textMain }]}>
                                ჩაიფიქრეთ 4 მამაკაცი, ჩაწერეთ მათი სახელები და გაიგეთ, რას გრძნობენ ისინი რეალურად თქვენს მიმართ.
                            </Text>
                        </View>

                        {names.map((name, index) => (
                            <View key={index} style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>კაროლი {index + 1}</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain }]}
                                    placeholder="შეიყვანეთ სახელი..."
                                    placeholderTextColor={colors.textMuted}
                                    value={name}
                                    onChangeText={(text) => handleNameChange(text, index)}
                                    maxLength={20}
                                />
                            </View>
                        ))}

                        <TouchableOpacity 
                            style={[styles.startBtn, { backgroundColor: colors.primary }]} 
                            onPress={startFortuneTelling}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.startBtnText}>მკითხაობის დაწყება</Text>
                            <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.resultsSection}>
                        <Text style={[styles.resultsTitle, { color: colors.textMain }]}>მკითხაობის შედეგები</Text>
                        
                        {results.map((item, index) => (
                            <View key={index} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.resultName, { color: colors.textMain }]}>{item.name}</Text>
                                    <Text style={[styles.resultCardName, { color: item.card.color }]}>
                                        {item.card.name}
                                    </Text>
                                </View>

                                <View style={styles.cardBody}>
                                    {/* ვიზუალური კარტი */}
                                    <View style={[styles.playingCard, { borderColor: item.card.color }]}>
                                        <Text style={[styles.cardRank, { color: item.card.color }]}>{item.card.rank}</Text>
                                        <Text style={styles.cardSuit}>{item.card.suit}</Text>
                                    </View>
                                    
                                    {/* ახსნა - 🔥 ჩავამატეთ PrimeLock */}
                                    <View style={{ flex: 1, minHeight: 60, overflow: 'hidden' }}>
                                        <Text style={[styles.resultMeaning, { color: colors.textMuted }]}>
                                            {item.card.meaning}
                                        </Text>

                                        {!isPrime && (
                                            <PrimeLock title="განმარტება დაბლოკილია" />
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity 
                            style={[styles.resetBtn, { borderColor: colors.primary }]} 
                            onPress={resetGame}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="refresh" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.resetBtnText, { color: colors.primary }]}>თავიდან დაწყება</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    
    scrollContent: { paddingHorizontal: 24, paddingBottom: 50, paddingTop: 10 },
    
    inputSection: { width: '100%' },
    infoBox: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 25, alignItems: 'center' },
    infoText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },
    
    inputWrapper: { padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 15 },
    inputLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
    input: { fontSize: 16, fontWeight: '600', height: 30 },
    
    startBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    resultsSection: { width: '100%' },
    resultsTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    
    resultCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    resultName: { fontSize: 18, fontWeight: '800' },
    resultCardName: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
    
    cardBody: { flexDirection: 'row', alignItems: 'center' },
    playingCard: { width: 60, height: 85, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardRank: { fontSize: 24, fontWeight: '900', marginTop: 5 },
    cardSuit: { fontSize: 28, marginBottom: 5 },
    
    resultMeaning: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },
    
    resetBtn: { flexDirection: 'row', height: 56, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    resetBtnText: { fontSize: 16, fontWeight: '800' }
});