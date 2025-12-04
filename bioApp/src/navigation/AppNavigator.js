// AppNavigator.js (fixed)
import React, { useEffect, useRef } from 'react';
import { Linking, View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentErrorScreen from '../screens/PaymentErrorScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import InAppPaymentScreen from '../screens/InAppPaymentScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ShopStack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.navy,
    background: colors.white,
    card: colors.white,
    text: colors.black,
    border: colors.grayLight,
  },
};

/* --------------------
   Shop stack (only Shop)
   -------------------- */
function ShopStackScreen() {
  return (
    <ShopStack.Navigator screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
      <ShopStack.Screen name="Shop" component={ShopScreen} />
      {/* DO NOT include ProductDetail here */}
    </ShopStack.Navigator>
  );
}

/* --------------------
   CenteredTabBar (unchanged, small fixes)
   -------------------- */
function CenteredTabBar(props) {
  const { width: screenWidth } = Dimensions.get('window');
  const pct = 0.6;
  const width = Math.round(screenWidth * pct);

  const visibleRoutes = props.state.routes.filter((r) => {
    const desc = props.descriptors[r.key];
    const opt = desc && desc.options;
    return !(opt && opt.tabBarButton === null);
  });

  if (visibleRoutes.length === 0) {
    return <BottomTabBar {...props} />;
  }

  const icons = {
    Home: 'home',
    ShopStack: 'cart',
    Cart: 'basket',
    Profile: 'person',
  };

  return (
    <View style={{ alignItems: 'center', backgroundColor: props.descriptors[props.state.routes[0].key]?.options?.tabBarStyle?.backgroundColor || 'transparent' }}>
      <View style={{ width }}>
        <View style={styles.tabRow}>
          {visibleRoutes.map((route) => {
            const routeIndex = props.state.routes.findIndex((r) => r.key === route.key);
            const isFocused = props.state.index === routeIndex;
            const iconName = icons[route.name] || 'ellipse';
            const color = isFocused ? colors.navy : colors.gray;

            const onPress = () => {
              const event = props.navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                // Special-case ShopStack: explicitly navigate into its inner "Shop" screen.
                if (route.name === 'ShopStack') {
                  props.navigation.navigate('ShopStack', { screen: 'Shop' });
                } else {
                  props.navigation.navigate(route.name);
                }
              }
            };

            const onLongPress = () => {
              props.navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={props.descriptors[route.key]?.options?.tabBarAccessibilityLabel || route.name}
                testID={props.descriptors[route.key]?.options?.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
              >
                <Ionicons name={iconName} size={24} color={color} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', alignItems: 'center' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
});

/* --------------------
   ProtectedSignUp
   -------------------- */
function ProtectedSignUp({ navigation, route, ...rest }) {
  const allowed = route?.params?.from === 'Profile';

  useEffect(() => {
    if (!allowed) navigation.navigate('Profile');
  }, []);

  if (!allowed) return null;
  return <SignUpScreen navigation={navigation} route={route} {...rest} />;
}
/* --------------------
   Tabs
   -------------------- */
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CenteredTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: { backgroundColor: colors.white },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      {/* Stack that contains only Shop */}
      <Tab.Screen
        name="ShopStack"
        component={ShopStackScreen}
        options={{ title: 'Tienda' }}
      />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />

      <Tab.Screen name="SignUp" component={ProtectedSignUp} options={{ tabBarButton: null }} />
      <Tab.Screen name="ForgotPassword" component={require('../screens/ForgotPasswordScreen').default} options={{ tabBarButton: null }} />
      <Tab.Screen name="ResetPassword" component={require('../screens/ResetPasswordScreen').default} options={{ tabBarButton: null }} />
    </Tab.Navigator>
  );
}

/* --------------------
   Root stack (ProductDetail shown with header)
   -------------------- */
export default function AppNavigator() {
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleUrl = (event) => {
      const url = event?.url || event;
      if (!url) return;
      const lowered = String(url).toLowerCase();
      if (lowered.includes('payment-success') || lowered.includes('/orders/completed') || lowered.includes('success')) {
        try {
          navigationRef.current?.navigate('PaymentSuccess');
        } catch (e) { /* ignore */ }
      }
    };

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) handleUrl(initialUrl);
    }).catch(() => { });

    const sub = Linking.addEventListener ? Linking.addEventListener('url', handleUrl) : Linking.addListener('url', handleUrl);
    return () => {
      try {
        if (sub && sub.remove) sub.remove();
        else if (Linking.removeEventListener) Linking.removeEventListener('url', handleUrl);
      } catch (e) { }
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tabs are the main UI */}
        <RootStack.Screen name="MainTabs" component={MainTabs} />

        {/* ProductDetail is global but SHOWS a header so the back arrow works.
           headerShown: true, but keep header styling consistent with theme */}
        <RootStack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            headerShown: true,
            headerTitle: 'Product',
            headerBackTitleVisible: false,
            // optional: customize header style if you want
            // headerStyle: { backgroundColor: colors.white },
            // headerTintColor: colors.navy,
          }}
        />

        <RootStack.Screen name="Checkout" component={CheckoutScreen} />
        <RootStack.Screen name="InAppPayment" component={InAppPaymentScreen} />
        <RootStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <RootStack.Screen name="PaymentError" component={PaymentErrorScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
