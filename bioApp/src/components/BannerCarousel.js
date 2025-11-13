import React, { useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme/colors';

const banners = [
  'https://images.unsplash.com/photo-1554284126-aa88f22d8b55?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519869325930-2816f8f64cd1?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571019613455-1f06b31c0d1a?q=80&w=1600&auto=format&fit=crop',
];

export default function BannerCarousel() {
  const scrollRef = useRef(null);
  const { width } = Dimensions.get('window');
  const slideWidth = width;
  const intervalRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % banners.length;
      scrollRef.current?.scrollTo({ x: indexRef.current * slideWidth, animated: true });
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [slideWidth]);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {banners.map((uri) => (
          <Image key={uri} source={{ uri }} style={{ width: slideWidth, height: 160 }} contentFit="cover" cachePolicy="memory-disk" />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
});