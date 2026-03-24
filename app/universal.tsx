import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppTheme } from '../lib/ThemeContext';
// 🔥 შემოვიტანეთ PrimeLock კომპონენტი
import { PrimeLock } from '../components/PrimeLock';

const { width } = Dimensions.get('window');

// 🃏 1. 36 კარტის სასიყვარულო ბაზა
const SUITS = [
    { id: 'H', icon: '♥️', color: '#FF3B30', name: 'გული' },
    { id: 'D', icon: '♦️', color: '#FF3B30', name: 'აგური' },
    { id: 'C', icon: '♣️', color: '#1C1C1E', name: 'ჯვარი' },
    { id: 'S', icon: '♠️', color: '#1C1C1E', name: 'ყვავი' }
];

const RANKS = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// მნიშვნელობების გენერატორი თითოეული კარტისთვის
const getCardMeaning = (suit: string, rank: string) => {
    if (suit === 'H') { // გული
        if (rank === '6') return "რომანტიკული პაემანი და თქვენკენ მომავალი გზა.";
        if (rank === '7') return "სასიამოვნო ფლირტი და ილუზიები.";
        if (rank === '8') return "გულახდილი საუბარი და გრძნობების გაზიარება.";
        if (rank === '9') return "ნამდვილი, სუფთა და უანგარო სიყვარული.";
        if (rank === '10') return "ოჯახური იდილია, სერიოზული და სტაბილური გეგმები.";
        if (rank === 'J') return "სასიყვარულო საზრუნავი და ფიქრები თქვენზე.";
        if (rank === 'Q') return "ძლიერი ქალის ფიგურა (შეიძლება იყოს თავად მკითხავი).";
        if (rank === 'K') return "შეყვარებული მამაკაცი, რომელიც გრძნობებს არ მალავს.";
        if (rank === 'A') return "უდიდესი ვნება, ახალი სასიყვარულო თავგადასავალი.";
    }
    if (suit === 'D') { // აგური
        if (rank === '6') return "მხიარული, მაგრამ არასერიოზული შეხვედრა.";
        if (rank === '7') return "მცირე ეჭვიანობა და ინტერესის გამოჩენა.";
        if (rank === '8') return "საერთო ინტერესები, უფრო მეგობრული დამოკიდებულება.";
        if (rank === '9') return "ძლიერი სიმპათია, რომელიც სიყვარულში შეიძლება გადაიზარდოს.";
        if (rank === '10') return "ფინანსური ან პრაგმატული ინტერესი ურთიერთობაში.";
        if (rank === 'J') return "მერყეობა. ვერ გადაუწყვეტია რა სურს რეალურად.";
        if (rank === 'Q') return "ახალგაზრდა, დაუქორწინებელი გოგოს გავლენა.";
        if (rank === 'K') return "სანდო მეგობარი ან სტაბილური ახალგაზრდა კაცი.";
        if (rank === 'A') return "მნიშვნელოვანი სასიხარულო სიახლე ან წერილი.";
    }
    if (suit === 'C') { // ჯვარი
        if (rank === '6') return "საქმიანი შეხვედრა, სიყვარულისთვის ნაკლებად სცალია.";
        if (rank === '7') return "აზრთა სხვადასხვაობა და მცირე კამათი.";
        if (rank === '8') return "სერიოზული და საქმიანი დამოკიდებულება თქვენს მიმართ.";
        if (rank === '9') return "ძლიერი მიჯაჭვულობა, მაგრამ რაღაც გარემოება უშლის ხელს.";
        if (rank === '10') return "ცვლილებები უკეთესობისკენ, სერიოზული ნაბიჯები.";
        if (rank === 'J') return "საკუთარი პრობლემებითაა დაკავებული.";
        if (rank === 'Q') return "კოლეგის ან მეგობარი ქალის ჩარევა ურთიერთობაში.";
        if (rank === 'K') return "სოლიდური, ასაკოვანი ან დაოჯახებული მამაკაცი.";
        if (rank === 'A') return "სტაბილურობა ურთიერთობაში, მაგრამ რომანტიკის ნაკლებობა.";
    }
    if (suit === 'S') { // ყვავი
        if (rank === '6') return "შორი გზა. შეიძლება დროებით მოგიწიოთ დაშორება.";
        if (rank === '7') return "ბრაზი, კონფლიქტი და უკმაყოფილება.";
        if (rank === '8') return "იმედგაცრუება, მძიმე საუბარი და სევდა.";
        if (rank === '9') return "დიდი დარდი, ავადმყოფობა ან ემოციური ტკივილი.";
        if (rank === '10') return "ჩაშლილი გეგმები და ინტერესის დაკარგვა.";
        if (rank === 'J') return "ფუჭი იმედები, ცრუ დაპირებები და ილუზიები.";
        if (rank === 'Q') return "ბოროტი ენა, ჭორიკანა ან მეტოქე ქალი.";
        if (rank === 'K') return "მკაცრი და ეგოისტი ადამიანი.";
        if (rank === 'A') return "ძლიერი ფიზიკური ლტოლვა ან სერიოზული დარტყმა (კონტექსტის მიხედვით).";
    }
    return "";
};

// 36 კარტის დაგენერირება
const generateDeck = () => {
    let deck: any[] = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            deck.push({
                id: `${rank}${suit.id}`,
                rank: rank,
                suitIcon: suit.icon,
                color: suit.color,
                meaning: getCardMeaning(suit.id, rank)
            });
        });
    });
    // არევა (Shuffle)
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

export default function ThreeCardScreen() {
    const { colors, isPrime } = useAppTheme(); // 🔥 ამოვიღეთ isPrime

    const [deck, setDeck] = useState<any[]>([]);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        setDeck(generateDeck());
    }, []);

    const handleCardPress = (index: number) => {
        if (isFinished) return;
        if (selectedIndexes.includes(index)) return; // უკვე არჩეულს ვეღარ დააჭერს

        const newSelection = [...selectedIndexes, index];
        setSelectedIndexes(newSelection);

        // თუ მესამე კარტი აირჩია, ვასრულებთ თამაშს
        if (newSelection.length === 3) {
            setTimeout(() => {
                setIsFinished(true);
            }, 400); // ოდნავ დაყოვნება, რომ ანიმაცია გამოჩნდეს
        }
    };

    const resetGame = () => {
        setSelectedIndexes([]);
        setIsFinished(false);
        setDeck(generateDeck()); // თავიდან ვურევთ
    };

    // ეტაპების ტექსტები
    const POSITION_TITLES = [
        "რა სურს ახლა:",
        "უახლოეს მომავალში:",
        "შორეულ პერსპექტივაში:"
    ];

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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>რა უნდა ჩემგან?</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {!isFinished ? (
                    <>
                        <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                            <Ionicons name="albums-outline" size={28} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.infoText, { color: colors.textMain }]}>
                                ჩაიფიქრეთ საყვარელი ადამიანი და აირჩიეთ <Text style={{fontWeight: '800', color: colors.primary}}>3 კარტი</Text>, რათა გაიგოთ რას გრძნობს და რა გეგმები აქვს თქვენთან მიმართებაში.
                            </Text>
                        </View>

                        <Text style={[styles.counterText, { color: colors.textMuted }]}>
                            არჩეულია: <Text style={{ color: colors.primary }}>{selectedIndexes.length} / 3</Text>
                        </Text>

                        {/* 36 კარტის ბადე (6 სვეტი, 6 რიგი) */}
                        <View style={styles.gridContainer}>
                            {deck.map((card, index) => {
                                const isSelected = selectedIndexes.includes(index);
                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={[
                                            styles.miniCard, 
                                            { 
                                                backgroundColor: isSelected ? colors.surface : colors.primary,
                                                borderColor: isSelected ? card.color : 'transparent',
                                                borderStyle: isSelected ? 'solid' : 'solid',
                                                borderWidth: isSelected ? 1 : 0
                                            }
                                        ]}
                                        onPress={() => handleCardPress(index)}
                                        activeOpacity={0.7}
                                    >
                                        {isSelected ? (
                                            <>
                                                <Text style={[styles.miniRank, { color: card.color }]}>{card.rank}</Text>
                                                <Text style={styles.miniSuit}>{card.suitIcon}</Text>
                                            </>
                                        ) : (
                                            <Ionicons name="star" size={12} color="rgba(255,255,255,0.4)" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                ) : (
                    <View style={styles.resultsSection}>
                        <Text style={[styles.resultsMainTitle, { color: colors.textMain }]}>მკითხაობის შედეგი</Text>

                        {selectedIndexes.map((deckIndex, i) => {
                            const card = deck[deckIndex];
                            return (
                                <View key={i} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={[styles.positionTitle, { color: colors.textMuted }]}>
                                        {POSITION_TITLES[i]}
                                    </Text>
                                    
                                    <View style={styles.cardInfoRow}>
                                        <View style={[styles.playingCard, { borderColor: card.color }]}>
                                            <Text style={[styles.cardRank, { color: card.color }]}>{card.rank}</Text>
                                            <Text style={styles.cardSuit}>{card.suitIcon}</Text>
                                        </View>
                                        
                                        {/* 🔥 აქ ჩავსვით დაბლოკვის ლოგიკა განმარტებაზე */}
                                        <View style={{ flex: 1, minHeight: 60, overflow: 'hidden' }}>
                                            <Text style={[styles.cardMeaning, { color: colors.textMain }]}>
                                                {card.meaning}
                                            </Text>

                                            {!isPrime && (
                                                <PrimeLock title="განმარტება დაბლოკილია" />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        <TouchableOpacity 
                            style={[styles.resetBtn, { backgroundColor: colors.primary }]} 
                            onPress={resetGame}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.resetBtnText}>თავიდან მკითხაობა</Text>
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
    
    infoBox: { flexDirection: 'row', padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 15, alignItems: 'center' },
    infoText: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' },
    
    counterText: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase' },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
    miniCard: { width: (width - 48 - 40) / 6, height: 65, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    miniRank: { fontSize: 16, fontWeight: '900' },
    miniSuit: { fontSize: 14 },

    resultsSection: { width: '100%' },
    resultsMainTitle: { fontSize: 24, fontWeight: '900', marginBottom: 25, textAlign: 'center' },

    resultCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
    positionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 15 },
    
    cardInfoRow: { flexDirection: 'row', alignItems: 'center' },
    playingCard: { width: 60, height: 85, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardRank: { fontSize: 24, fontWeight: '900', marginTop: 5 },
    cardSuit: { fontSize: 28, marginBottom: 5 },
    
    cardMeaning: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '600' },

    resetBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    resetBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});