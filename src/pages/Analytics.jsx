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
  Box,
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
import PageHeader from '../components/PageHeader';
import { useIsMobile, useIsSmallScreen } from '../hooks/useIsMobile';

const CHART_COLORS = {
  line: 'var(--mantine-color-green-5)',
  bar: 'var(--mantine-color-blue-5)',
  maintenance: 'var(--mantine-color-orange-5)',
  accessories: 'var(--mantine-color-pink-5)',
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
    fontSize: 12,
  },
  labelStyle: { color: 'var(--mantine-color-gray-3)' },
  itemStyle: { color: 'var(--mantine-color-gray-2)' },
};

function ChartCard({ title, subtitle, children, empty, emptyMessage, chartHeight }) {
  return (
    <Card
      padding={{ base: 'md', sm: 'lg' }}
      radius="md"
      bg="dark.8"
      style={{ border: '1px solid var(--mantine-color-dark-5)', overflow: 'hidden' }}
    >
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={4} c="white" size="h5">
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </Stack>
        {empty ? (
          <Center h={chartHeight}>
            <Text c="dimmed" size="sm" ta="center" px="md">
              {emptyMessage}
            </Text>
          </Center>
        ) : (
          <Box w="100%" style={{ overflow: 'hidden' }}>
            {children}
          </Box>
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
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scooterChartData, setScooterChartData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const chartHeight = isSmallScreen ? 220 : isMobile ? 260 : 280;
  const pieHeight = isSmallScreen ? 260 : isMobile ? 300 : 320;

  const axisStyle = useMemo(
    () => ({
      stroke: 'var(--mantine-color-gray-5)',
      tick: { fill: 'var(--mantine-color-gray-5)', fontSize: isSmallScreen ? 10 : 12 },
    }),
    [isSmallScreen],
  );

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
    <Stack gap={{ base: 'lg', sm: 'xl' }}>
      <PageHeader
        title="Analytics"
        subtitle="Consumption trends and expense breakdown"
      />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ChartCard
          title="Consumption Trend"
          subtitle="kWh per km over time"
          empty={scooterChartData.length === 0}
          emptyMessage="Not enough charging records yet. Add at least two logs to see consumption trends."
          chartHeight={chartHeight}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart
              data={scooterChartData}
              margin={{ top: 8, right: 4, left: isSmallScreen ? -12 : 0, bottom: 0 }}
            >
              <CartesianGrid {...GRID_STYLE} />
              <XAxis
                dataKey="date"
                {...axisStyle}
                interval="preserveStartEnd"
                angle={isSmallScreen ? -35 : 0}
                textAnchor={isSmallScreen ? 'end' : 'middle'}
                height={isSmallScreen ? 50 : 30}
              />
              <YAxis
                {...axisStyle}
                tickFormatter={(value) => formatNumber(value, 3)}
                width={isSmallScreen ? 42 : 48}
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
                dot={{ fill: CHART_COLORS.line, r: isSmallScreen ? 3 : 4 }}
                activeDot={{ r: isSmallScreen ? 5 : 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distance Per Charge"
          subtitle="Distance traveled between charges"
          empty={scooterChartData.length === 0}
          emptyMessage="Not enough charging records yet. Add at least two logs to see distance per charge."
          chartHeight={chartHeight}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={scooterChartData}
              margin={{ top: 8, right: 4, left: isSmallScreen ? -12 : 0, bottom: 0 }}
            >
              <CartesianGrid {...GRID_STYLE} />
              <XAxis
                dataKey="date"
                {...axisStyle}
                interval="preserveStartEnd"
                angle={isSmallScreen ? -35 : 0}
                textAnchor={isSmallScreen ? 'end' : 'middle'}
                height={isSmallScreen ? 50 : 30}
              />
              <YAxis
                {...axisStyle}
                tickFormatter={(value) => formatNumber(value, 0)}
                width={isSmallScreen ? 36 : 40}
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
        chartHeight={pieHeight}
      >
        <ResponsiveContainer width="100%" height={pieHeight}>
          <PieChart>
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={isSmallScreen ? '58%' : '70%'}
              innerRadius={isSmallScreen ? '38%' : '45%'}
              paddingAngle={2}
              label={
                isSmallScreen
                  ? false
                  : ({ name, value }) => `${name}: ${formatCurrency(value)}`
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
              wrapperStyle={{
                color: 'var(--mantine-color-gray-4)',
                fontSize: isSmallScreen ? 12 : 14,
                paddingTop: 8,
              }}
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
