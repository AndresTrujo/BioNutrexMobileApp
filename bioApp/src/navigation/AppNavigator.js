import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
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
        <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Carrito' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}