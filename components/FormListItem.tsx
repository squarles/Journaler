import { Pressable, StyleSheet, Text } from "react-native";

import { useThemeColors } from "@/hooks/useThemeColors";
import type { Form } from "@/types/journal";

interface Props {
  form: Form;
  onPress: () => void;
}

export function FormListItem({ form, onPress }: Props) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{form.title}</Text>
      {!!form.description && (
        <Text style={styles.description} numberOfLines={2}>
          {form.description}
        </Text>
      )}
    </Pressable>
  );
}
