import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types';

const HomeStackNavigator = createNativeStackNavigator<RootStackParamList>();
const ListStackNavigator = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.secondary },
  headerTintColor: colors.white,
};

/**
 * Indicador da aba desenhado com View.
 * Não depende de fonte de ícones nem do suporte a emoji do aparelho, que
 * varia entre dispositivos e pode cair no glifo vazio.
 */
const TabDot: React.FC<{ color: string }> = ({ color }) => (
  <View style={[styles.tabDot, { backgroundColor: color }]} />
);

const styles = StyleSheet.create({
  tabDot: { width: 10, height: 10, borderRadius: 5 },
});

/** Aba Início: comerciantes -> produtos do comerciante -> formulário. */
function HomeStack() {
  return (
    <HomeStackNavigator.Navigator screenOptions={stackScreenOptions}>
      <HomeStackNavigator.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStackNavigator.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: 'Produtos do Comerciante' }}
      />
      <HomeStackNavigator.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: 'Produto' }}
      />
    </HomeStackNavigator.Navigator>
  );
}

/**
 * Aba Minha Lista: a lista completa também precisa da própria pilha.
 * Sem ela, navegar para o formulário a partir desta aba não é resolvido
 * por nenhum navegador e a ação falha.
 */
function ListStack() {
  return (
    <ListStackNavigator.Navigator screenOptions={stackScreenOptions}>
      <ListStackNavigator.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: 'Minha Lista de Compras' }}
      />
      <ListStackNavigator.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: 'Produto' }}
      />
    </ListStackNavigator.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            paddingTop: 6,
            // Respeita a barra de gestos em vez de uma altura fixa
            paddingBottom: insets.bottom + 6,
            height: 58 + insets.bottom,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Início"
          component={HomeStack}
          options={{
            tabBarLabel: 'Início',
            // Sem tabBarIcon o React Navigation desenha um ícone placeholder
            tabBarIcon: ({ color }) => <TabDot color={color} />,
          }}
        />
        <Tab.Screen
          name="Lista"
          component={ListStack}
          options={{
            tabBarLabel: 'Minha Lista',
            tabBarIcon: ({ color }) => <TabDot color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
