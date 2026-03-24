import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { supabase } from '../lib/supabase';
import { useAppTheme } from '../lib/ThemeContext';
// 🔥 შემოვიტანეთ PrimeLock კომპონენტი
import { PrimeLock } from '../components/PrimeLock';

const { width } = Dimensions.get('window');

export default function SpreadEnergyScreen() {
    const { colors, isPrime } = useAppTheme(); // 🔥 დავამატეთ isPrime-ის ამოღება

    const [isRevealed, setIsRevealed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [card, setCard] = useState<any>(null);

    const handleReveal = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const { data, error } = await supabase.from('tarot_cards').select('*');
            if (data && data.length > 0) {
                const randomCard = data[Math.floor(Math.random() * data.length)];
                setCard(randomCard);
                setIsRevealed(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetSpread = () => {
        setIsRevealed(false);
        setCard(null);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
            <View style={[styles.topGlow, { backgroundColor: `${colors.primary}15` }]} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>დღის ენერგია</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isRevealed ? (
                    <View style={styles.selectionSection}>
                        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                            <Ionicons name="sunny" size={28} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.infoText, { color: colors.textMain }]}>
                                გაიგეთ, რა იქნება დღევანდელი დღის მთავარი თემა და ენერგია. ამოიღეთ <Text style={{fontWeight: '800', color: colors.primary}}>1 ბარათი</Text>.
                            </Text>
                        </View>

                        <View style={styles.slotWrapper}>
                            <View style={[styles.cardSlot, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Ionicons name="sparkles-outline" size={40} color={colors.border} />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.deckContainer, { borderColor: colors.border }]} 
                            activeOpacity={0.8}
                            onPress={handleReveal}
                        >
                            <LinearGradient colors={[`${colors.primary}40`, colors.primary]} style={styles.deckBg} />
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="layers" size={48} color="#FFF" />
                                    <Text style={styles.deckText}>ბარათის ამოღება</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.resultsSection}>
                        <Text style={[styles.resultsMainTitle, { color: colors.textMain }]}>თქვენი დღის ნიშანი</Text>

                        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Image 
                                source={{ uri: card?.image_url || 'https://images.unsplash.com/photo-1607581179836-81e0507fb083?q=80&w=600&auto=format&fit=crop' }} 
                                style={styles.fullCardImage}
                                contentFit="cover"
                                cachePolicy="disk"
                            />
                            
                            <View style={styles.cardInfo}>
                                <Text style={[styles.cardName, { color: colors.textMain }]}>{card?.name}</Text>
                                <Text style={[styles.cardSuit, { color: colors.primary }]}>{card?.arcana === 'Major' ? 'დიდი არკანი' : card?.suit}</Text>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                
                                {/* 🔥 აქ დავამატეთ PrimeLock-ის ლოგიკა განმარტების ტექსტზე */}
                                <View style={{ position: 'relative', minHeight: 120, overflow: 'hidden' }}>
                                    <Text style={[styles.cardMeaning, { color: colors.textMain }]}>
                                        {card?.meaning_upright}
                                    </Text>

                                    {!isPrime && (
                                        <PrimeLock title="განმარტება დაბლოკილია" />
                                    )}
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.resetBtn, { borderColor: colors.primary }]} 
                            onPress={resetSpread}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="refresh" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.resetBtnText, { color: colors.primary }]}>სცადეთ თავიდან</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topGlow: { position: 'absolute', top: -50, alignSelf: 'center', width: width * 0.9, height: 250, borderRadius: 150 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 24, paddingBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    
    scrollContent: { paddingHorizontal: 24, paddingBottom: 50, paddingTop: 10 },
    
    selectionSection: { width: '100%', alignItems: 'center' },
    infoBox: { flexDirection: 'row', padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 30, alignItems: 'center' },
    infoText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },

    slotWrapper: { marginBottom: 40, width: 140, alignItems: 'center' },
    cardSlot: { width: '100%', height: 200, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },

    deckContainer: { width: 160, height: 100, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    deckBg: { ...StyleSheet.absoluteFillObject, opacity: 0.9 },
    deckText: { color: '#FFF', fontSize: 14, fontWeight: '800', marginTop: 8 },

    resultsSection: { width: '100%', alignItems: 'center' },
    resultsMainTitle: { fontSize: 24, fontWeight: '900', marginBottom: 25 },

    resultCard: { width: '100%', borderRadius: 28, borderWidth: 1, overflow: 'hidden', marginBottom: 30 },
    fullCardImage: { width: '100%', height: 350 },
    cardInfo: { padding: 24 },
    cardName: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
    cardSuit: { fontSize: 14, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase' },
    divider: { height: 1, width: '100%', marginBottom: 15, opacity: 0.5 },
    cardMeaning: { fontSize: 15, lineHeight: 24, fontWeight: '500' },

    resetBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    resetBtnText: { fontSize: 16, fontWeight: '800' }
});