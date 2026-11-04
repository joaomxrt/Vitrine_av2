import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectableChip } from '../components/SelectableChip';
import { useBusinesses } from '../hooks/useBusinesses';
import { useProducts } from '../hooks/useProducts';
import { borderRadius, colors, spacing } from '../theme/colors';
import { ProductDraft, ProductFormScreenProps } from '../types';
import {
  formatCurrency,
  parseDecimalInput,
  parseIntegerInput,
  toDecimalInput,
} from '../utils/format';

interface SelectedBusiness {
  id: string;
  name: string;
}

type FormErrors = Partial<Record<'name' | 'price' | 'quantity' | 'category' | 'business', string>>;

export const ProductFormScreen: React.FC<ProductFormScreenProps> = ({ navigation, route }) => {
  const productId = route.params?.productId;
  const isEditing = Boolean(productId);

  const { findProduct, addProduct, updateProduct, status } = useProducts();
  const {
    businesses,
    loading: loadingBusinesses,
    error: businessesError,
    reload: reloadBusinesses,
  } = useBusinesses();

  const editingProduct = productId ? findProduct(productId) : undefined;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [business, setBusiness] = useState<SelectedBusiness | null>(
    route.params?.businessId && route.params?.businessName
      ? { id: route.params.businessId, name: route.params.businessName }
      : null,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Preenche o formulário uma única vez, quando o produto a editar fica disponível.
  const hydratedRef = useRef(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Produto' : 'Novo Produto' });
  }, [navigation, isEditing]);

  useEffect(() => {
    if (!editingProduct || hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;
    setName(editingProduct.name);
    setPrice(toDecimalInput(editingProduct.price));
    setQuantity(String(editingProduct.quantity));
    setCategory(editingProduct.category);
    setDescription(editingProduct.description ?? '');

    if (editingProduct.businessId && editingProduct.businessName) {
      setBusiness({ id: editingProduct.businessId, name: editingProduct.businessName });
    }
  }, [editingProduct]);

  const parsedPrice = parseDecimalInput(price);
  const parsedQuantity = parseIntegerInput(quantity);
  const subtotalPreview =
    parsedPrice !== null && parsedQuantity !== null ? parsedPrice * parsedQuantity : null;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = 'Informe o nome do produto (mínimo 2 caracteres)';
    }

    if (parsedPrice === null) {
      nextErrors.price = 'Informe um preço válido (ex: 7,50)';
    } else if (parsedPrice <= 0) {
      nextErrors.price = 'O preço deve ser maior que zero';
    }

    if (parsedQuantity === null) {
      nextErrors.quantity = 'Informe um número inteiro (ex: 2)';
    } else if (parsedQuantity < 1) {
      nextErrors.quantity = 'A quantidade mínima é 1';
    } else if (parsedQuantity > 999) {
      nextErrors.quantity = 'A quantidade máxima é 999';
    }

    if (!category.trim()) {
      nextErrors.category = 'Informe a categoria';
    }

    // Só exige o comerciante quando há algum disponível para escolher:
    // offline e sem cache, o produto ainda pode ser cadastrado.
    if (!business && businesses.length > 0) {
      nextErrors.business = 'Selecione o comerciante do bairro';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || parsedPrice === null || parsedQuantity === null) {
      return;
    }

    setSubmitting(true);

    try {
      const draft: ProductDraft = {
        name: name.trim(),
        price: parsedPrice,
        quantity: parsedQuantity,
        category: category.trim(),
        description: description.trim() || undefined,
        businessId: business?.id,
        businessName: business?.name,
      };

      if (productId) {
        // Partial<Product>: isPurchased não é enviado, então o status é preservado.
        await updateProduct(productId, draft);
      } else {
        await addProduct(draft);
      }

      navigation.goBack();
    } catch (submitError) {
      Alert.alert(
        'Erro ao salvar',
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível salvar o produto. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Enquanto a lista salva ainda está sendo lida, o produto a editar não existe
  // em memória: mostrar "não encontrado" aqui seria um falso negativo.
  if (isEditing && !editingProduct && status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.notFound}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing && !editingProduct) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Este produto não está mais na sua lista.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a lista"
          >
            <Text style={styles.buttonText}>Voltar para a lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.label}>Nome do Produto *</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : undefined]}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Pão Francês"
            placeholderTextColor={colors.textLight}
            accessibilityLabel={`Campo nome do produto. ${errors.name ?? ''}`}
          />
          {errors.name && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {errors.name}
            </Text>
          )}

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : undefined]}
                value={price}
                onChangeText={setPrice}
                placeholder="7,50"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
                accessibilityLabel={`Campo preço em reais. ${errors.price ?? ''}`}
              />
              {errors.price && (
                <Text style={styles.errorText} accessibilityRole="alert">
                  {errors.price}
                </Text>
              )}
            </View>

            <View style={[styles.rowItem, styles.rowItemLast]}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={[styles.input, errors.quantity ? styles.inputError : undefined]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                accessibilityLabel={`Campo quantidade. ${errors.quantity ?? ''}`}
              />
              {errors.quantity && (
                <Text style={styles.errorText} accessibilityRole="alert">
                  {errors.quantity}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.label}>Categoria *</Text>
          <TextInput
            style={[styles.input, errors.category ? styles.inputError : undefined]}
            value={category}
            onChangeText={setCategory}
            placeholder="Ex: Padaria, Hortifruti, etc."
            placeholderTextColor={colors.textLight}
            accessibilityLabel={`Campo categoria. ${errors.category ?? ''}`}
          />
          {errors.category && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {errors.category}
            </Text>
          )}

          <Text style={styles.label}>Comerciante do bairro *</Text>

          {loadingBusinesses && (
            <View style={styles.businessesLoading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Carregando comerciantes...</Text>
            </View>
          )}

          {!loadingBusinesses && businessesError && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>{businessesError}</Text>
              <TouchableOpacity
                onPress={() => {
                  void reloadBusinesses();
                }}
                accessibilityRole="button"
                accessibilityLabel="Tentar carregar os comerciantes novamente"
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loadingBusinesses && businesses.length > 0 && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={businesses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SelectableChip
                  label={item.name}
                  selected={business?.id === item.id}
                  onPress={() => setBusiness({ id: item.id, name: item.name })}
                  accessibilityLabel={`Selecionar ${item.name}`}
                />
              )}
              contentContainerStyle={styles.businessesList}
            />
          )}

          {business && <Text style={styles.selectedBusiness}>Selecionado: {business.name}</Text>}

          {errors.business && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {errors.business}
            </Text>
          )}

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição opcional do produto"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            accessibilityLabel="Campo descrição do produto"
          />

          {subtotalPreview !== null && (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Subtotal deste produto</Text>
              <Text style={styles.previewValue}>{formatCurrency(subtotalPreview)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={() => {
              void handleSubmit();
            }}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            accessibilityLabel={isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          >
            <Text style={styles.buttonText}>
              {submitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  form: { paddingBottom: spacing.xl },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  row: { flexDirection: 'row' },
  rowItem: { flex: 1, marginRight: spacing.sm },
  rowItemLast: { marginRight: 0 },
  businessesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loadingText: { marginLeft: spacing.sm, color: colors.textLight, fontSize: 14 },
  businessesList: { paddingVertical: spacing.xs },
  selectedBusiness: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#FFF3E0',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  bannerText: { color: '#E65100', fontSize: 13, fontWeight: '600' },
  retryText: { color: colors.primary, fontWeight: '700', fontSize: 13, marginTop: 4 },
  preview: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  previewLabel: { fontSize: 13, color: colors.textLight },
  previewValue: { fontSize: 22, fontWeight: '700', color: colors.secondary, marginTop: 2 },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
