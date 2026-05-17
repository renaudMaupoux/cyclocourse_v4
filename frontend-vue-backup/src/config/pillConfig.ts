export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const pillConfig = {
  colors: {
    high: {
      bg: '#e3f2fd',
      border: '#2196f3',
      text: '#1565c0'
    },
    medium: {
      bg: '#fff3e0',
      border: '#ff9800',
      text: '#e65100'
    },
    low: {
      bg: '#ffebee',
      border: '#f44336',
      text: '#c62828'
    }
  },
  thresholds: {
    high: 0.9,
    medium: 0.7
  },
  layout: {
    columns: 'auto',
    gap: '12px',
    maxWidth: '1200px'
  },
  animation: {
    duration: '0.3s',
    easing: 'ease'
  }
} as const;

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= pillConfig.thresholds.high) return 'high';
  if (confidence >= pillConfig.thresholds.medium) return 'medium';
  return 'low';
}

export function getConfidenceColors(confidence: number) {
  const level = getConfidenceLevel(confidence);
  return pillConfig.colors[level];
}

/** Classes Tailwind (shadcn / design tokens) pour les gellules selon la confiance */
const confidenceTw: Record<ConfidenceLevel, string> = {
  high:
    'border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-100',
  medium:
    'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400 dark:bg-amber-950/60 dark:text-amber-100',
  low: 'border-red-500 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-950/60 dark:text-red-100'
};

export function getConfidenceTwClasses(confidence: number): string {
  return confidenceTw[getConfidenceLevel(confidence)];
}
