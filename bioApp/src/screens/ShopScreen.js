import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, BRANDS } from '../data/products';
import { colors } from '../theme/colors';

export default function ShopScreen({ navigation }) {
  const localProducts = useSelector((state) => state.products.list);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [remoteError, setRemoteError] = useState(null);

  // Use 'localhost' on iOS simulator / web, use 10.0.2.2 for Android emulator
  const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  // Fetch remote products once
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function fetchProducts() {
      setLoadingRemote(true);
      setRemoteError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products/`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : data.results || []).map((it) => ({
          id: String(it.id ?? it.ID_PRODUCTO ?? it.pk ?? it.pk_id ?? ''),
          name: it.name ?? it.PROD_NOMBRE ?? it.nombre ?? 'Producto',
          price: parseFloat(it.price ?? it.PROD_PRECIO_PUB ?? it.precio ?? 0) || 0,
          category: it.category ?? it.PROD_CATEGORIA ?? null,
          ...it,
        }));
        if (mounted) setRemoteProducts(mapped);
      } catch (err) {
        if (mounted) setRemoteError(err.message || 'Fetch error');
      } finally {
        if (mounted) setLoadingRemote(false);
      }
    }
    fetchProducts();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [API_BASE]);

  const filtered = useMemo(() => {
    const source = remoteProducts.length ? remoteProducts : localProducts;
    return source.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase())
      const matchCat = selectedCategory === 'all' ? true : p.category === selectedCategory;
      let matchPrice = true;
      if (priceRange === 'lt30') matchPrice = p.price < 30;
      else if (priceRange === '30to60') matchPrice = p.price >= 30 && p.price <= 60;
      else if (priceRange === 'gt60') matchPrice = p.price > 60;
      return matchQuery && matchCat && matchPrice;
    });
  }, [localProducts, remoteProducts, query, selectedCategory, priceRange]);
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
      {loadingRemote && <Text style={{ paddingHorizontal: 12, color: colors.navy }}>Cargando productos...</Text>}
      {remoteError && <Text style={{ paddingHorizontal: 12, color: 'red' }}>Error: {remoteError}</Text>}
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
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </View>
      </Animated.View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard variant="fixed" product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />
        )}
      />
    </View>
  );
}