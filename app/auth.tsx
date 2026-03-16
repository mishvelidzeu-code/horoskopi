import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  // შეცვლილია: false ნიშნავს, რომ პირდაპირ რეგისტრაცია გამოჩნდება
  const [isLogin, setIsLogin] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('შეცდომა', 'გთხოვთ, შეავსოთ ყველა ველი');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // სისტემაში შესვლა (ლოგინი)
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // გადავდივართ ინდექსზე, რომელიც გადაწყვეტს ჰოუმზე გაუშვას თუ არა
        router.replace('/'); 
      } else {
        // რეგისტრაცია
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // თუ ავტომატურად არ შევიდა სესიაში, იძულებით შეგვყავს
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
        }
        
        // რეგისტრაციის მერე აუცილებლად მიდის ონბორდინგზე
        router.replace('/onboarding');
      }
    } catch (error: any) {
      Alert.alert('შეცდომა', error.message || 'დაფიქსირდა შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop' }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(7,7,17,0.6)', 'rgba(20,16,40,0.95)', '#070711']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <Animated.View entering={FadeInUp.duration(1000)} style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={42} color="#B829EA" />
          </View>
          <Text style={styles.title}>{isLogin ? 'მოგესალმებით' : 'შემოგვიერთდი'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'განაგრძე შენი ვარსკვლავური მოგზაურობა' : 'შექმენი ანგარიში და აღმოაჩინე შენი ბედისწერა'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(300)} style={styles.formContainer}>
          <BlurView intensity={30} tint="dark" style={styles.glassCard}>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#A0A0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ელ-ფოსტა"
                placeholderTextColor="#A0A0B0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#A0A0B0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="პაროლი"
                placeholderTextColor="#A0A0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={handleAuth} disabled={loading} style={styles.buttonWrapper}>
              <LinearGradient
                colors={['#B829EA', '#6C63FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.mainButtonText}>{isLogin ? 'შესვლა' : 'რეგისტრაცია'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)} activeOpacity={0.7}>
              <Text style={styles.switchText}>
                {isLogin ? 'არ გაქვს ანგარიში? ' : 'უკვე გაქვს ანგარიში? '}
                <Text style={styles.switchTextBold}>{isLogin ? 'დარეგისტრირდი' : 'შედი'}</Text>
              </Text>
            </TouchableOpacity>

          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070711' },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 45 },
  iconCircle: { 
    width: 86, 
    height: 86, 
    borderRadius: 43, 
    backgroundColor: 'rgba(184, 41, 234, 0.15)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(184, 41, 234, 0.4)',
    shadowColor: '#B829EA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginBottom: 12, letterSpacing: 1 },
  subtitle: { color: '#D1D1E0', fontSize: 15, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22, opacity: 0.9 },
  formContainer: { width: '100%', alignItems: 'center' },
  glassCard: { 
    width: '100%', 
    padding: 28, 
    borderRadius: 32, 
    backgroundColor: 'rgba(20, 16, 40, 0.4)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    overflow: 'hidden' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    borderRadius: 20, 
    marginBottom: 18, 
    paddingHorizontal: 18, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)' 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 60, color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  buttonWrapper: {
    marginTop: 15,
    borderRadius: 20,
    shadowColor: '#B829EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  mainButton: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  switchButton: { marginTop: 28, alignItems: 'center' },
  switchText: { color: '#A0A0B0', fontSize: 14, fontWeight: '500' },
  switchTextBold: { color: '#E0B0FF', fontWeight: '800' },
});