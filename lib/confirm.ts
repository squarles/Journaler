import { Alert, Platform } from "react-native";

/**
 * react-native-web's Alert.alert() is a no-op, so confirmation dialogs need
 * a web-specific path (window.confirm) alongside the native Alert.alert flow.
 */
export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Delete", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

/** Same no-op-on-web caveat as confirmAsync, for plain single-button notices. */
export function notify(title: string, message: string): void {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
