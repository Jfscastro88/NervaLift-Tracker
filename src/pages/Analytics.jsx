import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Title,
  Text,
  Stack,
  Card,
  Loader,
  Center,
  Alert,
  SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { enrichRecords, formatDate, formatNumber } from '../lib/calculations';
import {
  calculateMaintenanceStats,
  calculateAccessoriesStats,
  formatCurrency,
} from '../lib/expenseCalculations';

const CHART_COLORS = {
  line: 'var(--mantine-color-green-5)',
  bar: 'var(--mantine-color-blue-5)',
  maintenance: 'var(--mantine-color-orange-5)',
  accessories: 'var(--mantine-color-pink-5)',
};

const AXIS_STYLE = {
  stroke: 'var(--mantine-color-gray-5)',
  tick: { fill: 'var(--mantine-color-gray-5)', fontSize: 12 },
};

const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: 'var(--mantine-color-dark-5)',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--mantine-color-dark-7)',
    border: '1px solid var(--mantine-color-dark-5)',
    borderRadius: 'var(--mantine-radius-md)',
    color: 'var(--mantine-color-gray-2)',
  },
  labelStyle: { color: 'var(--mantine-color-gray-3)' },
  itemStyle: { color: 'var(--mantine-color-gray-2)' },
};

function ChartCard({ title, subtitle, children, empty, emptyMessage }) {
  return (
    <Card
      padding="lg"
      radius="md"
      bg="dark.8"
      style={{ border: '1px solid var(--mantine-color-dark-5)' }}
    >
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={4} c="white">
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </Stack>
        {empty ? (
          <Center h={280}>
            <Text c="dimmed" size="sm" ta="center">
              {emptyMessage}
            </Text>
          </Center>
        ) : (
          children
        )}
      </Stack>
    </Card>
  );
}

function buildScooterChartData(enrichedRecords) {
  return enrichedRecords
    .filter((record) => record.distanceKm !== null && record.distanceKm > 0)
    .map((record) => ({
      date: formatDate(record.created_at),
      kwhPerKm: record.kwhPerKm,
      distanceKm: record.distanceKm,
    }));
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scooterChartData, setScooterChartData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [logsResult, maintenanceResult, accessoriesResult] = await Promise.all([
      supabase.from('scooter_logs').select('*').order('odo', { ascending: true }),
      supabase.from('maintenance').select('date, odo, cost'),
      supabase.from('accessories').select('purchase_date, cost, installed'),
    ]);

    if (logsResult.error) {
      setError(logsResult.error.message);
      setLoading(false);
      return;
    }

    if (maintenanceResult.error) {
      setError(maintenanceResult.error.message);
      setLoading(false);
      return;
    }

    if (accessoriesResult.error) {
      setError(accessoriesResult.error.message);
      setLoading(false);
      return;
    }

    const enriched = enrichRecords(logsResult.data || []);
    setScooterChartData(buildScooterChartData(enriched));

    const maintenanceStats = calculateMaintenanceStats(maintenanceResult.data || []);
    const accessoriesStats = calculateAccessoriesStats(accessoriesResult.data || []);

    setExpenseData([
      { name: 'Maintenance', value: maintenanceStats.totalCost },
      { name: 'Accessories', value: accessoriesStats.totalCost },
    ]);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const expenseTotal = useMemo(
    () => expenseData.reduce((sum, item) => sum + item.value, 0),
    [expenseData],
  );

  if (loading) {
    return (
      <Center h={300}>
        <Loader color="green" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading analytics">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2} c="white">
          Analytics
        </Title>
        <Text c="dimmed" size="sm">
          Consumption trends and expense breakdown
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ChartCard
          title="Consumption Trend"
          subtitle="kWh per km over time"
          empty={scooterChartData.length === 0}
          emptyMessage="Not enough charging records yet. Add at least two logs to see consumption trends."
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scooterChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="date" {...AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis
                {...AXIS_STYLE}
                tickFormatter={(value) => formatNumber(value, 3)}
                width={48}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value) => [`${formatNumber(value, 3)} kWh/km`, 'Consumption']}
              />
              <Line
                type="monotone"
                dataKey="kwhPerKm"
                stroke={CHART_COLORS.line}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.line, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distance Per Charge"
          subtitle="Distance traveled between charges"
          empty={scooterChartData.length === 0}
          emptyMessage="Not enough charging records yet. Add at least two logs to see distance per charge."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scooterChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="date" {...AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis
                {...AXIS_STYLE}
                tickFormatter={(value) => formatNumber(value, 0)}
                width={40}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value) => [`${formatNumber(value, 1)} km`, 'Distance']}
              />
              <Bar dataKey="distanceKm" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>

      <ChartCard
        title="Expense Breakdown"
        subtitle="Maintenance vs Accessories"
        empty={expenseTotal === 0}
        emptyMessage="No maintenance or accessory costs recorded yet."
      >
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius="45%"
              paddingAngle={2}
              label={({ name, value }) =>
                `${name}: ${formatCurrency(value)}`
              }
            >
              <Cell fill={CHART_COLORS.maintenance} />
              <Cell fill={CHART_COLORS.accessories} />
            </Pie>
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value) => formatCurrency(value)}
            />
            <Legend
              wrapperStyle={{ color: 'var(--mantine-color-gray-4)' }}
              formatter={(value) => (
                <span style={{ color: 'var(--mantine-color-gray-3)' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </Stack>
  );
}
