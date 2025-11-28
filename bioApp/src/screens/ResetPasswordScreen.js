import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useToast } from '../components/ToastProvider';

export default function ResetPasswordScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const toast = useToast();
    const [uid, setUid] = useState(route.params?.uid || '');
    const [token, setToken] = useState(route.params?.token || '');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const API_BASE = 'https://bionutrexmobile.duckdns.org';

    const handleReset = async () => {
        if (!uid || !token || !password) {
            toast.show({ type: 'warning', icon: 'warning', message: 'Completa todos los campos' });
            return;
        }
        if (password !== password2) {
            toast.show({ type: 'warning', icon: 'warning', message: 'Las contraseñas no coinciden' });
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/auth/password/reset/confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token, new_password: password }),
            });
            const json = await res.json();
            if (res.ok) {
                toast.show({ type: 'success', icon: 'checkmark-circle', message: 'Contraseña restablecida' });
                navigation.navigate('Profile');
            } else {
                toast.show({ type: 'error', icon: 'close-circle', message: json.detail || 'Error al restablecer' });
            }
        } catch (e) {
            toast.show({ type: 'error', icon: 'close-circle', message: e.message || String(e) });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.desc}>Pega el UID y el token recibidos por email.</Text>
            <TextInput placeholder="UID" value={uid} onChangeText={setUid} style={styles.input} placeholderTextColor={colors.gray} />
            <TextInput placeholder="Token" value={token} onChangeText={setToken} style={styles.input} placeholderTextColor={colors.gray} />
            <TextInput placeholder="Nueva contraseña" value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor={colors.gray} secureTextEntry />
            <TextInput placeholder="Repite la contraseña" value={password2} onChangeText={setPassword2} style={styles.input} placeholderTextColor={colors.gray} secureTextEntry />
            <TouchableOpacity style={styles.btn} onPress={handleReset}><Text style={styles.btnText}>Restablecer</Text></TouchableOpacity>
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
