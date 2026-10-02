import { useState, useEffect, useRef, useCallback } from "react";

export interface ChartDataItem {
  date?: string;
  time?: string;
  [key: string]: any;
}

export interface BrushRange {
  startIndex?: number;
  endIndex?: number;
}

/**
 * Custom hook that synchronizes the chart brushing / zooming window
 * across different aggregation frequencies (Raw, Daily, Weekly, Monthly)
 * to maintain the user's temporal context when switching views.
 */
export function useChartBrushSync<T extends ChartDataItem>(
  dataset: T[],
  reportAggregation: string
) {
  const [brushRange, setBrushRangeState] = useState<BrushRange>({});

  // Store the temporal bounds (start and end timestamps) of the active selection
  const temporalBoundsRef = useRef<{ startMs: number; endMs: number } | null>(null);

  // Helper to parse a millisecond timestamp from a chart data item
  const getItemTimestamp = useCallback((item: ChartDataItem): number => {
    if (!item) return 0;
    const dateStr = item.date || "";
    const timeStr = item.time || "00:00";

    // Standardize YYYY-MM (monthly group key) to YYYY-MM-01
    let fullDateStr = dateStr;
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      fullDateStr = `${dateStr}-01`;
    }

    const dateTimeStr = `${fullDateStr}T${timeStr.length === 5 ? timeStr + ":00" : timeStr}`;
    const parsed = Date.parse(dateTimeStr);
    if (!isNaN(parsed)) return parsed;

    const dateOnlyParsed = Date.parse(fullDateStr);
    return !isNaN(dateOnlyParsed) ? dateOnlyParsed : 0;
  }, []);

  // Update brush range & record temporal boundaries when user interacts with brush
  const handleBrushChange = useCallback((range: { startIndex?: number; endIndex?: number }) => {
    if (range && typeof range.startIndex === "number" && typeof range.endIndex === "number") {
      setBrushRangeState({ startIndex: range.startIndex, endIndex: range.endIndex });

      if (dataset && dataset.length > 0) {
        const startItem = dataset[Math.max(0, Math.min(dataset.length - 1, range.startIndex))];
        const endItem = dataset[Math.max(0, Math.min(dataset.length - 1, range.endIndex))];

        const startMs = getItemTimestamp(startItem);
        const endMs = getItemTimestamp(endItem);

        if (startMs > 0 && endMs > 0) {
          temporalBoundsRef.current = {
            startMs: Math.min(startMs, endMs),
            endMs: Math.max(startMs, endMs)
          };
        }
      }
    } else {
      setBrushRangeState({});
      temporalBoundsRef.current = null;
    }
  }, [dataset, getItemTimestamp]);

  // Reset zoom selection
  const resetBrush = useCallback(() => {
    setBrushRangeState({});
    temporalBoundsRef.current = null;
  }, []);

  // Preset zoom helper (e.g. last 7 or last 15 points)
  const setPreset = useCallback((count: number) => {
    if (!dataset || dataset.length === 0) return;
    const total = dataset.length;
    const startIndex = Math.max(0, total - count);
    const endIndex = total - 1;
    handleBrushChange({ startIndex, endIndex });
  }, [dataset, handleBrushChange]);

  // Synchronize brush range whenever dataset or aggregation mode changes
  useEffect(() => {
    if (!dataset || dataset.length === 0) {
      setBrushRangeState({});
      return;
    }

    // If an active temporal zoom exists, remap it to nearest indices in the new dataset
    if (temporalBoundsRef.current) {
      const { startMs, endMs } = temporalBoundsRef.current;

      let newStartIndex = 0;
      let minStartDiff = Infinity;

      let newEndIndex = dataset.length - 1;
      let minEndDiff = Infinity;

      dataset.forEach((item, idx) => {
        const itemMs = getItemTimestamp(item);
        if (itemMs > 0) {
          const startDiff = Math.abs(itemMs - startMs);
          if (startDiff < minStartDiff) {
            minStartDiff = startDiff;
            newStartIndex = idx;
          }

          const endDiff = Math.abs(itemMs - endMs);
          if (endDiff < minEndDiff) {
            minEndDiff = endDiff;
            newEndIndex = idx;
          }
        }
      });

      if (newStartIndex > newEndIndex) {
        const temp = newStartIndex;
        newStartIndex = newEndIndex;
        newEndIndex = temp;
      }

      setBrushRangeState({ startIndex: newStartIndex, endIndex: newEndIndex });
    }
  }, [dataset, reportAggregation, getItemTimestamp]);

  return {
    brushRange,
    handleBrushChange,
    resetBrush,
    setPreset,
    isZoomed: brushRange.startIndex !== undefined && brushRange.endIndex !== undefined
  };
}
