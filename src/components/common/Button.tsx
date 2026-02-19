import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radius, spacing, gradients } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  disabled, loading, style, textStyle, fullWidth, icon,
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyle.container, isDisabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.text, sizeStyle.text, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle = VARIANT_STYLES[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base, sizeStyle.container, variantStyle.container,
        isDisabled && styles.disabled, fullWidth && styles.fullWidth, style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, sizeStyle.text, { color: variantStyle.textColor }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.button,
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

const SIZE_STYLES = {
  sm: {
    container: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
    text: { fontSize: 13 },
  },
  md: {
    container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
    text: { fontSize: 15 },
  },
  lg: {
    container: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg, borderRadius: radius.lg },
    text: { fontSize: 16 },
  },
} as const;

const VARIANT_STYLES = {
  secondary: {
    container: { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.glassBorder },
    textColor: colors.textPrimary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    textColor: colors.primaryLight,
  },
  danger: {
    container: { backgroundColor: 'rgba(248,113,113,0.15)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
    textColor: colors.error,
  },
} as const;
