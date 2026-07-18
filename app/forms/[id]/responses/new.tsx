import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { QuestionTypeInput } from "@/components/QuestionTypeInput";
import type { ThemeColors } from "@/constants/theme";
import { getFormWithQuestions } from "@/db/forms";
import { createResponse } from "@/db/responses";
import { useThemeColors } from "@/hooks/useThemeColors";
import { notify } from "@/lib/confirm";
import type { AnswerDraft, FormWithQuestions } from "@/types/journal";

export default function NewResponse() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const formId = Number(id);
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [values, setValues] = useState<
    Record<number, string | number | boolean | null>
  >({});

  useFocusEffect(
    useCallback(() => {
      getFormWithQuestions(db, formId).then(setForm);
    }, [db, formId]),
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

    await createResponse(db, formId, answers);
    router.back();
  }

  if (!form) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "New Response" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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
          <Text style={styles.saveText}>Save Response</Text>
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
  });
}
