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
  Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconShoppingCart,
  IconList,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EditAccessoryModal from '../components/EditAccessoryModal';
import TableRowActions from '../components/TableRowActions';
import {
  calculateAccessoriesStats,
  formatCurrency,
} from '../lib/expenseCalculations';
import { formatDate } from '../lib/calculations';

const ACCESSORY_CATEGORIES = [
  'Bauletto',
  'Staffa telefono',
  'Parabrezza',
  'Antifurto',
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

export default function Accessories() {
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
      purchase_date: new Date().toISOString().slice(0, 10),
      name: '',
      category: '',
      cost: '',
      installed: true,
      notes: '',
    },
    validate: {
      purchase_date: (value) => (!value ? 'Purchase date is required' : null),
      name: (value) => (!value.trim() ? 'Name is required' : null),
      category: (value) => (!value ? 'Category is required' : null),
      cost: (value) => {
        if (value === '' || value === null) return 'Cost is required';
        const num = Number(value);
        if (num < 0) return 'Cost must be 0 or greater';
        return null;
      },
    },
  });

  const fetchRecords = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('accessories')
      .select('*')
      .order('purchase_date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      if (!silent) setLoading(false);
      return;
    }

    const fetchedRecords = data || [];
    setRecords(fetchedRecords);
    setStats(calculateAccessoriesStats(fetchedRecords));
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
      .from('accessories')
      .delete()
      .eq('id', selectedRecord.id);

    setDeleting(false);

    if (deleteError) {
      console.error('Error deleting accessory:', deleteError);
      notifications.show({
        title: 'Error',
        message: deleteError.message,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: 'Accessory deleted',
      message: 'The accessory has been deleted successfully.',
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
      setError('You must be logged in to add accessories.');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('accessories').insert({
      user_id: user.id,
      purchase_date: values.purchase_date,
      name: values.name.trim(),
      category: values.category,
      cost: Number(values.cost),
      installed: values.installed,
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
      title: 'Accessory saved',
      message: 'Your accessory has been added successfully.',
      color: 'green',
      icon: <IconCheck size={18} />,
    });

    form.reset();
    form.setFieldValue('purchase_date', new Date().toISOString().slice(0, 10));
    form.setFieldValue('installed', true);
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
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2} c="white">
          Accessories
        </Title>
        <Text c="dimmed" size="sm">
          Track add-ons, upgrades, and gear purchases
        </Text>
      </Stack>

      {stats && (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          <SummaryCard
            title="Total Cost"
            value={formatCurrency(stats.totalCost)}
            icon={IconShoppingCart}
            color="orange"
          />
          <SummaryCard
            title="Accessories"
            value={stats.count}
            icon={IconList}
            color="blue"
          />
          <SummaryCard
            title="Installed"
            value={stats.installedCount}
            icon={IconCircleCheck}
            color="green"
          />
          <SummaryCard
            title="Not Installed"
            value={stats.notInstalledCount}
            icon={IconCircleX}
            color="red"
          />
        </SimpleGrid>
      )}

      <Paper
        p="xl"
        radius="md"
        bg="dark.8"
        style={{ border: '1px solid var(--mantine-color-dark-5)' }}
        maw={600}
        mx="auto"
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
              label="Purchase date"
              type="date"
              required
              {...form.getInputProps('purchase_date')}
            />
            <TextInput
              label="Name"
              placeholder="e.g. Top case 35L"
              required
              {...form.getInputProps('name')}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={ACCESSORY_CATEGORIES}
              required
              searchable
              {...form.getInputProps('category')}
            />
            <NumberInput
              label="Cost (€)"
              placeholder="e.g. 89.99"
              min={0}
              decimalScale={2}
              required
              {...form.getInputProps('cost')}
            />
            <Checkbox
              label="Installed"
              {...form.getInputProps('installed', { type: 'checkbox' })}
            />
            <Textarea
              label="Notes"
              placeholder="Optional notes..."
              minRows={3}
              {...form.getInputProps('notes')}
            />
            <Button type="submit" color="green" loading={submitting}>
              Save Accessory
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
            px="lg"
            py="md"
            style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
          >
            <Title order={4} c="white">
              Accessories List
            </Title>
            <Text size="sm" c="dimmed">
              {records.length} entries
            </Text>
          </Group>

          {records.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed">No accessories yet.</Text>
            </Center>
          ) : (
            <ScrollArea>
              <Table
                striped
                highlightOnHover
                withTableBorder={false}
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
                    <Table.Th>Purchase Date</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Cost</Table.Th>
                    <Table.Th>Installed</Table.Th>
                    <Table.Th>Notes</Table.Th>
                    <Table.Th w={90}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>{formatDate(record.purchase_date)}</Table.Td>
                      <Table.Td>{record.name}</Table.Td>
                      <Table.Td>{record.category}</Table.Td>
                      <Table.Td>{formatCurrency(Number(record.cost))}</Table.Td>
                      <Table.Td>{record.installed ? 'Yes' : 'No'}</Table.Td>
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
          )}
        </Stack>
      </Paper>

      <EditAccessoryModal
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
        title="Delete Accessory"
        message="Are you sure you want to delete this accessory? This action cannot be undone."
        loading={deleting}
      />
    </Stack>
  );
}
