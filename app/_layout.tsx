import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";
import { migrateDbIfNeeded } from "@/db/migrations";

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.tint,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.destructive,
    },
  };

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return (
    <SQLiteProvider databaseName="journaler.db" onInit={migrateDbIfNeeded}>
      <ThemeProvider value={navigationTheme}>
        <Stack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
