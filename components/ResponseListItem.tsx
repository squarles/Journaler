import { Pressable, StyleSheet, Text } from "react-native";

import type { FormResponse } from "@/types/journal";

interface Props {
  response: FormResponse;
  preview?: string;
  onPress: () => void;
}

export function ResponseListItem({ response, preview, onPress }: Props) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  date: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1c1e",
  },
  preview: {
    fontSize: 13,
    color: "#6b7075",
    marginTop: 4,
  },
});
