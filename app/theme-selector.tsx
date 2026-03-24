import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEMES, ThemeId, useAppTheme } from '../lib/ThemeContext';

const { width } = Dimensions.get('window');

export default function ThemeSelectorScreen() {
  const { activeTheme, setTheme } = useAppTheme();
  const colors = activeTheme.colors;

  // დამხმარე ფუნქცია აიქონების სწორად შესარჩევად
  const getThemeIcon = (id: string) => {
    switch (id) {
      case 'standard': return 'moon'; // მისტიკური ღამე
      case 'nordicLight': return 'snow';
      case 'deepForest': return 'leaf';
      case 'sunsetRetro': return 'sunny';
      default: return 'color-palette';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/*StatusBar-ის ფერი იცვლება თემის მიხედვით */}
      <StatusBar barStyle={activeTheme.id === 'nordicLight' || activeTheme.id === 'sunsetRetro' ? 'dark-content' : 'light-content'} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>აპლიკაციის თემა</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          აირჩიე ვიზუალური სტილი. Standard თემა უფასოა, ხოლო სხვები ხელმისაწვდომია Prime წევრებისთვის.
        </Text>

        {Object.values(THEMES).map((themeOption) => (
          <TouchableOpacity 
            key={themeOption.id}
            style={[
              styles.themeCard, 
              { backgroundColor: themeOption.colors.surface, borderColor: themeOption.colors.border },
              activeTheme.id === themeOption.id && { borderColor: themeOption.colors.primary, borderWidth: 2 }
            ]}
            activeOpacity={0.8}
            onPress={() => setTheme(themeOption.id as ThemeId)}
          >
            <LinearGradient 
              colors={[themeOption.colors.background, themeOption.colors.surface]} 
              style={[styles.themePreview, { borderColor: themeOption.colors.border }]}
            >
              <Ionicons 
                name={getThemeIcon(themeOption.id) as any} 
                size={32} 
                color={themeOption.colors.primary} 
              />
            </LinearGradient>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeName, { color: themeOption.colors.textMain }]}>{themeOption.name}</Text>
              <Text style={[styles.themeStatus, { color: activeTheme.id === themeOption.id ? themeOption.colors.primary : themeOption.colors.textMuted }]}>
                {activeTheme.id === themeOption.id ? 'აქტიურია' : 'არჩევა'}
              </Text>
            </View>
            {activeTheme.id === themeOption.id && <Ionicons name="checkmark-circle" size={28} color={themeOption.colors.primary} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 30 },
  themeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 16, marginBottom: 20, borderWidth: 1 },
  themePreview: { width: 70, height: 70, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  themeInfo: { flex: 1, marginLeft: 16 },
  themeName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  themeStatus: { fontSize: 13, fontWeight: '600' },
});