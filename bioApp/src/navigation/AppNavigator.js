import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function CenteredTabBar(props) {
  // Use a percentage of the screen width to center the tab bar group
  const { width: screenWidth } = Dimensions.get('window');
  const pct = 0.6; // 60% of screen width (tuneable)
  const width = Math.round(screenWidth * pct);

  // Filter out routes that have tabBarButton === null (hidden tabs)
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
    Chat: 'chatbubble-ellipses',
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
                props.navigation.navigate(route.name);
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

function ProtectedSignUp({ navigation, route, ...rest }) {
  // Allow navigation to SignUp only when route.params.from === 'Profile'
  const allowedParam = route && route.params && route.params.from === 'Profile';

  useEffect(() => {
    if (allowedParam) return;
    // try to detect previous route name as 'Profile' (best-effort)
    try {
      const state = navigation.getState && navigation.getState();
      if (state) {
        // look at last routes in the state stack
        const routes = state.routes || [];
        const idx = state.index != null ? state.index : routes.length - 1;
        const prev = routes && routes[idx - 1];
        if (prev && prev.name === 'Profile') {
          return; // allow if previous was Profile
        }
      }
    } catch (e) {
      // ignore
    }
    // otherwise redirect to Profile
    navigation.navigate('Profile');
  }, []);

  if (!allowedParam) return null;
  return <SignUpScreen navigation={navigation} route={route} {...rest} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CenteredTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: { backgroundColor: colors.white },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            ShopStack: 'cart',
            Chat: 'chatbubble-ellipses',
            Cart: 'basket',
            Profile: 'person',
          };
          const name = icons[route.name] || 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="ShopStack" component={ShopStack} options={{ title: 'Tienda' }} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      {/* SignUp is part of the tab navigator but has no tab button so it won't render or reserve space */}
      <Tab.Screen name="SignUp" component={(props) => <ProtectedSignUp {...props} />} options={{ tabBarButton: null }} />
      <Tab.Screen name="ForgotPassword" component={require('../screens/ForgotPasswordScreen').default} options={{ tabBarButton: null }} />
      <Tab.Screen name="ResetPassword" component={require('../screens/ResetPasswordScreen').default} options={{ tabBarButton: null }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleUrl = (event) => {
      const url = event?.url || event;
      if (!url) return;
      // If the return URL indicates a successful payment, navigate to PaymentSuccess
      const lowered = String(url).toLowerCase();
      if (lowered.includes('payment-success') || lowered.includes('/orders/completed') || lowered.includes('orders/completed') || lowered.includes('success')) {
        try {
          navigationRef.current?.navigate('PaymentSuccess');
        } catch (e) {
          // ignore
        }
      }
    };

    // initial URL
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <Stack.Screen name="PaymentError" component={PaymentErrorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}