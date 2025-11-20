import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function PaymentSuccessScreen({ navigation, route }) {
    const { total } = route.params || {};
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pago completado</Text>
            <Text style={styles.subtitle}>Gracias por tu compra{total ? ` — ${total.toFixed(2)} MXN` : ''}.</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
                <Text style={styles.buttonText}>Volver al inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.white },
    title: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: colors.black },
    subtitle: { fontSize: 16, color: colors.gray, marginBottom: 20 },
    button: { backgroundColor: colors.navy, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
    buttonText: { color: colors.white, fontWeight: '700' },
});
