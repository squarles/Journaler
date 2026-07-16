import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import {
  FormBuilderForm,
  type FormBuilderSubmitData,
} from "@/components/FormBuilderForm";
import { getFormWithQuestions, updateForm } from "@/db/forms";
import type { FormWithQuestions } from "@/types/journal";

export default function EditForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const formId = Number(id);
  const db = useSQLiteContext();
  const [form, setForm] = useState<FormWithQuestions | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFormWithQuestions(db, formId).then(setForm);
    }, [db, formId]),
  );

  async function handleSubmit(data: FormBuilderSubmitData) {
    if (!data.title) return;
    await updateForm(db, formId, {
      title: data.title,
      description: data.description || null,
      questions: data.questions,
    });
    router.replace({ pathname: "/forms/[id]", params: { id } });
  }

  if (!form) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Edit Form" }} />
      <FormBuilderForm
        initialTitle={form.title}
        initialDescription={form.description ?? ""}
        initialQuestions={form.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          type: q.type,
          required: q.required,
        }))}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
