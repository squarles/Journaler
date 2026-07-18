import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { QuestionTypeEditor } from "@/components/QuestionTypeEditor";
import type { QuestionDraft } from "@/types/journal";

export interface FormBuilderSubmitData {
  title: string;
  description: string;
  questions: QuestionDraft[];
}

interface Props {
  initialTitle: string;
  initialDescription: string;
  initialQuestions: QuestionDraft[];
  submitLabel: string;
  onSubmit: (data: FormBuilderSubmitData) => void;
}

export function FormBuilderForm({
  initialTitle,
  initialDescription,
  initialQuestions,
  submitLabel,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<QuestionDraft[]>(initialQuestions);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { prompt: "", type: "short_text", required: false },
    ]);
  }

  function updateQuestion(index: number, next: QuestionDraft) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? next : q)));
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit() {
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((q) => ({ ...q, prompt: q.prompt.trim() })),
    });
  }

  const canSubmit =
    title.trim().length > 0 &&
    questions.length > 0 &&
    questions.every((q) => q.prompt.trim().length > 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Form title"
        placeholderTextColor="#9aa0a6"
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.descriptionInput}
        value={description}
        onChangeText={setDescription}
        placeholder="What is this form for?"
        placeholderTextColor="#9aa0a6"
        multiline
      />

      <View style={styles.questionsHeader}>
        <Text style={styles.label}>Questions</Text>
        <Pressable onPress={addQuestion}>
          <Text style={styles.addText}>+ Add Question</Text>
        </Pressable>
      </View>

      {questions.length === 0 && (
        <Text style={styles.emptyText}>No questions yet.</Text>
      )}

      {questions.map((q, i) => (
        <QuestionTypeEditor
          key={q.id ?? `new-${i}`}
          question={q}
          index={i}
          total={questions.length}
          onChange={(next) => updateQuestion(i, next)}
          onRemove={() => removeQuestion(i)}
          onMoveUp={() => moveQuestion(i, -1)}
          onMoveDown={() => moveQuestion(i, 1)}
        />
      ))}

      <Pressable
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7075",
    marginBottom: 6,
    marginTop: 16,
    textTransform: "uppercase",
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1c1c1e",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  descriptionInput: {
    fontSize: 15,
    color: "#1c1c1e",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
    minHeight: 40,
  },
  questionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a84ff",
  },
  emptyText: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 8,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#c7c7cc",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
