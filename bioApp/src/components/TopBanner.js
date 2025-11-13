import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';

export default function TopBanner({ text = 'BIONUTREX', height = 90 }) {
  const { width } = useWindowDimensions();
  const fontSize = width < 380 ? 24 : width < 768 ? 28 : 32;
  return (
    <View style={[styles.banner, Platform.OS === 'web' ? styles.bannerWeb : null, { height, minHeight: 80 }]}>
      <Text style={[styles.title, { fontSize }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    zIndex: 1000,
    elevation: 4,
  },
  bannerWeb: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' ? { fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' } : {}),
    textAlign: 'center',
  },
});