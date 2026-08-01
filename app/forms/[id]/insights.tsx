import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { InsightCard } from "@/components/InsightCard";
import { LineChart, type LineChartSeries } from "@/components/LineChart";
import type { ThemeColors } from "@/constants/theme";
import { getFormWithQuestions } from "@/db/forms";
import {
  listAnsweredQuestionsForForm,
  listResponsesForForm,
} from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import { parseSqliteDate } from "@/lib/dates";
import {
  buildQuestionSeries,
  computeQuestionInsights,
  filterResponsesByRange,
  isGraphableQuestion,
  type InsightTimeRange,
} from "@/lib/stats";
import type {
  AnsweredQuestion,
  FormResponse,
  FormWithQuestions,
  Question,
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
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

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

  const eligibleQuestions = useMemo(
    () => form?.questions.filter(isGraphableQuestion) ?? [],
    [form],
  );

  function toggleQuestion(questionId: number) {
    setSelectedQuestionIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }
      if (prev.length < 2) return [...prev, questionId];
      return [prev[1], questionId];
    });
  }

  // Responses come back newest-first; the chart reads left-to-right, oldest-first.
  const chronologicalResponses = useMemo(
    () => [...filteredResponses].reverse(),
    [filteredResponses],
  );

  const chartLabels = useMemo(
    () =>
      chronologicalResponses.map((r) =>
        parseSqliteDate(r.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      ),
    [chronologicalResponses],
  );

  const chartTimestamps = useMemo(
    () => chronologicalResponses.map((r) => parseSqliteDate(r.createdAt).getTime()),
    [chronologicalResponses],
  );

  const selectedQuestions = useMemo(
    () =>
      selectedQuestionIds
        .map((qid) => eligibleQuestions.find((q) => q.id === qid))
        .filter((q): q is Question => !!q),
    [selectedQuestionIds, eligibleQuestions],
  );

  const chartSeries: LineChartSeries[] = useMemo(
    () =>
      selectedQuestions.map((question, i) => ({
        id: question.id,
        label: question.prompt,
        color: i === 0 ? colors.chartSeries1 : colors.chartSeries2,
        type: question.type as "numeric" | "yes_no",
        values: buildQuestionSeries(
          question,
          chronologicalResponses,
          filteredAnsweredQuestions,
        ),
      })),
    [selectedQuestions, chronologicalResponses, filteredAnsweredQuestions, colors],
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

            {eligibleQuestions.length > 0 && (
              <View style={styles.compareSection}>
                <Text style={styles.sectionTitle}>Compare Over Time</Text>
                <View style={styles.questionChipRow}>
                  {eligibleQuestions.map((q) => {
                    const selected = selectedQuestionIds.includes(q.id);
                    return (
                      <Pressable
                        key={q.id}
                        onPress={() => toggleQuestion(q.id)}
                        style={[
                          styles.questionChip,
                          selected && styles.questionChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.questionChipText,
                            selected && styles.questionChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {q.prompt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {chartSeries.length === 0 ? (
                  <Text style={styles.compareEmptyText}>
                    Select up to two questions to compare their trends.
                  </Text>
                ) : chartLabels.length === 0 ? (
                  <Text style={styles.compareEmptyText}>
                    No responses in this range.
                  </Text>
                ) : (
                  <LineChart
                    labels={chartLabels}
                    timestamps={chartTimestamps}
                    series={chartSeries}
                  />
                )}
              </View>
            )}
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
    compareSection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 10,
    },
    questionChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    questionChip: {
      maxWidth: 200,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    questionChipActive: {
      backgroundColor: colors.buttonPrimaryBackground,
    },
    questionChipText: {
      fontSize: 13,
      color: colors.chipText,
    },
    questionChipTextActive: {
      color: colors.buttonPrimaryText,
    },
    compareEmptyText: {
      fontSize: 13,
      color: colors.textTertiary,
      fontStyle: "italic",
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
