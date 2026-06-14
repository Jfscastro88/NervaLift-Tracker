import { useEffect, useState } from "react";
import {
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  Stack,
  Loader,
  Center,
  Alert,
  Table,
  ScrollArea,
  Paper,
} from "@mantine/core";
import {
  IconRoute,
  IconBatteryCharging,
  IconGauge,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { supabase } from "../lib/supabase";
import {
  enrichRecords,
  computeSummary,
  formatNumber,
  formatDate,
  formatChargeTime,
} from "../lib/calculations";

function SummaryCard({ title, value, unit, icon: Icon, color }) {
  return (
    <Card
      padding="lg"
      radius="md"
      bg="dark.8"
      style={{ border: "1px solid var(--mantine-color-dark-5)" }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {title}
          </Text>
          <Group gap={4} align="baseline">
            <Text size="xl" fw={700} c="white">
              {value}
            </Text>
            {unit && (
              <Text size="sm" c="dimmed">
                {unit}
              </Text>
            )}
          </Group>
        </Stack>
        <Icon size={28} color={`var(--mantine-color-${color}-5)`} opacity={0.8} />
      </Group>
    </Card>
  );
}

export default function Dashboard() {
  const [enrichedRecords, setEnrichedRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("scooter_logs")
        .select("*")
        .order("odo", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const enriched = enrichRecords(data || []);
      const summaryResult = computeSummary(enriched);

      console.log({
        totalDistance: summaryResult.totalKm,
        totalKwh: summaryResult.totalKwh,
        avgKwhPerKm: summaryResult.avgKwhPerKm,
        avgKmPerKwh: summaryResult.avgKmPerKwh,
      });

      setEnrichedRecords(enriched);
      setSummary(summaryResult);
      setLoading(false);
    }

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <Center h={300}>
        <Loader color="green" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading data">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2} c="white">
          Dashboard
        </Title>
        <Text c="dimmed" size="sm">
          Scooter charging and range overview
        </Text>
      </Stack>

      {summary && (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 5 }} spacing="md">
          <SummaryCard
            title="Total KM"
            value={formatNumber(summary.totalKm, 1)}
            unit="km"
            icon={IconRoute}
            color="green"
          />
          <SummaryCard
            title="Total kWh"
            value={formatNumber(summary.totalKwh, 2)}
            unit="kWh"
            icon={IconBatteryCharging}
            color="blue"
          />
          <SummaryCard
            title="Avg kWh/km"
            value={formatNumber(summary.avgKwhPerKm, 3)}
            unit="kWh/km"
            icon={IconGauge}
            color="yellow"
          />
          <SummaryCard
            title="Avg km/kWh"
            value={formatNumber(summary.avgKmPerKwh, 2)}
            unit="km/kWh"
            icon={IconGauge}
            color="teal"
          />
          <SummaryCard
            title="Charging Time"
            value={formatChargeTime(summary.totalChargeMinutes)}
            icon={IconClock}
            color="violet"
          />
        </SimpleGrid>
      )}

      <Paper
        radius="md"
        bg="dark.8"
        style={{ border: "1px solid var(--mantine-color-dark-5)", overflow: "hidden" }}
      >
        <Stack gap={0}>
          <Group px="lg" py="md" style={{ borderBottom: "1px solid var(--mantine-color-dark-5)" }}>
            <Title order={4} c="white">
              Records
            </Title>
            <Text size="sm" c="dimmed">
              {enrichedRecords.length} entries
            </Text>
          </Group>

          {enrichedRecords.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed">No records yet. Add your first charge log.</Text>
            </Center>
          ) : (
            <ScrollArea>
              <Table
                striped
                highlightOnHover
                withTableBorder={false}
                styles={{
                  th: {
                    backgroundColor: "var(--mantine-color-dark-7)",
                    color: "var(--mantine-color-gray-4)",
                    fontSize: "var(--mantine-font-size-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  },
                  td: {
                    color: "var(--mantine-color-gray-2)",
                    fontSize: "var(--mantine-font-size-sm)",
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>ODO</Table.Th>
                    <Table.Th>Distance</Table.Th>
                    <Table.Th>Battery Before</Table.Th>
                    <Table.Th>Battery After</Table.Th>
                    <Table.Th>kWh</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>kWh/km</Table.Th>
                    <Table.Th>Notes</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {enrichedRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>{formatDate(record.created_at)}</Table.Td>
                      <Table.Td>{record.odo} km</Table.Td>
                      <Table.Td>
                        {record.distanceKm !== null
                          ? `${formatNumber(record.distanceKm, 1)} km`
                          : "—"}
                      </Table.Td>
                      <Table.Td>{record.battery_before}%</Table.Td>
                      <Table.Td>{record.battery_after}%</Table.Td>
                      <Table.Td>{formatNumber(record.charge_kwh, 2)}</Table.Td>
                      <Table.Td>{formatChargeTime(record.charge_minutes)}</Table.Td>
                      <Table.Td>{formatNumber(record.kwhPerKm, 3)}</Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2} maw={200}>
                          {record.notes || "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
