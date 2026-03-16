import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
// 🔴 დავამატეთ StatusBar იმპორტებში
import { Platform, StatusBar, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
// 🔴 ვიყენებთ ჩვენს კონტექსტს
import { useAppTheme } from '../../lib/ThemeContext';

export default function TabLayout() {
  // 🔴 ახლა ვიღებთ პირდაპირ colors-ს
  const { colors } = useAppTheme();

  return (
    <>
      {/* 🔴 აქ ვსვამთ გლობალურ სტატუსბარს, რომ ყველა ტაბზე ერთნაირი იყოს */}
      <StatusBar barStyle="light-content" />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary, 
          tabBarInactiveTintColor: colors.textMuted, 
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === 'ios' ? 88 : 65,
            backgroundColor: colors.surface, 
          },
          tabBarBackground: () => (
            <BlurView 
              intensity={80} 
              // 🔴 რადგან მხოლოდ მუქი თემა გვაქვს, თინთიც სულ dark-ია
              tint="dark" 
              style={StyleSheet.absoluteFill} 
            />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginBottom: Platform.OS === 'ios' ? 0 : 10,
          },
        }}>
        
        <Tabs.Screen
          name="home"
          options={{
            title: 'მთავარი',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="explore"
          options={{
            title: 'აღმოაჩინე',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "compass" : "compass-outline"} size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="natural"
          options={{
            title: 'რუკა',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "planet" : "planet-outline"} size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="tarot"
          options={{
            title: 'ტარო',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'პროფილი',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}