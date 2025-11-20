import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { removeFromCart, setQuantity, setShipping, clearCart } from '../store/cartSlice';
import { addOrder } from '../store/authSlice';
import Constants from 'expo-constants';
import { usePayment } from '../services/payment';
import SmartImage from '../components/SmartImage';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../components/ToastProvider';
import { formatCurrencyMXN, amountColor } from '../utils/currency';
import { Linking } from 'react-native';
import { Platform } from 'react-native';

export default function CartScreen() {
  const { items, shipping } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const [taxRate] = useState(0.21);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const { initialize, pay } = usePayment();
  const navigation = useNavigation();
  const toast = useToast();

  const products = useSelector((s) => s.products.list);

  const enrichedItems = useMemo(() =>
    items.map((it) => ({
      ...it,
      product: products.find((p) => p.id === it.productId) || { id: it.productId, name: 'Producto', price: 0, image: null, brand: '' },
    })),
    [items, products]
  );

  const subtotal = useMemo(() => enrichedItems.reduce((acc, it) => acc + (it.product?.price || 0) * it.quantity, 0), [enrichedItems]);
  const shippingCost = useMemo(() => {
    if (shipping === 'express') return 10;
    if (shipping === 'standard') return subtotal >= 60 ? 0 : 5;
    return 0;
  }, [shipping, subtotal]);
  const taxes = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
  const total = useMemo(() => subtotal + shippingCost + taxes, [subtotal, shippingCost, taxes]);

  const simulatePayment = () => {
    const order = {
      id: 'ord_' + Date.now(),
      items: enrichedItems,
      total,
      date: new Date().toISOString(),
    };
    dispatch(addOrder(order));
    dispatch(clearCart());
    alert('Pago completado en modo prueba. ¡Gracias por tu compra!');
  };

  const handlePay = async () => {
    // Prevent proceeding if cart is empty
    if (!items || items.length === 0) {
      toast.show({ type: 'warning', icon: 'warning', message: 'No hay productos en el carrito' });
      return;
    }

    // Ensure at least one item has quantity > 0 and in-stock
    const hasAvailable = enrichedItems.some((it) => (it.quantity || 0) > 0 && (it.product?.stock || 0) > 0);
    if (!hasAvailable) {
      toast.show({ type: 'warning', icon: 'warning', message: 'No hay productos disponibles en stock' });
      return;
    }

    // Navigate to Checkout screen to collect buyer info before payment
    try {
      navigation.navigate('Checkout', { items: enrichedItems, total });
    } catch (e) {
      toast.show({ type: 'error', icon: 'close-circle', message: e.message || String(e) });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Tu carrito</Text>
        <Text style={styles.headerSubtitle}>Revisa productos y continúa al pago</Text>
      </View>
      <FlatList
        data={enrichedItems}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.product.image && (
              <SmartImage uri={item.product.image} alt={item.product.name} style={styles.thumb} contentFit="cover" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.brand}>{item.product.brand}</Text>
              <Text style={[styles.price, { color: amountColor(item.product.price) }]}>{`${formatCurrencyMXN(item.product.price)} x ${item.quantity}`}</Text>
            </View>
            <View style={styles.qtyWrap}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => dispatch(setQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))}><Text style={styles.qtyText}>-</Text></TouchableOpacity>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              {(() => {
                const available = item.product?.stock ?? item.product?.STOCK_PROD ?? 0;
                const requested = (item.quantity || 0) + 1;
                const canIncrement = requested <= available;
                return (
                  <TouchableOpacity
                    style={[styles.qtyBtn, !canIncrement && styles.qtyBtnDisabled]}
                    onPress={() => {
                      if (!canIncrement) {
                        toast.show({ type: 'warning', icon: 'warning', message: 'No hay suficiente stock para esa cantidad' });
                        return;
                      }
                      dispatch(setQuantity({ productId: item.productId, quantity: requested }));
                    }}
                    disabled={!canIncrement}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                );
              })()}
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => {
                dispatch(removeFromCart({ productId: item.productId }));
                toast.show({ type: 'warning', icon: 'trash', message: 'Producto eliminado del carrito' });
              }}
            ><Text style={styles.removeText}>Quitar</Text></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.gray, textAlign: 'center', marginTop: 24 }}>Tu carrito está vacío</Text>}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumen de compra</Text>
        <TouchableOpacity onPress={() => setDetailsVisible(!detailsVisible)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>más detalle</Text>
        </TouchableOpacity>
        {detailsVisible && (
          <View style={styles.accordionContent}>
            <View style={styles.shippingRow}>
              <Text style={styles.label}>Envío:</Text>
              <View style={styles.shippingBtns}>
                {[
                  { id: 'standard', label: 'Estándar' },
                  { id: 'express', label: 'Express' },
                ].map((opt) => (
                  <TouchableOpacity key={opt.id} style={[styles.shipBtn, shipping === opt.id && styles.shipBtnActive]} onPress={() => { dispatch(setShipping(opt.id)); toast.show({ type: 'info', icon: 'airplane', message: `Envío ${opt.label} seleccionado` }); }}>
                    <Text style={[styles.shipText, shipping === opt.id && styles.shipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.totalsRow}><Text style={styles.label}>Subtotal</Text><Text style={[styles.value, { color: amountColor(subtotal) }]}>{formatCurrencyMXN(subtotal)}</Text></View>
            <View style={styles.totalsRow}><Text style={styles.label}>Envío</Text><Text style={[styles.value, { color: amountColor(shippingCost) }]}>{formatCurrencyMXN(shippingCost)}</Text></View>
            <View style={styles.totalsRow}><Text style={styles.label}>Impuestos (21%)</Text><Text style={[styles.value, { color: amountColor(taxes) }]}>{formatCurrencyMXN(taxes)}</Text></View>
          </View>
        )}
        <View style={[styles.totalsRow, styles.totalRow]}><Text style={[styles.label, styles.totalLabel]}>Total</Text><Text style={[styles.value, styles.totalValue, { color: amountColor(total) }]}>{formatCurrencyMXN(total)}</Text></View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay} accessibilityRole="button" accessibilityLabel="Pagar ahora">
          <Text style={styles.payText}>Pagar ahora</Text>
        </TouchableOpacity>
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ShopStack', { screen: 'Shop' })}>
            <Text style={styles.secondaryText}>Seguir comprando</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtnOutline]} onPress={() => { dispatch(clearCart()); toast.show({ type: 'warning', icon: 'warning', message: 'Carrito vaciado' }); }}>
            <Text style={[styles.secondaryText, { color: colors.accent }]}>Vaciar carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { color: colors.black, fontWeight: '800', fontSize: 22 },
  headerSubtitle: { color: colors.gray },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  name: { color: colors.black, fontWeight: '700' },
  brand: { color: colors.gray },
  price: { fontWeight: '700' },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  qtyBtn: { borderWidth: 1, borderColor: colors.navy, borderRadius: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: colors.navy },
  qtyValue: { marginHorizontal: 6, color: colors.black },
  qtyBtnDisabled: { borderColor: colors.grayLight, opacity: 0.5 },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  removeText: { color: colors.accent },
  summary: { padding: 16, borderTopWidth: 1, borderTopColor: colors.grayLight, backgroundColor: '#F9FAFB' },
  summaryTitle: { color: colors.black, fontWeight: '800', marginBottom: 8 },
  accordionHeader: {
    paddingVertical: 8,
  },
  accordionTitle: {
    color: colors.navy,
    fontWeight: '600',
    textAlign: 'right',
  },
  accordionContent: {
    paddingTop: 8,
  },
  shippingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.black },
  value: { color: colors.black },
  shippingBtns: { flexDirection: 'row' },
  shipBtn: { borderWidth: 1, borderColor: colors.navy, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  shipBtnActive: { backgroundColor: colors.navy },
  shipText: { color: colors.navy },
  shipTextActive: { color: colors.white },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  totalRow: { marginTop: 10 },
  totalLabel: { fontWeight: '800' },
  totalValue: { fontWeight: '800' },
  payBtn: { backgroundColor: colors.navy, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  payText: { color: colors.white, fontWeight: '700', textAlign: 'center' },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.navy, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.white },
  secondaryBtnOutline: { borderWidth: 1, borderColor: colors.accent, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.white },
});