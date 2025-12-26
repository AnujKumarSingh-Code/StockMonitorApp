import { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions,
  PanResponder,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import Svg, { Path, Line, Circle, Rect, G } from 'react-native-svg';
import { useThemeStore } from '@/store/themeStore';
import alphaApi, { CandlestickDataPoint, IndicatorDataPoint } from '@/services/alphaApi';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { formatPrice } from '@/utils/dummy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.base * 2;
const CHART_HEIGHT = 250;

type ChartType = 'line' | 'candlestick';
type IndicatorType = 'none' | 'sma' | 'ema' | 'rsi' | 'macd';

interface AdvancedChartProps {
  symbol: string;
  isPositive?: boolean;
}

interface TouchInfo {
  x: number;
  y: number;
  value: number;
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export default function AdvancedChart({ symbol, isPositive = true }: AdvancedChartProps) {
  const { colors } = useThemeStore();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [indicator, setIndicator] = useState<IndicatorType>('none');
  const [candleData, setCandleData] = useState<CandlestickDataPoint[]>([]);
  const [smaData, setSmaData] = useState<IndicatorDataPoint[]>([]);
  const [emaData, setEmaData] = useState<IndicatorDataPoint[]>([]);
  const [rsiData, setRsiData] = useState<IndicatorDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchInfo, setTouchInfo] = useState<TouchInfo | null>(null);

  const padding = { top: 30, bottom: 30, left: 10, right: 10 };
  const chartWidth = CHART_WIDTH - padding.left - padding.right;
  const chartHeight = CHART_HEIGHT - padding.top - padding.bottom;

  useEffect(() => {
    loadData();
  }, [symbol]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await alphaApi.getCandlestickData(symbol, 'daily');
      if (data.length > 0) {
        setCandleData(data);
      } else {
        setError('No data available');
      }
    } catch (err) {
      setError('Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndicator = async (type: IndicatorType) => {
    setIndicator(type);
    if (type === 'none') return;

    try {
      switch (type) {
        case 'sma':
          if (smaData.length === 0) {
            const data = await alphaApi.getSMA(symbol, 20);
            setSmaData(data);
          }
          break;
        case 'ema':
          if (emaData.length === 0) {
            const data = await alphaApi.getEMA(symbol, 20);
            setEmaData(data);
          }
          break;
        case 'rsi':
          if (rsiData.length === 0) {
            const data = await alphaApi.getRSI(symbol, 14);
            setRsiData(data);
          }
          break;
      }
    } catch (err) {
      console.error('Error loading indicator:', err);
    }
  };

  // Calculate chart bounds
  const chartBounds = useMemo(() => {
    if (candleData.length < 2) {
      return { minVal: 0, maxVal: 1, range: 1, xStep: 0 };
    }
    const highs = candleData.map((d) => d.high);
    const lows = candleData.map((d) => d.low);
    const minVal = Math.min(...lows) * 0.99;
    const maxVal = Math.max(...highs) * 1.01;
    const range = maxVal - minVal || 1;
    const xStep = chartWidth / (candleData.length - 1);
    return { minVal, maxVal, range, xStep };
  }, [candleData, chartWidth]);

  const { minVal, range, xStep } = chartBounds;

  // Get Y position for value
  const getY = (value: number) => {
    return padding.top + chartHeight - ((value - minVal) / range) * chartHeight;
  };

  // Format time
  const formatTime = (timestamp: string): string => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Get point at X position
  const getPointAtX = (touchX: number): TouchInfo | null => {
    if (candleData.length < 2 || xStep === 0) return null;

    const relativeX = Math.max(0, touchX - padding.left);
    const index = Math.round(relativeX / xStep);
    const clampedIndex = Math.max(0, Math.min(candleData.length - 1, index));
    
    const point = candleData[clampedIndex];
    if (!point) return null;

    const x = padding.left + clampedIndex * xStep;
    const y = getY(point.close);

    return {
      x,
      y,
      value: point.close,
      time: formatTime(point.timestamp),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
    };
  };

  // Pan responder
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const info = getPointAtX(evt.nativeEvent.locationX);
        setTouchInfo(info);
      },
      onPanResponderMove: (evt) => {
        const info = getPointAtX(evt.nativeEvent.locationX);
        setTouchInfo(info);
      },
      onPanResponderRelease: () => setTouchInfo(null),
      onPanResponderTerminate: () => setTouchInfo(null),
    });
  }, [candleData, minVal, range, xStep]);

  // Generate line path
  const linePath = useMemo(() => {
    if (candleData.length < 2) return '';
    let path = '';
    candleData.forEach((point, index) => {
      const x = padding.left + index * xStep;
      const y = getY(point.close);
      path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path;
  }, [candleData, xStep, minVal, range]);

  // Generate indicator path
  const indicatorPath = useMemo(() => {
    const data = indicator === 'sma' ? smaData : indicator === 'ema' ? emaData : [];
    if (data.length < 2) return '';
    
    let path = '';
    data.forEach((point, index) => {
      const x = padding.left + index * xStep;
      const y = getY(point.value);
      path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path;
  }, [indicator, smaData, emaData, xStep, minVal, range]);

  const lineColor = isPositive ? '#00D09C' : '#FF6B6B';
  const candleWidth = Math.max(3, (chartWidth / candleData.length) - 2);

  if (isLoading) {
    return (
      <View style={[styles.container, { height: CHART_HEIGHT + 80 }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error || candleData.length < 2) {
    return (
      <View style={[styles.container, { height: CHART_HEIGHT + 80 }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>
          {error || 'Unable to load chart data'}
        </Text>
      </View>
    );
  }

  // Label position
  const getLabelX = () => {
    if (!touchInfo) return 0;
    const labelWidth = 130;
    if (touchInfo.x < labelWidth / 2) return labelWidth / 2;
    if (touchInfo.x > CHART_WIDTH - labelWidth / 2) return CHART_WIDTH - labelWidth / 2;
    return touchInfo.x;
  };

  return (
    <View style={styles.container}>


      {/* Chart Type Toggle */}
      <View style={styles.toggleRow}>
        <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, chartType === 'line' && { backgroundColor: colors.primary }]}
            onPress={() => setChartType('line')}
          >
            <Text style={[styles.toggleText, { color: chartType === 'line' ? '#FFF' : colors.text }]}>
              Line
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, chartType === 'candlestick' && { backgroundColor: colors.primary }]}
            onPress={() => setChartType('candlestick')}
          >
            <Text style={[styles.toggleText, { color: chartType === 'candlestick' ? '#FFF' : colors.text }]}>
              Candle
            </Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* Chart */}
      <View style={styles.chartArea} {...panResponder.panHandlers}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {chartType === 'line' ? (
            // Line Chart
            <Path
              d={linePath}
              stroke={lineColor}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
            />
          ) : (


            // Candlestick Chart
            <G>
              {candleData.map((candle, index) => {
                const x = padding.left + index * xStep;
                const isGreen = candle.close >= candle.open;
                const color = isGreen ? '#00D09C' : '#FF6B6B';
                const bodyTop = getY(Math.max(candle.open, candle.close));
                const bodyBottom = getY(Math.min(candle.open, candle.close));
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                  <G key={index}>
                    {/* Wick */}
                    <Line
                      x1={x}
                      y1={getY(candle.high)}
                      x2={x}
                      y2={getY(candle.low)}
                      stroke={color}
                      strokeWidth={1}
                    />
                    {/* Body */}
                    <Rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={isGreen ? color : color}
                      stroke={color}
                      strokeWidth={0.5}
                    />
                  </G>
                );
              })}
            </G>
          )}



          {/* Indicator Overlay */}
          {indicator !== 'none' && indicator !== 'rsi' && indicatorPath && (
            <Path
              d={indicatorPath}
              stroke="#FFB800"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4,2"
            />
          )}

          {/* Touch indicator */}
          {touchInfo && (
            <>
              <Line
                x1={touchInfo.x}
                y1={0}
                x2={touchInfo.x}
                y2={CHART_HEIGHT}
                stroke="#6B7280"
                strokeWidth={1}
              />
              <Circle
                cx={touchInfo.x}
                cy={touchInfo.y}
                r={5}
                fill={lineColor}
                stroke={colors.background}
                strokeWidth={2}
              />
            </>
          )}
        </Svg>



        {/* Touch Label */}
        {touchInfo && (
          <View style={[styles.labelContainer, { left: getLabelX() - 65 }]}>
            <Text style={styles.labelText}>
              {formatPrice(touchInfo.value)} | {touchInfo.time}
            </Text>
            {chartType === 'candlestick' && touchInfo.open && (
              <Text style={styles.ohlcText}>
                O:{formatPrice(touchInfo.open)} H:{formatPrice(touchInfo.high!)} L:{formatPrice(touchInfo.low!)} C:{formatPrice(touchInfo.close!)}
              </Text>
            )}
          </View>
        )}
      </View>


      {/* Technical Indicators */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicatorScroll}>
        <View style={styles.indicatorRow}>
          {(['none', 'sma', 'ema', 'rsi', 'macd'] as IndicatorType[]).map((ind) => (
            <TouchableOpacity
              key={ind}
              style={[
                styles.indicatorBtn,
                { 
                  backgroundColor: indicator === ind ? colors.primary : colors.surfaceSecondary,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => loadIndicator(ind)}
            >
              <Text style={[
                styles.indicatorText,
                { color: indicator === ind ? '#FFF' : colors.text }
              ]}>
                {ind === 'none' ? 'None' : ind.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>



      {/* RSI Chart  */}
      {indicator === 'rsi' && rsiData.length > 0 && (
        <View style={styles.rsiContainer}>
          <Text style={[styles.rsiLabel, { color: colors.textMuted }]}>RSI (14)</Text>
          <Svg width={CHART_WIDTH} height={60}>


            {/* RSI Levels */}
            <Line x1={0} y1={12} x2={CHART_WIDTH} y2={12} stroke={colors.danger} strokeWidth={0.5} strokeDasharray="4,4" />
            <Line x1={0} y1={30} x2={CHART_WIDTH} y2={30} stroke={colors.textMuted} strokeWidth={0.5} strokeDasharray="4,4" />
            <Line x1={0} y1={48} x2={CHART_WIDTH} y2={48} stroke={colors.success} strokeWidth={0.5} strokeDasharray="4,4" />
            
            {/* RSI Line */}

            <Path
              d={rsiData.map((point, index) => {
                const x = (index / (rsiData.length - 1)) * CHART_WIDTH;
                const y = 60 - (point.value / 100) * 60;
                return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
              }).join(' ')}
              stroke="#9C27B0"
              strokeWidth={1.5}
              fill="none"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  toggleText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  chartArea: {
    position: 'relative',
  },
  errorText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  labelContainer: {
    position: 'absolute',
    top: 4,
    width: 130,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ohlcText: {
    fontSize: 8,
    color: '#AAAAAA',
    marginTop: 2,
  },
  indicatorScroll: {
    marginTop: spacing.md,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  indicatorBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  indicatorText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  rsiContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  rsiLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
});