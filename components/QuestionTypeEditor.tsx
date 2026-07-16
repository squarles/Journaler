import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import type { QuestionDraft, QuestionType } from "@/types/journal";

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short answer",
  numeric: "Number",
  yes_no: "Yes / No",
};

const TYPES: QuestionType[] = ["short_text", "numeric", "yes_no"];

interface Props {
  question: QuestionDraft;
  index: number;
  total: number;
  onChange: (question: QuestionDraft) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuestionTypeEditor({
  question,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.index}>{index + 1}.</Text>
        <TextInput
          style={styles.promptInput}
          value={question.prompt}
          onChangeText={(prompt) => onChange({ ...question, prompt })}
          placeholder="Question prompt"
          placeholderTextColor="#9aa0a6"
        />
      </View>

      <View style={styles.chipRow}>
        {TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => onChange({ ...question, type })}
            style={[styles.chip, question.type === type && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                question.type === type && styles.chipTextActive,
              ]}
            >
              {TYPE_LABELS[type]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.requiredRow}>
          <Text style={styles.requiredLabel}>Required</Text>
          <Switch
            value={question.required}
            onValueChange={(required) => onChange({ ...question, required })}
          />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onMoveUp}
            disabled={index === 0}
            style={styles.iconButton}
          >
            <Text style={[styles.iconText, index === 0 && styles.iconTextDisabled]}>
              ↑
            </Text>
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={index === total - 1}
            style={styles.iconButton}
          >
            <Text
              style={[
                styles.iconText,
                index === total - 1 && styles.iconTextDisabled,
              ]}
            >
              ↓
            </Text>
          </Pressable>
          <Pressable onPress={onRemove} style={styles.iconButton}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  index: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7075",
  },
  promptInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    color: "#1c1c1e",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e5e5ea",
  },
  chipActive: {
    backgroundColor: "#1c1c1e",
  },
  chipText: {
    fontSize: 13,
    color: "#3c3c43",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requiredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requiredLabel: {
    fontSize: 13,
    color: "#3c3c43",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  iconText: {
    fontSize: 16,
    color: "#1c1c1e",
  },
  iconTextDisabled: {
    color: "#c7c7cc",
  },
  removeText: {
    fontSize: 13,
    color: "#d70015",
  },
});
