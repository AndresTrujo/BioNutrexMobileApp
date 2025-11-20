import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import Constants from 'expo-constants';
import { StripeProvider } from './src/libs/stripe';
import React, { useState, useCallback } from 'react';
import SplashScreen from './src/screens/SplashScreen';
import TopBanner from './src/components/TopBanner';
import { ToastProvider } from './src/components/ToastProvider';
import ChatWidget from './src/components/ChatWidget'; // Importar el widget

export default function App() {
  const publishableKey = Constants?.expoConfig?.extra?.stripePublishableKey || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';
  const [ready, setReady] = useState(false);
  const handleSplashDone = useCallback(() => setReady(true), []);
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={publishableKey}>
        <ToastProvider position="top-right" duration={5000}>
          <View style={[styles.container, Platform.OS === 'web' ? { paddingTop: 90 } : null]}>
            <StatusBar style="light" />
            <TopBanner />
            {ready ? <AppNavigator /> : <SplashScreen onDone={handleSplashDone} />}
            <ChatWidget />
          </View>
        </ToastProvider>
      </StripeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
});
