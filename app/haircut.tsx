import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppTheme } from '../lib/ThemeContext';

const { width } = Dimensions.get('window');

// 🔴 თმის შეჭრის მიზნები
const GOALS = [
    { id: 'growth', title: 'სწრაფი ზრდა', icon: 'trending-up', desc: 'მოითხოვს მზარდ მთვარეს' },
    { id: 'strength', title: 'ძირების გამაგრება', icon: 'leaf', desc: 'მოითხოვს კლებად მთვარეს' },
    { id: 'energy', title: 'რადიკალური ცვლილება', icon: 'sparkles', desc: 'სავსემთვარეობის ენერგია' }
];

// 🔴 მთვარის ფაზების სიმულაცია მომდევნო 7 დღისთვის (შემდეგში API-თ ჩაანაცვლებ)
const MOON_PHASES = [
    { phase: 'waxing', name: 'მზარდი მთვარე', icon: 'moon' },
    { phase: 'waxing', name: 'მზარდი მთვარე', icon: 'moon' },
    { phase: 'full', name: 'სავსემთვარეობა', icon: 'ellipse' },
    { phase: 'waning', name: 'კლებადი მთვარე', icon: 'moon-outline' },
    { phase: 'waning', name: 'კლებადი მთვარე', icon: 'moon-outline' },
    { phase: 'waning', name: 'კლებადი მთვარე', icon: 'moon-outline' },
    { phase: 'new', name: 'ახალი მთვარე', icon: 'radio-button-off' },
];

export default function HaircutCalendarScreen() {
    const { colors } = useAppTheme();
    const [selectedGoal, setSelectedGoal] = useState<string>('growth');
    const [weekForecast, setWeekForecast] = useState<any[]>([]);

    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // მთვარის პულსაციის ანიმაცია
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
                Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
            ])
        ).start();

        generateForecast();
    }, [selectedGoal]);

    // 🔴 7 დღის პროგნოზის გენერატორი არჩეული მიზნის მიხედვით
    const generateForecast = () => {
        const today = new Date();
        const forecast = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const phaseInfo = MOON_PHASES[i];

            let status = 'neutral';
            let message = 'ნეიტრალური დღეა. შეგიძლიათ შეიჭრათ, მაგრამ განსაკუთრებულ ეფექტს არ მოგცემთ.';

            // ლოგიკა მიზნების მიხედვით
            if (selectedGoal === 'growth') {
                if (phaseInfo.phase === 'waxing') { status = 'good'; message = 'იდეალური დღეა! თმა გაიზრდება სწრაფად და ჯანსაღად.'; }
                if (phaseInfo.phase === 'waning' || phaseInfo.phase === 'new') { status = 'bad'; message = 'თავი შეიკავეთ! თმის ზრდა საგრძნობლად შენელდება.'; }
            } else if (selectedGoal === 'strength') {
                if (phaseInfo.phase === 'waning') { status = 'good'; message = 'საუკეთესო დროა. თმის ძირები გამაგრდება და ცვენა შემცირდება.'; }
                if (phaseInfo.phase === 'waxing') { status = 'bad'; message = 'არ არის რეკომენდებული. ფოკუსი ზრდაზე გადავა და არა სიძლიერეზე.'; }
            } else if (selectedGoal === 'energy') {
                if (phaseInfo.phase === 'full') { status = 'good'; message = 'სრულყოფილია იმიჯის რადიკალური ცვლილებისთვის და ნეგატივის მოსაშორებლად.'; }
                if (phaseInfo.phase === 'new') { status = 'bad'; message = 'ენერგია ნულზეა. თმის შეჭრამ შეიძლება სისუსტე გამოიწვიოს.'; }
            }

            forecast.push({
                date: date.toLocaleDateString('ka-GE', { weekday: 'short', day: 'numeric', month: 'short' }),
                isToday: i === 0,
                phaseInfo,
                status,
                message
            });
        }
        setWeekForecast(forecast);
    };

    const getStatusColor = (status: string) => {
        if (status === 'good') return colors.status?.success || '#10B981';
        if (status === 'bad') return colors.status?.error || '#FF4B72';
        return colors.textMuted;
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>თმის კალენდარი</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 🔴 მიზნის ამორჩევის სექცია */}
                <View style={styles.goalSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>რა არის თქვენი მიზანი?</Text>
                    <Text style={[styles.sectionSub, { color: colors.textMuted }]}>აირჩიეთ მიზანი და მიიღეთ 1 კვირის ინდივიდუალური პროგნოზი</Text>
                    
                    <View style={styles.goalsWrapper}>
                        {GOALS.map((goal) => {
                            const isSelected = selectedGoal === goal.id;
                            return (
                                <TouchableOpacity 
                                    key={goal.id} 
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedGoal(goal.id)}
                                    style={[
                                        styles.goalCard, 
                                        { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
                                        isSelected && { shadowColor: colors.primary, elevation: 10, shadowOpacity: 0.3, shadowRadius: 10 }
                                    ]}
                                >
                                    <View style={[styles.goalIcon, { backgroundColor: isSelected ? colors.primary : `${colors.primary}15` }]}>
                                        <Ionicons name={goal.icon as any} size={20} color={isSelected ? '#FFF' : colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.goalTitle, { color: isSelected ? colors.primary : colors.textMain }]}>{goal.title}</Text>
                                        <Text style={[styles.goalDesc, { color: colors.textMuted }]}>{goal.desc}</Text>
                                    </View>
                                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* 🔴 მთვარის ვიზუალიზაცია (დღევანდელი დღე) */}
                <View style={styles.moonContainer}>
                    <Animated.View style={[styles.moonGlow, { 
                        backgroundColor: `${colors.primary}30`,
                        transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] 
                    }]} />
                    <View style={[styles.moonCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="moon" size={60} color="#FFD700" />
                    </View>
                    <Text style={[styles.moonPhaseText, { color: colors.textMain }]}>დღეს: {MOON_PHASES[0].name}</Text>
                </View>

                {/* 🔴 7 დღის პროგნოზი */}
                <Text style={[styles.sectionTitle, { color: colors.textMain, paddingHorizontal: 24 }]}>კვირის პროგნოზი</Text>
                
                <View style={styles.forecastList}>
                    {weekForecast.map((day, index) => (
                        <View key={index} style={[styles.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            
                            {/* თარიღი და ფაზა */}
                            <View style={styles.dayHeader}>
                                <View style={styles.dateRow}>
                                    <Text style={[styles.dateText, { color: colors.textMain }]}>{day.date}</Text>
                                    {day.isToday && <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}><Text style={styles.todayText}>დღეს</Text></View>}
                                </View>
                                <View style={styles.phaseRow}>
                                    <Ionicons name={day.phaseInfo.icon as any} size={14} color={colors.textMuted} />
                                    <Text style={[styles.phaseName, { color: colors.textMuted }]}>{day.phaseInfo.name}</Text>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            {/* სტატუსი და რჩევა */}
                            <View style={styles.dayBody}>
                                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(day.status) }]} />
                                <Text style={[styles.dayMessage, { color: colors.textMain }]}>{day.message}</Text>
                            </View>
                            
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    
    scrollContent: { paddingBottom: 50 },
    
    goalSection: { paddingHorizontal: 24, paddingTop: 10, marginBottom: 30 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
    sectionSub: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
    
    goalsWrapper: { gap: 12 },
    goalCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1.5 },
    goalIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    goalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    goalDesc: { fontSize: 12 },

    moonContainer: { alignItems: 'center', justifyContent: 'center', height: 220, marginBottom: 20 },
    moonGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
    moonCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 15 },
    moonPhaseText: { fontSize: 16, fontWeight: '700', letterSpacing: 1 },

    forecastList: { paddingHorizontal: 24, marginTop: 15, gap: 15 },
    dayCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dateText: { fontSize: 16, fontWeight: '800' },
    todayBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    todayText: { color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    phaseName: { fontSize: 12, fontWeight: '600' },
    
    divider: { height: 1, width: '100%', marginBottom: 15, opacity: 0.5 },
    
    dayBody: { flexDirection: 'row', alignItems: 'flex-start' },
    statusIndicator: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
    dayMessage: { flex: 1, fontSize: 14, lineHeight: 22, fontWeight: '500' }
});