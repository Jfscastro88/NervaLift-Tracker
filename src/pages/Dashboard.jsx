import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  SegmentedControl,
  Button,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconRoute,
  IconBatteryCharging,
  IconGauge,
  IconClock,
  IconAlertCircle,
  IconTool,
  IconShoppingCart,
  IconReceipt,
  IconCheck,
  IconChartBar,
} from "@tabler/icons-react";
import { supabase } from "../lib/supabase";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditScooterLogModal from "../components/EditScooterLogModal";
import TableRowActions from "../components/TableRowActions";
import DataMobileCard from "../components/DataMobileCard";
import PageHeader from "../components/PageHeader";
import {
  enrichRecords,
  computeSummary,
  formatNumber,
  formatDate,
  formatChargeTime,
} from "../lib/calculations";
import {
  calculateMaintenanceStats,
  calculateAccessoriesStats,
  formatCurrency,
} from "../lib/expenseCalculations";

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
  const [sortOrder, setSortOrder] = useState("new");
  const [enrichedRecords, setEnrichedRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [maintenanceStats, setMaintenanceStats] = useState(null);
  const [accessoriesStats, setAccessoriesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    const [logsResult, maintenanceResult, accessoriesResult] = await Promise.all([
      supabase.from("scooter_logs").select("*").order("odo", { ascending: true }),
      supabase.from("maintenance").select("date, odo, cost"),
      supabase.from("accessories").select("purchase_date, cost, installed"),
    ]);

    if (logsResult.error) {
      setError(logsResult.error.message);
      if (!silent) setLoading(false);
      return;
    }

    if (maintenanceResult.error) {
      setError(maintenanceResult.error.message);
      if (!silent) setLoading(false);
      return;
    }

    if (accessoriesResult.error) {
      setError(accessoriesResult.error.message);
      if (!silent) setLoading(false);
      return;
    }

    const enriched = enrichRecords(logsResult.data || []);
    const summaryResult = computeSummary(enriched);

    setEnrichedRecords(enriched);
    setSummary(summaryResult);
    setMaintenanceStats(calculateMaintenanceStats(maintenanceResult.data || []));
    setAccessoriesStats(calculateAccessoriesStats(accessoriesResult.data || []));
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  function handleEdit(record) {
    setSelectedRecord(record);
    setEditModalOpened(true);
  }

  function handleDeleteClick(record) {
    setSelectedRecord(record);
    setDeleteModalOpened(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedRecord) return;

    setDeleting(true);

    const { error: deleteError } = await supabase
      .from("scooter_logs")
      .delete()
      .eq("id", selectedRecord.id);

    setDeleting(false);

    if (deleteError) {
      console.error("Error deleting scooter log:", deleteError);
      notifications.show({
        title: "Error",
        message: deleteError.message,
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: "Record deleted",
      message: "The charging record has been deleted successfully.",
      color: "green",
      icon: <IconCheck size={18} />,
    });

    setDeleteModalOpened(false);
    setSelectedRecord(null);
    fetchRecords({ silent: true });
  }

  const displayedRecords =
    sortOrder === "new" ? [...enrichedRecords].reverse() : enrichedRecords;

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
    <Stack gap={{ base: "lg", sm: "xl" }}>
      <PageHeader
        title="Dashboard"
        subtitle="Scooter charging and range overview"
        action={
          <Button
            component={Link}
            to="/analytics"
            variant="light"
            color="green"
            leftSection={<IconChartBar size={16} />}
            fullWidth
            visibleFrom="xs"
            maw={{ base: "100%", xs: "auto" }}
          >
            View Analytics
          </Button>
        }
      />
      <Button
        component={Link}
        to="/analytics"
        variant="light"
        color="green"
        leftSection={<IconChartBar size={16} />}
        fullWidth
        hiddenFrom="xs"
      >
        View Analytics
      </Button>

      {summary && (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="md">
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
          {maintenanceStats && (
            <SummaryCard
              title="Maintenance Cost"
              value={formatCurrency(maintenanceStats.totalCost)}
              icon={IconTool}
              color="orange"
            />
          )}
          {accessoriesStats && (
            <SummaryCard
              title="Accessories Cost"
              value={formatCurrency(accessoriesStats.totalCost)}
              icon={IconShoppingCart}
              color="pink"
            />
          )}
          {maintenanceStats && accessoriesStats && (
            <SummaryCard
              title="Total Extra Cost"
              value={formatCurrency(
                maintenanceStats.totalCost + accessoriesStats.totalCost,
              )}
              icon={IconReceipt}
              color="red"
            />
          )}
        </SimpleGrid>
      )}

      <Paper
        radius="md"
        bg="dark.8"
        style={{ border: "1px solid var(--mantine-color-dark-5)", overflow: "hidden" }}
      >
        <Stack gap={0}>
          <Group
            px={{ base: "md", sm: "lg" }}
            py="md"
            justify="space-between"
            wrap="wrap"
            gap="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-dark-5)" }}
          >
            <Group gap="sm">
              <Title order={4} c="white" size="h5">
                Records
              </Title>
              <Text size="sm" c="dimmed">
                {enrichedRecords.length} entries
              </Text>
            </Group>
            <SegmentedControl
              size="xs"
              value={sortOrder}
              onChange={setSortOrder}
              data={[
                { label: "New", value: "new" },
                { label: "Old", value: "old" },
              ]}
            />
          </Group>

          {enrichedRecords.length === 0 ? (
            <Center py="xl" px="md">
              <Text c="dimmed" ta="center">
                No records yet. Add your first charge log.
              </Text>
            </Center>
          ) : (
            <>
              <Box visibleFrom="sm">
                <ScrollArea type="auto" offsetScrollbars>
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder={false}
                    miw={900}
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
                    <Table.Th w={90}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {displayedRecords.map((record) => (
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
                      <Table.Td>
                        <TableRowActions
                          onEdit={() => handleEdit(record)}
                          onDelete={() => handleDeleteClick(record)}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
                </ScrollArea>
              </Box>

              <Stack gap="sm" p="md" hiddenFrom="sm">
                {displayedRecords.map((record) => (
                  <DataMobileCard
                    key={record.id}
                    title={formatDate(record.created_at)}
                    subtitle={`${record.odo} km ODO`}
                    onEdit={() => handleEdit(record)}
                    onDelete={() => handleDeleteClick(record)}
                    fields={[
                      {
                        label: "Distance",
                        value:
                          record.distanceKm !== null
                            ? `${formatNumber(record.distanceKm, 1)} km`
                            : "—",
                      },
                      { label: "Battery", value: `${record.battery_before}% → ${record.battery_after}%` },
                      { label: "kWh", value: formatNumber(record.charge_kwh, 2) },
                      { label: "Time", value: formatChargeTime(record.charge_minutes) },
                      { label: "kWh/km", value: formatNumber(record.kwhPerKm, 3) },
                      { label: "Notes", value: record.notes || "—" },
                    ]}
                  />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      <EditScooterLogModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onSuccess={() => fetchRecords({ silent: true })}
      />

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this charging record? This action cannot be undone."
        loading={deleting}
      />
    </Stack>
  );
}
