import { Pressable, StyleSheet, Text } from "react-native";

import { useThemeColors } from "@/hooks/useThemeColors";
import type { FormResponse } from "@/types/journal";

interface Props {
  response: FormResponse;
  preview?: string;
  onPress: () => void;
}

export function ResponseListItem({ response, preview, onPress }: Props) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    date: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    preview: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  const date = new Date(
    `${response.createdAt.replace(" ", "T")}Z`,
  ).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.date}>{date}</Text>
      {!!preview && (
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
        </Text>
      )}
    </Pressable>
  );
}
