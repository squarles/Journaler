import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ResponseListItem } from "@/components/ResponseListItem";
import type { ThemeColors } from "@/constants/theme";
import { deleteForm, getFormWithQuestions } from "@/db/forms";
import { listResponsesForForm } from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import { confirmAsync } from "@/lib/confirm";
import type { FormResponse, FormWithQuestions } from "@/types/journal";

export default function FormDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const formId = Number(id);
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFormWithQuestions(db, formId).then(setForm);
      listResponsesForForm(db, formId).then(setResponses);
    }, [db, formId]),
  );

  async function confirmDeleteForm() {
    const confirmed = await confirmAsync(
      "Delete form?",
      "This will permanently delete this form, all of its questions, and all of its responses.",
    );
    if (!confirmed) return;
    await deleteForm(db, formId);
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: form?.title ?? "Form" }} />

      <View style={styles.header}>
        {!!form?.description && (
          <Text style={styles.description}>{form.description}</Text>
        )}
        <Text style={styles.questionCount}>
          {form?.questions.length ?? 0} question
          {form?.questions.length === 1 ? "" : "s"}
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/forms/[id]/responses/new",
                params: { id },
              })
            }
          >
            <Text style={styles.actionButtonText}>+ New Response</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push({ pathname: "/forms/[id]/edit", params: { id } })
            }
          >
            <Text style={styles.secondaryButtonText}>Edit Form</Text>
          </Pressable>
        </View>

        <Pressable onPress={confirmDeleteForm}>
          <Text style={styles.deleteText}>Delete Form</Text>
        </Pressable>
      </View>

      {responses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No responses yet.</Text>
        </View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ResponseListItem
              response={item}
              onPress={() =>
                router.push({
                  pathname: "/forms/[id]/responses/[responseId]",
                  params: { id, responseId: String(item.id) },
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
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 6,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    questionCount: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
    },
    actionButton: {
      backgroundColor: colors.buttonPrimaryBackground,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    actionButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 14,
      fontWeight: "600",
    },
    secondaryButton: {
      backgroundColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    deleteText: {
      fontSize: 13,
      color: colors.destructive,
      marginTop: 8,
    },
    list: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  });
}
