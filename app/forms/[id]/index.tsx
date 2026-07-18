import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ResponseListItem } from "@/components/ResponseListItem";
import type { ThemeColors } from "@/constants/theme";
import { deleteForm, getFormWithQuestions } from "@/db/forms";
import { listResponsesForForm } from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import { confirmAsync } from "@/lib/confirm";
import type { FormResponse, FormWithQuestions } from "@/types/journal";

import { parseSqliteDate, toDateKey } from "@/lib/dates";
import { Calendar, type DateData } from "react-native-calendars";

const SELECTED_TEXT_COLOR = "#ffffff";

function markFor(tintColor: string, hasResponses: boolean, isSelected: boolean) {
  return {
    marked: hasResponses,
    dotColor: tintColor,
    selected: isSelected,
    selectedColor: tintColor,
    selectedTextColor: SELECTED_TEXT_COLOR,
  };
}

export default function FormDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const formId = Number(id);
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFormWithQuestions(db, formId).then(setForm);
      listResponsesForForm(db, formId).then((list) => {
        setResponses(list);
        setSelectedDate((current) => current ?? toDateKey(list[0] ? parseSqliteDate(list[0].createdAt) : new Date()));
      });
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

  const responsesByDate = useMemo(() => {
    const map = new Map<string, FormResponse[]>();
    for (const response of responses) {
      const key = toDateKey(parseSqliteDate(response.createdAt));
      const list = map.get(key) ?? [];
      list.push(response);
      map.set(key, list);
    }
    return map;
  }, [responses]);

  const markedDates = useMemo(() => {
    const marks: Record<string, ReturnType<typeof markFor>> = {};
    for (const key of responsesByDate.keys()) {
      marks[key] = markFor(colors.tint, true, key === selectedDate);
    }
    if (selectedDate && !marks[selectedDate]) {
      marks[selectedDate] = markFor(colors.tint, false, true);
    }
    return marks;
  }, [responsesByDate, selectedDate, colors.tint]);

  const selectedResponses = selectedDate
    ? (responsesByDate.get(selectedDate) ?? [])
    : [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: form?.title ?? "Form" }} />

      <View style={styles.header}>
        {!!form?.description && (
          <Text style={styles.description}>{form.description}</Text>
        )}
        <Text style={styles.questionCount}>
          {form?.questions.length ?? 0} question
          {form?.questions.length === 1 ? ", " : "s, "}
          {responses.length ?? 0} response
          {responses.length === 1 ? "" : "s"}
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

      <FlatList
        data={selectedResponses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Calendar
              current={selectedDate ?? undefined}
              markedDates={markedDates}
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              theme={{
                backgroundColor: colors.background,
                calendarBackground: colors.background,
                textSectionTitleColor: colors.textSecondary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textTertiary,
                monthTextColor: colors.text,
                arrowColor: colors.tint,
                todayTextColor: colors.tint,
                selectedDayBackgroundColor: colors.tint,
                selectedDayTextColor: SELECTED_TEXT_COLOR,
                dotColor: colors.tint,
                selectedDotColor: SELECTED_TEXT_COLOR,
              }}
              style={styles.calendar}
            />
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {selectedDate ?? ""} · {selectedResponses.length} response
                {selectedResponses.length === 1 ? "" : "s"}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No responses on this day.</Text>
          </View>
        }
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
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    headerLink: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.tint,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    calendar: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    listHeaderText: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    list: {
      padding: 16,
      paddingTop: 6,
    },
  });
}
