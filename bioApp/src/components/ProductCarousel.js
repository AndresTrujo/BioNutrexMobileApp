import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import SmartImage from './SmartImage';
import { formatCurrencyMXN, amountColor } from '../utils/currency';

export default function ProductCarousel({ products = [], onPressItem }) {
  const { width } = Dimensions.get('window');
  const spacing = 12;
  const cardWidth = Math.max(280, Math.min(420, Math.floor(width * 0.78)));
  const snapInterval = cardWidth + spacing;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPressItem?.(item)}
            style={{ width: cardWidth, marginRight: spacing }}
          >
            {item.image && (
              <SmartImage uri={item.image} alt={item.name} style={styles.image} contentFit="cover" />
            )}
            <View style={styles.overlay}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.price, { color: amountColor(item.price) }]}>{formatCurrencyMXN(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  image: { width: '100%', height: 160, borderRadius: 12 },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  name: { color: '#FFFFFF', fontWeight: '700' },
  price: { marginTop: 4 },
});