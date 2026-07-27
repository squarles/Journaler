import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { DateTimePickerField } from "@/components/DateTimePickerField";
import { QuestionTypeInput } from "@/components/QuestionTypeInput";
import type { ThemeColors } from "@/constants/theme";
import { getFormWithQuestions } from "@/db/forms";
import {
  answerValue,
  deleteResponse,
  getResponseWithAnswers,
  updateResponse,
} from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import { confirmAsync, notify } from "@/lib/confirm";
import { parseSqliteDate, toSqliteDate } from "@/lib/dates";
import type { AnswerDraft, FormWithQuestions } from "@/types/journal";

export default function ResponseDetail() {
  const { id, responseId } = useLocalSearchParams<{
    id: string;
    responseId: string;
  }>();
  const formId = Number(id);
  const respId = Number(responseId);
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [values, setValues] = useState<
    Record<number, string | number | boolean | null>
  >({});
  const [createdAt, setCreatedAt] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([
        getFormWithQuestions(db, formId),
        getResponseWithAnswers(db, respId),
      ]).then(([formResult, responseResult]) => {
        if (cancelled) return;
        setForm(formResult);
        if (responseResult) {
          const initial: Record<number, string | number | boolean | null> = {};
          for (const { question, answer } of responseResult.answers) {
            initial[question.id] = answerValue(answer);
          }
          setValues(initial);
          setCreatedAt(parseSqliteDate(responseResult.createdAt));
        }
      });
      return () => {
        cancelled = true;
      };
    }, [db, formId, respId]),
  );

  async function handleSave() {
    if (!form) return;

    const missingRequired = form.questions.some(
      (q) =>
        q.required &&
        (values[q.id] === undefined ||
          values[q.id] === null ||
          values[q.id] === ""),
    );
    if (missingRequired) {
      notify("Missing answers", "Please answer all required questions.");
      return;
    }

    const answers: AnswerDraft[] = form.questions.map((q) => ({
      questionId: q.id,
      type: q.type,
      value: values[q.id] ?? null,
    }));

    await updateResponse(db, respId, answers, toSqliteDate(createdAt));
    router.back();
  }

  async function confirmDelete() {
    const confirmed = await confirmAsync(
      "Delete response?",
      "This cannot be undone.",
    );
    if (!confirmed) return;
    await deleteResponse(db, respId);
    router.back();
  }

  if (!form) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Response" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <DateTimePickerField value={createdAt} onChange={setCreatedAt} />

        {form.questions.map((question) => (
          <QuestionTypeInput
            key={question.id}
            question={question}
            value={values[question.id] ?? null}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, [question.id]: value }))
            }
          />
        ))}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </Pressable>

        <Pressable onPress={confirmDelete}>
          <Text style={styles.deleteText}>Delete Response</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 48,
    },
    saveButton: {
      backgroundColor: colors.buttonPrimaryBackground,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
    },
    saveText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: "600",
    },
    deleteText: {
      fontSize: 14,
      color: colors.destructive,
      textAlign: "center",
      marginTop: 16,
    },
  });
}
