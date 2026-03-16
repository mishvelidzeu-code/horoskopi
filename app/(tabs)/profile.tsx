import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions, Modal,
  RefreshControl, StatusBar, StyleSheet, Switch, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/ThemeContext';

const { width } = Dimensions.get('window');

Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export default function ProfileScreen() {
    // 🔴 ვიღებთ პირდაპირ colors და isPrime-ს
    const { colors, isPrime, checkSubscription } = useAppTheme();
    
    const [notifications, setNotifications] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newName, setNewName] = useState('');

    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fetchProfile();
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => console.log(notification));
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => console.log(response));
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (!error && data) {
                    setProfile(data);
                    setNewName(data.full_name || '');
                    if (data.expo_push_token) setNotifications(true);
                }
            }
        } catch (error) { console.log(error); } 
        finally { setLoading(false); setRefreshing(false); }
    };

    async function registerForPushNotificationsAsync() {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') { Alert.alert('შეცდომა', 'ნოთიფიკაციების უფლება არაა გაცემული'); return; }
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
        return token;
    }

    const handleNotificationToggle = async (value: boolean) => {
        setNotifications(value);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        if (value) {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                await supabase.from('profiles').update({ expo_push_token: token }).eq('id', user.id);
            } else { setNotifications(false); }
        } else {
            await supabase.from('profiles').update({ expo_push_token: null }).eq('id', user.id);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
        if (!result.canceled && result.assets[0].base64) uploadAvatar(result.assets[0].base64);
    };

    const uploadAvatar = async (base64: string) => {
        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const filePath = `${user.id}/${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, decode(base64), { contentType: 'image/png', upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
            setProfile({ ...profile, avatar_url: publicUrl });
        } catch (error: any) { Alert.alert("შეცდომა", error.message); } 
        finally { setUploading(false); }
    };

    const handleUpdateProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ full_name: newName }).eq('id', user.id);
            setProfile({ ...profile, full_name: newName });
            setEditModalVisible(false);
        }
    };

    if (loading) return <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor={colors.primary} />}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>ჩემი პროფილი</Text>
                    <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={() => setEditModalVisible(true)}>
                        <Ionicons name="create-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.heroSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarGlow, { backgroundColor: `${colors.primary}30` }]} />
                        {uploading ? (
                            <View style={[styles.avatarContainer, { justifyContent: 'center', borderColor: colors.border, backgroundColor: colors.surface }]}><ActivityIndicator color={colors.primary} /></View>
                        ) : (
                            <View style={[styles.avatarContainer, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
                                {profile?.avatar_url ? (
                                    <View style={styles.imageBox}><Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} contentFit="cover" /></View>
                                ) : (
                                    <View style={styles.avatarPlaceholder}><Ionicons name="person" size={40} color={colors.textMuted} /></View>
                                )}
                            </View>
                        )}
                        <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]} onPress={pickImage} disabled={uploading}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{profile?.full_name || 'უჩა'}</Text>
                    <View style={[styles.zodiacBadge, { borderColor: `${colors.primary}50`, backgroundColor: `${colors.primary}15` }]}>
                        <Ionicons name="sparkles" size={12} color={colors.primary} style={{ marginRight: 6 }} />
                        <Text style={[styles.zodiacText, { color: colors.primary }]}>{profile?.zodiac_sign || 'ზოდიაქო'}</Text>
                    </View>
                </View>

                {!isPrime && (
                    <TouchableOpacity style={[styles.premiumCard, { borderColor: colors.border }]} activeOpacity={0.9} onPress={() => router.push('/subscription')}>
                        <LinearGradient colors={[colors.surface, colors.background]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumGradient}>
                            <View style={styles.premiumLeft}>
                                <View style={[styles.premiumIconBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.border }]}><Ionicons name="star" size={24} color={colors.primary} /></View>
                                <View style={styles.premiumTexts}>
                                    <Text style={[styles.premiumTitle, { color: colors.primary }]}>Astral Plus</Text>
                                    <Text style={[styles.premiumSubtitle, { color: colors.textMuted }]}>გახსენი პრემიუმ ფუნქციები</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <Text style={[styles.groupLabel, { color: colors.textMuted }]}>ანგარიში</Text>
                <View style={[styles.glassGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingItem icon="person" color={colors.primary} label="პირადი მონაცემები" onPress={() => setEditModalVisible(true)} colors={colors} />
                    <SettingItem icon="planet" color={colors.primary} label="ჩემი ნატალური რუკა" onPress={() => router.push('/natural')} colors={colors} />
                    <SettingItem icon="lock-closed" color={colors.textMuted} label="უსაფრთხოება და პაროლი" isLast colors={colors} />
                </View>

                <Text style={[styles.groupLabel, { color: colors.textMuted }]}>აპლიკაცია</Text>
                <View style={[styles.glassGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingItem 
                        icon="notifications" color={colors.primary} label="შეტყობინებები" colors={colors}
                        right={<Switch value={notifications} onValueChange={handleNotificationToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFF" />}
                    />
                    {/* 🔴 Theme Selector აქედან წაიშალა */}
                    <SettingItem icon="language" color={colors.textMuted} label="ენა" right={<Text style={{color: colors.textMuted, fontSize: 14}}>ქართული</Text>} isLast colors={colors} />
                </View>

                <Text style={[styles.groupLabel, { color: colors.textMuted }]}>დახმარება</Text>
                <View style={[styles.glassGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingItem icon="help-buoy" color={colors.textMuted} label="ხშირად დასმული კითხვები" colors={colors} />
                    <SettingItem icon="document-text" color={colors.textMuted} label="მოხმარების წესები" colors={colors} />
                    <SettingItem icon="shield-checkmark" color={colors.textMuted} label="კონფიდენციალურობა" isLast colors={colors} />
                </View>

                <Text style={[styles.groupLabel, { color: colors.textMuted, marginTop: 10 }]}>სხვა</Text>
                <View style={[styles.glassGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SettingItem icon="log-out" color={colors.status.error} label="გამოსვლა" onPress={() => supabase.auth.signOut().then(() => router.replace('/auth'))} colors={colors} />
                    <SettingItem icon="trash" color={colors.status.error} label="ანგარიშის წაშლა" isLast hideChevron colors={colors} />
                </View>

            </Animated.ScrollView>

            <Modal visible={editModalVisible} animationType="fade" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>პროფილის რედაქტირება</Text>
                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]} value={newName} onChangeText={setNewName} placeholder="სახელი" placeholderTextColor={colors.textMuted} />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}><Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>გაუქმება</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleUpdateProfile}><Text style={styles.saveBtnText}>შენახვა</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const SettingItem = ({ icon, color, label, right, isLast, onPress, hideChevron, colors }: any) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7} style={[styles.settingRow, { borderBottomColor: colors.border }, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.textMain }]}>{label}</Text>
        </View>
        {right ? right : (!hideChevron && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />)}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '900' },
    settingsBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    heroSection: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative', marginBottom: 18 },
    avatarGlow: { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 60, transform: [{ scale: 1.05 }] },
    avatarContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, overflow: 'hidden' },
    imageBox: { width: '100%', height: '100%' },
    avatarImage: { width: '100%', height: '100%' },
    avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, zIndex: 10 },
    userName: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
    zodiacBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    zodiacText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    premiumCard: { marginHorizontal: 24, borderRadius: 24, overflow: 'hidden', marginBottom: 30, borderWidth: 1 },
    premiumGradient: { padding: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    premiumLeft: { flexDirection: 'row', alignItems: 'center' },
    premiumIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    premiumTexts: { marginLeft: 16 },
    premiumTitle: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
    premiumSubtitle: { fontSize: 13 },
    groupLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginLeft: 30, marginBottom: 10, letterSpacing: 1 },
    glassGroup: { marginHorizontal: 24, borderRadius: 24, marginBottom: 25, borderWidth: 1, overflow: 'hidden' },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1 },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    settingLabel: { fontSize: 15, fontWeight: '600' },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 24 },
    modalContent: { borderRadius: 32, padding: 24, borderWidth: 1 },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
    input: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, padding: 16, alignItems: 'center' },
    cancelBtnText: { fontSize: 16, fontWeight: '600' },
    saveBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});