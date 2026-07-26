import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { InsightCard } from "@/components/InsightCard";
import type { ThemeColors } from "@/constants/theme";
import { getFormWithQuestions } from "@/db/forms";
import {
  listAnsweredQuestionsForForm,
  listResponsesForForm,
} from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  computeQuestionInsights,
  filterResponsesByRange,
  type InsightTimeRange,
} from "@/lib/stats";
import type {
  AnsweredQuestion,
  FormResponse,
  FormWithQuestions,
} from "@/types/journal";

const RANGES: InsightTimeRange[] = ["week", "month", "all"];
const RANGE_LABELS: Record<InsightTimeRange, string> = {
  week: "Past Week",
  month: "Past Month",
  all: "All Time",
};

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
  const [range, setRange] = useState<InsightTimeRange>("all");

  useFocusEffect(
    useCallback(() => {
      getFormWithQuestions(db, formId).then(setForm);
      listResponsesForForm(db, formId).then(setResponses);
      listAnsweredQuestionsForForm(db, formId).then(setAnsweredQuestions);
    }, [db, formId]),
  );

  const filteredResponses = useMemo(
    () => filterResponsesByRange(responses, range),
    [responses, range],
  );

  const filteredAnsweredQuestions = useMemo(() => {
    const includedResponseIds = new Set(filteredResponses.map((r) => r.id));
    return answeredQuestions.filter(
      (aq) => aq.answer && includedResponseIds.has(aq.answer.responseId),
    );
  }, [answeredQuestions, filteredResponses]);

  const insights = useMemo(
    () =>
      computeQuestionInsights(form?.questions ?? [], filteredAnsweredQuestions),
    [form, filteredAnsweredQuestions],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Insights" }} />

      <FlatList
        data={insights}
        keyExtractor={(item) => String(item.question.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.rangeRow}>
              {RANGES.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRange(r)}
                  style={[styles.rangeChip, range === r && styles.rangeChipActive]}
                >
                  <Text
                    style={[
                      styles.rangeChipText,
                      range === r && styles.rangeChipTextActive,
                    ]}
                  >
                    {RANGE_LABELS[r]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.summary}>
              {filteredResponses.length} response
              {filteredResponses.length === 1 ? "" : "s"}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              This form has no questions yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <InsightCard insight={item} totalResponses={filteredResponses.length} />
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
    rangeRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    rangeChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    rangeChipActive: {
      backgroundColor: colors.buttonPrimaryBackground,
    },
    rangeChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.chipText,
    },
    rangeChipTextActive: {
      color: colors.buttonPrimaryText,
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
