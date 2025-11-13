import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

export default function SplashScreen({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onDone?.());
      }, 900);
    });
  }, [fade, scale, onDone]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fade, transform: [{ scale }] }]}>
        <Text style={styles.logo}>bioApp</Text>
        <Text style={styles.tagline}>Nutrición deportiva, rendimiento y bienestar</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  logo: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  tagline: { color: colors.gray, marginTop: 6 },
});