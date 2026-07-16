import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Question } from "@/types/journal";

interface Props {
  question: Question;
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean | null) => void;
}

export function QuestionTypeInput({ question, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>
        {question.prompt}
        {question.required && <Text style={styles.required}> *</Text>}
      </Text>

      {question.type === "short_text" && (
        <TextInput
          style={styles.textInput}
          value={typeof value === "string" ? value : ""}
          onChangeText={(text) => onChange(text)}
          placeholder="Your answer"
          placeholderTextColor="#9aa0a6"
        />
      )}

      {question.type === "numeric" && (
        <TextInput
          style={styles.textInput}
          value={value === null || value === undefined ? "" : String(value)}
          onChangeText={(text) => {
            if (text === "") {
              onChange(null);
              return;
            }
            const parsed = Number(text);
            onChange(Number.isNaN(parsed) ? text : parsed);
          }}
          placeholder="Enter a number"
          placeholderTextColor="#9aa0a6"
          keyboardType="numeric"
        />
      )}

      {question.type === "yes_no" && (
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggle, value === true && styles.toggleActive]}
            onPress={() => onChange(value === true ? null : true)}
          >
            <Text
              style={[styles.toggleText, value === true && styles.toggleTextActive]}
            >
              Yes
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, value === false && styles.toggleActive]}
            onPress={() => onChange(value === false ? null : false)}
          >
            <Text
              style={[
                styles.toggleText,
                value === false && styles.toggleTextActive,
              ]}
            >
              No
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  prompt: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1c1c1e",
    marginBottom: 8,
  },
  required: {
    color: "#d70015",
  },
  textInput: {
    fontSize: 16,
    color: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5ea",
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#1c1c1e",
    borderColor: "#1c1c1e",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3c3c43",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
});
