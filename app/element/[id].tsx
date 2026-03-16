import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type ElementKey = 'fire' | 'earth' | 'air' | 'water';

// ელემენტების მონაცემები Nebula-ს კოსმოსურ სტილში
const ELEMENT_DATA: Record<ElementKey, {
  name: string;
  signs: string;
  desc: string;
  color: string;
  secondaryColor: string;
  icon: any;
}> = {
  fire: {
    name: 'ცეცხლი',
    signs: 'ვერძი, ლომი, მშვილდოსანი',
    desc: 'ცეცხლი წარმოადგენს ვნებას, ენერგიასა და მოქმედებას. ამ ელემენტის ნიშნები ლიდერობით, ენთუზიაზმით და ძლიერი ნებისყოფით გამოირჩევიან.',
    color: '#FF3366',
    secondaryColor: '#FF5757',
    icon: 'flame',
  },
  earth: {
    name: 'მიწა',
    signs: 'კურო, ქალწული, თხის რქა',
    desc: 'მიწა სიმყარეს, სტაბილურობას და პრაქტიკულობას ნიშნავს. ამ ელემენტის ნიშნები რეალისტურები და მიზანმიმართულები არიან.',
    color: '#00E5FF',
    secondaryColor: '#00D09E',
    icon: 'leaf',
  },
  air: {
    name: 'ჰაერი',
    signs: 'ტყუპები, სასწორი, მერწყული',
    desc: 'ჰაერი ინტელექტის, კომუნიკაციის და იდეების ელემენტია. ამ ნიშნებს ახასიათებთ აზროვნების სისწრაფე და სოციალური ბუნება.',
    color: '#F9A826',
    secondaryColor: '#FFD700',
    icon: 'cloud',
  },
  water: {
    name: 'წყალი',
    signs: 'კირჩხიბი, მორიელი, თევზები',
    desc: 'წყალი ემოციების და ინტუიციის ელემენტია. ამ ნიშნები ღრმა ემოციურობითა და სენსიტიურობით გამოირჩევიან.',
    color: '#B829EA',
    secondaryColor: '#6B48FF',
    icon: 'water',
  },
};

export default function ElementScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  // თუ id არ არსებობს, დეფოლტად ვიღებთ ცეცხლს
  const key = (id as ElementKey) || 'fire';
  const element = ELEMENT_DATA[key] ?? ELEMENT_DATA.fire;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ეკრანის გამოჩენის ანიმაცია
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // ტივტივის (Floating) მუდმივი ანიმაცია იკონისთვის
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070711" />
      
      {/* ფონის გრადიენტი */}
      <LinearGradient
        colors={['#070711', '#141028', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* დეკორატიული ნათება ელემენტის ფერის მიხედვით */}
      <View style={[styles.glowCircle, { backgroundColor: element.color, opacity: 0.12 }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ელემენტის დეტალები</Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* მთავარი მოტივტივე იკონი */}
        <Animated.View style={[styles.iconContainer, { transform: [{ translateY }] }]}>
          <LinearGradient
            colors={[`${element.color}30`, 'transparent']}
            style={styles.iconHalo}
          />
          <View style={[
            styles.mainIconCircle, 
            { borderColor: `${element.color}40`, shadowColor: element.color }
          ]}>
            <Ionicons name={element.icon} size={80} color={element.color} />
          </View>
        </Animated.View>

        {/* ტექსტური შიგთავსი */}
        <View style={styles.textContent}>
          <Text style={[
            styles.elementName, 
            { color: element.color, textShadowColor: `${element.color}50` }
          ]}>
            {element.name.toUpperCase()}
          </Text>
          
          <View style={[styles.tagContainer, { borderColor: `${element.color}20` }]}>
            <Text style={styles.signsText}>{element.signs}</Text>
          </View>

          <Text style={styles.descriptionText}>{element.desc}</Text>

          {/* ინფორმაციული ბარათი (Glassmorphism) */}
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.glassGradient}
            >
              <Text style={styles.cardTitle}>ენერგიის მახასიათებლები</Text>
              
              <InfoRow icon="sparkles" text="ინტუიცია და შინაგანი ძალა" color={element.color} />
              <InfoRow icon="flash" text="ენერგია და მოტივაცია" color={element.color} />
              <InfoRow icon="planet" text="კოსმოსური კავშირი" color={element.color} />
            </LinearGradient>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// დამხმარე კომპონენტი რიგების გამოსაჩენად
const InfoRow = ({ icon, text, color }: { icon: any; text: string; color: string }) => (
  <View style={styles.infoRow}>
    <View style={[styles.smallIconBox, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070711',
  },
  glowCircle: {
    position: 'absolute',
    top: -height * 0.05,
    right: -width * 0.25,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 50,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  mainIconCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(20, 16, 40, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  textContent: {
    width: '100%',
    paddingHorizontal: 28,
  },
  elementName: {
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
  },
  signsText: {
    color: '#D1D1E0',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  descriptionText: {
    color: '#A0A0B0',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.95,
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  glassGradient: {
    padding: 28,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  smallIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  infoText: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '600',
  },
});