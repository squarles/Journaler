import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { FormListItem } from "@/components/FormListItem";
import type { ThemeColors } from "@/constants/theme";
import { listForms } from "@/db/forms";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { Form } from "@/types/journal";

export default function Index() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [forms, setForms] = useState<Form[]>([]);

  useFocusEffect(
    useCallback(() => {
      listForms(db).then(setForms);
    }, [db]),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Journaler",
          headerRight: () => (
            <Pressable onPress={() => router.push("/forms/new")}>
              <Text style={styles.newText}>+ New Form</Text>
            </Pressable>
          ),
        }}
      />

      {forms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No forms yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a form to start logging responses.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/forms/new")}
          >
            <Text style={styles.emptyButtonText}>+ New Form</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FormListItem
              form={item}
              onPress={() =>
                router.push({
                  pathname: "/forms/[id]",
                  params: { id: String(item.id) },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: 16,
    },
    newText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.tint,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 6,
      textAlign: "center",
    },
    emptyButton: {
      marginTop: 20,
      backgroundColor: colors.buttonPrimaryBackground,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    emptyButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 15,
      fontWeight: "600",
    },
  });
}
