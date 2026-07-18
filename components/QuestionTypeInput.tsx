import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { Question } from "@/types/journal";

interface Props {
  question: Question;
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean | null) => void;
}

export function QuestionTypeInput({ question, value, onChange }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

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
          placeholderTextColor={colors.placeholder}
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
          placeholderTextColor={colors.placeholder}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    prompt: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    required: {
      color: colors.destructive,
    },
    textInput: {
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderColor: colors.border,
      alignItems: "center",
    },
    toggleActive: {
      backgroundColor: colors.buttonPrimaryBackground,
      borderColor: colors.buttonPrimaryBackground,
    },
    toggleText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.chipText,
    },
    toggleTextActive: {
      color: colors.buttonPrimaryText,
    },
  });
}
