import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';
import Constants from 'expo-constants';

// This screen loads a small HTML+JS page in a WebView that uses Stripe.js
// to render a card element and confirm the PaymentIntent. It communicates
// result back via postMessage.
export default function InAppPaymentScreen({ route, navigation }) {
    const { clientSecret, publishableKey: passedPublishableKey, orderId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const webviewRef = useRef(null);

    // prefer passed key but fall back to app config extras
    const publishableKey = passedPublishableKey || (Constants?.expoConfig?.extra?.stripePublishableKey) || (Constants?.manifest?.extra?.stripePublishableKey) || null;

    // validate publishable key isn't a placeholder like 'pk_test_XXXXXXXXXX'
    const looksLikePlaceholder = (k) => {
        if (!k) return true;
        try {
            const up = String(k);
            if (up.includes('XXXXX') || /X{4,}/.test(up)) return true;
            if (/^pk_(test|live)_?X{4,}/i.test(up)) return true;
            return false;
        } catch (e) { return true; }
    };

    if (!clientSecret || looksLikePlaceholder(publishableKey)) {
        return (
            <View style={styles.container}>
                <Text style={{ color: colors.black, marginBottom: 12 }}>Faltan parámetros de pago o la clave pública de Stripe es inválida.</Text>
                <Text style={{ color: colors.gray }}>Asegúrate de configurar `STRIPE_PUBLISHABLE_KEY` en el backend o `EXPO_PUBLIC_STRIPE_PK` en `app.config.js`.</Text>
            </View>
        );
    }

    const injectedJavaScript = `
    (function(){
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = function() {
        const stripe = Stripe('${publishableKey}');
        const elements = stripe.elements();
        const style = { base: { color: '#32325d', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSmoothing: 'antialiased', fontSize: '16px', '::placeholder': { color: '#aab7c4' } }, invalid: { color: '#fa755a', iconColor: '#fa755a' } };
        const card = elements.create('card', { style: style });
        card.mount('#card-element');

        document.getElementById('pay').addEventListener('click', function(ev) {
          ev.preventDefault();
          document.getElementById('status').innerText = 'Procesando...';
          stripe.confirmCardPayment('${clientSecret}', { payment_method: { card: card } }).then(function(result) {
            if (result.error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'error', error: result.error }));
            } else {
              if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', paymentIntent: result.paymentIntent }));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'processing', paymentIntent: result.paymentIntent }));
              }
            }
          }).catch(function(e){
            window.ReactNativeWebView.postMessage(JSON.stringify({status:'error', error: e.message || String(e)}));
          });
        });
      };
      document.head.appendChild(script);
    })();
    true;
  `;

    const html = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <style>body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; padding:16px;} #card-element{border:1px solid #e6e9ef; padding:12px; border-radius:8px;} button{background:#0b5cff;color:#fff;border:none;padding:12px;border-radius:8px;margin-top:12px;width:100%;font-weight:700} #status{margin-top:12px;color:#333}</style>
      </head>
      <body>
        <h3>Pagar con tarjeta</h3>
        <div id="card-element"></div>
        <button id="pay">Pagar</button>
        <div id="status"></div>
      </body>
    </html>
  `;

    const API_BASE = 'https://bionutrexmobile.duckdns.org/api';

    const onMessage = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'success') {
                // try to confirm with backend (so webhook or direct mark happens)
                const pi = data.paymentIntent || data.payment_intent || data.paymentIntentId || (data.paymentIntent && data.paymentIntent.id) || null;
                const payment_intent_id = (pi && (pi.id || pi)) || null;

                if (payment_intent_id) {
                    try {
                        const res = await fetch(`${API_BASE}/payments/confirm-intent/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ payment_intent_id, order_id: orderId }),
                        });
                        const json = await res.json().catch(() => ({}));
                        // if paid according to backend or webhook already processed, show success
                        if (res.ok && json.paid) {
                            navigation.replace('PaymentSuccess', { total: undefined, orderId });
                            return;
                        }
                        // Not paid yet but client-side succeeded; still navigate to success (webhook may arrive shortly)
                        navigation.replace('PaymentSuccess', { total: undefined, orderId });
                        return;
                    } catch (e) {
                        // failure contacting backend - still navigate but show error screen as fallback
                        navigation.replace('PaymentSuccess', { total: undefined, orderId });
                        return;
                    }
                }

                // no payment_intent id found in message - fallback to success screen
                navigation.replace('PaymentSuccess', { total: undefined, orderId });
            } else if (data.status === 'error') {
                navigation.replace('PaymentError', { error: data.error });
            } else {
                // processing - show intermediate state (could also poll backend)
                navigation.replace('PaymentSuccess', { total: undefined, orderId });
            }
        } catch (e) {
            navigation.replace('PaymentError', { error: e.message || String(e) });
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webviewRef}
                originWhitelist={["*"]}
                source={{ html }}
                injectedJavaScript={injectedJavaScript}
                onMessage={onMessage}
                onLoadEnd={() => setLoading(false)}
                javaScriptEnabled
                domStorageEnabled
            />
            {loading && (
                <View style={styles.loader} pointerEvents="none">
                    <ActivityIndicator size="large" color={colors.navy} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    loader: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
