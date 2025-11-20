import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { useStripe } from '../libs/stripe';

export function usePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // extras: optional object with items, full_name, email, address, etc.
  const initialize = async (amount, currency = 'mxn', extras = {}) => {
    try {
      let endpoint = Constants?.expoConfig?.extra?.paymentEndpoint;
      if (!endpoint) {
        // default fallbacks for local/dev — point to production host provided by user
        const isAndroid = (Constants?.platform?.android) ? true : false;
        endpoint = 'http://165.22.166.75/api';
      }
      // ensure endpoint has no trailing slash, then append the payment-sheet path with trailing slash
      const base = endpoint.replace(/\/$/, '');
      const res = await fetch(`${base}/payment-sheet/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, ...extras }),
      });
      const ct = res.headers.get('content-type') || '';
      let data;
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { detail: text };
        }
      }
      if (!res.ok) return { ok: false, reason: data?.error || data?.detail || 'Request failed', data };

      // Backend may return either a PaymentIntent client_secret alone or the full customer/ephemeralKey flow
      const clientSecret = data.paymentIntent || data.paymentIntentClientSecret || data.client_secret || data.payment_intent_client_secret;
      const ephemeralKey = data.ephemeralKey || data.ephemeral_key || data.ephemeralKeySecret;
      const customer = data.customer || data.customerId;

      const initParams = {
        merchantDisplayName: 'bioApp Suplementos',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: 'Cliente' },
      };
      if (customer && ephemeralKey) {
        initParams.customerId = customer;
        initParams.customerEphemeralKeySecret = ephemeralKey;
      }

      const initRes = await initPaymentSheet(initParams);
      if (initRes.error) return { ok: false, reason: initRes.error.message };
      // include server response so caller can store order_id or other metadata
      return { ok: true, data };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  };

  const pay = async () => {
    const res = await presentPaymentSheet();
    if (res.error) {
      Alert.alert('Pago', res.error.message || 'Error al procesar el pago');
      return { ok: false, error: res.error };
    }
    Alert.alert('Pago', 'Pago realizado correctamente');
    return { ok: true };
  };

  return { initialize, pay };
}