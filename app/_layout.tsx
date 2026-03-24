import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// 🔴 შემოგვაქვს კონტექსტები
import { RevenueCatProvider } from '../lib/RevenueCatProvider';
import { ThemeProvider as AppThemeProvider } from '../lib/ThemeContext';
// 🪐 დარწმუნდი, რომ ეს იმპორტი გაქვს:
import { AstrologyProvider } from '../lib/AstrologyContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppThemeProvider>
      <RevenueCatProvider>
        <AstrologyProvider>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              
              <Stack.Screen 
                name="compatibility" 
                options={{ 
                  presentation: 'modal',
                  animation: 'slide_from_bottom'
                }} 
              />
              
              <Stack.Screen name="element/[id]" options={{ animation: 'fade' }} />
              
              <Stack.Screen 
                name="subscription" 
                options={{ 
                  presentation: 'modal',
                  animation: 'slide_from_bottom'
                }} 
              />
            </Stack>
            <StatusBar style="light" />
          </NavigationThemeProvider>
        </AstrologyProvider>
      </RevenueCatProvider>
    </AppThemeProvider>
  );
}