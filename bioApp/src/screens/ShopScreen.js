import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { CATEGORY_OPTIONS } from '../data/categories';
import { PRICE_LOW, PRICE_HIGH, PRICE_MEDIUM } from '../data/priceRanges';
import { colors } from '../theme/colors';

export default function ShopScreen({ navigation }) {
  const localProducts = useSelector((state) => state.products.list);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const filtered = useMemo(() => {
    const source = localProducts;
    return source.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase())
      const matchCat = selectedCategory === 'all' ? true : p.category === selectedCategory;
      let matchPrice = true;
      if (priceRange === PRICE_LOW) matchPrice = p.price < 500;
      else if (priceRange === PRICE_MEDIUM) matchPrice = p.price >= 500 && p.price <= 800;
      else if (priceRange === PRICE_HIGH) matchPrice = p.price > 800;
      return matchQuery && matchCat && matchPrice;
    });
  }, [localProducts, query, selectedCategory, priceRange]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);

  useEffect(() => {
    Animated.timing(animHeight, {
      toValue: filtersOpen ? contentHeight.current : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [filtersOpen]);

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={query} onChange={setQuery} />

      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => setFiltersOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
        >
          <Text style={{ color: colors.white, fontWeight: '700' }}>Filtros</Text>
          <Text style={{ color: colors.white, marginLeft: 8 }}>{filtersOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={{ overflow: 'hidden', height: animHeight }}>
        <View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            contentHeight.current = h;
            if (filtersOpen) {
              animHeight.setValue(h);
            }
          }}
        >
          <FilterBar
            categories={CATEGORY_OPTIONS}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </View>
      </Animated.View>
      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: colors.gray, fontSize: 16, textAlign: 'center' }}>No encontramos productos con esas caracteristicas :(</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard variant="fixed" product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />
          )}
        />
      )}
    </View>
  );
}