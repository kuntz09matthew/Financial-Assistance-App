import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function IncomeLineChart({ months, data, theme }) {
  return (
    <Line
      data={{
        labels: months,
        datasets: [
          {
            label: 'Total Income',
            data: data,
            fill: true,
            backgroundColor: theme.isDarkMode ? 'rgba(0,180,255,0.12)' : 'rgba(0,120,255,0.18)',
            borderColor: theme.accent,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: theme.accent,
            pointBorderColor: theme.card,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { color: theme.border },
            ticks: { color: theme.text },
          },
          y: {
            grid: { color: theme.border },
            ticks: { color: theme.text },
          },
        },
      }}
      height={320}
    />
  );
}

export function IncomeStackedAreaChart({ months, bySource, theme }) {
  const datasets = Object.entries(bySource).map(([name, arr], i) => ({
    label: name,
    data: arr.map(m => m.total),
    fill: true,
    backgroundColor: theme.stackedColors?.[i % theme.stackedColors.length] || theme.accent,
    borderColor: theme.stackedColors?.[i % theme.stackedColors.length] || theme.accent,
    tension: 0.3,
    pointRadius: 2,
  }));
  return (
    <Line
      data={{
        labels: months,
        datasets,
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { stacked: true, grid: { color: theme.border }, ticks: { color: theme.text } },
          y: { stacked: true, grid: { color: theme.border }, ticks: { color: theme.text } },
        },
      }}
      height={320}
    />
  );
}

export function IncomeGroupedBarChart({ months, byEarner, theme }) {
  const datasets = Object.entries(byEarner).map(([earner, arr], i) => ({
    label: earner,
    data: arr.map(m => m.total),
    backgroundColor: theme.stackedColors?.[i % theme.stackedColors.length] || theme.accent,
    borderRadius: 6,
    maxBarThickness: 32,
  }));
  return (
    <Bar
      data={{
        labels: months,
        datasets,
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { color: theme.border }, ticks: { color: theme.text } },
          y: { grid: { color: theme.border }, ticks: { color: theme.text } },
        },
      }}
      height={320}
    />
  );
}
