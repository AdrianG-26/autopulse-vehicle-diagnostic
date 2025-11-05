/**
 * Android Material Design Optimized Styles
 * Following Material Design 3 (Material You) guidelines
 */

import { Platform, StyleSheet } from "react-native";

// Material Design 3 Color Palette
export const MaterialColors = {
  // Primary
  primary: "#0a7ea4",
  primaryVariant: "#085f7d",
  onPrimary: "#ffffff",

  // Surface & Background
  surface: "#ffffff",
  surfaceVariant: "#f5f5f5",
  background: "#fafafa",

  // Text
  onSurface: "#1c1b1f",
  onSurfaceVariant: "#49454f",
  onBackground: "#1c1b1f",

  // Outline
  outline: "#e0e0e0",
  outlineVariant: "#c7c7c7",

  // Status Colors
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
};

// Material Design Elevation (Android-specific)
export const MaterialElevation = {
  level0: {
    elevation: 0,
    shadowColor: "transparent",
  },
  level1: {
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  level2: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  level3: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  level4: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
};

// Material Design Typography Scale
export const MaterialTypography = {
  displayLarge: {
    fontSize: 57,
    fontWeight: "400" as const,
    lineHeight: 64,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: "400" as const,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: "400" as const,
    lineHeight: 44,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: "400" as const,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: "400" as const,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: "400" as const,
    lineHeight: 32,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: "500" as const,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

// Material Design Spacing (8dp grid system)
export const MaterialSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Material Design Border Radius
export const MaterialBorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Common Material Components
export const MaterialComponents = StyleSheet.create({
  // Cards
  card: {
    backgroundColor: MaterialColors.surface,
    borderRadius: MaterialBorderRadius.md,
    padding: MaterialSpacing.lg,
    ...MaterialElevation.level1,
  },
  cardElevated: {
    backgroundColor: MaterialColors.surface,
    borderRadius: MaterialBorderRadius.md,
    padding: MaterialSpacing.lg,
    ...MaterialElevation.level2,
  },
  cardOutlined: {
    backgroundColor: MaterialColors.surface,
    borderRadius: MaterialBorderRadius.md,
    padding: MaterialSpacing.lg,
    borderWidth: 1,
    borderColor: MaterialColors.outline,
  },

  // Buttons
  filledButton: {
    backgroundColor: MaterialColors.primary,
    borderRadius: MaterialBorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 24,
    ...MaterialElevation.level0,
  },
  filledButtonText: {
    ...MaterialTypography.labelLarge,
    color: MaterialColors.onPrimary,
    textAlign: "center",
  },
  outlinedButton: {
    backgroundColor: "transparent",
    borderRadius: MaterialBorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: MaterialColors.outline,
  },
  outlinedButtonText: {
    ...MaterialTypography.labelLarge,
    color: MaterialColors.primary,
    textAlign: "center",
  },
  textButton: {
    backgroundColor: "transparent",
    borderRadius: MaterialBorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textButtonText: {
    ...MaterialTypography.labelLarge,
    color: MaterialColors.primary,
    textAlign: "center",
  },

  // List Items
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MaterialSpacing.md,
    paddingHorizontal: MaterialSpacing.lg,
    minHeight: 56,
  },
  listItemDivider: {
    height: 1,
    backgroundColor: MaterialColors.outline,
    marginLeft: MaterialSpacing.lg,
  },

  // Chips
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MaterialSpacing.md,
    paddingVertical: MaterialSpacing.xs,
    borderRadius: MaterialBorderRadius.sm,
    borderWidth: 1,
    borderColor: MaterialColors.outline,
    backgroundColor: MaterialColors.surface,
  },
  chipText: {
    ...MaterialTypography.labelMedium,
    color: MaterialColors.onSurfaceVariant,
  },

  // FAB (Floating Action Button)
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: MaterialColors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...MaterialElevation.level3,
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: MaterialColors.background,
  },
  surfaceContainer: {
    backgroundColor: MaterialColors.surface,
  },
});

// Helper to get platform-specific elevation
export const getElevation = (level: 0 | 1 | 2 | 3 | 4) => {
  if (Platform.OS === "android") {
    return { elevation: level };
  }
  // iOS fallback
  return MaterialElevation[`level${level}` as keyof typeof MaterialElevation];
};
