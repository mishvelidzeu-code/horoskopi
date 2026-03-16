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
import { useAppTheme } from '../lib/ThemeContext';

const { width } = Dimensions.get('window');

// 🔢 1. ნუმეროლოგიური ბაზა (1-დან 9-მდე რიცხვების მნიშვნელობები)
const NUMEROLOGY_DB: Record<number, { title: string, meaning: string }> = {
    1: {
        title: "ლიდერი და ნოვატორი",
        meaning: "თქვენ ხართ დაბადებული ლიდერი. ერთიანი განასახიერებს დამოუკიდებლობას, ორიგინალურობას და ინიციატივას. თქვენი ცხოვრებისეული გზაა იყოთ პირველი, შექმნათ რაიმე ახალი და არ შეგეშინდეთ პასუხისმგებლობის. ერიდეთ ზედმეტ სიჯიუტეს და ეგოიზმს."
    },
    2: {
        title: "დიპლომატი და მშვიდობისმყოფელი",
        meaning: "თქვენი ძალა ჰარმონიასა და თანამშრომლობაშია. შესანიშნავად გრძნობთ სხვების ემოციებს და იდეალური პარტნიორი ხართ როგორც პირად, ისე საქმიან ურთიერთობებში. თქვენი მისიაა კონფლიქტების მოგვარება, თუმცა ფრთხილად იყავით, რომ სხვებზე ზედმეტად დამოკიდებული არ გახდეთ."
    },
    3: {
        title: "შემოქმედი და ოპტიმისტი",
        meaning: "სამიანი არის კომუნიკაციის, ხელოვნებისა და ცხოვრების სიყვარულის რიცხვი. თქვენ გაქვთ უნარი შთააგონოთ სხვები სიტყვით ან შემოქმედებით. თქვენი ენერგია მაგნიტურია. მთავარი გამოწვევაა ისწავლოთ ფოკუსირება და არ გაფანტოთ თქვენი ნიჭი წვრილმანებზე."
    },
    4: {
        title: "მშენებელი და პრაქტიკოსი",
        meaning: "სტაბილურობა, შრომისმოყვარეობა და წესრიგი თქვენი სავიზიტო ბარათია. თქვენ ხართ საიმედო საყრდენი ოჯახისა და მეგობრებისთვის. თქვენი გზაა შექმნათ მყარი ფუნდამენტი ცხოვრებაში. ეცადეთ არ იყოთ ზედმეტად ხისტი და მიეცით საკუთარ თავს მოდუნების საშუალება."
    },
    5: {
        title: "თავისუფლების მოყვარული მოგზაური",
        meaning: "ცვლილებები თქვენი სტიქიაა. ხუთიანი სიმბოლოა თავგადასავლების, ენერგიულობისა და ცნობისმოყვარეობის. რუტინა განადგურებთ, ამიტომ მუდმივად გჭირდებათ სიახლეები. თქვენი მისიაა სამყაროს შეცნობა, თუმცა ისწავლეთ პასუხისმგებლობების ბოლომდე მისაყვანად მოთმინება."
    },
    6: {
        title: "მზრუნველი და ჰარმონიული",
        meaning: "თქვენი ცხოვრების მთავარი ღირებულება ოჯახი, სიყვარული და სხვებზე ზრუნვაა. გაქვთ გამძაფრებული სამართლიანობის გრძნობა და მზად ხართ დაეხმაროთ გაჭირვებულებს. ერიდეთ სხვების ცხოვრებაში ზედმეტ ჩარევას და ნუ დაივიწყებთ საკუთარ საჭიროებებს."
    },
    7: {
        title: "ფილოსოფოსი და მაძიებელი",
        meaning: "შვიდიანი სულიერების, ანალიტიკური გონებისა და იდუმალების რიცხვია. თქვენ მუდმივად ეძებთ ჭეშმარიტებას და გიყვართ მოვლენების სიღრმეებში ჩასვლა. ხშირად გჭირდებათ მარტოობა ძალების აღსადგენად. თქვენი გამოწვევაა, არ ჩაიკეტოთ საკუთარ თავში."
    },
    8: {
        title: "მიზანდასახული და ძლიერი",
        meaning: "ეს არის ფინანსური წარმატების, ძალაუფლებისა და მატერიალური კეთილდღეობის რიცხვი. თქვენ გაქვთ დიდი ბიზნეს-პოტენციალი და ორგანიზატორული ნიჭი. თქვენი მიზანია ისწავლოთ მატერიალურისა და სულიერის ბალანსი, რათა არ გახდეთ ფულის მონა."
    },
    9: {
        title: "ჰუმანისტი და ბრძენი",
        meaning: "ცხრიანი აერთიანებს ყველა წინა რიცხვის გამოცდილებას. თქვენ გაქვთ უდიდესი თანაგრძნობის უნარი და გლობალური ხედვა. თქვენი მისიაა სამყაროს უკეთესობისკენ შეცვლა და სხვებისთვის უანგარო დახმარება. ისწავლეთ წარსულის გაშვება და პატიება."
    }
};

export default function NumerologyScreen() {
    const { colors } = useAppTheme();

    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    
    const [resultNumber, setResultNumber] = useState<number | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // ლოგიკა: ციფრების ჯამის დაყვანა 1-ნიშნა რიცხვამდე
    const calculateLifePath = () => {
        // ვალიდაცია
        if (!day || !month || !year) {
            Alert.alert("ყურადღება", "გთხოვთ, შეავსოთ თარიღის ყველა ველი.");
            return;
        }

        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
            Alert.alert("შეცდომა", "შეყვანილი თარიღი არასწორია.");
            return;
        }

        // ვაერთიანებთ ერთ სტრინგად: მაგ. "25121990"
        let fullDateString = `${d}${m}${y}`;
        
        // ვითვლით ჯამს
        let sum = 0;
        for (let char of fullDateString) {
            sum += parseInt(char);
        }

        // ვაგრძელებთ შეკრებას, სანამ არ მივიღებთ 1-ნიშნა რიცხვს
        while (sum > 9) {
            let tempSum = 0;
            let sumString = sum.toString();
            for (let char of sumString) {
                tempSum += parseInt(char);
            }
            sum = tempSum;
        }

        setResultNumber(sum);
        setIsRevealed(true);
    };

    const resetCalculator = () => {
        setDay('');
        setMonth('');
        setYear('');
        setResultNumber(null);
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>ნუმეროლოგია</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isRevealed ? (
                    <View style={styles.inputSection}>
                        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                            <Ionicons name="calculator" size={24} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.infoText, { color: colors.textMain }]}>
                                შეიყვანეთ თქვენი დაბადების თარიღი, რათა გამოვთვალოთ თქვენი ცხოვრებისეული გზის რიცხვი და მისი იდუმალი მნიშვნელობა.
                            </Text>
                        </View>

                        <Text style={[styles.label, { color: colors.textMuted }]}>დაბადების თარიღი</Text>
                        
                        <View style={styles.dateInputsContainer}>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain }]}
                                    placeholder="დღე"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={day}
                                    onChangeText={setDay}
                                />
                            </View>
                            
                            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain }]}
                                    placeholder="თვე"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={month}
                                    onChangeText={setMonth}
                                />
                            </View>

                            <View style={[styles.inputWrapper, styles.yearInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain }]}
                                    placeholder="წელი (მაგ: 1990)"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={year}
                                    onChangeText={setYear}
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.startBtn, { backgroundColor: colors.primary }]} 
                            onPress={calculateLifePath}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.startBtnText}>გამოთვლა</Text>
                            <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.resultsSection}>
                        <Text style={[styles.resultsTitle, { color: colors.textMain }]}>თქვენი ბედის კოდი</Text>
                        
                        <View style={[styles.numberCircle, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                            <Text style={[styles.bigNumber, { color: colors.primary }]}>{resultNumber}</Text>
                        </View>

                        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.resultSubtitle, { color: colors.primary }]}>
                                {resultNumber && NUMEROLOGY_DB[resultNumber].title}
                            </Text>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <Text style={[styles.resultMeaning, { color: colors.textMain }]}>
                                {resultNumber && NUMEROLOGY_DB[resultNumber].meaning}
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={[styles.resetBtn, { borderColor: colors.primary }]} 
                            onPress={resetCalculator}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="refresh" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.resetBtnText, { color: colors.primary }]}>თავიდან გამოთვლა</Text>
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
    
    label: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginLeft: 5 },
    dateInputsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    inputWrapper: { width: '28%', padding: 12, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    yearInput: { width: '40%' },
    input: { fontSize: 18, fontWeight: '800', textAlign: 'center', width: '100%' },
    
    startBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    resultsSection: { width: '100%', alignItems: 'center' },
    resultsTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    
    numberCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 25 },
    bigNumber: { fontSize: 64, fontWeight: '900' },

    resultCard: { width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
    resultSubtitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 15 },
    divider: { height: 1, width: '100%', marginBottom: 15 },
    resultMeaning: { fontSize: 15, lineHeight: 26, fontWeight: '500', textAlign: 'justify' },
    
    resetBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    resetBtnText: { fontSize: 16, fontWeight: '800' }
});