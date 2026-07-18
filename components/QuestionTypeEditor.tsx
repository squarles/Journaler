import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
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
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.index}>{index + 1}.</Text>
        <TextInput
          style={styles.promptInput}
          value={question.prompt}
          onChangeText={(prompt) => onChange({ ...question, prompt })}
          placeholder="Question prompt"
          placeholderTextColor={colors.placeholder}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
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
      color: colors.textSecondary,
    },
    promptInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 6,
      color: colors.text,
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
      backgroundColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.buttonPrimaryBackground,
    },
    chipText: {
      fontSize: 13,
      color: colors.chipText,
    },
    chipTextActive: {
      color: colors.buttonPrimaryText,
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
      color: colors.chipText,
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
      color: colors.text,
    },
    iconTextDisabled: {
      color: colors.borderDisabled,
    },
    removeText: {
      fontSize: 13,
      color: colors.destructive,
    },
  });
}
