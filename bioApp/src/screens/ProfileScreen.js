import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { login, logout, register, setAuth } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../components/ToastProvider';
import { useNavigation } from '@react-navigation/native';
import { formatCurrencyMXN, amountColor } from '../utils/currency';

export default function ProfileScreen() {
  const { user, orders, wishlist } = useSelector((s) => s.auth);
  const products = useSelector((s) => s.products.list);
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  const toast = useToast();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Crea una cuenta o inicia sesión</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.gray} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor={colors.gray} style={styles.input} secureTextEntry />
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('SignUp', { from: 'Profile' })}><Text style={styles.btnText}>Registrarme</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={async () => {
            if (!email || !password) {
              toast.show({ type: 'warning', icon: 'warning', message: 'Ingresa email y contraseña' });
              return;
            }
            try {
              const res = await fetch(`${API_BASE}/api/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }),
              });
              const json = await res.json();
              if (res.ok) {
                const tokens = { access: json.access, refresh: json.refresh };
                await AsyncStorage.setItem('authTokens', JSON.stringify(tokens));
                const displayName = email.includes('@') ? email.split('@')[0] : email;
                dispatch(setAuth({ user: { name: displayName, email }, tokens }));
                toast.show({ type: 'success', icon: 'checkmark-circle', message: 'Inicio de sesión correcto' });
              } else {
                toast.show({ type: 'error', icon: 'close-circle', message: json.detail || 'Credenciales incorrectas' });
              }
            } catch (e) {
              toast.show({ type: 'error', icon: 'close-circle', message: e.message || String(e) });
            }
          }}><Text style={styles.btnTextSecondary}>Iniciar sesión</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={{ marginTop: 8 }} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={{ color: colors.navy, textAlign: 'center' }}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View style={styles.container}>
          <Text style={styles.title}>Hola, {user.name}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await AsyncStorage.removeItem('authTokens'); dispatch(logout()); }}><Text style={styles.logoutText}>Cerrar sesión</Text></TouchableOpacity>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Lista de deseos</Text>
        </View>
      )}
      data={wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean)}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => navigation.navigate('ShopStack', { screen: 'ProductDetail', params: { productId: item.id, from: 'Profile' } })}
        >
          <Text style={styles.itemName}>{item?.name}</Text>
          <Text style={[styles.itemPrice, { color: amountColor(item?.price) }]}>{formatCurrencyMXN(item?.price)}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: colors.gray }}>Añade un producto a tu lista de deseados</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Historial de pedidos</Text>
          {orders.length === 0 ? (
            <Text style={{ color: colors.gray, marginTop: 8 }}>Sin pedidos aún</Text>
          ) : (
            orders.map((o) => {
              const idStr = String(o && o.id != null ? o.id : '');
              const shortId = idStr.length > 6 ? idStr.slice(-6) : idStr;
              return (
                <View key={idStr || Math.random().toString(36).slice(2, 9)} style={styles.orderRow}>
                  <Text style={styles.orderText}>Pedido {shortId} - {new Date(o.date).toLocaleDateString()}</Text>
                  <Text style={[styles.orderText, { color: amountColor(o.total) }]}>Total: {formatCurrencyMXN(o.total)}</Text>
                </View>
              );
            })
          )}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Configuración de cuenta</Text>
          <Text style={{ color: colors.gray }}>Próximamente: dirección, métodos de pago, notificaciones...</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, padding: 16 },
  title: { color: colors.navy, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.gray },
  input: { backgroundColor: colors.grayLight, height: 40, borderRadius: 8, paddingHorizontal: 12, marginTop: 8, color: colors.black },
  row: { flexDirection: 'row', marginTop: 12 },
  row: { flexDirection: 'row', marginTop: 12, justifyContent: 'center', alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.navy, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 8 },
  btnSecondary: { borderWidth: 1, borderColor: colors.navy, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 8 },
  btnText: { color: colors.white, fontWeight: '700' },
  btnTextSecondary: { color: colors.navy, fontWeight: '700' },
  logoutBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.navy, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  logoutText: { color: colors.navy, fontWeight: '700' },
  sectionTitle: { color: colors.black, fontSize: 16, fontWeight: '700' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  itemName: { color: colors.black },
  itemPrice: { fontWeight: '700' },
  orderRow: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.grayLight },
  orderText: { color: colors.black },
});