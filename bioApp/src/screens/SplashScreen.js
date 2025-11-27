import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useDispatch } from 'react-redux';
import { setProducts } from '../store/productsSlice';

export default function SplashScreen({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const [fetchDone, setFetchDone] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => setAnimDone(true));
      }, 900);
    });
  }, [fade, scale]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const API_BASE = 'https://bionutrexmobile.duckdns.org';

    async function fetchProducts() {
      try {
        const res = await fetch(`${API_BASE}/api/products/`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : data.results || []).map((it) => ({
          id: String(it.id ?? it.ID_PRODUCTO ?? it.pk ?? it.pk_id ?? ''),
          name: it.name ?? it.PROD_NOMBRE ?? it.nombre ?? 'Producto',
          price: Number.parseFloat(it.price ?? it.PROD_PRECIO_PUB ?? it.precio ?? 0) || 0,
          category: it.category ?? it.PROD_CATEGORIA ?? null,
          image: it.image ?? it.PROD_IMAGEN ?? it.imagen ?? null,
          stock: Number.parseFloat(it.stock ?? it.STOCK_PROD ?? 0) || 0,
          description: it.description ?? it.PROD_DESCRIPCION_DESC ?? '',
          // preserve backend 'featured' flag if present; default to false
          featured: Boolean(it.featured) || false,
          ...it,
        }));

        // If backend didn't mark any products as featured, mark the first 6 so the
        // ProductCarousel has something to display on HomeScreen.
        if (!mapped.some((p) => p.featured) && mapped.length > 0) {
          for (let i = 0; i < Math.min(6, mapped.length); i += 1) {
            mapped[i].featured = true;
          }
        }

        if (mounted) dispatch(setProducts(mapped));
      } catch (err) {
        if (mounted) dispatch(setProducts([]));
      } finally {
        if (mounted) setFetchDone(true);
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    if (fetchDone && animDone) {
      onDone?.();
    }
  }, [fetchDone, animDone, onDone]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fade, transform: [{ scale }] }]}>
        <Text style={styles.logo}>bioApp</Text>
        <Text style={styles.tagline}>Nutrición deportiva, rendimiento y bienestar</Text>
      </Animated.View>
      {!fetchDone && animDone && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.loadingText}>Cargando productos…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  logo: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  tagline: { color: colors.gray, marginTop: 6 },
  loadingWrap: { marginTop: 20, alignItems: 'center' },
  loadingText: { color: colors.gray, marginTop: 8 },
});