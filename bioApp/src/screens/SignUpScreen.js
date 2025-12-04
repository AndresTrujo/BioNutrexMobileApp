import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useToast } from '../components/ToastProvider';
import { setAuth } from '../store/authSlice';

export default function SignUpScreen() {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const toast = useToast();
    const isFocused = useIsFocused();

    const API_BASE = 'https://bionutrexmobile.duckdns.org';

    /* 🔥 Limpia todos los campos del formulario */
    const resetForm = () => {
        setUsername('');
        setName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPassword2('');
    };

    const handleSignUp = async () => {
        if (!email || !password || !name) {
            toast.show({ type: 'warning', icon: 'warning', message: 'Completa nombre, email y contraseña' });
            return;
        }
        if (password !== password2) {
            toast.show({ type: 'warning', icon: 'warning', message: 'Las contraseñas no coinciden' });
            return;
        }

        try {
            const body = {
                username,
                email,
                first_name: name,
                last_name: lastName,
                password,
                password2,
            };

            const res = await fetch(`${API_BASE}/api/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const json = await res.json();

            if (res.ok) {
                // Auto-login: request token
                const tokenRes = await fetch(`${API_BASE}/api/token/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password }),
                });

                const tokenJson = await tokenRes.json();

                if (tokenRes.ok) {
                    const tokens = { access: tokenJson.access, refresh: tokenJson.refresh };
                    await AsyncStorage.setItem('authTokens', JSON.stringify(tokens));
                    dispatch(setAuth({ user: { name, email }, tokens }));

                    toast.show({ type: 'success', icon: 'checkmark-circle', message: 'Registro correcto, has iniciado sesión' });

                    /* 🔥 1. Limpia formulario */
                    resetForm();

                    /* 🔥 2. Navega a Profile */
                    navigation.navigate('Profile');
                } else {
                    toast.show({ type: 'success', icon: 'checkmark-circle', message: 'Usuario creado. Puedes iniciar sesión.' });

                    resetForm();
                    navigation.navigate('Profile');
                }
            } else {
                const msg = json?.email || json?.detail || JSON.stringify(json);
                toast.show({ type: 'error', icon: 'close-circle', message: String(msg) });
            }
        } catch (e) {
            toast.show({ type: 'error', icon: 'close-circle', message: e.message || String(e) });
        }
    };

    useEffect(() => {
        const parent = navigation.getParent && navigation.getParent();
        try {
            if (parent && typeof parent.setOptions === 'function') {
                parent.setOptions({ tabBarStyle: isFocused ? { display: 'flex' } : undefined });
            }
        } catch (e) { }

        return () => {
            if (parent && typeof parent.setOptions === 'function') {
                parent.setOptions({ tabBarStyle: undefined });
            }
        };
    }, [isFocused]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear cuenta</Text>

            <TextInput placeholder="Nombre de Usuario" value={username} onChangeText={setUsername} style={styles.input} placeholderTextColor={colors.gray} />
            <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} placeholderTextColor={colors.gray} />
            <TextInput placeholder="Apellido(s)" value={lastName} onChangeText={setLastName} style={styles.input} placeholderTextColor={colors.gray} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor={colors.gray} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor={colors.gray} secureTextEntry />
            <TextInput placeholder="Repite contraseña" value={password2} onChangeText={setPassword2} style={styles.input} placeholderTextColor={colors.gray} secureTextEntry />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleSignUp}>
                <Text style={styles.btnText}>Registrarme</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.linkText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.white },
    title: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 12 },
    input: { backgroundColor: colors.grayLight, height: 44, borderRadius: 8, paddingHorizontal: 12, marginTop: 8, color: colors.black },
    btnPrimary: { backgroundColor: colors.navy, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
    btnText: { color: colors.white, textAlign: 'center', fontWeight: '700' },
    link: { marginTop: 12 },
    linkText: { color: colors.navy, textAlign: 'center' },
});
