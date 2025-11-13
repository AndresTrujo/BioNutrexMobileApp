import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { login, logout, register } from '../store/authSlice';
import { formatCurrencyMXN, amountColor } from '../utils/currency';

export default function ProfileScreen() {
  const { user, orders, wishlist } = useSelector((s) => s.auth);
  const products = useSelector((s) => s.products.list);
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Crea una cuenta o inicia sesión</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={colors.gray} style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.gray} style={styles.input} />
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => dispatch(register({ name, email }))}><Text style={styles.btnText}>Registrarme</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => dispatch(login({ email }))}><Text style={styles.btnTextSecondary}>Iniciar sesión</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View style={styles.container}>
          <Text style={styles.title}>Hola, {user.name}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}><Text style={styles.logoutText}>Cerrar sesión</Text></TouchableOpacity>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Lista de deseos</Text>
        </View>
      )}
      data={wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean)}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>{item?.name}</Text>
          <Text style={[styles.itemPrice, { color: amountColor(item?.price) }]}>{formatCurrencyMXN(item?.price)}</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Historial de pedidos</Text>
          {orders.length === 0 ? (
            <Text style={{ color: colors.gray, marginTop: 8 }}>Sin pedidos aún</Text>
          ) : (
            orders.map((o) => (
              <View key={o.id} style={styles.orderRow}>
                <Text style={styles.orderText}>Pedido {o.id.slice(-6)} - {new Date(o.date).toLocaleDateString()}</Text>
                <Text style={[styles.orderText, { color: amountColor(o.total) }]}>Total: {formatCurrencyMXN(o.total)}</Text>
              </View>
            ))
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
  btnPrimary: { backgroundColor: colors.navy, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8 },
  btnSecondary: { borderWidth: 1, borderColor: colors.navy, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
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