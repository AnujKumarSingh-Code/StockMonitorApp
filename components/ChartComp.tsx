import { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions,
  PanResponder,
} from 'react-native';


import Svg, { Path, Line, Circle } from 'react-native-svg';
import { useThemeStore } from '@/store/themeStore';
import { useAlphaStore } from '@/store/alphaStore';
import { spacing, fontSize } from '@/constants/theme';
import { formatPrice } from '@/utils/dummy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.base * 2;
const CHART_HEIGHT = 200;


interface ChartCompProps {
  symbol: string;
  height?: number;
  isPositive?: boolean;
}


interface TouchInfo {
  x: number;
  y: number;
  value: number;
  time: string;
}



export default function ChartComp({ symbol, height = CHART_HEIGHT, isPositive = true }: ChartCompProps) {
  const { colors } = useThemeStore();
  const { chartData, isLoadingChart, chartError, fetchChartData } = useAlphaStore();
  const [touchInfo, setTouchInfo] = useState<TouchInfo | null>(null);

  useEffect(() => {

    if (symbol) {
      fetchChartData(symbol, '3M');
    }
  }, [symbol, fetchChartData]);


  const padding = { top: 30, bottom: 10, left: 0, right: 0 };
  const chartWidth = CHART_WIDTH - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;



  // Calculate chart values
  const chartValues = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return { minVal: 0, maxVal: 1, range: 1, xStep: 0 };
    }
    const values = chartData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const xStep = chartWidth / (chartData.length - 1);
    return { minVal, maxVal, range, xStep };
  }, [chartData, chartWidth]);


  const { minVal, range, xStep } = chartValues;


  // Format time from timestamp
  const formatTime = (timestamp: string): string => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  // Get point at X position
  const getPointAtX = (touchX: number): TouchInfo | null => {
    if (!chartData || chartData.length < 2 || xStep === 0) return null;

    const relativeX = Math.max(0, touchX - padding.left);
    const index = Math.round(relativeX / xStep);
    const clampedIndex = Math.max(0, Math.min(chartData.length - 1, index));
    

    const point = chartData[clampedIndex];
    if (!point) return null;

    const x = padding.left + clampedIndex * xStep;
    const y = padding.top + chartHeight - ((point.value - minVal) / range) * chartHeight;

    return {
      x,
      y,
      value: point.value,
      time: formatTime(point.timestamp),
    };
  };


  // PanResponder with proper dependencies
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const info = getPointAtX(locationX);
        setTouchInfo(info);
      },

      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        const info = getPointAtX(locationX);
        setTouchInfo(info);
      },
      onPanResponderRelease: () => {
        setTouchInfo(null);
      },

      onPanResponderTerminate: () => {
        setTouchInfo(null);
      },
    });
  }, [chartData, minVal, range, xStep, chartHeight]);



  // Generate SVG path
  const linePath = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return '';
    }

    let path = '';
    chartData.forEach((point, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + chartHeight - ((point.value - minVal) / range) * chartHeight;

      if (index === 0) {
        path = `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  }, [chartData, minVal, range, xStep, chartHeight]);



  const lineColor = isPositive ? '#00D09C' : '#FF6B6B';

  if (isLoadingChart) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }


  if (chartError || chartData.length < 2) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>
          Unable to load chart data
        </Text>
      </View>
    );
  }



  // Calculate label position - keep within bounds
  const getLabelX = () => {
    if (!touchInfo) return 0;
    const labelWidth = 130;
    const halfLabel = labelWidth / 2;
    if (touchInfo.x < halfLabel) return halfLabel;
    if (touchInfo.x > CHART_WIDTH - halfLabel) return CHART_WIDTH - halfLabel;
    return touchInfo.x;
  };



  return (
    <View style={[styles.container, { height }]} {...panResponder.panHandlers}>
      <Svg width={CHART_WIDTH} height={height}>
        {/* Main chart line */}
        <Path
          d={linePath}
          stroke={lineColor}
          strokeWidth={1.5}
          fill="none"
          strokeLinejoin="round"
        />

        {/* Touch indicator */}
        {touchInfo && (
          <>
            {/* Vertical line - full height */}
            <Line
              x1={touchInfo.x}
              y1={0}
              x2={touchInfo.x}
              y2={height}
              stroke="#6B7280"
              strokeWidth={1}
            />
            

            {/* Dot at intersection */}
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


      {/* Price & Time label at top of vertical line */}
      {touchInfo && (
        <View 
          style={[
            styles.labelContainer,
            { left: getLabelX() - 65 }
          ]}
        >
          <Text style={styles.labelText}>
            {formatPrice(touchInfo.value)} | {touchInfo.time}
          </Text>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  errorText: {
    fontSize: fontSize.sm,
  },
  labelContainer: {
    position: 'absolute',
    top: 4,
    width: 130,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});