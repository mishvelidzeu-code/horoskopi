import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// 🔴 შემოგვაქვს ჩვენი გამარტივებული თემების კონტექსტი
import { ThemeProvider as AppThemeProvider } from '../lib/ThemeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppThemeProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* საწყისი ეკრანი */}
          <Stack.Screen name="index" />
          
          {/* ავტორიზაცია და ონბორდინგი */}
          <Stack.Screen name="auth" />
          <Stack.Screen name="onboarding" />
          
          {/* მთავარი ტაბები */}
          <Stack.Screen name="(tabs)" />
          
          {/* თავსებადობის მოდალი */}
          <Stack.Screen 
            name="compatibility" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }} 
          />
          
          <Stack.Screen name="element/[id]" options={{ animation: 'fade' }} />
          
          {/* 🔴 აქედან წაიშალა theme-selector */}
          
          {/* პრაიმ გამოწერის ეკრანი */}
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
    </AppThemeProvider>
  );
}