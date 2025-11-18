import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { PRICE_RANGES } from '../data/priceRanges';

export default function FilterBar({ categories, selectedCategory, setSelectedCategory, priceRange, setPriceRange }) {
  const priceRanges = PRICE_RANGES;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.wrap}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCategory(selectedCategory === c.id ? 'all' : c.id)}
              style={({ pressed }) => [
                styles.pill,
                selectedCategory === c.id && styles.pillActive,
                pressed && styles.pillPressed,
              ]}
              onHoverIn={Platform.OS === 'web' ? undefined : undefined}
            >
              <Text style={[styles.pillText, selectedCategory === c.id && styles.pillTextActive]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Precio</Text>
        <View style={styles.wrap}>
          {priceRanges.map((pr) => (
            <Pressable
              key={pr.id}
              onPress={() => setPriceRange(priceRange === pr.id ? 'all' : pr.id)}
              style={({ pressed }) => [styles.pill, priceRange === pr.id && styles.pillActive, pressed && styles.pillPressed]}
            >
              <Text style={[styles.pillText, priceRange === pr.id && styles.pillTextActive]}>{pr.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  row: { marginBottom: 8 },
  label: { color: colors.black, marginBottom: 6, fontWeight: '600' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  pillActive: { backgroundColor: colors.navy },
  pillPressed: { opacity: 0.85 },
  pillText: { color: colors.navy },
  pillTextActive: { color: colors.white },
});