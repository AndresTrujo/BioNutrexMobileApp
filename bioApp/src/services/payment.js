import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { useStripe } from '../libs/stripe';

export function usePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initialize = async (amount, currency = 'mxn') => {
    try {
      const endpoint = Constants?.expoConfig?.extra?.paymentEndpoint;
      if (!endpoint) return { ok: false, reason: 'No endpoint' };
      const res = await fetch(`${endpoint}/payment-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, reason: data?.error || 'Request failed' };
      const { paymentIntent, ephemeralKey, customer } = data;
      const initRes = await initPaymentSheet({
        merchantDisplayName: 'bioApp Suplementos',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        defaultBillingDetails: { name: 'Cliente' },
      });
      if (initRes.error) return { ok: false, reason: initRes.error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  };

  const pay = async () => {
    const res = await presentPaymentSheet();
    if (res.error) {
      Alert.alert('Pago', res.error.message || 'Error al procesar el pago');
      return { ok: false };
    }
    Alert.alert('Pago', 'Pago realizado correctamente');
    return { ok: true };
  };

  return { initialize, pay };
}