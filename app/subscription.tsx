import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import Purchases from 'react-native-purchases';
import { useRevenueCat } from '../lib/RevenueCatProvider';
import { useAppTheme } from '../lib/ThemeContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const FEATURES = [
    { icon: 'infinite', text: 'ულიმიტო ტაროს გაშლა' },
    { icon: 'analytics', text: 'სრული ნატალური ანალიზი' },
    { icon: 'heart-half', text: 'პარტნიორული თავსებადობა' },
    { icon: 'calendar', text: 'ყოველდღიური პერსონალური პროგნოზი' },
    { icon: 'moon', text: 'მთვარის ფაზების გავლენა და რჩევები' },
    { icon: 'flash', text: 'პრიორიტეტული მხარდაჭერა' },
];

export default function SubscriptionScreen() {
    const { colors, checkSubscription } = useAppTheme();
    const { purchasePackage, restorePurchases } = useRevenueCat(); 
    const [packages, setPackages] = useState<any[]>([]); 

    const termsUrl = 'https://sites.google.com/view/astral-terms/';
    const privacyUrl = 'https://sites.google.com/view/astral-georgia/';

    // რეალური პაკეტების წამოღება (UI-სთვის)
    useEffect(() => {
        const fetchOfferings = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                }
            } catch (e) {
                console.log("Error fetching offerings:", e);
                // თუ RevenueCat-მა ვერ წამოიღო, სატესტო პაკეტი მაინც რომ გამოჩნდეს
                // 🔥 განახლდა სატესტო მნიშვნელობები
                setPackages([{ identifier: 'test_pro', product: { title: 'Astral Plus', priceString: 'FREE / 0.99$' } }]);
            }
        };
        fetchOfferings();
    }, []);

    /**
     * ✅ გამარტივებული ფუნქცია:
     * კლიკისთანავე ააქტიურებს პრაიმს ბაზაში და თიშავს Loading-ს
     */
    const handleSubscribe = async (pack: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                Alert.alert("ავტორიზაცია", "გთხოვთ გაიაროთ ავტორიზაცია");
                return;
            }

            // 🚀 მომენტალური "პრაიმი" ბაზაში (ტესტირებისთვის)
            const { error } = await supabase
                .from('profiles')
                .update({ is_prime: true })
                .eq('id', user.id);

            if (error) throw error;

            // 🔄 გლობალური სტატუსის განახლება (ThemeContext-ში)
            await checkSubscription();

            Alert.alert("გილოცავთ!", "Astral Plus წარმატებით გააქტიურდა 🚀");
            
            // უკან დაბრუნება
            if (router.canGoBack()) {
                router.back();
            } else {
              router.replace('/home');
            }

        } catch (err) {
            console.error(err);
            Alert.alert("შეცდომა", "სტატუსის განახლება ვერ მოხერხდა.");
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

                {/* პაკეტების სია */}
                <View style={styles.plansContainer}>
                    {packages.length > 0 ? (
                        packages.map((pack) => (
                            <TouchableOpacity 
                                key={pack.identifier} 
                                activeOpacity={0.8}
                                onPress={() => handleSubscribe(pack)}
                                style={[
                                    styles.planCard,
                                    { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1.5 }
                                ]}
                            >
                                <View style={styles.planInfo}>
                                    <Text style={[styles.planTitle, { color: colors.textMain }]}>
                                        {pack.product.title.split('(')[0]}
                                    </Text>
                                    {/* 🔥 განახლებული აღწერა */}
                                    <Text style={[styles.planSub, { color: colors.textMuted }]}>
                                        გადახდისას თანხა უკან დაგიბრუნდებათ 0.99$/თვეში
                                    </Text>
                                </View>
                                {/* 🔥 განახლებული ფასის ჩვენება */}
                                <Text style={[styles.planPrice, { color: colors.textMain }]}>
                                    {pack.identifier === 'test_pro' ? 'FREE / 0.99$' : `FREE / ${pack.product.priceString}`}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <ActivityIndicator color={colors.primary} />
                    )}
                </View>

                <View style={styles.legalLinks}>
                    <TouchableOpacity onPress={restorePurchases}>
                        <Text style={styles.legalText}>Restore</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalDivider}>•</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(termsUrl)}>
                        <Text style={styles.legalText}>Terms</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalDivider}>•</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(privacyUrl)}>
                        <Text style={styles.legalText}>Privacy</Text>
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
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 10
    },
    topContent: { paddingHorizontal: 24, marginTop: height * 0.1 },
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
        padding: 20, 
        borderRadius: 20, 
        marginBottom: 10
    },
    planInfo: { flex: 1, marginRight: 10 },
    planTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
    planSub: { fontSize: 12, lineHeight: 16 },
    planPrice: { fontSize: 16, fontWeight: '900', minWidth: 100, textAlign: 'right' },
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