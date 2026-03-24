import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

import { useAstrology } from '../../lib/AstrologyContext';
import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/ThemeContext';

const { height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getForecastTopics = (colors: any) => [
    { id: 'love', title: 'სიყვარული', icon: 'heart', color: colors.status?.error || '#FF3366' },
    { id: 'career', title: 'კარიერა', icon: 'briefcase', color: colors.primary },
    { id: 'health', title: 'ჯანმრთელობა', icon: 'fitness', color: colors.status?.success || '#10B981' },
    { id: 'finance', title: 'ფინანსები', icon: 'wallet', color: '#F59E0B' },
    { id: 'sexual', title: 'სექსუალური', icon: 'flame', color: '#EC4899' },
];

export default function HomeScreen() {
    const { colors } = useAppTheme();
    const { userNatalData, isLoading: isAstrologyLoading } = useAstrology();
    const FORECAST_TOPICS = getForecastTopics(colors);

    const [userData, setUserData] = useState<any>(null);
    const [horoscope, setHoroscope] = useState<any>(null);
    const [detailedForecast, setDetailedForecast] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const [forecastType, setForecastType] = useState<'weekly' | 'monthly'>('weekly');
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    const requestId = useRef(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const glow = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

        const glowLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(glow, { toValue: 1, duration: 2500, useNativeDriver: false }),
                Animated.timing(glow, { toValue: 0, duration: 2500, useNativeDriver: false }),
            ])
        );

        glowLoop.start();

        return () => {
            glowLoop.stop();
        };
    }, [fadeAnim, glow]);

    useEffect(() => {
        if (!isAstrologyLoading) {
            fetchInitialData();
        }
    }, [isAstrologyLoading, userNatalData, forecastType]);

    const fetchInitialData = async () => {
        const currentRequest = ++requestId.current;

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (currentRequest !== requestId.current) return;
            if (userError) throw userError;

            if (!user) {
                setUserData(null);
                setHoroscope(null);
                setDetailedForecast(null);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (currentRequest !== requestId.current) return;
            if (profileError) throw profileError;

            if (profile) setUserData(profile);

            const activeSign =
                userNatalData?.planets?.find((p: any) => p.id === 'sun')?.sign ||
                profile?.zodiac_sign ||
                'ვერძი';

            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            const { data: horo, error: horoError } = await supabase
                .from('horoscopes')
                .select('*')
                .eq('sign', activeSign)
                .eq('prediction_date', today)
                .maybeSingle();

            if (currentRequest !== requestId.current) return;
            if (horoError) throw horoError;

            setHoroscope(horo ?? null);

            const { data: detailed, error: detailedError } = await supabase
                .from('detailed_forecasts')
                .select('*')
                .eq('sign', activeSign)
                .eq('type', forecastType)
                .maybeSingle();

            if (currentRequest !== requestId.current) return;
            if (detailedError) throw detailedError;

            setDetailedForecast(detailed ?? null);

        } catch (error) {
            if (currentRequest !== requestId.current) return;
            console.error('Fetch Error:', error);
        } finally {
            if (currentRequest === requestId.current) {
                setLoading(false);
            }
        }
    };

    const toggleTopic = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedTopic === id) {
            setExpandedTopic(null);
            contentOpacity.setValue(0);
        } else {
            setExpandedTopic(id);
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    };

    const getForecastText = (topicId: string) => {
        if (!detailedForecast) return 'ინფორმაცია მალე დაემატება...';
        const fieldMap: any = {
            love: detailedForecast.love_text,
            career: detailedForecast.career_text,
            health: detailedForecast.health_text,
            finance: detailedForecast.finance_text,
            sexual: detailedForecast.sexual_text,
        };
        return fieldMap[topicId] || 'ვარსკვლავები ამ სფეროში სიახლეებს ამზადებენ.';
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'დილა მშვიდობისა' : hour < 18 ? 'შუადღე მშვიდობისა' : 'საღამო მშვიდობისა';

    if (loading || isAstrologyLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textMuted, marginTop: 15, fontWeight: '700' }}>სამყარო იღვიძებს...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{ opacity: fadeAnim }}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.dateText, { color: colors.primary }]}>
                            {new Date().toLocaleDateString('ka-GE', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                        <Text style={[styles.greetingText, { color: colors.textMain }]}>
                            {greeting}, {userData?.full_name?.split(' ')[0] || 'მოგზაურო'} ✨
                        </Text>
                    </View>
                    <TouchableOpacity style={[styles.profileButton, { borderColor: colors.primary }]}>
                        <Image
                            source={{ uri: userData?.avatar_url || 'https://images.unsplash.com/photo-1532968961962-810cb2cece38?q=80&w=200' }}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                </View>

                <Animated.View style={[styles.mainCardContainer, { transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) }] }]}>
                    <TouchableOpacity activeOpacity={0.9} style={[styles.mainCardInner, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => setModalVisible(true)}>
                        <Image source={{ uri: horoscope?.image_url || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000' }} style={styles.cardBg} />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradient} />

                        <View style={styles.cardContent}>
                            <View style={[styles.glassBadge, { backgroundColor: colors.primary, borderColor: colors.border }]}>
                                <Text style={[styles.badgeText, { color: '#FFF' }]}>
                                    {userNatalData?.planets?.find((p: any) => p.id === 'sun')?.sign || userData?.zodiac_sign || 'თქვენი ნიშანი'}
                                </Text>
                            </View>
                            <Text style={[styles.cardTitle, { color: '#FFF' }]}>დღევანდელი ენერგია</Text>
                            <Text style={[styles.cardDesc, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={2}>
                                {horoscope?.general_prediction || 'შენი ვარსკვლავური გზა დღეს განსაკუთრებულ ჰარმონიას გპირდება...'}
                            </Text>
                            <View style={styles.readMore}>
                                <Text style={[styles.readMoreText, { color: colors.primary }]}>სრული გარჩევა</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>პერსონალური პროგნოზი</Text>

                <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, forecastType === 'weekly' && { backgroundColor: colors.primary }]}
                        onPress={() => setForecastType('weekly')}
                    >
                        <Text style={[styles.toggleText, { color: forecastType === 'weekly' ? '#FFF' : colors.textMuted }]}>კვირის</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleBtn, forecastType === 'monthly' && { backgroundColor: colors.primary }]}
                        onPress={() => setForecastType('monthly')}
                    >
                        <Text style={[styles.toggleText, { color: forecastType === 'monthly' ? '#FFF' : colors.textMuted }]}>თვის</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.glassContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {FORECAST_TOPICS.map((topic, index) => {
                        const isExpanded = expandedTopic === topic.id;
                        return (
                            <View key={topic.id} style={[styles.accordionItem, index !== FORECAST_TOPICS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                <TouchableOpacity activeOpacity={0.7} style={styles.accordionHeader} onPress={() => toggleTopic(topic.id)}>
                                    <View style={styles.accordionHeaderLeft}>
                                        <View style={[styles.iconBox, { backgroundColor: `${topic.color}20` }]}>
                                            <Ionicons name={topic.icon as any} size={18} color={topic.color} />
                                        </View>
                                        <Text style={[styles.accordionTitle, { color: colors.textMain }]}>{topic.title}</Text>
                                    </View>
                                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                                {isExpanded && (
                                    <Animated.View style={[styles.accordionContent, { opacity: contentOpacity }]}>
                                        <Text style={[styles.accordionText, { color: colors.textMuted }]}>
                                            {getForecastText(topic.id)}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </Animated.ScrollView>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <BlurView intensity={95} tint="dark" style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>დღის ჰოროსკოპი</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
                                <Ionicons name="close" size={24} color={colors.textMain} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                            <View style={styles.luckyRow}>
                                <View style={[styles.luckyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={[styles.luckyLabel, { color: colors.textMuted }]}>რიცხვი</Text>
                                    <Text style={[styles.luckyVal, { color: colors.primary }]}>{horoscope?.lucky_number || '8'}</Text>
                                </View>
                                <View style={[styles.luckyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={[styles.luckyLabel, { color: colors.textMuted }]}>ფერი</Text>
                                    <Text style={[styles.luckyVal, { color: colors.primary, fontSize: 16 }]}>{horoscope?.lucky_color || 'ვერცხლისფერი'}</Text>
                                </View>
                            </View>

                            {[
                                { label: 'ზოგადი პროგნოზი', text: horoscope?.general_prediction, icon: 'star', color: '#FFD700' },
                                { label: 'სიყვარული', text: horoscope?.love_prediction, icon: 'heart', color: '#FF3366' },
                                { label: 'კარიერა', text: horoscope?.career_prediction, icon: 'briefcase', color: colors.primary },
                                { label: 'ჯანმრთელობა', text: horoscope?.health_prediction, icon: 'fitness', color: '#10B981' },
                                { label: 'ფინანსები', text: horoscope?.finance_prediction, icon: 'wallet', color: '#F59E0B' },
                            ].map((item, i) => (
                                <View key={i} style={[styles.detailSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <View style={styles.detailHeader}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                        <Text style={[styles.detailLabel, { color: item.color }]}>{item.label}</Text>
                                    </View>
                                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                                        {item.text || 'ინფორმაცია დღევანდელი დღისთვის მალე განახლდება.'}
                                    </Text>
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

    mainCardContainer: { marginHorizontal: 24, height: 260, borderRadius: 32, elevation: 15 },
    mainCardInner: { flex: 1, borderRadius: 32, overflow: 'hidden', borderWidth: 1.5 },
    cardBg: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
    cardGradient: { ...StyleSheet.absoluteFillObject },
    cardContent: { flex: 1, justifyContent: 'flex-end', padding: 24 },
    glassBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    badgeText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
    cardTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    cardDesc: { fontSize: 14, lineHeight: 22, marginBottom: 15 },
    readMore: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    readMoreText: { fontSize: 14, fontWeight: '800' },

    sectionTitle: { fontSize: 20, fontWeight: '800', marginTop: 35, marginBottom: 20, paddingHorizontal: 24 },
    glassContainer: { marginHorizontal: 24, padding: 10, borderRadius: 32, borderWidth: 1, marginBottom: 20 },

    toggleContainer: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 15, borderRadius: 20, borderWidth: 1, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
    toggleText: { fontSize: 14, fontWeight: '800' },

    accordionItem: { overflow: 'hidden' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 10 },
    accordionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    accordionTitle: { fontSize: 16, fontWeight: '700' },
    accordionContent: { paddingHorizontal: 10, paddingBottom: 20, paddingTop: 5 },
    accordionText: { fontSize: 14, lineHeight: 22 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: height * 0.85, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, borderWidth: 1.5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { fontSize: 24, fontWeight: '900' },
    closeBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    modalScroll: { paddingBottom: 40 },
    luckyRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    luckyItem: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
    luckyLabel: { fontSize: 12, marginBottom: 8, fontWeight: '700', textTransform: 'uppercase' },
    luckyVal: { fontSize: 22, fontWeight: '900' },
    detailSection: { marginBottom: 20, padding: 20, borderRadius: 28, borderWidth: 1 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    detailLabel: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    detailText: { fontSize: 15, lineHeight: 24 },
});