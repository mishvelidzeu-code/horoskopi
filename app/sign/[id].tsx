import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function SignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchSignDetails();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [id]);

  const fetchSignDetails = async () => {
    try {
      const { data: res, error } = await supabase
        .from('zodiac_details')
        .select('*')
        .eq('sign', id)
        .single();

      if (res) setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#070711', '#1A1A2E']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ნიშნის დახასიათება</Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{ opacity: fadeAnim }}>
        
        {/* ნიშნის დასახელება და ელემენტი */}
        <Text style={styles.signTitle}>{data?.sign.toUpperCase()}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>{data?.element}</Text></View>
          <View style={[styles.tag, { borderColor: '#FFD700' }]}><Text style={[styles.tagText, { color: '#FFD700' }]}>{data?.ruling_planet}</Text></View>
        </View>

        {/* სექციები */}
        {[
          { title: 'ხასიათი', text: data?.character_trait, icon: 'person' },
          { title: 'სიყვარული', text: data?.love_trait, icon: 'heart' },
          { title: 'კარიერა', text: data?.career_trait, icon: 'briefcase' },
        ].map((item, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name={item.icon as any} size={20} color="#FFD700" />
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
            <Text style={styles.sectionText}>{item.text}</Text>
          </View>
        ))}

        {/* იღბლიანი დეტალები */}
        <View style={styles.luckyGrid}>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>ქვა</Text>
            <Text style={styles.luckyValue}>{data?.lucky_stone}</Text>
          </View>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>ფერი</Text>
            <Text style={styles.luckyValue}>{data?.lucky_color}</Text>
          </View>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>რიცხვი</Text>
            <Text style={styles.luckyValue}>{data?.lucky_number}</Text>
          </View>
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070711' },
  loadingContainer: { flex: 1, backgroundColor: '#070711', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 24 },
  backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scrollContent: { alignItems: 'center', paddingBottom: 50, paddingHorizontal: 24 },
  signTitle: { fontSize: 40, fontWeight: '900', color: '#FFF', marginTop: 30, letterSpacing: 2 },
  tagRow: { flexDirection: 'row', gap: 10, marginTop: 15, marginBottom: 30 },
  tag: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tagText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },
  sectionCard: { width: '100%', padding: 20, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { color: '#FFD700', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  sectionText: { color: '#D1D1E0', fontSize: 15, lineHeight: 24 },
  luckyGrid: { flexDirection: 'row', width: '100%', gap: 10, marginTop: 10 },
  luckyItem: { flex: 1, padding: 15, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.05)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  luckyLabel: { color: 'rgba(255,215,0,0.6)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 5 },
  luckyValue: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});