import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export const PrimeLock = ({ title = "ინფორმაცია დაბლოკილია" }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={32} color="#FFD700" />
        </View>
        <Text style={styles.lockTitle}>{title}</Text>
        <Text style={styles.lockDesc}>სრული განმარტების სანახავად გაააქტიურე PRIME გამოწერა</Text>
        
        <TouchableOpacity 
          style={styles.primeBtn} 
          onPress={() => router.push('/subscription')}
        >
          <Text style={styles.primeBtnText}>გააქტიურება</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 20, overflow: 'hidden' },
  content: { width: '85%', alignItems: 'center', padding: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 215, 0, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#FFD700' },
  lockTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  lockDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  primeBtn: { backgroundColor: '#FFD700', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  primeBtnText: { color: '#000', fontWeight: '900', fontSize: 15 }
});