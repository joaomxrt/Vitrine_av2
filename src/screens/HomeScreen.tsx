import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { useBusinesses } from '../hooks/useBusinesses';
import { colors, spacing } from '../theme/colors';
import { HomeScreenProps } from '../types';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { businesses, loading, error, reload } = useBusinesses();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Minha Lista de Compras"
        subtitle="Escolha um comerciante do bairro"
      />

      <View style={styles.content}>
        {loading && (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        )}

        {/* Banner offline: a lista em cache continua utilizável */}
        {!loading && error && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                void reload();
              }}
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar os comerciantes novamente"
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && (
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.businessCard}
                onPress={() =>
                  navigation.navigate('ProductList', {
                    businessId: item.id,
                    businessName: item.name,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Ver produtos de ${item.name}`}
              >
                <Text style={styles.businessName}>{item.name}</Text>
                <Text style={styles.businessCategory}>{item.category}</Text>
                {item.address && <Text style={styles.businessAddress}>{item.address}</Text>}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum comerciante encontrado</Text>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm')}
        accessibilityRole="button"
        accessibilityLabel="Adicionar produto à lista"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // A área segura do topo acompanha a cor do cabeçalho, para não deixar
  // uma faixa clara acima dele e manter o contraste da status bar.
  safeArea: { flex: 1, backgroundColor: colors.secondary },
  content: { flex: 1, padding: spacing.md, backgroundColor: colors.background },
  // Espaço para o botão flutuante não cobrir o último cartão
  listContent: { paddingBottom: 88 },
  loader: { marginTop: 50 },
  banner: {
    backgroundColor: '#FFF3E0',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  bannerText: { color: '#E65100', fontWeight: '600', fontSize: 14 },
  retryText: { color: colors.primary, fontWeight: '700', fontSize: 14, marginTop: 4 },
  businessCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 2,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  businessCategory: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  businessAddress: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 50,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
  },
});
