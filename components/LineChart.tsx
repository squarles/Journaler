import { useMemo, useState } from "react";
import type { GestureResponderEvent, LayoutChangeEvent } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line as SvgLine, Path, Text as SvgText } from "react-native-svg";

import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";

export interface LineChartSeries {
  id: number;
  label: string;
  color: string;
  type: "numeric" | "yes_no";
  /** One entry per x position; `null` where the question went unanswered for that response. */
  values: (number | null)[];
}

interface Props {
  /** X-axis category labels, aligned with each series' `values` array. */
  labels: string[];
  series: LineChartSeries[];
  height?: number;
}

const PADDING_LEFT = 8;
const PADDING_RIGHT = 40;
const PADDING_TOP = 22;
const PADDING_BOTTOM = 22;

function formatValue(type: "numeric" | "yes_no", value: number): string {
  if (type === "yes_no") return value >= 0.5 ? "Yes" : "No";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Maps a series' values onto a shared 0..1 band, independently per series (never a dual y-axis). */
function normalize(values: (number | null)[]): (number | null)[] {
  const defined = values.filter((v): v is number => v !== null);
  if (defined.length === 0) return values.map(() => null);
  const min = Math.min(...defined);
  const max = Math.max(...defined);
  if (min === max) return values.map((v) => (v === null ? null : 0.5));
  return values.map((v) => (v === null ? null : (v - min) / (max - min)));
}

/** Splits a values array into contiguous runs of defined indices, so gaps aren't connected. */
function toSegments(values: (number | null)[]): number[][] {
  const segments: number[][] = [];
  let current: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push(i);
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

export function LineChart({ labels, series, height = 200 }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = labels.length;
  const plotWidth = Math.max(width - PADDING_LEFT - PADDING_RIGHT, 1);
  const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const isComparing = series.length > 1;

  const plotted = useMemo(
    () => (isComparing ? series.map((s) => normalize(s.values)) : series.map((s) => s.values)),
    [series, isComparing],
  );

  const rawRangeBySeries = useMemo(
    () =>
      series.map((s) => {
        const defined = s.values.filter((v): v is number => v !== null);
        return {
          min: defined.length ? Math.min(...defined) : 0,
          max: defined.length ? Math.max(...defined) : 0,
        };
      }),
    [series],
  );

  function xAt(index: number): number {
    if (count <= 1) return PADDING_LEFT + plotWidth / 2;
    return PADDING_LEFT + (index / (count - 1)) * plotWidth;
  }

  function yAt(seriesIndex: number, value: number): number {
    if (isComparing) return PADDING_TOP + (1 - value) * plotHeight;
    const { min, max } = rawRangeBySeries[seriesIndex];
    if (min === max) return PADDING_TOP + plotHeight / 2;
    return PADDING_TOP + (1 - (value - min) / (max - min)) * plotHeight;
  }

  function indexFromX(locationX: number): number | null {
    if (count === 0 || !Number.isFinite(locationX)) return null;
    const ratio = count > 1 ? (locationX - PADDING_LEFT) / plotWidth : 0;
    return Math.min(Math.max(Math.round(ratio * (count - 1)), 0), count - 1);
  }

  function handleTouchStart(e: GestureResponderEvent) {
    const index = indexFromX(e.nativeEvent.locationX);
    if (index === null) return;
    setActiveIndex((prev) => (prev === index ? null : index));
  }

  function handleTouchMove(e: GestureResponderEvent) {
    const index = indexFromX(e.nativeEvent.locationX);
    if (index !== null) setActiveIndex(index);
  }

  return (
    <View style={styles.container}>
      {isComparing && (
        <View style={styles.legendRow}>
          {series.map((s) => {
            const defined = s.values.filter((v): v is number => v !== null);
            let rangeLabel = "No data";
            if (defined.length > 0) {
              if (s.type === "yes_no") {
                const pct = Math.round(
                  (defined.filter((v) => v >= 0.5).length / defined.length) * 100,
                );
                rangeLabel = `${pct}% Yes`;
              } else {
                const min = Math.min(...defined);
                const max = Math.max(...defined);
                rangeLabel =
                  min === max
                    ? formatValue("numeric", min)
                    : `${formatValue("numeric", min)}–${formatValue("numeric", max)}`;
              }
            }
            return (
              <View key={s.id} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {s.label}
                </Text>
                <Text style={styles.legendRange}>{rangeLabel}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={handleTouchStart}
            onResponderMove={handleTouchMove}
          >
            <Svg width={width} height={height}>
              {[0, 0.5, 1].map((t) => (
                <SvgLine
                  key={t}
                  x1={PADDING_LEFT}
                  x2={width - PADDING_RIGHT}
                  y1={PADDING_TOP + t * plotHeight}
                  y2={PADDING_TOP + t * plotHeight}
                  stroke={colors.border}
                  strokeWidth={1}
                />
              ))}

              {activeIndex !== null && (
                <SvgLine
                  x1={xAt(activeIndex)}
                  x2={xAt(activeIndex)}
                  y1={PADDING_TOP}
                  y2={PADDING_TOP + plotHeight}
                  stroke={colors.textTertiary}
                  strokeWidth={1}
                />
              )}

              {series.map((s, si) => {
                const values = plotted[si];
                const segments = toSegments(values);
                const lastDefinedIndex = segments.length
                  ? segments[segments.length - 1][segments[segments.length - 1].length - 1]
                  : undefined;

                return (
                  <G key={s.id}>
                    {segments.map((segment, segIndex) => (
                      <Path
                        key={segIndex}
                        d={segment
                          .map((i, pointIndex) => {
                            const x = xAt(i);
                            const y = yAt(si, values[i] as number);
                            return `${pointIndex === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")}
                        stroke={s.color}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    ))}

                    {segments.flat().map((i) => (
                      <Circle
                        key={i}
                        cx={xAt(i)}
                        cy={yAt(si, values[i] as number)}
                        r={activeIndex === i ? 5 : 3}
                        fill={s.color}
                        stroke={colors.card}
                        strokeWidth={2}
                      />
                    ))}

                    {/* Comparing two series risks converging end-labels overlapping each other;
                        the legend and tap tooltip already carry those values, so skip it there. */}
                    {!isComparing && lastDefinedIndex !== undefined && (
                      <SvgText
                        x={xAt(lastDefinedIndex) + 8}
                        y={yAt(si, values[lastDefinedIndex] as number) + 4}
                        fontSize={12}
                        fontWeight="600"
                        fill={colors.text}
                      >
                        {formatValue(s.type, s.values[lastDefinedIndex] as number)}
                      </SvgText>
                    )}
                  </G>
                );
              })}
            </Svg>
          </View>
        )}
      </View>

      <View style={styles.xAxisRow}>
        <Text style={styles.axisLabel}>{labels[0] ?? ""}</Text>
        {count > 1 && <Text style={styles.axisLabel}>{labels[count - 1]}</Text>}
      </View>

      {activeIndex !== null && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>{labels[activeIndex]}</Text>
          {series.map((s) => {
            const v = s.values[activeIndex];
            return (
              <View key={s.id} style={styles.tooltipRow}>
                <View style={[styles.tooltipSwatch, { backgroundColor: s.color }]} />
                <Text style={styles.tooltipLabel} numberOfLines={1}>
                  {s.label}
                </Text>
                <Text style={styles.tooltipValue}>
                  {v == null ? "—" : formatValue(s.type, v)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: "100%",
    },
    legendRow: {
      gap: 6,
      marginBottom: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendSwatch: {
      width: 14,
      height: 3,
      borderRadius: 1.5,
    },
    legendLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
    },
    legendRange: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    xAxisRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: PADDING_LEFT,
      marginTop: 2,
    },
    axisLabel: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    tooltip: {
      marginTop: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      gap: 6,
    },
    tooltipDate: {
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: 2,
    },
    tooltipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    tooltipSwatch: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    tooltipLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
    },
    tooltipValue: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
  });
}
