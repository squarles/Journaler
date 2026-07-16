import { router, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StyleSheet, View } from "react-native";

import { FormBuilderForm, type FormBuilderSubmitData } from "@/components/FormBuilderForm";
import { createForm } from "@/db/forms";

export default function NewForm() {
  const db = useSQLiteContext();

  async function handleSubmit(data: FormBuilderSubmitData) {
    if (!data.title) return;
    if (data.questions.length == 0) return;
    const newFormId = await createForm(db, {
      title: data.title,
      description: data.description || null,
      questions: data.questions,
    });
    router.replace({
      pathname: "/forms/[id]",
      params: { id: String(newFormId) },
    });
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "New Form" }} />
      <FormBuilderForm
        initialTitle=""
        initialDescription=""
        initialQuestions={[]}
        submitLabel="Create Form"
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
