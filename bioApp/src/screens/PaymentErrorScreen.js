import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function PaymentErrorScreen({ navigation, route }) {
    const { error } = route.params || {};
    const message = error && (error.message || error.code || JSON.stringify(error)) || 'Error en el pago';
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pago fallido</Text>
            <Text style={styles.subtitle}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.white },
    title: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: colors.black },
    subtitle: { fontSize: 16, color: colors.gray, marginBottom: 20, textAlign: 'center' },
    button: { backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
    buttonText: { color: colors.white, fontWeight: '700' },
});
