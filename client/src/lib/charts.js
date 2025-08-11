// Charts utility with theme colors and Chart.js configurations
export const chartColors = {
  // Primary brand colors
  midnight: '#0f172a',
  ocean: '#0369a1',
  sky: '#0ea5e9',

  // Extended palette for charts
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  }
};

// Chart.js color schemes
export const colorSchemes = {
  // Default color scheme
  default: [
    chartColors.ocean,
    chartColors.sky,
    chartColors.green[500],
    chartColors.yellow[500],
    chartColors.red[500],
    chartColors.purple[500],
    chartColors.blue[400],
    chartColors.green[400],
  ],

  // Budget categories
  budget: [
    chartColors.ocean,      // Transportation
    chartColors.sky,        // Accommodation
    chartColors.green[500], // Activities
    chartColors.yellow[500], // Food
    chartColors.red[500],   // Shopping
    chartColors.purple[500], // Entertainment
    chartColors.blue[400],  // Other
  ],

  // Trip timeline
  timeline: [
    chartColors.midnight,
    chartColors.ocean,
    chartColors.sky,
    chartColors.green[500],
    chartColors.yellow[500],
  ],

  // Success/error states
  status: {
    success: chartColors.green[500],
    warning: chartColors.yellow[500],
    error: chartColors.red[500],
    info: chartColors.sky,
  }
};

// Common Chart.js configurations
export const chartConfigs = {
  // Global defaults
  defaults: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
          color: chartColors.gray[700],
        },
      },
      tooltip: {
        backgroundColor: chartColors.midnight,
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: chartColors.ocean,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: '600',
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
        },
      },
    },
    // Disable animations if user prefers reduced motion
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  },

  // Line chart configuration
  line: {
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: 'white',
      },
    },
    scales: {
      x: {
        grid: {
          color: chartColors.gray[200],
          borderColor: chartColors.gray[300],
        },
        ticks: {
          color: chartColors.gray[600],
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: chartColors.gray[200],
          borderColor: chartColors.gray[300],
        },
        ticks: {
          color: chartColors.gray[600],
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
      },
    },
  },

  // Bar chart configuration
  bar: {
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartColors.gray[600],
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: chartColors.gray[200],
          borderColor: chartColors.gray[300],
        },
        ticks: {
          color: chartColors.gray[600],
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
      },
    },
  },

  // Doughnut/Pie chart configuration
  doughnut: {
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
          color: chartColors.gray[700],
        },
      },
    },
  },

  // Radar chart configuration
  radar: {
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: chartColors.gray[200],
        },
        pointLabels: {
          color: chartColors.gray[700],
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
        ticks: {
          color: chartColors.gray[600],
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 10,
          },
        },
      },
    },
  },
};

// Utility functions
export const createChartConfig = (type, data, options = {}) => {
  const baseConfig = chartConfigs.defaults;
  const typeConfig = chartConfigs[type] || {};

  return {
    type,
    data,
    options: {
      ...baseConfig,
      ...typeConfig,
      ...options,
    },
  };
};

export const getColorScheme = (schemeName = 'default') => {
  return colorSchemes[schemeName] || colorSchemes.default;
};

export const getStatusColor = (status) => {
  return colorSchemes.status[status] || chartColors.gray[500];
};

// Accessibility helpers
export const createAccessibleChart = (chartInstance, options = {}) => {
  const {
    title,
    description,
    ariaLabel,
  } = options;

  // Add ARIA attributes to chart canvas
  const canvas = chartInstance.canvas;
  if (canvas) {
    if (title) {
      canvas.setAttribute('aria-label', title);
    }
    if (description) {
      canvas.setAttribute('aria-describedby', description);
    }
    if (ariaLabel) {
      canvas.setAttribute('aria-label', ariaLabel);
    }
  }

  return chartInstance;
};

// Export default color scheme
export default chartColors;
