import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrencyMXN } from '../utils/currency';

const ToastContext = createContext({ show: () => {} });

export function ToastProvider({ children, duration = 5000, position = 'top-right' }) {
  const [toasts, setToasts] = useState([]); // [{ id, message, icon, type, actionLabel, onAction, amount }]
  const animsRef = useRef({}); // id -> { opacity, translateY }
  const timersRef = useRef({}); // id -> timeout id

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const show = ({ message, icon = 'checkmark-circle', type = 'info', actionLabel, onAction, amount }) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const opacity = new Animated.Value(0);
    const translateY = new Animated.Value(-10);
    animsRef.current[id] = { opacity, translateY };
    const toast = { id, message, icon, type, actionLabel, onAction, amount };
    setToasts((prev) => [toast, ...prev]);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => dismiss(id), duration);
    timersRef.current[id] = t;
  };

  const dismiss = (id) => {
    const anims = animsRef.current[id];
    if (!anims) {
      setToasts((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    Animated.parallel([
      Animated.timing(anims.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(anims.translateY, { toValue: -10, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
      delete animsRef.current[id];
    });
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View
        accessibilityLabel="Alertas"
        style={Platform.OS === 'web' ? getStackWebPosition(position) : styles.stackNative}
        pointerEvents="box-none"
      >
        {toasts.map((t) => {
          const anims = animsRef.current[t.id];
          const formattedAmount = typeof t.amount === 'number' ? formatCurrencyMXN(t.amount) : null;
          const amountStyle = typeof t.amount === 'number' ? (t.amount < 0 ? styles.amountNegative : styles.amountPositive) : null;
          return (
            <Animated.View
              key={t.id}
              accessibilityLiveRegion={Platform.OS === 'web' ? 'polite' : undefined}
              accessibilityRole={Platform.OS === 'web' ? 'alert' : undefined}
              style={[
                styles.toast,
                getTypeStyle(t?.type),
                { opacity: anims?.opacity || 1, transform: [{ translateY: anims?.translateY || 0 }] },
              ]}
            >
              <Ionicons name={t.icon} size={18} color={colors.white} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.toastText}>{t.message}</Text>
                {formattedAmount && <Text style={[styles.amountText, amountStyle]}>{formattedAmount}</Text>}
              </View>
              {t.actionLabel && (
                <TouchableOpacity onPress={t.onAction} style={styles.toastActionBtn} accessibilityRole="button" accessibilityLabel={t.actionLabel}>
                  <Text style={styles.toastAction}>{t.actionLabel}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => dismiss(t.id)} accessibilityRole="button" accessibilityLabel="Cerrar alerta">
                <Ionicons name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  stackNative: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 3000,
    width: 360,
    maxWidth: '90%',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    zIndex: 3000,
    minWidth: 240,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  toastText: { color: colors.white, fontWeight: '700' },
  toastActionBtn: { marginLeft: 12 },
  toastAction: { color: colors.white, fontWeight: '800', textDecorationLine: 'underline' },
  amountText: { marginTop: 2, fontWeight: '700' },
  amountNegative: { color: '#ef4444' },
  amountPositive: { color: '#10b981' },
});

function getTypeStyle(type) {
  switch (type) {
    case 'success':
      return { backgroundColor: '#134e4a' }; // teal dark for contrast
    case 'warning':
      return { backgroundColor: '#7c2d12' }; // amber dark for contrast
    case 'error':
      return { backgroundColor: '#7f1d1d' }; // red dark for contrast
    case 'info':
    default:
      return { backgroundColor: '#1e3a8a' }; // blue dark for contrast
  }
}

function getStackWebPosition(position) {
  const base = { position: 'fixed', minWidth: 240, zIndex: 3000, width: 360, maxWidth: '90%' };
  if (position === 'top-right') return { ...base, top: 20, right: 20 };
  if (position === 'top-left') return { ...base, top: 20, left: 20 };
  if (position === 'bottom-right') return { ...base, bottom: 20, right: 20 };
  if (position === 'bottom-left') return { ...base, bottom: 20, left: 20 };
  return { ...base, top: 20, right: 20 };
}

// formatCurrencyMXN is provided by src/utils/currency.js to keep formatting consistent app-wide.