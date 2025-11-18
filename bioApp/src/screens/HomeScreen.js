import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import ProductCard from '../components/ProductCard';
import { CATEGORY_OPTIONS } from '../data/categories';
import ProductCarousel from '../components/ProductCarousel';
import FilterBar from '../components/FilterBar';

export default function HomeScreen({ navigation }) {
  const products = useSelector((state) => state.products.list);
  const featured = useMemo(() => products.filter((p) => p.featured), [products]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Visible list for the bottom section:
  // - if a specific category is selected: return the first 6 products of that category
  // - if 'all' is selected: return 6 random products from the whole products list
  const visibleProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      const pool = products && products.length ? [...products] : [];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, 6);
    }
    return products.filter((p) => p.category === selectedCategory).slice(0, 6);
  }, [products, selectedCategory]);

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View>
          <ProductCarousel
            products={featured.slice(0, 6)}
            onPressItem={(item) =>
              navigation.navigate('ShopStack', { screen: 'ProductDetail', params: { productId: item.id } })
            }
          />
          <View style={styles.header}>
            <Text style={styles.title}>Promociones y destacados</Text>
            <Text style={styles.subtitle}>Explora las mejores ofertas del momento</Text>
            <View style={styles.categories}>
              <TouchableOpacity key={'all'} style={[styles.categoryPill, selectedCategory === 'all' && styles.categoryPillActive]} onPress={() => setSelectedCategory('all')}>
                <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>Todos</Text>
              </TouchableOpacity>
              {CATEGORY_OPTIONS.map((c) => (
                <TouchableOpacity key={c.id} style={[styles.categoryPill, selectedCategory === c.id && styles.categoryPillActive]} onPress={() => setSelectedCategory(c.id)}>
                  <Text style={[styles.categoryText, selectedCategory === c.id && styles.categoryTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
      data={visibleProducts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => navigation.navigate('ShopStack', { screen: 'ProductDetail', params: { productId: item.id } })} />
      )}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.white, padding: 16 },
  title: { color: colors.navy, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.gray, marginTop: 4 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  categoryPill: {
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryPillActive: { backgroundColor: colors.navy },
  categoryText: { color: colors.navy },
  categoryTextActive: { color: colors.white },
});