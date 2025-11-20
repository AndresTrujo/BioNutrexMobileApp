import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useToast } from '../components/ToastProvider';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const navigation = useNavigation();
    const toast = useToast();
    const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

    const handleRequest = async () => {
        if (!email) {
            toast.show({ type: 'warning', icon: 'warning', message: 'Ingresa tu email' });
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/auth/password/reset/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                toast.show({ type: 'success', icon: 'mail', message: 'Si existe, te hemos enviado un correo con instrucciones' });
                // Optionally navigate to Reset screen and instruct user to check email
                navigation.navigate('ResetPassword');
            } else {
                const json = await res.json();
                toast.show({ type: 'error', icon: 'close-circle', message: json.detail || 'Error al enviar email' });
            }
        } catch (e) {
            toast.show({ type: 'error', icon: 'close-circle', message: e.message || String(e) });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.desc}>Introduce el email asociado a tu cuenta y te enviaremos instrucciones para restablecer la contraseña.</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor={colors.gray} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={styles.btn} onPress={handleRequest}><Text style={styles.btnText}>Enviar instrucciones</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.white },
    title: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 8 },
    desc: { color: colors.gray, marginBottom: 12 },
    input: { backgroundColor: colors.grayLight, height: 44, borderRadius: 8, paddingHorizontal: 12, marginTop: 8, color: colors.black },
    btn: { backgroundColor: colors.navy, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
    btnText: { color: colors.white, textAlign: 'center', fontWeight: '700' },
});
