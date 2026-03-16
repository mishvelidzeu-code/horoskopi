import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

const DEFAULT_PLANETS = [
    { id: 'sun', name: 'მზე', sign: 'თხის რქა', degree: '25° 14\'', icon: 'white-balance-sunny', color: '#FFD700', house: 'მე-5 სახლი' },
    { id: 'moon', name: 'მთვარე', sign: 'ლომი', degree: '10° 42\'', icon: 'moon-waxing-crescent', color: '#E0E0E0', house: 'მე-12 სახლი' },
    { id: 'asc', name: 'ასცენდენტი', sign: 'ქალწული', degree: '15° 00\'', icon: 'arrow-up-circle-outline', color: '#00E5FF', house: '1-ლი სახლი' },
    { id: 'mercury', name: 'მერკური', sign: 'მერწყული', degree: '05° 11\'', icon: 'weather-windy', color: '#B829EA', house: 'მე-6 სახლი' },
    { id: 'venus', name: 'ვენერა', sign: 'თევზები', degree: '18° 33\'', icon: 'heart-outline', color: '#FF3366', house: 'მე-7 სახლი' },
    { id: 'mars', name: 'მარსი', sign: 'ვერძი', degree: '12° 05\'', icon: 'sword-cross', color: '#FF4B72', house: 'მე-1 სახლი' },
];

const HOUSES = [
    { id: '1', title: '1-ლი სახლი (ეგო)', sign: 'ქალწული', desc: 'პიროვნება, გარეგნობა, საწყისი ენერგია.' },
    { id: '2', title: 'მე-2 სახლი (ფინანსები)', sign: 'სასწორი', desc: 'მატერიალური რესურსები, ღირებულებები.' },
    { id: '4', title: 'მე-4 სახლი (ოჯახი - IC)', sign: 'მშვილდოსანი', desc: 'ფესვები, შინაგანი სამყარო, სახლი.' },
    { id: '10', title: 'მე-10 სახლი (კარიერა - MC)', sign: 'ტყუპები', desc: 'პროფესიული მიზნები, საზოგადოებრივი სტატუსი.' },
];

const ASPECTS = [
    { id: '1', title: 'მზე ტრიგონი მთვარე', type: 'ჰარმონიული', icon: 'triangle-outline', color: '#00D09E', desc: 'შინაგანი ბალანსი, ემოციური სტაბილურობა და თავდაჯერებულობა.' },
    { id: '2', title: 'მარსი კვადრატი ვენერა', type: 'დაძაბული', icon: 'square-outline', color: '#FF4B72', desc: 'ვნებიანი ბუნება, მაგრამ შესაძლოა გამოიწვიოს იმპულსური რეაქციები ურთიერთობებში.' },
];

export default function NatalChartScreen() {
    // 🔴 შეცვლილია: ვიღებთ პირდაპირ colors და isPrime-ს
    const { colors, isPrime } = useAppTheme();

    const [userProfile, setUserProfile] = useState<any>(null);
    const [planets, setPlanets] = useState(DEFAULT_PLANETS);
    const [loading, setLoading] = useState(true);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [analysisModal, setAnalysisModal] = useState(false);
    const [fetchingAnalysis, setFetchingAnalysis] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchUserData();
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
        Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 60000, useNativeDriver: true })).start();
        Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 2000, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])).start();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setUserProfile(data);
                    const updatedPlanets = DEFAULT_PLANETS.map(p => p.id === 'sun' ? { ...p, sign: data.zodiac_sign } : p);
                    setPlanets(updatedPlanets);
                }
            }
        } catch (error) { console.log(error); } finally { setLoading(false); }
    };

    const fetchDetailedAnalysis = async () => {
        if (!isPrime) { router.push('/subscription'); return; }
        setFetchingAnalysis(true);
        setAnalysisModal(true);
        try {
            const { data, error } = await supabase.from('natal_analyses').select('*').eq('sign', userProfile?.zodiac_sign).single();
            if (data) setAnalysisData(data);
        } catch (err) { console.log(err); } finally { setFetchingAnalysis(false); }
    };

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 🔴 რადგან თემა სულ მუქია, StatusBar მუდმივად light-content-ია */}
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                
                <View style={styles.header}>
                    <Text style={[styles.headerSubtitle, { color: colors.primary }]}>შენი კოსმოსური პასპორტი</Text>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>ნატალური რუკა</Text>
                </View>

                <View style={styles.wheelContainer}>
                    <View style={[styles.glowCircle, { backgroundColor: `${colors.primary}15`, shadowColor: colors.primary }]} />
                    <Animated.View style={[styles.wheelWrapper, { transform: [{ rotate: spin }], borderColor: colors.border }]}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1632768565778-4bfdb023ebce?q=80&w=800' }} style={styles.wheelImage} contentFit="cover" />
                        <LinearGradient colors={['transparent', colors.surface]} style={StyleSheet.absoluteFill} />
                    </Animated.View>
                    <Animated.View style={[styles.wheelCenterContent, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.primary, transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="sparkles" size={24} color={colors.primary} />
                    </Animated.View>
                </View>

                <TouchableOpacity 
                    style={[styles.analysisCard, { borderColor: isPrime ? colors.primary : '#FFD700', backgroundColor: colors.surface }]}
                    onPress={fetchDetailedAnalysis}
                    activeOpacity={0.9}
                >
                    <LinearGradient colors={isPrime ? [`${colors.primary}20`, 'transparent'] : ['rgba(255,215,0,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
                    <View style={styles.analysisContent}>
                        <View style={[styles.primeBadge, { backgroundColor: isPrime ? colors.primary : '#FFD700' }]}>
                            <Ionicons name={isPrime ? "sparkles" : "lock-closed"} size={12} color={isPrime ? "#FFF" : "#000"} />
                            <Text style={[styles.primeBadgeText, { color: isPrime ? "#FFF" : "#000" }]}>{isPrime ? "ანალიზი" : "PRIME"}</Text>
                        </View>
                        <Text style={[styles.analysisTitle, { color: colors.textMain }]}>სრული პერსონალური ანალიზი</Text>
                        <Text style={[styles.analysisDesc, { color: colors.textMuted }]}>
                            გაიგე რას გიწინასწარმეტყველებს პლანეტების განლაგება შენი ცხოვრების ყველა სფეროში.
                        </Text>
                    </View>
                    <View style={[styles.analysisBtn, { backgroundColor: isPrime ? colors.primary : '#FFD700' }]}>
                        <Ionicons name={isPrime ? "chevron-forward" : "lock-closed"} size={20} color={isPrime ? "#FFF" : "#000"} />
                    </View>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>პლანეტები და ნიშნები</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planetsScroll}>
                    {planets.map((planet) => (
                        <View key={planet.id} style={[styles.planetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.planetIconBg, { shadowColor: planet.color, shadowOpacity: 0.8, shadowRadius: 10, elevation: 10, borderColor: colors.border }]}>
                                <MaterialCommunityIcons name={planet.icon as any} size={28} color={planet.color} />
                            </View>
                            <Text style={[styles.planetName, { color: colors.textMain }]}>{planet.name}</Text>
                            <Text style={[styles.planetSign, { color: colors.textMuted }]}>{planet.sign}</Text>
                            <View style={[styles.planetDegreeBox, { backgroundColor: `${colors.primary}20` }]}><Text style={[styles.planetDegree, { color: colors.primary }]}>{planet.degree}</Text></View>
                            <Text style={[styles.planetHouse, { color: colors.textMuted }]}>{planet.house}</Text>
                        </View>
                    ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>ასტროლოგიური სახლები</Text>
                <View style={[styles.glassContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {HOUSES.map((house, index) => (
                        <View key={house.id} style={[styles.houseRow, { borderBottomColor: colors.border }, index === HOUSES.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <View style={styles.houseHeader}>
                                <Text style={[styles.houseTitle, { color: colors.textMain }]}>{house.title}</Text>
                                <Text style={[styles.houseSign, { color: colors.primary }]}>{house.sign}</Text>
                            </View>
                            <Text style={[styles.houseDesc, { color: colors.textMuted }]}>{house.desc}</Text>
                        </View>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>მთავარი ასპექტები</Text>
                <View style={styles.aspectsContainer}>
                    {ASPECTS.map((aspect) => (
                        <TouchableOpacity key={aspect.id} activeOpacity={0.8} style={[styles.aspectCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: aspect.color }]}>
                            <View style={styles.aspectHeader}>
                                <Ionicons name={aspect.icon as any} size={20} color={aspect.color} /><Text style={[styles.aspectTitle, { color: colors.textMain }]}>{aspect.title}</Text>
                                <View style={[styles.aspectBadge, { backgroundColor: `${aspect.color}20` }]}><Text style={[styles.aspectBadgeText, { color: aspect.color }]}>{aspect.type}</Text></View>
                            </View>
                            <Text style={[styles.aspectDesc, { color: colors.textMuted }]}>{aspect.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.ScrollView>

            <Modal visible={analysisModal} animationType="slide" transparent>
                <BlurView intensity={100} tint="dark" style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.primary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>ნატალური ანალიზი</Text>
                            <TouchableOpacity onPress={() => setAnalysisModal(false)}><Ionicons name="close-circle" size={32} color={colors.textMuted} /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {fetchingAnalysis ? (
                                <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />
                            ) : (
                                <View style={styles.analysisTextContent}>
                                    <Text style={[styles.analysisBody, { color: colors.textMuted }]}>
                                        {analysisData?.full_text || "თქვენი პიროვნება ხასიათდება ძლიერი ნებისყოფით. ვარსკვლავები მიუთითებენ, რომ თქვენი კარიერული გზა 2026 წელს იქნება განსაკუთრებით წარმატებული..."}
                                    </Text>
                                    <View style={[styles.detailBox, { backgroundColor: colors.surface }]}>
                                        <Text style={[styles.detailTitle, { color: colors.primary }]}>ბედისწერა</Text>
                                        <Text style={{ color: colors.textMuted }}>თქვენი კარმული დანიშნულებაა ლიდერობა და სხვების შთაგონება.</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backgroundGlow: { position: 'absolute', top: '10%', left: '10%', width: width * 0.8, height: 300, backgroundColor: 'rgba(184, 41, 234, 0.12)', borderRadius: 150 },
    scrollContent: { paddingBottom: 120, paddingTop: 60 },
    header: { paddingHorizontal: 24, marginBottom: 10 },
    headerSubtitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
    headerTitle: { fontSize: 32, fontWeight: '900', marginTop: 5 },
    wheelContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 30, height: 260 },
    glowCircle: { position: 'absolute', width: 260, height: 260, borderRadius: 130, shadowRadius: 50, shadowOpacity: 0.5, elevation: 20 },
    wheelWrapper: { width: 240, height: 240, borderRadius: 120, overflow: 'hidden', borderWidth: 2 },
    wheelImage: { width: '100%', height: '100%', opacity: 0.6 },
    wheelCenterContent: { position: 'absolute', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, shadowOpacity: 0.8, shadowRadius: 15, elevation: 15 },
    
    analysisCard: { marginHorizontal: 24, padding: 20, borderRadius: 28, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: 25 },
    analysisContent: { flex: 1 },
    primeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
    primeBadgeText: { fontSize: 10, fontWeight: '900', marginLeft: 4, textTransform: 'uppercase' },
    analysisTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    analysisDesc: { fontSize: 13, lineHeight: 18 },
    analysisBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },

    sectionTitle: { fontSize: 20, fontWeight: '800', marginVertical: 20, paddingHorizontal: 24, letterSpacing: 0.5 },
    planetsScroll: { paddingHorizontal: 24, paddingBottom: 20, gap: 15 },
    planetCard: { width: 145, borderRadius: 28, padding: 20, alignItems: 'center', borderWidth: 1 },
    planetIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
    planetName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    planetSign: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
    planetDegreeBox: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
    planetDegree: { fontSize: 11, fontWeight: '800' },
    planetHouse: { fontSize: 12, fontWeight: '700' },
    glassContainer: { marginHorizontal: 24, padding: 24, borderRadius: 32, borderWidth: 1 },
    houseRow: { borderBottomWidth: 1, paddingBottom: 16, marginBottom: 16 },
    houseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    houseTitle: { fontSize: 15, fontWeight: '800' },
    houseSign: { fontSize: 13, fontWeight: '700' },
    houseDesc: { fontSize: 13, lineHeight: 20 },
    aspectsContainer: { paddingHorizontal: 24, gap: 12 },
    aspectCard: { padding: 18, borderRadius: 20, borderWidth: 1, borderLeftWidth: 4 },
    aspectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    aspectTitle: { flex: 1, fontSize: 15, fontWeight: '700', marginLeft: 10 },
    aspectBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    aspectBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    aspectDesc: { fontSize: 13, lineHeight: 20, opacity: 0.9 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: height * 0.8, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 24, fontWeight: '900' },
    analysisTextContent: { paddingBottom: 40 },
    analysisBody: { fontSize: 16, lineHeight: 26 },
    detailBox: { marginTop: 25, padding: 20, borderRadius: 24 },
    detailTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 }
});