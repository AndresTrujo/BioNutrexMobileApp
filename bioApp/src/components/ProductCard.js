import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import SmartImage from './SmartImage';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from './ToastProvider';
import { formatCurrencyMXN, amountColor } from '../utils/currency';
import { useNavigation } from '@react-navigation/native';

export default function ProductCard({ product, onPress, variant = 'default' }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  const animateIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const animateOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.auth.wishlist);
  const user = useSelector((s) => s.auth.user);
  const inWishlist = wishlist.includes(product.id);
  const toast = useToast();
  const navigation = useNavigation();

  const handleAddCart = () => {
    dispatch(addToCart({ productId: product.id }));
    toast.show({ message: 'Agregado al carrito', icon: 'basket' });
  };

  const handleToggleWishlist = () => {
    if (!user) {
      toast.show({
        type: 'info',
        message: 'Para guardar en tu wishlist, por favor inicia sesión',
        icon: 'information-circle',
        actionLabel: 'Ir al login',
        onAction: () => navigation.navigate('Profile'),
      });
      return;
    }
    if (inWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.show({ type: 'success', message: 'Quitado de deseos', icon: 'heart' });
    } else {
      dispatch(addToWishlist(product.id));
      toast.show({ type: 'success', message: 'Añadido a deseos', icon: 'heart' });
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={animateIn}
      onPressOut={animateOut}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
    >
      <Animated.View style={[styles.card, variant === 'fixed' && styles.cardFixed, { transform: [{ scale }] }, hovered && styles.cardHover]}>
        {product.image && (
          <SmartImage uri={product.image} style={[styles.image, variant === 'fixed' && styles.imageFixed]} alt={product.name} contentFit="cover" />
        )}
        <View style={styles.header}>
          <Text style={[styles.price, { color: amountColor(product.price) }]}>{formatCurrencyMXN(product.price)}</Text>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleAddCart}
            accessibilityRole="button"
            accessibilityLabel={`Agregar ${product.name} al carrito`}
          >
            <Ionicons name="basket" size={16} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.btnPrimaryText}>Agregar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSecondary, inWishlist && styles.btnSecondaryActive]}
            onPress={handleToggleWishlist}
            accessibilityRole="button"
            accessibilityLabel={`${inWishlist ? 'Quitar' : 'Añadir'} ${product.name} a deseos`}
          >
            <Ionicons name="heart" size={16} color={inWishlist ? colors.white : colors.navy} style={{ marginRight: 6 }} />
            <Text style={[styles.btnSecondaryText, inWishlist && styles.btnSecondaryTextActive]}>
              {inWishlist ? 'Quitar' : 'Deseos'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.grayLight,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  cardHover: { elevation: 3, shadowOpacity: 0.15 },
  image: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  imageFixed: { height: 220 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  brand: { color: colors.gray, fontWeight: '600' },
  price: { fontWeight: '700' },
  name: { color: colors.black, fontSize: 16, marginBottom: 4 },
  rating: { color: colors.accent },
  cardFixed: { minHeight: 400, width: '100%' },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  btnPrimaryText: { color: colors.white, fontWeight: '700' },
  btnSecondary: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.navy, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnSecondaryActive: { backgroundColor: colors.navy },
  btnSecondaryText: { color: colors.navy, fontWeight: '700' },
  btnSecondaryTextActive: { color: colors.white },
});