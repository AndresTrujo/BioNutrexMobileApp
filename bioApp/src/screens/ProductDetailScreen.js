import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/authSlice';
import SmartImage from '../components/SmartImage';
import { Video } from 'expo-av';
import { useToast } from '../components/ToastProvider';
import { formatCurrencyMXN, amountColor } from '../utils/currency';
import { useNavigation } from '@react-navigation/native';

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const product = useSelector((s) => s.products.list.find((p) => p.id === productId));
  const wishlist = useSelector((s) => s.auth.wishlist);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const inWishlist = wishlist.includes(productId);
  const toast = useToast();
  const navigation = useNavigation();

  if (!product) return <View style={styles.container}><Text>Producto no encontrado</Text></View>;

  return (
    <View style={styles.container}>
      {product.image && (
        <SmartImage uri={product.image} style={styles.image} alt={product.name} />
      )}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={[styles.price, { color: amountColor(product.price) }]}>{formatCurrencyMXN(product.price)}</Text>
      <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      {product.video && (
        <View style={{ marginTop: 12 }}>
          <Video
            source={{ uri: product.video }}
            style={{ width: '100%', height: 200, borderRadius: 8 }}
            useNativeControls
            resizeMode="cover"
          />
        </View>
      )}
      <View style={styles.row}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => { dispatch(addToCart({ productId })); toast.show({ type: 'success', icon: 'basket', message: 'Agregado al carrito' }); }}>
          <Text style={styles.btnPrimaryText}>Añadir al carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSecondary, inWishlist && styles.btnSecondaryActive]}
          onPress={() => {
            if (!user) {
              toast.show({ type: 'info', icon: 'information-circle', message: 'Para guardar en tu wishlist, por favor inicia sesión', actionLabel: 'Ir al login', onAction: () => navigation.navigate('Profile') });
              return;
            }
            if (inWishlist) {
              dispatch(removeFromWishlist(productId));
              toast.show({ type: 'success', icon: 'heart', message: 'Quitado de deseos' });
            } else {
              dispatch(addToWishlist(productId));
              toast.show({ type: 'success', icon: 'heart', message: 'Añadido a deseos' });
            }
          }}
        >
          <Text style={[styles.btnSecondaryText, inWishlist && styles.btnSecondaryTextActive]}>
            {inWishlist ? 'Quitar de deseos' : 'Añadir a deseos'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 16 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  name: { color: colors.black, fontSize: 20, fontWeight: '700' },
  brand: { color: colors.gray, marginTop: 4 },
  price: { marginTop: 6, fontWeight: '700' },
  rating: { color: colors.accent, marginTop: 4 },
  desc: { color: colors.black, marginTop: 12 },
  row: { flexDirection: 'row', marginTop: 16 },
  btnPrimary: { backgroundColor: colors.navy, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginRight: 8 },
  btnPrimaryText: { color: colors.white, fontWeight: '700' },
  btnSecondary: { borderWidth: 1, borderColor: colors.navy, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  btnSecondaryActive: { backgroundColor: colors.navy },
  btnSecondaryText: { color: colors.navy, fontWeight: '700' },
  btnSecondaryTextActive: { color: colors.white },
});