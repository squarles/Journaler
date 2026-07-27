import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

type PickerMode = "date" | "time";

function withDatePart(base: Date, datePart: Date): Date {
  const merged = new Date(base);
  merged.setFullYear(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
  );
  return merged;
}

function withTimePart(base: Date, timePart: Date): Date {
  const merged = new Date(base);
  merged.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return merged;
}

export function DateTimePickerField({ value, onChange }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [iosMode, setIosMode] = useState<PickerMode | null>(null);

  function applyPicked(mode: PickerMode, picked: Date) {
    onChange(mode === "date" ? withDatePart(value, picked) : withTimePart(value, picked));
  }

  function openPicker(mode: PickerMode) {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode,
        onChange: (event: DateTimePickerEvent, picked?: Date) => {
          if (event.type !== "set" || !picked) return;
          applyPicked(mode, picked);
        },
      });
    } else {
      setIosMode(iosMode === mode ? null : mode);
    }
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Date &amp; Time</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.webField}
            value={toDateInputValue(value)}
            onChangeText={(text) => {
              const parsed = parseDateInput(text);
              if (parsed) applyPicked("date", parsed);
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.placeholder}
          />
          <TextInput
            style={styles.webField}
            value={toTimeInputValue(value)}
            onChangeText={(text) => {
              const parsed = parseTimeInput(text);
              if (parsed) applyPicked("time", parsed);
            }}
            placeholder="HH:MM"
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date &amp; Time</Text>
      <View style={styles.row}>
        <Pressable style={styles.field} onPress={() => openPicker("date")}>
          <Text style={styles.fieldText}>
            {value.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </Pressable>
        <Pressable style={styles.field} onPress={() => openPicker("time")}>
          <Text style={styles.fieldText}>
            {value.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        </Pressable>
      </View>

      {Platform.OS === "ios" && iosMode && (
        <View>
          <DateTimePicker
            value={value}
            mode={iosMode}
            display="spinner"
            onChange={(event, picked) => {
              if (!picked) return;
              applyPicked(iosMode, picked);
            }}
          />
          <Pressable style={styles.doneButton} onPress={() => setIosMode(null)}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseDateInput(text: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function parseTimeInput(text: string): Date | null {
  const match = /^(\d{2}):(\d{2})$/.exec(text);
  if (!match) return null;
  const [, hours, minutes] = match;
  const h = Number(hours);
  const m = Number(minutes);
  if (h > 23 || m > 59) return null;
  return new Date(0, 0, 0, h, m);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      gap: 10,
    },
    field: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    webField: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      color: colors.text,
      fontSize: 16,
    },
    fieldText: {
      fontSize: 16,
      color: colors.text,
    },
    doneButton: {
      alignSelf: "flex-end",
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    doneText: {
      color: colors.tint,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
