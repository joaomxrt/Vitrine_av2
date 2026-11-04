import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Cabeçalho das telas sem header nativo.
 * O recuo da área segura fica a cargo do SafeAreaView da tela, por isso
 * aqui não há paddingTop fixo.
 */
export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
});
