import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import ProductCard from '../components/ProductCard';
import { CATEGORY_OPTIONS } from '../data/categories';
import ProductCarousel from '../components/ProductCarousel';

export default function HomeScreen({ navigation }) {
  const products = useSelector((state) => state.products.list);
  const featured = useMemo(() => products.filter((p) => p.featured), [products]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const filteredFeatured = useMemo(() => {
    if (selectedCategory === 'all') return featured;
    return featured.filter((p) => p.category === selectedCategory);
  }, [featured, selectedCategory]);

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
      data={filteredFeatured}
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