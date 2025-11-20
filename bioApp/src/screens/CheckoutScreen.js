import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { formatCurrencyMXN, amountColor } from '../utils/currency';
import { usePayment } from '../services/payment';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../components/ToastProvider';
import { clearCart } from '../store/cartSlice';
import { addOrder } from '../store/authSlice';

export default function CheckoutScreen({ route }) {
    const { items: passedItems = [], total: passedTotal = 0 } = route.params || {};
    const products = useSelector((s) => s.products.list);
    const authUser = useSelector((s) => s.auth && s.auth.user);
    const enrichedItems = useMemo(() => passedItems.map((it) => ({
        ...it,
        product: products.find((p) => p.id === it.productId) || it.product || { id: it.productId, name: 'Producto', price: it.price || 0 },
    })), [passedItems, products]);

    const [fullName, setFullName] = useState(authUser?.name || '');
    const [email, setEmail] = useState(authUser?.email || '');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const { initialize, pay } = usePayment();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const toast = useToast();

    const subtotal = useMemo(() => enrichedItems.reduce((acc, it) => acc + (it.product?.price || 0) * (it.quantity || 1), 0), [enrichedItems]);
    const total = passedTotal || subtotal;

    const handlePayNow = async () => {
        setLoading(true);
        try {
            // Final validation: ensure cart has items and quantities do not exceed stock
            if (!enrichedItems || enrichedItems.length === 0) {
                toast.show({ type: 'warning', icon: 'warning', message: 'No hay productos en el carrito' });
                setLoading(false);
                return;
            }
            const invalid = enrichedItems.find((it) => !(it.quantity > 0) || ((it.product?.stock ?? it.product?.STOCK_PROD ?? 0) < (it.quantity || 0)));
            if (invalid) {
                const avail = invalid.product?.stock ?? invalid.product?.STOCK_PROD ?? 0;
                toast.show({ type: 'warning', icon: 'warning', message: `Cantidad no válida para ${invalid.product?.name || 'el producto'}. Disponible: ${avail}` });
                setLoading(false);
                return;
            }

            toast.show({ type: 'info', icon: 'cart', message: 'Creando orden y redirigiendo a Stripe...' });

            // Build API base (local dev fallback)
            const apiBase = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';
            const payload = { items: enrichedItems.map((it) => ({ productId: it.product.id || it.product.ID_PRODUCTO, quantity: it.quantity })), full_name: fullName, email, address, amount: total };

            let res;
            try {
                res = await fetch(`${apiBase}/orders/create-checkout/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } catch (e) {
                toast.show({ type: 'error', icon: 'close-circle', message: 'Error de red al crear la orden' });
                setLoading(false);
                return;
            }

            let json;
            try {
                json = await res.json();
            } catch (e) {
                toast.show({ type: 'error', icon: 'close-circle', message: 'Respuesta inválida del servidor' });
                setLoading(false);
                return;
            }

            if (!res.ok) {
                toast.show({ type: 'error', icon: 'close-circle', message: json.detail || json.error || 'No se pudo crear la orden' });
                setLoading(false);
                return;
            }

            const checkoutUrl = json.checkout_url || json.checkoutUrl || json.url;
            const orderId = json.order_id || json.orderId || json.id;
            // add order to local history as pending
            try {
                const order = { id: String(orderId || 'local_' + Date.now()), items: enrichedItems, total, date: new Date().toISOString() };
                dispatch(addOrder(order));
            } catch (e) {
                console.warn('Failed to add order to redux:', e);
            }

            if (!checkoutUrl) {
                toast.show({ type: 'error', icon: 'close-circle', message: 'No se obtuvo URL de pago de Stripe' });
                setLoading(false);
                return;
            }

            // Open Stripe Checkout in browser; ensure success_url set in backend to a deep link (e.g., myapp://payment-success)
            try {
                await Linking.openURL(checkoutUrl);
            } catch (e) {
                toast.show({ type: 'error', icon: 'close-circle', message: 'No se pudo abrir Stripe Checkout' });
                setLoading(false);
                return;
            }

            // We don't mark the order paid here; webhook or deep-link return will handle marking as paid and navigation.
        } catch (e) {
            toast.show({ type: 'error', icon: 'close-circle', message: e.message || String(e) });
        } finally {
            setLoading(false);
        }
    };

    // If auth user changes while on this screen, prefill fields (only when empty)
    React.useEffect(() => {
        if (!authUser) return;
        if (!fullName) setFullName(authUser.name || '');
        if (!email) setEmail(authUser.email || '');
    }, [authUser]);

    const handleClosePress = () => {
        const doClose = () => {
            try {
                if (navigation && navigation.canGoBack && navigation.canGoBack()) {
                    navigation.goBack();
                } else if (navigation && navigation.navigate) {
                    // fallback to main tabs/home
                    navigation.navigate('MainTabs', { screen: 'Home' });
                }
            } catch (e) {
                // final fallback
                try { navigation.navigate('MainTabs', { screen: 'Home' }); } catch (err) { /* ignore */ }
            }
        };

        if (Platform.OS === 'web') {
            // simple confirm dialog in web builds
            if (typeof window !== 'undefined' && window.confirm) {
                if (window.confirm('¿Deseas salir del formulario? Se perderán los datos ingresados.')) doClose();
            } else {
                doClose();
            }
            return;
        }

        Alert.alert('Cancelar compra', '¿Deseas salir del formulario? Se perderán los datos ingresados.', [
            { text: 'No', style: 'cancel' },
            { text: 'Sí, salir', style: 'destructive', onPress: doClose },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.title}>Datos de envío y facturación</Text>
            <TextInput placeholder="Nombre completo" style={styles.input} value={fullName} onChangeText={setFullName} />
            <TextInput placeholder="Correo electrónico" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Dirección" style={[styles.input, { height: 80 }]} value={address} onChangeText={setAddress} multiline />

            <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Resumen</Text>
                {enrichedItems.map((it) => (
                    <View key={it.productId} style={styles.row}>
                        <Text style={styles.name}>{it.product?.name}</Text>
                        <Text style={[styles.value, { color: amountColor(it.product?.price || 0) }]}>{formatCurrencyMXN((it.product?.price || 0) * it.quantity)}</Text>
                    </View>
                ))}
                <View style={styles.row}><Text style={styles.name}>Total</Text><Text style={[styles.value, { color: amountColor(total) }]}>{formatCurrencyMXN(total)}</Text></View>
            </View>

            <TouchableOpacity style={[styles.payBtn, loading && { opacity: 0.6 }]} onPress={handlePayNow} disabled={loading}>
                <Text style={styles.payText}>{loading ? 'Procesando...' : 'Pagar ahora'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClosePress} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancelar compra</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.black },
    input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: colors.white },
    summary: { marginTop: 12, padding: 12, backgroundColor: '#FBFBFD', borderRadius: 8 },
    summaryTitle: { fontWeight: '700', marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    name: { color: colors.black },
    value: { color: colors.black },
    payBtn: { backgroundColor: colors.navy, paddingVertical: 12, borderRadius: 8, marginTop: 16, alignItems: 'center' },
    payText: { color: colors.white, fontWeight: '700' },
    cancelBtn: { marginTop: 12, borderWidth: 1, borderColor: colors.navy, borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.white },
    cancelText: { color: colors.navy, fontWeight: '700' },
});
