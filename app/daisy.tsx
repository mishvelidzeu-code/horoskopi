import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
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

// 🌼 ტრადიციული გვირილას ფრაზები
const DAISY_PHRASES = [
    'უყვარვარ ❤️',
    'არ ვუყვარვარ 💔',
    'გულით ვუნდივარ 🥺',
    'ეჭვიანობს 👀',
    'სხვაზე ფიქრობს 🚶‍♂️',
    'ძალიან ენატრები ✨'
];

export default function DaisyScreen() {
    const { colors } = useAppTheme();

    const [targetName, setTargetName] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    
    const [totalPetals, setTotalPetals] = useState(0); // ეს ახლა სრულიად გასაიდუმლოებულია მომხმარებლისთვის!
    const [currentPetal, setCurrentPetal] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const startDivination = () => {
        if (!targetName.trim()) {
            Alert.alert("ყურადღება", "გთხოვთ, ჩაწეროთ იმ ადამიანის სახელი, ვისზეც მკითხაობთ.");
            return;
        }

        // ფურცლების შემთხვევითი რაოდენობა (მაგ: 15-დან 30-მდე)
        const randomPetals = Math.floor(Math.random() * 16) + 15;
        
        setTotalPetals(randomPetals);
        setCurrentPetal(0);
        setIsFinished(false);
        setIsStarted(true);
    };

    const pluckPetal = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.85, duration: 120, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true })
        ]).start();

        const nextPetal = currentPetal + 1;
        setCurrentPetal(nextPetal);

        if (nextPetal >= totalPetals) {
            setIsFinished(true);
        }
    };

    const resetGame = () => {
        setTargetName('');
        setIsStarted(false);
        setIsFinished(false);
        setCurrentPetal(0);
    };

    const currentPhrase = DAISY_PHRASES[(currentPetal - 1) % DAISY_PHRASES.length] || "დაიწყე მოწყვეტა";

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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>გვირილა</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isStarted ? (
                    <View style={styles.inputSection}>
                        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                            <Ionicons name="flower-outline" size={26} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.infoText, { color: colors.textMain }]}>
                                ტრადიციული მკითხაობა. ჩაიფიქრეთ ადამიანი, ჩაწერეთ მისი სახელი და გავარკვიოთ, რას გრძნობს სინამდვილეში.
                            </Text>
                        </View>

                        <Text style={[styles.label, { color: colors.textMuted }]}>ვისზე მკითხაობთ?</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textMain }]}
                                placeholder="შეიყვანეთ სახელი..."
                                placeholderTextColor={colors.textMuted}
                                value={targetName}
                                onChangeText={setTargetName}
                                maxLength={25}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.startBtn, { backgroundColor: colors.primary }]} 
                            onPress={startDivination}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.startBtnText}>გვირილის არჩევა</Text>
                            <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.gameSection}>
                        
                        {!isFinished ? (
                            <>
                                <Text style={[styles.targetNameText, { color: colors.textMain }]}>
                                    მკითხაობთ: <Text style={{ color: colors.primary }}>{targetName}</Text>-ზე
                                </Text>

                                <Animated.View style={[styles.flowerContainer, { transform: [{ scale: scaleAnim }] }]}>
                                    {/* ახლა აქ ციფრების მაგივრად უბრალოდ ლამაზი გვირილაა */}
                                    <View style={[styles.flowerCore, { backgroundColor: '#FFD700', borderColor: '#FFB300' }]}>
                                        <Ionicons name="flower" size={54} color="#B37700" />
                                    </View>
                                </Animated.View>

                                <View style={[styles.phraseBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={[styles.phraseText, { color: currentPetal === 0 ? colors.textMuted : colors.textMain }]}>
                                        {currentPetal === 0 ? "დააჭირეთ ფურცლის მოსაწყვეტად" : currentPhrase}
                                    </Text>
                                </View>

                                <TouchableOpacity 
                                    style={[styles.pluckBtn, { backgroundColor: colors.primary }]} 
                                    onPress={pluckPetal}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="leaf-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.pluckBtnText}>ფურცლის მოწყვეტა</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.resultContainer}>
                                <Ionicons name="heart" size={64} color={colors.primary} style={{ marginBottom: 20 }} />
                                <Text style={[styles.resultTitle, { color: colors.textMain }]}>საბოლოო პასუხი</Text>
                                <Text style={[styles.targetNameText, { color: colors.textMuted, marginBottom: 15 }]}>
                                    {targetName}-ს:
                                </Text>
                                
                                <View style={[styles.finalAnswerBox, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                                    <Text style={[styles.finalAnswerText, { color: colors.primary }]}>
                                        {currentPhrase}
                                    </Text>
                                </View>

                                <TouchableOpacity 
                                    style={[styles.resetBtn, { borderColor: colors.primary }]} 
                                    onPress={resetGame}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="refresh" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                                    <Text style={[styles.resetBtnText, { color: colors.primary }]}>თავიდან მკითხაობა</Text>
                                </TouchableOpacity>
                            </View>
                        )}

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
    infoBox: { flexDirection: 'row', padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 25, alignItems: 'center' },
    infoText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },
    
    label: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginLeft: 5 },
    inputWrapper: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    input: { fontSize: 18, fontWeight: '700', height: 26 },
    
    startBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    gameSection: { width: '100%', alignItems: 'center' },
    targetNameText: { fontSize: 18, fontWeight: '800', marginBottom: 30 },
    
    flowerContainer: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    flowerCore: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 8 },

    phraseBox: { width: '100%', padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 25, minHeight: 70, justifyContent: 'center' },
    phraseText: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    
    pluckBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    pluckBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    resultContainer: { width: '100%', alignItems: 'center', paddingTop: 20 },
    resultTitle: { fontSize: 28, fontWeight: '900', marginBottom: 5 },
    
    finalAnswerBox: { width: '100%', paddingVertical: 30, paddingHorizontal: 20, borderRadius: 24, borderWidth: 2, alignItems: 'center', marginBottom: 40 },
    finalAnswerText: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
    
    resetBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    resetBtnText: { fontSize: 16, fontWeight: '800' }
});