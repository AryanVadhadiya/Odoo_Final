/**
 * Charts utility library for Chart.js configurations
 * Provides theme-aligned colors and accessibility features
 */

/**
 * Chart color palette aligned with the theme
 */
export const chartColors = {
  primary: [
    '#0f172a', // midnight-900
    '#1e293b', // midnight-800
    '#334155', // midnight-700
    '#475569', // midnight-600
    '#64748b', // midnight-500
  ],
  accent: [
    '#0369a1', // ocean-700
    '#0ea5e9', // sky-500
    '#38bdf8', // sky-400
    '#7dd3fc', // sky-300
    '#bae6fd', // sky-200
  ],
  success: [
    '#059669', // success-700
    '#16a34a', // success-600
    '#22c55e', // success-500
    '#4ade80', // success-400
    '#86efac', // success-300
  ],
  warning: [
    '#d97706', // warning-600
    '#f59e0b', // warning-500
    '#fbbf24', // warning-400
    '#fcd34d', // warning-300
    '#fde68a', // warning-200
  ],
  danger: [
    '#dc2626', // danger-600
    '#ef4444', // danger-500
    '#f87171', // danger-400
    '#fca5a5', // danger-300
    '#fecaca', // danger-200
  ],
  neutral: [
    '#f8fafc', // gray-50
    '#f1f5f9', // gray-100
    '#e2e8f0', // gray-200
    '#cbd5e1', // gray-300
    '#94a3b8', // gray-400
  ]
};

/**
 * Get chart colors based on type
 * @param {string} type - Chart type (primary, accent, success, warning, danger, neutral)
 * @param {number} count - Number of colors needed
 * @returns {string[]} Array of colors
 */
export function getChartColors(type = 'primary', count = 5) {
  const colors = chartColors[type] || chartColors.primary;
  return colors.slice(0, count);
}

/**
 * Get sequential colors for charts
 * @param {string} baseType - Base color type
 * @param {number} count - Number of colors needed
 * @returns {string[]} Array of sequential colors
 */
export function getSequentialColors(baseType = 'primary', count = 5) {
  const colors = chartColors[baseType] || chartColors.primary;
  const step = Math.max(1, Math.floor(colors.length / count));
  
  return Array.from({ length: count }, (_, i) => {
    const index = Math.min(i * step, colors.length - 1);
    return colors[index];
  });
}

/**
 * Get diverging colors for charts
 * @param {string} positiveType - Positive color type
 * @param {string} negativeType - Negative color type
 * @param {number} count - Number of colors needed
 * @returns {string[]} Array of diverging colors
 */
export function getDivergingColors(positiveType = 'success', negativeType = 'danger', count = 5) {
  const positiveColors = chartColors[positiveType] || chartColors.success;
  const negativeColors = chartColors[negativeType] || chartColors.danger;
  
  const midIndex = Math.floor(count / 2);
  const colors = [];
  
  // Add negative colors (reds)
  for (let i = 0; i < midIndex; i++) {
    const index = Math.min(i, negativeColors.length - 1);
    colors.unshift(negativeColors[index]);
  }
  
  // Add positive colors (greens)
  for (let i = 0; i < count - midIndex; i++) {
    const index = Math.min(i, positiveColors.length - 1);
    colors.push(positiveColors[index]);
  }
  
  return colors;
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Whether user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get Chart.js common options with accessibility features
 * @param {Object} options - Custom options
 * @returns {Object} Chart.js options object
 */
export function getChartOptions(options = {}) {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: !prefersReducedMotion(),
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#0ea5e9',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          weight: '600'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#e2e8f0',
          borderColor: '#cbd5e1'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#64748b'
        }
      },
      y: {
        grid: {
          color: '#e2e8f0',
          borderColor: '#cbd5e1'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#64748b'
        }
      }
    }
  };
  
  return { ...baseOptions, ...options };
}

/**
 * Get line chart configuration
 * @param {Object} data - Chart data
 * @param {Object} options - Custom options
 * @returns {Object} Line chart configuration
 */
export function getLineChartConfig(data, options = {}) {
  return {
    type: 'line',
    data,
    options: getChartOptions({
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 3
        },
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      ...options
    })
  };
}

/**
 * Get bar chart configuration
 * @param {Object} data - Chart data
 * @param {Object} options - Custom options
 * @returns {Object} Bar chart configuration
 */
export function getBarChartConfig(data, options = {}) {
  return {
    type: 'bar',
    data,
    options: getChartOptions({
      elements: {
        bar: {
          borderRadius: 4
        }
      },
      ...options
    })
  };
}

/**
 * Get pie chart configuration
 * @param {Object} data - Chart data
 * @param {Object} options - Custom options
 * @returns {Object} Pie chart configuration
 */
export function getPieChartConfig(data, options = {}) {
  return {
    type: 'pie',
    data,
    options: getChartOptions({
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      },
      ...options
    })
  };
}

/**
 * Get doughnut chart configuration
 * @param {Object} data - Chart data
 * @param {Object} options - Custom options
 * @returns {Object} Doughnut chart configuration
 */
export function getDoughnutChartConfig(data, options = {}) {
  return {
    type: 'doughnut',
    data,
    options: getChartOptions({
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      },
      ...options
    })
  };
}

// Default export
export default {
  chartColors,
  getChartColors,
  getSequentialColors,
  getDivergingColors,
  prefersReducedMotion,
  getChartOptions,
  getLineChartConfig,
  getBarChartConfig,
  getPieChartConfig,
  getDoughnutChartConfig
}; 