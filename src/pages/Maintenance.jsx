import { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Title,
  Text,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Paper,
  Group,
  Alert,
  SimpleGrid,
  Card,
  Table,
  ScrollArea,
  Loader,
  Center,
  Select,
  TextInput,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconTool,
  IconList,
  IconGauge,
  IconCalendar,
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EditMaintenanceModal from '../components/EditMaintenanceModal';
import TableRowActions from '../components/TableRowActions';
import DataMobileCard from '../components/DataMobileCard';
import PageHeader from '../components/PageHeader';
import {
  calculateMaintenanceStats,
  formatCurrency,
} from '../lib/expenseCalculations';
import { formatDate, formatNumber } from '../lib/calculations';

const MAINTENANCE_TYPES = [
  'Revisione',
  'Cambio gomme',
  'Freni',
  'Controllo generale',
  'Altro',
];

function SummaryCard({ title, value, unit, icon: Icon, color }) {
  return (
    <Card
      padding="lg"
      radius="md"
      bg="dark.8"
      style={{ border: '1px solid var(--mantine-color-dark-5)' }}
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

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    initialValues: {
      date: new Date().toISOString().slice(0, 10),
      odo: '',
      type: '',
      cost: '',
      notes: '',
    },
    validate: {
      date: (value) => (!value ? 'Date is required' : null),
      type: (value) => (!value ? 'Type is required' : null),
      cost: (value) => {
        if (value === '' || value === null) return 'Cost is required';
        const num = Number(value);
        if (num < 0) return 'Cost must be 0 or greater';
        return null;
      },
      odo: (value) => {
        if (value === '' || value === null) return null;
        const num = Number(value);
        if (num < 0) return 'ODO cannot be negative';
        return null;
      },
    },
  });

  const fetchRecords = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('maintenance')
      .select('*')
      .order('date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      if (!silent) setLoading(false);
      return;
    }

    const fetchedRecords = data || [];
    setRecords(fetchedRecords);
    setStats(calculateMaintenanceStats(fetchedRecords));
    if (!silent) setLoading(false);
  }, []);

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
      .from('maintenance')
      .delete()
      .eq('id', selectedRecord.id);

    setDeleting(false);

    if (deleteError) {
      console.error('Error deleting maintenance record:', deleteError);
      notifications.show({
        title: 'Error',
        message: deleteError.message,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: 'Maintenance deleted',
      message: 'The maintenance record has been deleted successfully.',
      color: 'green',
      icon: <IconCheck size={18} />,
    });

    setDeleteModalOpened(false);
    setSelectedRecord(null);
    fetchRecords({ silent: true });
  }

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  async function handleSubmit(values) {
    setSubmitting(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('You must be logged in to add maintenance.');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('maintenance').insert({
      user_id: user.id,
      date: values.date,
      odo: values.odo !== '' && values.odo !== null ? Number(values.odo) : null,
      type: values.type,
      cost: Number(values.cost),
      notes: values.notes.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      notifications.show({
        title: 'Error',
        message: insertError.message,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: 'Maintenance saved',
      message: 'Your maintenance record has been added successfully.',
      color: 'green',
      icon: <IconCheck size={18} />,
    });

    form.reset();
    form.setFieldValue('date', new Date().toISOString().slice(0, 10));
    fetchRecords();
  }

  if (loading) {
    return (
      <Center h={300}>
        <Loader color="green" />
      </Center>
    );
  }

  return (
    <Stack gap={{ base: 'lg', sm: 'xl' }}>
      <PageHeader
        title="Maintenance"
        subtitle="Track service, repairs, and upkeep costs"
      />

      {stats && (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          <SummaryCard
            title="Total Cost"
            value={formatCurrency(stats.totalCost)}
            icon={IconTool}
            color="orange"
          />
          <SummaryCard
            title="Records"
            value={stats.count}
            icon={IconList}
            color="blue"
          />
          <SummaryCard
            title="Last ODO"
            value={
              stats.lastOdo !== null ? formatNumber(stats.lastOdo, 0) : '—'
            }
            unit={stats.lastOdo !== null ? 'km' : undefined}
            icon={IconGauge}
            color="teal"
          />
          <SummaryCard
            title="Last Date"
            value={stats.lastDate ? formatDate(stats.lastDate) : '—'}
            icon={IconCalendar}
            color="violet"
          />
        </SimpleGrid>
      )}

      <Paper
        p={{ base: 'md', sm: 'xl' }}
        radius="md"
        bg="dark.8"
        style={{ border: '1px solid var(--mantine-color-dark-5)' }}
        w="100%"
      >
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="md"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Date"
              type="date"
              required
              size="md"
              {...form.getInputProps('date')}
            />
            <NumberInput
              label="ODO (km)"
              placeholder="Optional"
              min={0}
              decimalScale={0}
              size="md"
              {...form.getInputProps('odo')}
            />
            <Select
              label="Type"
              placeholder="Select maintenance type"
              data={MAINTENANCE_TYPES}
              required
              searchable
              size="md"
              {...form.getInputProps('type')}
            />
            <NumberInput
              label="Cost (€)"
              placeholder="e.g. 120"
              min={0}
              decimalScale={2}
              required
              size="md"
              {...form.getInputProps('cost')}
            />
            <Textarea
              label="Notes"
              placeholder="Optional notes..."
              minRows={3}
              {...form.getInputProps('notes')}
            />
            <Button type="submit" color="green" loading={submitting} fullWidth size="md">
              Save Maintenance
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper
        radius="md"
        bg="dark.8"
        style={{ border: '1px solid var(--mantine-color-dark-5)', overflow: 'hidden' }}
      >
        <Stack gap={0}>
          <Group
            px={{ base: 'md', sm: 'lg' }}
            py="md"
            wrap="wrap"
            gap="sm"
            style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
          >
            <Title order={4} c="white" size="h5">
              Maintenance History
            </Title>
            <Text size="sm" c="dimmed">
              {records.length} entries
            </Text>
          </Group>

          {records.length === 0 ? (
            <Center py="xl" px="md">
              <Text c="dimmed" ta="center">No maintenance records yet.</Text>
            </Center>
          ) : (
            <>
              <Box visibleFrom="sm">
                <ScrollArea type="auto" offsetScrollbars>
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder={false}
                    miw={700}
                    styles={{
                  th: {
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    color: 'var(--mantine-color-gray-4)',
                    fontSize: 'var(--mantine-font-size-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  },
                  td: {
                    color: 'var(--mantine-color-gray-2)',
                    fontSize: 'var(--mantine-font-size-sm)',
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>ODO</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Cost</Table.Th>
                    <Table.Th>Notes</Table.Th>
                    <Table.Th w={90}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>{formatDate(record.date)}</Table.Td>
                      <Table.Td>
                        {record.odo !== null && record.odo !== undefined
                          ? `${record.odo} km`
                          : '—'}
                      </Table.Td>
                      <Table.Td>{record.type}</Table.Td>
                      <Table.Td>{formatCurrency(Number(record.cost))}</Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2} maw={200}>
                          {record.notes || '—'}
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
                {records.map((record) => (
                  <DataMobileCard
                    key={record.id}
                    title={record.type}
                    subtitle={formatDate(record.date)}
                    onEdit={() => handleEdit(record)}
                    onDelete={() => handleDeleteClick(record)}
                    fields={[
                      {
                        label: 'ODO',
                        value:
                          record.odo !== null && record.odo !== undefined
                            ? `${record.odo} km`
                            : '—',
                      },
                      { label: 'Cost', value: formatCurrency(Number(record.cost)) },
                      { label: 'Notes', value: record.notes || '—' },
                    ]}
                  />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      <EditMaintenanceModal
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
        title="Delete Maintenance"
        message="Are you sure you want to delete this maintenance record? This action cannot be undone."
        loading={deleting}
      />
    </Stack>
  );
}
