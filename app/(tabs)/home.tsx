import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/ThemeContext';

const { width, height } = Dimensions.get('window');

// 🔴 ანდროიდზე ანიმაციისთვის საჭიროა ეს ხაზი (აკორდეონის ჩამოშლისთვის)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 🔴 5 კატეგორია პროგნოზებისთვის
const getForecastTopics = (colors: any) => [
    { id: 'love', title: 'სიყვარული', icon: 'heart', color: colors.status?.error || '#FF3366' },
    { id: 'career', title: 'კარიერა', icon: 'briefcase', color: colors.primary },
    { id: 'health', title: 'ჯანმრთელობა', icon: 'fitness', color: colors.status?.success || '#10B981' },
    { id: 'finance', title: 'ფინანსები', icon: 'wallet', color: '#F59E0B' },
    { id: 'sexual', title: 'სექსუალური', icon: 'flame', color: '#EC4899' },
];

export default function HomeScreen() {
    const { colors } = useAppTheme(); 
    const FORECAST_TOPICS = getForecastTopics(colors);

    const [userData, setUserData] = useState<any>(null);
    const [horoscope, setHoroscope] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // 🔴 ახალი სთეითები პროგნოზებისთვის
    const [forecastType, setForecastType] = useState<'weekly' | 'monthly'>('weekly');
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const glow = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchInitialData();
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(glow, { toValue: 1, duration: 2500, useNativeDriver: false }),
                Animated.timing(glow, { toValue: 0, duration: 2500, useNativeDriver: false }),
            ])
        ).start();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUserData(profile);

                const { data: horo } = await supabase.from('horoscopes').select('*').eq('sign', profile?.zodiac_sign || 'თევზები').single();
                setHoroscope(horo);
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🔴 ფუნქცია, რომელიც ხსნის/კეტავს აკორდეონს ანიმაციით
    const toggleTopic = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedTopic(prev => prev === id ? null : id);
    };

    // 🔴 ტექსტის დინამიური გენერატორი (სანამ ბაზაში რეალურ ველებს ჩაამატებ)
    const getForecastText = (topicTitle: string) => {
        const timeFrame = forecastType === 'weekly' ? 'ამ კვირაში' : 'ამ თვეში';
        // აქ შეგიძლია მერე `horoscope`-ის ველები ჩასვა (მაგ: horoscope.weekly_love)
        return `ვარსკვლავები გიწინასწარმეტყველებენ, რომ ${timeFrame} შენი ${topicTitle} იქნება საკმაოდ საინტერესო. ეცადე მეტი ყურადღება მიაქციო დეტალებს და ენდო შინაგან ინტუიციას.`;
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'დილა მშვიდობისა' : hour < 18 ? 'შუადღე მშვიდობისა' : 'საღამო მშვიდობისა';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{ opacity: fadeAnim }}>
                
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.dateText, { color: colors.primary }]}>{new Date().toLocaleDateString('ka-GE', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                        <Text style={[styles.greetingText, { color: colors.textMain }]}>{greeting}, {userData?.full_name || 'უჩა'} ✨</Text>
                    </View>
                    <TouchableOpacity style={[styles.profileButton, { borderColor: colors.primary }]}>
                        <Image source={{ uri: userData?.avatar_url || 'https://images.unsplash.com/photo-1532968961962-810cb2cece38?q=80&w=200' }} style={styles.profileImage} />
                    </TouchableOpacity>
                </View>

                {/* Main Horoscope Card */}
                <Animated.View style={[styles.mainCardContainer, { transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] }) }] }]}>
                    <TouchableOpacity activeOpacity={0.9} style={[styles.mainCardInner, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => setModalVisible(true)}>
                        <Image source={{ uri: horoscope?.image_url || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000' }} style={styles.cardBg} />
                        <LinearGradient colors={['transparent', colors.surface]} style={styles.cardGradient} />
                        
                        <View style={styles.cardContent}>
                            <View style={[styles.glassBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <Text style={[styles.badgeText, { color: colors.primary }]}>{userData?.zodiac_sign || 'ჰოროსკოპი'}</Text>
                            </View>
                            <Text style={[styles.cardTitle, { color: colors.textMain }]}>დღის მთავარი პროგნოზი</Text>
                            <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={3}>
                                {loading ? 'იტვირთება...' : horoscope?.love_prediction || 'ვარსკვლავები დღეს განსაკუთრებულ ენერგიას გპირდებიან...'}
                            </Text>
                            <View style={styles.readMore}>
                                <Text style={[styles.readMoreText, { color: colors.primary }]}>დეტალური ანალიზი</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* 🔴 Forecasts Section (ახალი აკორდეონი) */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>პროგნოზები</Text>
                
                {/* Weekly / Monthly Toggle */}
                <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, forecastType === 'weekly' && { backgroundColor: `${colors.primary}30` }]} 
                        onPress={() => { setForecastType('weekly'); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); }}
                    >
                        <Text style={[styles.toggleText, { color: forecastType === 'weekly' ? colors.primary : colors.textMuted }]}>კვირის</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.toggleBtn, forecastType === 'monthly' && { backgroundColor: `${colors.primary}30` }]} 
                        onPress={() => { setForecastType('monthly'); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); }}
                    >
                        <Text style={[styles.toggleText, { color: forecastType === 'monthly' ? colors.primary : colors.textMuted }]}>თვის</Text>
                    </TouchableOpacity>
                </View>

                {/* Accordion List */}
                <View style={[styles.glassContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {FORECAST_TOPICS.map((topic, index) => {
                        const isExpanded = expandedTopic === topic.id;
                        
                        return (
                            <View key={topic.id} style={[styles.accordionItem, index !== FORECAST_TOPICS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                <TouchableOpacity 
                                    activeOpacity={0.7} 
                                    style={styles.accordionHeader} 
                                    onPress={() => toggleTopic(topic.id)}
                                >
                                    <View style={styles.accordionHeaderLeft}>
                                        <View style={[styles.iconBox, { backgroundColor: `${topic.color}15` }]}>
                                            <Ionicons name={topic.icon as any} size={18} color={topic.color} />
                                        </View>
                                        <Text style={[styles.accordionTitle, { color: colors.textMain }]}>{topic.title}</Text>
                                    </View>
                                    <Ionicons 
                                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color={colors.textMuted} 
                                    />
                                </TouchableOpacity>

                                {/* 🔴 ჩამოსაშლელი ტექსტი */}
                                {isExpanded && (
                                    <View style={styles.accordionContent}>
                                        <Text style={[styles.accordionText, { color: colors.textMuted }]}>
                                            {getForecastText(topic.title)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </Animated.ScrollView>

            {/* --- FULL ANALYSIS MODAL --- */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <BlurView intensity={95} tint="dark" style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>სრული ანალიზი</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
                                <Ionicons name="close" size={24} color={colors.textMain} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                            <View style={styles.luckyRow}>
                                <View style={[styles.luckyItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.luckyLabel, { color: colors.textMuted }]}>იღბლიანი რიცხვი</Text>
                                    <Text style={[styles.luckyVal, { color: colors.primary }]}>{horoscope?.lucky_number || '7'}</Text>
                                </View>
                                <View style={[styles.luckyItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.luckyLabel, { color: colors.textMuted }]}>დღის ფერი</Text>
                                    <Text style={[styles.luckyVal, { color: colors.primary }]}>{horoscope?.lucky_color || 'ლურჯი'}</Text>
                                </View>
                            </View>

                            {[
                                { label: 'სიყვარული', text: horoscope?.love_prediction, icon: 'heart', color: colors.status?.error || '#FF3366' },
                                { label: 'კარიერა', text: horoscope?.career_prediction, icon: 'briefcase', color: colors.primary },
                                { label: 'ჯანმრთელობა', text: horoscope?.health_prediction, icon: 'fitness', color: colors.status?.success || '#10B981' },
                                { label: 'ფინანსები', text: horoscope?.finance_prediction, icon: 'wallet', color: colors.primary },
                            ].map((item, i) => (
                                <View key={i} style={[styles.detailSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <View style={styles.detailHeader}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                        <Text style={[styles.detailLabel, { color: item.color }]}>{item.label}</Text>
                                    </View>
                                    <Text style={[styles.detailText, { color: colors.textMuted }]}>{item.text || 'დღეს ამ სფეროში სტაბილურობაა მოსალოდნელი.'}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, marginBottom: 25 },
    dateText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
    greetingText: { fontSize: 22, fontWeight: '800', marginTop: 4 },
    profileButton: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', borderWidth: 2 },
    profileImage: { width: '100%', height: '100%' },

    mainCardContainer: { marginHorizontal: 24, height: 260, borderRadius: 32, elevation: 10 },
    mainCardInner: { flex: 1, borderRadius: 32, overflow: 'hidden', borderWidth: 1 },
    cardBg: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
    cardGradient: { ...StyleSheet.absoluteFillObject },
    cardContent: { flex: 1, justifyContent: 'flex-end', padding: 24 },
    glassBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    badgeText: { fontSize: 11, fontWeight: '800' },
    cardTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
    cardDesc: { fontSize: 14, lineHeight: 22, marginBottom: 15 },
    readMore: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    readMoreText: { fontSize: 14, fontWeight: '700' },

    sectionTitle: { fontSize: 20, fontWeight: '800', marginTop: 35, marginBottom: 20, paddingHorizontal: 24 },
    glassContainer: { marginHorizontal: 24, padding: 10, borderRadius: 32, borderWidth: 1 },
    
    // 🔴 ახალი სტილები პროგნოზებისთვის
    toggleContainer: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 15, borderRadius: 20, borderWidth: 1, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
    toggleText: { fontSize: 14, fontWeight: '700' },
    
    accordionItem: { overflow: 'hidden' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 10 },
    accordionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    accordionTitle: { fontSize: 16, fontWeight: '700' },
    accordionContent: { paddingHorizontal: 10, paddingBottom: 20, paddingTop: 5 },
    accordionText: { fontSize: 14, lineHeight: 22 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: height * 0.85, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { fontSize: 24, fontWeight: '900' },
    closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    modalScroll: { paddingBottom: 40 },
    luckyRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    luckyItem: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
    luckyLabel: { fontSize: 12, marginBottom: 8 },
    luckyVal: { fontSize: 22, fontWeight: '900' },
    detailSection: { marginBottom: 25, padding: 20, borderRadius: 24, borderWidth: 1 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    detailLabel: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
    detailText: { fontSize: 15, lineHeight: 24 },
});