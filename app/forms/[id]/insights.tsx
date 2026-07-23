import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { InsightCard } from "@/components/InsightCard";
import type { ThemeColors } from "@/constants/theme";
import { getFormWithQuestions } from "@/db/forms";
import {
  listAnsweredQuestionsForForm,
  listResponsesForForm,
} from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import { computeQuestionInsights } from "@/lib/stats";
import type {
  AnsweredQuestion,
  FormResponse,
  FormWithQuestions,
} from "@/types/journal";

export default function FormInsights() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const formId = Number(id);
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      getFormWithQuestions(db, formId).then(setForm);
      listResponsesForForm(db, formId).then(setResponses);
      listAnsweredQuestionsForForm(db, formId).then(setAnsweredQuestions);
    }, [db, formId]),
  );

  const insights = useMemo(
    () => computeQuestionInsights(form?.questions ?? [], answeredQuestions),
    [form, answeredQuestions],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Insights" }} />

      <FlatList
        data={insights}
        keyExtractor={(item) => String(item.question.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.summary}>
            {responses.length} response{responses.length === 1 ? "" : "s"}{" "}
            total
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              This form has no questions yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <InsightCard insight={item} totalResponses={responses.length} />
        )}
      />
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
    summary: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  });
}
