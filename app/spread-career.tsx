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

const { width } = Dimensions.get('window');

const POSITIONS = [
    { title: "სტატუსი", desc: "თქვენი ამჟამინდელი მდგომარეობა სამსახურში ან ბიზნესში" },
    { title: "დაბრკოლება", desc: "რა გიშლით ხელს წინსვლაში ან რა არის მთავარი გამოწვევა" },
    { title: "რჩევა", desc: "რა ნაბიჯები უნდა გადადგათ წარმატების მისაღწევად" },
    { title: "შედეგი", desc: "პოტენციური ფინანსური ან პროფესიული შედეგი" }
];

export default function SpreadCareerScreen() {
    const { colors } = useAppTheme();

    const [pickedCount, setPickedCount] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleDrawCard = () => {
        if (pickedCount < 4) {
            setPickedCount(prev => prev + 1);
        }
    };

    const handleReveal = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const { data, error } = await supabase.from('tarot_cards').select('*');
            if (data && data.length >= 4) {
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                setResults(shuffled.slice(0, 4));
                setIsRevealed(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetSpread = () => {
        setPickedCount(0);
        setIsRevealed(false);
        setResults([]);
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>კარიერა</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isRevealed ? (
                    <View style={styles.selectionSection}>
                        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                            <Ionicons name="briefcase" size={28} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.infoText, { color: colors.textMain }]}>
                                კონცენტრირდით სამსახურზე ან ფინანსურ საკითხზე და ამოიღეთ <Text style={{fontWeight: '800', color: colors.primary}}>4 კარტი</Text>.
                            </Text>
                        </View>

                        <View style={styles.slotsContainer}>
                            {[0, 1, 2, 3].map((index) => {
                                const isFilled = pickedCount > index;
                                return (
                                    <View key={index} style={styles.slotWrapper}>
                                        <Text style={[styles.slotTitle, { color: colors.textMuted }]}>{POSITIONS[index].title}</Text>
                                        <View style={[
                                            styles.cardSlot, 
                                            { 
                                                backgroundColor: isFilled ? colors.primary : colors.surface,
                                                borderColor: isFilled ? colors.primary : colors.border,
                                                borderStyle: isFilled ? 'solid' : 'dashed'
                                            }
                                        ]}>
                                            {isFilled ? (
                                                <Ionicons name="star" size={24} color="rgba(255,255,255,0.5)" />
                                            ) : (
                                                <Text style={[styles.slotNumber, { color: colors.textMuted }]}>{index + 1}</Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {pickedCount < 4 ? (
                            <TouchableOpacity 
                                style={[styles.deckContainer, { borderColor: colors.border }]} 
                                activeOpacity={0.8}
                                onPress={handleDrawCard}
                            >
                                <LinearGradient colors={[`${colors.primary}40`, colors.primary]} style={styles.deckBg} />
                                <Ionicons name="layers" size={48} color="#FFF" />
                                <Text style={styles.deckText}>დააჭირეთ ამოსაღებად ({pickedCount}/4)</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.revealBtn, { backgroundColor: colors.primary }]} 
                                onPress={handleReveal}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.revealBtnText}>კარტების გახსნა</Text>
                                        <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.resultsSection}>
                        <Text style={[styles.resultsMainTitle, { color: colors.textMain }]}>გაშლის შედეგი</Text>

                        {results.map((card, index) => (
                            <View key={index} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.positionHeader}>
                                    <View style={[styles.positionBadge, { backgroundColor: `${colors.primary}20` }]}>
                                        <Text style={[styles.positionBadgeText, { color: colors.primary }]}>{POSITIONS[index].title}</Text>
                                    </View>
                                    <Text style={[styles.positionDesc, { color: colors.textMuted }]}>{POSITIONS[index].desc}</Text>
                                </View>

                                <View style={styles.cardContentRow}>
                                    <Image 
                                        source={{ uri: card.image_url || 'https://images.unsplash.com/photo-1607581179836-81e0507fb083?q=80&w=600&auto=format&fit=crop' }} 
                                        style={styles.realCardImage}
                                        contentFit="cover"
                                    />
                                    
                                    <View style={styles.cardTextContent}>
                                        <Text style={[styles.cardName, { color: colors.textMain }]}>{card.name}</Text>
                                        <Text style={[styles.cardSuit, { color: colors.textMuted }]}>{card.arcana === 'Major' ? 'დიდი არკანი' : `მცირე არკანი • ${card.suit}`}</Text>
                                        <ScrollView style={styles.meaningScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                            <Text style={[styles.cardMeaning, { color: colors.textMain }]}>
                                                {card.meaning_upright}
                                            </Text>
                                        </ScrollView>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity 
                            style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                            onPress={resetSpread}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.resetBtnText, { color: colors.primary }]}>თავიდან გაშლა</Text>
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
    infoBox: { flexDirection: 'row', padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 25, alignItems: 'center' },
    infoText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },

    slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: 30 },
    slotWrapper: { alignItems: 'center', width: '45%', marginHorizontal: '2%', marginBottom: 20 },
    slotTitle: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' },
    cardSlot: { width: '100%', height: 130, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    slotNumber: { fontSize: 24, fontWeight: '900', opacity: 0.3 },

    deckContainer: { width: 140, height: 180, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    deckBg: { ...StyleSheet.absoluteFillObject, opacity: 0.9 },
    deckText: { color: '#FFF', fontSize: 12, fontWeight: '800', marginTop: 12, textAlign: 'center', paddingHorizontal: 10 },

    revealBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    revealBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    resultsSection: { width: '100%' },
    resultsMainTitle: { fontSize: 24, fontWeight: '900', marginBottom: 25, textAlign: 'center' },

    resultCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
    positionHeader: { marginBottom: 15 },
    positionBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 8 },
    positionBadgeText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
    positionDesc: { fontSize: 12, fontWeight: '600' },
    
    cardContentRow: { flexDirection: 'row', height: 160 },
    realCardImage: { width: 100, height: '100%', borderRadius: 12, marginRight: 15 },
    cardTextContent: { flex: 1 },
    cardName: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
    cardSuit: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
    meaningScroll: { flex: 1 },
    cardMeaning: { fontSize: 13, lineHeight: 20, fontWeight: '500' },

    resetBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    resetBtnText: { fontSize: 16, fontWeight: '800' }
});