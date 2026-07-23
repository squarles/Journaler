import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { QuestionInsight } from "@/lib/stats";

interface Props {
  insight: QuestionInsight;
  totalResponses: number;
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function InsightCard({ insight, totalResponses }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{insight.question.prompt}</Text>

      {insight.type === "numeric" &&
        (insight.count > 0 ? (
          <>
            <Text style={styles.headline}>{formatNumber(insight.average)}</Text>
            <Text style={styles.subtext}>
              average · min {formatNumber(insight.min)} · max{" "}
              {formatNumber(insight.max)}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>No numeric answers yet.</Text>
        ))}

      {insight.type === "yes_no" &&
        (insight.count > 0 ? (
          <>
            <Text style={styles.headline}>
              {Math.round(insight.yesPercentage)}% Yes
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[styles.barFill, { width: `${insight.yesPercentage}%` }]}
              />
            </View>
            <Text style={styles.subtext}>
              {insight.yesCount} yes · {insight.noCount} no
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>No answers yet.</Text>
        ))}

      {insight.type === "short_text" && (
        <Text style={styles.subtext}>
          {insight.count} text response{insight.count === 1 ? "" : "s"}
        </Text>
      )}

      <Text style={styles.responseRate}>
        Answered in {insight.count} of {totalResponses} response
        {totalResponses === 1 ? "" : "s"}
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      gap: 6,
    },
    prompt: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    headline: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginTop: 2,
    },
    subtext: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textTertiary,
      fontStyle: "italic",
    },
    barTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      overflow: "hidden",
      marginTop: 2,
    },
    barFill: {
      height: "100%",
      backgroundColor: colors.tint,
      borderRadius: 4,
    },
    responseRate: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
  });
}
