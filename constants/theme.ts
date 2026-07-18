export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderDisabled: string;
  tint: string;
  destructive: string;
  placeholder: string;
  chipText: string;
  buttonPrimaryBackground: string;
  buttonPrimaryText: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#ffffff",
    card: "#f5f5f7",
    text: "#1c1c1e",
    textSecondary: "#6b7075",
    textTertiary: "#8e8e93",
    border: "#e5e5ea",
    borderDisabled: "#c7c7cc",
    tint: "#0a84ff",
    destructive: "#d70015",
    placeholder: "#9aa0a6",
    chipText: "#3c3c43",
    buttonPrimaryBackground: "#1c1c1e",
    buttonPrimaryText: "#ffffff",
  },
  dark: {
    background: "#000000",
    card: "#1c1c1e",
    text: "#f2f2f7",
    textSecondary: "#98989d",
    textTertiary: "#8e8e93",
    border: "#38383a",
    borderDisabled: "#48484a",
    tint: "#0a84ff",
    destructive: "#ff453a",
    placeholder: "#68686d",
    chipText: "#d1d1d6",
    buttonPrimaryBackground: "#f2f2f7",
    buttonPrimaryText: "#1c1c1e",
  },
};
