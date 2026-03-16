import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppTheme } from '../lib/ThemeContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const PLANS = [
    { id: 'premium', title: 'Astral Premium', price: '1.99 $', info: 'სრული წვდომა ყველა ფუნქციაზე' },
];

const FEATURES = [
    { icon: 'infinite', text: 'ულიმიტო ტაროს გაშლა' },
    { icon: 'analytics', text: 'სრული ნატალური ანალიზი' },
    { icon: 'heart-half', text: 'პარტნიორული თავსებადობა' },
    { icon: 'calendar', text: 'ყოველდღიური პერსონალური პროგნოზი' },
    { icon: 'moon', text: 'მთვარის ფაზების გავლენა და რჩევები' },
    { icon: 'flash', text: 'პრიორიტეტული მხარდაჭერა' },
];

export default function SubscriptionScreen() {
    // 🔴 შეცვლილია: პირდაპირ ვიღებთ colors-ს
    const { colors, checkSubscription } = useAppTheme();
    const [loading, setLoading] = useState(false);

    const restoreUrl = 'https://sites.google.com/view/astroagdgena/%E1%83%9B%E1%83%97%E1%83%90%E1%83%95%E1%83%90%E1%83%A0%E1%83%98';
    const termsUrl = 'https://sites.google.com/view/astral-terms/%E1%83%9B%E1%83%97%E1%83%90%E1%83%95%E1%83%90%E1%83%A0%E1%83%98';
    const privacyUrl = 'https://sites.google.com/view/astral-georgia/%E1%83%9B%E1%83%97%E1%83%90%E1%83%95%E1%83%90%E1%83%A0%E1%83%98?read_current=1';

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("ავტორიზაცია", "გთხოვთ გაიაროთ ავტორიზაცია");
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .update({ is_prime: true })
                .eq('id', user.id);

            if (error) throw error;

            await checkSubscription();
            Alert.alert("გილოცავთ!", "Astral Plus წარმატებით გააქტიურდა 🚀");
            router.back();
        } catch (err) {
            Alert.alert("შეცდომა", "ვერ მოხერხდა გამოწერის გააქტიურება");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000' }} 
                style={styles.heroImage}
            >
                <LinearGradient colors={['rgba(7,7,17,0.1)', colors.background]} style={StyleSheet.absoluteFill} />
                
                <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.topContent}>
                    <Text style={[styles.premiumLabel, { color: colors.primary }]}>ASTRAL PLUS</Text>
                    <Text style={styles.mainTitle}>გახსენი შენი მომავალი</Text>
                    <Text style={styles.subTitle}>მიიღე სრული წვდომა სამყაროს საიდუმლოებებზე</Text>
                </View>
            </ImageBackground>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.featuresList}>
                    {FEATURES.map((item, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={[styles.featureIconBox, { backgroundColor: `${colors.primary}15` }]}>
                                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.featureText, { color: colors.textMain }]}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.plansContainer}>
                    {PLANS.map((plan) => (
                        <View 
                            key={plan.id} 
                            style={[
                                styles.planCard,
                                { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 }
                            ]}
                        >
                            <View style={styles.planInfo}>
                                <Text style={[styles.planTitle, { color: colors.textMain }]}>{plan.title}</Text>
                                <Text style={[styles.planSub, { color: colors.textMuted }]}>{plan.info}</Text>
                            </View>
                            <Text style={[styles.planPrice, { color: colors.textMain }]}>{plan.price}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity 
                    style={styles.subscribeBtnWrapper} 
                    activeOpacity={0.9}
                    onPress={handleSubscribe}
                    disabled={loading}
                >
                    <LinearGradient colors={[colors.primary, '#6C63FF']} style={styles.subscribeBtn}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.subscribeBtnText}>გააქტიურება</Text>}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.legalLinks}>
                    <TouchableOpacity onPress={() => Linking.openURL(restoreUrl)}>
                        <Text style={styles.legalText}>Restore Purchase</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalDivider}>•</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(termsUrl)}>
                        <Text style={styles.legalText}>Terms of Use</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalDivider}>•</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(privacyUrl)}>
                        <Text style={styles.legalText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerNote}>გაუქმება შესაძლებელია ნებისმიერ დროს</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroImage: { width: '100%', height: height * 0.35, justifyContent: 'flex-start' },
    closeBtn: { 
        position: 'absolute', 
        top: Platform.OS === 'ios' ? 55 : 35, 
        right: 20, 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 10
    },
    topContent: { 
        paddingHorizontal: 24, 
        marginTop: height * 0.1, 
    },
    premiumLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 4, marginBottom: 5 },
    mainTitle: { color: '#FFF', fontSize: 32, fontWeight: '900' },
    subTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600', marginTop: 4 },
    
    scrollContent: { paddingHorizontal: 24, paddingBottom: 50 },
    featuresList: { marginTop: 10, marginBottom: 20 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featureIconBox: { 
        width: 36, 
        height: 36, 
        borderRadius: 10, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 15 
    },
    featureText: { fontSize: 14, fontWeight: '600' },

    plansContainer: { marginBottom: 20 },
    planCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 22, 
        borderRadius: 24, 
    },
    planInfo: { flex: 1 },
    planTitle: { fontSize: 19, fontWeight: '800', marginBottom: 2 },
    planSub: { fontSize: 12 },
    planPrice: { fontSize: 22, fontWeight: '900' },

    subscribeBtnWrapper: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    subscribeBtn: { paddingVertical: 18, alignItems: 'center' },
    subscribeBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },

    legalLinks: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 15 
    },
    legalText: { color: '#888', fontSize: 12, textDecorationLine: 'underline' },
    legalDivider: { color: '#555', marginHorizontal: 8 },
    footerNote: { textAlign: 'center', color: '#666', fontSize: 11 }
});