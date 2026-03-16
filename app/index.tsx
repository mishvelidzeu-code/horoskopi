import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const COLORS = {
  bg: '#000005',
  primary: '#FFD700',
  secondary: '#C0C0C0',
  light: 'rgba(255, 255, 255, 0.8)',
  dimmed: 'rgba(255, 255, 255, 0.4)',
  deepBlue: '#001A33',
};

const constellationPoints = [
  { x: 0.2, y: 0.3 }, { x: 0.3, y: 0.2 }, { x: 0.5, y: 0.15 }, { x: 0.7, y: 0.2 }, { x: 0.8, y: 0.3 },
  { x: 0.75, y: 0.5 }, { x: 0.6, y: 0.6 }, { x: 0.4, y: 0.6 }, { x: 0.25, y: 0.5 }, { x: 0.2, y: 0.3 },
  { x: 0.4, y: 0.4 }, { x: 0.6, y: 0.4 }, { x: 0.5, y: 0.55 }, { x: 0.5, y: 0.15 }, { x: 0.5, y: 0.55 },
  { x: 0.5, y: 0.8 }, { x: 0.35, y: 0.75 }, { x: 0.65, y: 0.75 }, { x: 0.5, y: 0.8 }, { x: 0.5, y: 0.15 }
];

type Point = { x: number; y: number };

const calculateLine = (p1: Point, p2: Point) => {
  const dx = (p2.x - p1.x) * width;
  const dy = (p2.y - p1.y) * height;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return { length, angle, x: p1.x * width, y: p1.y * height };
};

export default function PremiumSplashScreen() {
  const bgOpacity = useSharedValue(0);
  const constellationOpacity = useSharedValue(0);
  const geometryLineOpacity = useSharedValue(0);
  const celestialSphereScale = useSharedValue(1.2);
  const celestialSphereRotate = useSharedValue(0);
  const coreElementScale = useSharedValue(0);
  const coreElementOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    // ანიმაციების დაწყება
    bgOpacity.value = withTiming(1, { duration: 1500 });
    celestialSphereScale.value = withTiming(1, { duration: 3000, easing: Easing.out(Easing.back(1.2)) });
    constellationOpacity.value = withDelay(800, withTiming(1, { duration: 2500 }));
    geometryLineOpacity.value = withDelay(1200, withTiming(1, { duration: 2000 }));

    celestialSphereRotate.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );

    coreElementScale.value = withDelay(2000, withTiming(1, { duration: 2000, easing: Easing.out(Easing.exp) }));
    coreElementOpacity.value = withDelay(2000, withTiming(1, { duration: 1500 }));
    textOpacity.value = withDelay(3000, withTiming(1, { duration: 1500 }));
    textY.value = withDelay(3000, withTiming(0, { duration: 1500, easing: Easing.out(Easing.exp) }));
    footerOpacity.value = withDelay(3500, withTiming(1, { duration: 1000 }));
    
    // პროგრეს ბარი 5.5 წამში ივსება
    barWidth.value = withTiming(1, { duration: 5500 }, () => {
        // როცა პროგრეს ბარი შეივსება, მაშინ გადავიდეს შემდეგ ეკრანზე
        runOnJS(checkAndNavigate)();
    });
  }, []);

  const checkAndNavigate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/auth');
    }
  };

  const celestialSphereStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celestialSphereScale.value }, { rotate: `${celestialSphereRotate.value}deg` }],
    opacity: bgOpacity.value,
  }));

  const coreElementStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreElementScale.value }],
    opacity: coreElementOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1200&auto=format&fit=crop' }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 5, 0.9)' }]} />

      <Animated.View style={[styles.celestialSphere, celestialSphereStyle]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1543722524-a4c315e811c7?q=80&w=600&auto=format&fit=crop' }}
          style={styles.celestialSphereImage}
          contentFit="cover"
        />
        <View style={styles.celestialOverlay} />
      </Animated.View>

      <View style={StyleSheet.absoluteFill}>
        {constellationPoints.map((point, index) => (
          <Animated.View
            key={`point-${index}`}
            style={[styles.constellationPoint, { left: point.x * width, top: point.y * height }, { opacity: constellationOpacity }]}
          />
        ))}
        {constellationPoints.slice(0, -1).map((p1, index) => {
          const p2 = constellationPoints[index + 1];
          const { length, angle, x, y } = calculateLine(p1, p2);
          return (
            <Animated.View
              key={`line-${index}`}
              style={[
                styles.geometryLine, 
                { width: length, transform: [{ rotate: `${angle}deg` }], left: x, top: y }, 
                { opacity: geometryLineOpacity }
              ]}
            />
          );
        })}
      </View>

      <Animated.View style={[styles.coreElementContainer, coreElementStyle]}>
        <Image
          source={{ uri: 'https://cdn.icon-icons.com/icons2/3358/PNG/512/sacred_geometry_esoteric_magic_icon_210403.png' }} 
          style={styles.coreElement}
          tintColor={COLORS.primary}
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.brandName}>A S T R O L O G I</Text>
        <View style={styles.separator} />
        <Text style={styles.slogan}>Your destiny in the stars</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <View style={styles.loaderLineBg}>
          <Animated.View style={[styles.loaderLineFill, { width: barWidth.value * (width * 0.6) }]} />
        </View>
        <Text style={styles.loadingText}>Connecting to celestial forces...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  celestialSphere: { position: 'absolute', width: width * 1.5, height: width * 1.5, borderRadius: width * 0.75, overflow: 'hidden', zIndex: 1 },
  celestialSphereImage: { width: '100%', height: '100%', opacity: 0.1 },
  celestialOverlay: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.05)', borderRadius: width * 0.75 },
  constellationPoint: { position: 'absolute', width: 3, height: 3, backgroundColor: COLORS.secondary, borderRadius: 1.5, zIndex: 10 },
  geometryLine: { position: 'absolute', height: 1, backgroundColor: 'rgba(255, 215, 0, 0.2)', transformOrigin: 'top left', zIndex: 5 },
  coreElementContainer: { position: 'absolute', top: height * 0.35, left: width * 0.25, width: width * 0.5, height: width * 0.5, zIndex: 20, justifyContent: 'center', alignItems: 'center' },
  coreElement: { width: '100%', height: '100%', opacity: 0.8 },
  textContainer: { marginTop: height * 0.3, alignItems: 'center', zIndex: 30 },
  brandName: { color: COLORS.light, fontSize: 24, fontWeight: '200', letterSpacing: 10, textTransform: 'uppercase' },
  separator: { height: 1, width: 60, backgroundColor: COLORS.primary, marginVertical: 20, opacity: 0.6 },
  slogan: { color: COLORS.dimmed, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '300' },
  footer: { position: 'absolute', bottom: 60, alignItems: 'center', zIndex: 30 },
  loaderLineBg: { width: width * 0.6, height: 1, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', borderRadius: 0.5 },
  loaderLineFill: { height: '100%', backgroundColor: COLORS.primary },
  loadingText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 12, letterSpacing: 2, fontWeight: '300' },
});