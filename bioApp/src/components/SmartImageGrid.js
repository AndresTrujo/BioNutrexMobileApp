import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import SmartImage from './SmartImage';

/**
 * SmartImageGrid
 * - Grid virtualizado para alto rendimiento con múltiples imágenes
 * - Usa FlatList con windowSize, removeClippedSubviews, initialNumToRender
 */
export default function SmartImageGrid({ items, numColumns = 2, itemGap = 8, imageHeight = 140 }) {
  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: itemGap / 2 }}>
      <SmartImage uri={item.uri} alt={item.alt || 'Imagen'} style={{ width: '100%', height: imageHeight, borderRadius: 8 }} />
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(it, idx) => it.id ?? String(idx)}
      numColumns={numColumns}
      renderItem={renderItem}
      contentContainerStyle={[styles.container, { padding: itemGap / 2 }]}
      initialNumToRender={Math.min(10, items?.length ?? 0)}
      removeClippedSubviews
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
});