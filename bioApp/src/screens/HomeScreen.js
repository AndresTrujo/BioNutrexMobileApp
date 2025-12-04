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
  const sliderCategories = useMemo(() => [{ id: 'all', name: 'Todos' }, ...CATEGORY_OPTIONS], []);

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
              navigation.navigate('ShopStack', { screen: 'ProductDetail', params: { productId: item.id, from: 'Home' } })
            }
          />
          <View style={styles.header}>
            <Text style={styles.title}>Promociones y destacados</Text>
            <Text style={styles.subtitle}>Explora las mejores ofertas del momento</Text>
            <View style={styles.categoriesSlider}>
              <FlatList
                data={sliderCategories}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.categoryPill, selectedCategory === item.id && styles.categoryPillActive]}
                    onPress={() => setSelectedCategory(item.id)}
                  >
                    <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingHorizontal: 2 }}
              />
            </View>
          </View>
        </View>
      )}
      data={visibleProducts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => navigation.getParent()?.navigate('ProductDetail', {
            productId: item.id,
            from: 'Home'
          })}
        />
      )}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.white, padding: 16 },
  title: { color: colors.navy, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.gray, marginTop: 4 },
  categoriesSlider: { marginTop: 12 },
  categoryPill: {
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  categoryPillActive: { backgroundColor: colors.navy },
  categoryText: { color: colors.navy },
  categoryTextActive: { color: colors.white },
});