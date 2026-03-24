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

import { useNatalChart } from '../../hooks/useNatalChart';
import { useAppTheme } from '../../lib/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function NatalChartScreen() {
    const { colors, isPrime } = useAppTheme();

    const {
        planets,
        loading,
        analysis,
        fetchingAnalysis,
        loadAnalysis,
        loadFullAnalysis, // 🔥 შემოდის ახალი ფუნქცია
        isOffline
    } = useNatalChart();

    const [analysisModal, setAnalysisModal] = useState(false);
    const [selectedPlanetName, setSelectedPlanetName] = useState(''); 

    // ანიმაციები
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // 1. მუდმივი ანიმაციები (ტრიალი და პულსაცია)
    useEffect(() => {
        const spinLoop = Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 60000, useNativeDriver: true })
        );
        spinLoop.start();

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
            ])
        );
        pulseLoop.start();

        return () => {
            spinLoop.stop();
            pulseLoop.stop();
        };
    }, []);

    // 2. ლოადინგის დასრულების ანიმაცია (გამოჩენა)
    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]).start();
        }
    }, [loading, fadeAnim, slideAnim]);

    // 🔥 1. ფუნქცია პატარა პლანეტების ბარათებისთვის
    const handlePlanetPress = (planet: any) => {
        if (!isPrime) {
            router.push('/subscription');
            return;
        }

        setSelectedPlanetName(planet.name); 
        setAnalysisModal(true);
        loadAnalysis(null as any, null as any);
        loadAnalysis(planet.id, planet.sign); 
    };

    // 🔥 2. ფუნქცია მთავარი დიდი ბარათისთვის (სრული ანალიზი)
    const handleMainAnalysis = () => {
        if (!isPrime) {
            router.push('/subscription');
            return;
        }

        setSelectedPlanetName("სრული პერსონალური ანალიზი");
        setAnalysisModal(true);
        loadAnalysis(null as any, null as any);

        loadFullAnalysis(); // 👈 აქ ვიძახებთ გაერთიანების ფუნქციას
    };

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textMuted, marginTop: 15 }}>ვარსკვლავები ლაგდებიან...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            <Animated.ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent} 
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >

                {isOffline && (
                    <Text style={{ color: 'orange', textAlign: 'center', marginBottom: 10 }}>
                        Offline რეჟიმი
                    </Text>
                )}

                <View style={styles.header}>
                    <Text style={[styles.headerSubtitle, { color: colors.primary }]}>შენი კოსმოსური პასპორტი</Text>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>ნატალური რუკა</Text>
                </View>

                {/* 🎡 რუკა */}
                <View style={styles.wheelContainer}>
                    <View style={[styles.glowCircle, { backgroundColor: `${colors.primary}15`, shadowColor: colors.primary }]} />
                    <Animated.View style={[styles.wheelWrapper, { transform: [{ rotate: spin }], borderColor: colors.border }]}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1632768565778-4bfdb023ebce?q=80&w=800' }} 
                            style={styles.wheelImage} 
                            contentFit="cover" 
                        />
                        <LinearGradient colors={['transparent', colors.surface]} style={StyleSheet.absoluteFill} />
                    </Animated.View>
                    <Animated.View style={[styles.wheelCenterContent, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.primary, transform: [{ scale: pulseAnim }] }]}>
                        <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>მე</Text>
                    </Animated.View>
                </View>

                {/* 💎 მთავარი ანალიზი (გაერთიანებული) */}
                <TouchableOpacity 
                    style={[styles.analysisCard, { borderColor: isPrime ? colors.primary : '#FFD700', backgroundColor: colors.surface }]}
                    onPress={handleMainAnalysis}
                    activeOpacity={0.9}
                >
                    <LinearGradient colors={isPrime ? [`${colors.primary}20`, 'transparent'] : ['rgba(255,215,0,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
                    <View style={styles.analysisContent}>
                        <View style={[styles.primeBadge, { backgroundColor: isPrime ? colors.primary : '#FFD700' }]}>
                            <Ionicons name={isPrime ? "sparkles" : "lock-closed"} size={12} color={isPrime ? "#FFF" : "#000"} />
                            <Text style={[styles.primeBadgeText, { color: isPrime ? "#FFF" : "#000" }]}>
                                {isPrime ? "ანალიზი" : "PRIME"}
                            </Text>
                        </View>
                        <Text style={[styles.analysisTitle, { color: colors.textMain }]}>სრული პერსონალური ანალიზი</Text>
                        <Text style={[styles.analysisDesc, { color: colors.textMuted }]}>
                            ყველა პლანეტის გაერთიანებული განმარტება ერთ დიდ კოსმოსურ დასკვნაში.
                        </Text>
                    </View>
                    <View style={[styles.analysisBtn, { backgroundColor: isPrime ? colors.primary : '#FFD700' }]}>
                        <Ionicons name={isPrime ? "chevron-forward" : "lock-closed"} size={20} color={isPrime ? "#FFF" : "#000"} />
                    </View>
                </TouchableOpacity>

                {/* 🪐 პლანეტების Grid */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>პლანეტები და ნიშნები</Text>
                <View style={styles.planetsGrid}>
                    {planets?.map((planet, index) => (
                        <TouchableOpacity 
                            key={index} 
                            activeOpacity={0.7}
                            style={[styles.planetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => handlePlanetPress(planet)}
                        >
                            <View style={[styles.planetIconBg, { shadowColor: planet.color, shadowOpacity: 0.8, shadowRadius: 10, elevation: 10, borderColor: colors.border }]}>
                                <MaterialCommunityIcons name={planet.icon as any} size={28} color={planet.color} />
                            </View>
                            <Text style={[styles.planetName, { color: colors.textMain }]}>{planet.name}</Text>
                            <Text style={[styles.planetSign, { color: colors.textMuted }]}>{planet.sign}</Text>
                            <View style={[styles.planetDegreeBox, { backgroundColor: `${colors.primary}20` }]}>
                                <Text style={[styles.planetDegree, { color: colors.primary }]}>{planet.degree}</Text>
                            </View>
                            <Text style={[styles.planetHouse, { color: colors.textMuted }]}>{planet.house}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </Animated.ScrollView>

            {/* 📝 მოდალი (ამოტანილია ScrollView-ს გარეთ) */}
            <Modal visible={analysisModal} animationType="slide" transparent>
                <BlurView intensity={100} tint="dark" style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.primary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                                {selectedPlanetName || 'ანალიზი'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setAnalysisModal(false);
                                setSelectedPlanetName(''); // 👈 ვასუფთავებთ სახელს დახურვისას
                            }}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {fetchingAnalysis ? (
                                <View style={{ marginTop: 50, alignItems: 'center' }}>
                                    <ActivityIndicator color={colors.primary} size="large" />
                                    <Text style={{ color: colors.textMuted, marginTop: 10 }}>ინფორმაცია გროვდება...</Text>
                                </View>
                            ) : (
                                <View style={styles.analysisTextContent}>
                                    {analysis?.title && selectedPlanetName !== "სრული პერსონალური ანალიზი" && (
                                        <Text style={[styles.detailTitle, { color: colors.primary, marginBottom: 15 }]}>
                                            {analysis.title}
                                        </Text>
                                    )}
                                    <Text style={[styles.analysisBody, { color: colors.textMuted }]}>
                                        {analysis?.text_georgian || "ვარსკვლავური ანალიზი ამ პლანეტისთვის მუშავდება. გთხოვთ შეამოწმოთ მოგვიანებით!"}
                                    </Text>
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
    sectionTitle: { fontSize: 20, fontWeight: '800', marginVertical: 20, paddingHorizontal: 24 },
    planetsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 20 },
    planetCard: { width: (width - 48 - 15) / 2, borderRadius: 28, padding: 20, alignItems: 'center', borderWidth: 1, marginBottom: 15 },
    planetIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
    planetName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    planetSign: { fontSize: 14, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
    planetDegreeBox: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
    planetDegree: { fontSize: 11, fontWeight: '800' },
    planetHouse: { fontSize: 12, fontWeight: '700' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: height * 0.7, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 24, fontWeight: '900' },
    analysisTextContent: { paddingBottom: 40 },
    analysisBody: { fontSize: 16, lineHeight: 26 },
    detailTitle: { fontSize: 18, fontWeight: '800' }
});