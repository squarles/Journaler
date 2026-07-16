import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { FormListItem } from "@/components/FormListItem";
import { listForms } from "@/db/forms";
import type { Form } from "@/types/journal";

export default function Index() {
  const db = useSQLiteContext();
  const [forms, setForms] = useState<Form[]>([]);

  useFocusEffect(
    useCallback(() => {
      listForms(db).then(setForms);
    }, [db]),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Journaler",
          headerRight: () => (
            <Pressable onPress={() => router.push("/forms/new")}>
              <Text style={styles.newText}>+ New</Text>
            </Pressable>
          ),
        }}
      />

      {forms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No forms yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a form to start logging responses.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/forms/new")}
          >
            <Text style={styles.emptyButtonText}>+ New Form</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FormListItem
              form={item}
              onPress={() =>
                router.push({
                  pathname: "/forms/[id]",
                  params: { id: String(item.id) },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  list: {
    padding: 16,
  },
  newText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a84ff",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1c1c1e",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7075",
    marginTop: 6,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
