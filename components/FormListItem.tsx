import { Pressable, StyleSheet, Text } from "react-native";

import type { Form } from "@/types/journal";

interface Props {
  form: Form;
  onPress: () => void;
}

export function FormListItem({ form, onPress }: Props) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1c1c1e",
  },
  description: {
    fontSize: 14,
    color: "#6b7075",
    marginTop: 4,
  },
});
