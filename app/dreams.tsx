import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
    View,
} from 'react-native';
import { useAppTheme } from '../lib/ThemeContext';
// შემოვიტანეთ ბაზა
import { FULL_DREAM_DICTIONARY } from '../lib/dreamData';

const { width, height } = Dimensions.get('window');

// 🔴 1. ვუწერთ ტიპს (TypeScript-მა რომ აღარ გააწითლოს)
interface DreamItem {
    word: string;
    meaning: string;
}

const ALPHABET = [
    'ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ', 'თ', 'ი', 'კ', 'ლ', 'მ', 'ნ', 'ო',
    'პ', 'ჟ', 'რ', 'ს', 'ტ', 'უ', 'ფ', 'ქ', 'ღ', 'ყ', 'შ', 'ჩ', 'ც', 'ძ',
    'წ', 'ჭ', 'ხ', 'ჯ', 'ჰ'
];

// 🔴 2. ვეუბნებით კოდს, რომ ეს არის DreamItem-ების მასივი
const DREAM_DICTIONARY = FULL_DREAM_DICTIONARY as DreamItem[];

// პოპულარული სიტყვები (სქრინიდან)
const POPULAR_WORDS = [
    'გველი', 'ორსულობა', 'ცოცხალი ადამიანი, როგორც გარდაცვლილი', 'ოქრო',
    'კბილები', 'ძაღლი', 'კბილების ცვენა', 'ფეხსაცმელი', 'ავტომობილი', 'ორსული ქალი',
    'ტილი', 'ბებია', 'ჭამა', 'ქორწინება', 'ბრძოლა', 'თეთრეული', 'თაიგული', 'საკურთხეველი',
    'შარვალი', 'ნაპირი', 'თეთრი კატა', 'ხარი', 'სროლა', 'ავარია', 'ანბანი', 'ზვიგენი',
    'სარკე', 'ყურძენი', 'სუფრა', 'მიწა'
];

export default function DreamsScreen() {
    const { colors } = useAppTheme();

    const [selectedLetter, setSelectedLetter] = useState<string>('ა');
    // 🔴 3. აქაც ვუთითებთ ტიპს
    const [selectedDream, setSelectedDream] = useState<DreamItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const scrollViewRef = useRef<ScrollView>(null);
    const [wordsSectionY, setWordsSectionY] = useState<number>(0);

    // ფილტრაციის ლოგიკა
    const getFilteredWords = (): DreamItem[] => {
        if (searchQuery.trim().length > 0) {
            // 🔴 4. item-ს ვუწერთ : DreamItem
            return DREAM_DICTIONARY.filter((item: DreamItem) => 
                item.word.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return DREAM_DICTIONARY.filter((item: DreamItem) => item.word.startsWith(selectedLetter));
    };

    const displayWords = getFilteredWords();

    const handleWordClick = (word: string) => {
        // 🔴 5. d-ს ვუწერთ : DreamItem
        const dreamObj = DREAM_DICTIONARY.find((d: DreamItem) => d.word === word) || { 
            word, 
            meaning: 'ამ სიზმრის დეტალური განმარტება მალე დაემატება ბაზაში.' 
        };
        setSelectedDream(dreamObj);
    };

    const handleLetterPress = (letter: string) => {
        setSelectedLetter(letter);
        if (scrollViewRef.current && wordsSectionY > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: wordsSectionY - 20, animated: true });
            }, 100);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>სიზმრების ახსნა</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textMain }]}
                        placeholder="ძებნა სიტყვით..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.mainScroll}
            >
                
                {searchQuery.trim().length === 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ანბანის მიხედვით</Text>
                        <View style={styles.alphabetWrapper}>
                            {ALPHABET.map((letter) => {
                                const isActive = selectedLetter === letter;
                                return (
                                    <TouchableOpacity
                                        key={letter}
                                        style={[
                                            styles.letterGridBtn,
                                            isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                                            !isActive && { backgroundColor: colors.surface, borderColor: colors.border }
                                        ]}
                                        onPress={() => handleLetterPress(letter)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.letterText,
                                            { color: isActive ? '#FFF' : colors.textMuted }
                                        ]}>
                                            {letter}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 25 }]}>პოპულარული</Text>
                        <View style={styles.tagsContainer}>
                            {POPULAR_WORDS.map((word, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={[styles.tagBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => handleWordClick(word)}
                                >
                                    <Text style={[styles.tagText, { color: colors.textMain }]}>{word}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* ნაპოვნი/არჩეული ასოს სიტყვების სია */}
                {(searchQuery.length > 0 || displayWords.length > 0 || searchQuery.trim().length === 0) && (
                    <View 
                        style={styles.wordsList}
                        onLayout={(event) => setWordsSectionY(event.nativeEvent.layout.y)} 
                    >
                        {searchQuery.length > 0 && <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ძიების შედეგები:</Text>}
                        {searchQuery.length === 0 && <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>სიტყვები ასოზე: "{selectedLetter}"</Text>}
                        
                        {displayWords.length > 0 ? (
                            // 🔴 6. აქაც ვუთითებთ ტიპებს (item: DreamItem, index: number)
                            displayWords.map((item: DreamItem, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedDream(item)}
                                >
                                    <View style={[styles.wordIconBox, { backgroundColor: `${colors.primary}15` }]}>
                                        <Ionicons name="moon" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.wordText, { color: colors.textMain }]}>{item.word}</Text>
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="search" size={48} color={colors.border} style={{ marginBottom: 15 }} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                    ამ ასოზე სიტყვები ჯერ არ არის დამატებული.
                                </Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>

            {/* განმარტების მოდალი */}
            <Modal visible={!!selectedDream} animationType="fade" transparent>
                <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.primary }]}>

                        <View style={[styles.modalGlow, { shadowColor: colors.primary }]} />

                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIconBox, { backgroundColor: `${colors.primary}20` }]}>
                                <Ionicons name="book" size={28} color={colors.primary} />
                            </View>
                            <TouchableOpacity onPress={() => setSelectedDream(null)} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
                                <Ionicons name="close" size={24} color={colors.textMain} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalWordTitle, { color: colors.textMain }]}>
                                {selectedDream?.word}
                            </Text>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <Text style={[styles.modalMeaning, { color: colors.textMuted }]}>
                                {selectedDream?.meaning}
                            </Text>
                        </ScrollView>

                    </View>
                </BlurView>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },

    searchContainer: { paddingHorizontal: 24, marginBottom: 20 },
    searchBox: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
    clearBtn: { padding: 5 },

    mainScroll: { paddingBottom: 50 },
    sectionTitle: { fontSize: 16, fontWeight: '800', paddingHorizontal: 24, marginBottom: 15, textTransform: 'uppercase' },

    alphabetWrapper: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 8, justifyContent: 'flex-start' },
    letterGridBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    letterText: { fontSize: 16, fontWeight: '800' },

    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 10 },
    tagBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
    tagText: { fontSize: 14, fontWeight: '600' },

    wordsList: { paddingHorizontal: 24, paddingTop: 30 },
    wordCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
    wordIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    wordText: { flex: 1, fontSize: 16, fontWeight: '700' },

    emptyState: { alignItems: 'center', marginTop: 40, paddingHorizontal: 40, paddingBottom: 40 },
    emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 24, fontWeight: '600' },

    modalOverlay: { flex: 1, justifyContent: 'center', padding: 24 },
    modalContent: { maxHeight: height * 0.7, borderRadius: 32, padding: 24, borderWidth: 1, overflow: 'hidden' },
    modalGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 50, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    modalIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    modalWordTitle: { fontSize: 28, fontWeight: '900', marginBottom: 15 },
    divider: { height: 1, width: '100%', marginBottom: 20 },
    modalMeaning: { fontSize: 16, lineHeight: 28, fontWeight: '500' },
});