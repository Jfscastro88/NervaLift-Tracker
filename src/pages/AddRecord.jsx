import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  Text,
  NumberInput,
  Textarea,
  Button,
  Stack,
  Paper,
  Alert,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/profile';
import PageHeader from '../components/PageHeader';

export default function AddRecord() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      odo: '',
      battery_before: '',
      battery_after: '',
      charge_kwh: '',
      charge_hours: '',
      charge_minutes: '',
      notes: '',
    },
    validate: {
      odo: (value) => {
        const num = Number(value);
        if (!value && value !== 0) return 'ODO is required';
        if (num <= 0) return 'ODO must be greater than 0';
        return null;
      },
      battery_before: (value) => {
        const num = Number(value);
        if (value === '' || value === null) return 'Battery before is required';
        if (num < 0 || num > 100) return 'Must be between 0 and 100';
        return null;
      },
      battery_after: (value) => {
        const num = Number(value);
        if (value === '' || value === null) return 'Battery after is required';
        if (num < 0 || num > 100) return 'Must be between 0 and 100';
        return null;
      },
      charge_kwh: (value) => {
        const num = Number(value);
        if (!value && value !== 0) return 'Charged energy is required';
        if (num <= 0) return 'Must be greater than 0';
        return null;
      },
      charge_hours: (value, values) => {
        const hours = Number(value) || 0;
        const minutes = Number(values.charge_minutes) || 0;

        if (hours < 0) return 'Cannot be negative';
        if (hours === 0 && minutes === 0) return 'Enter hours and/or minutes';
        return null;
      },
      charge_minutes: (value, values) => {
        const hours = Number(values.charge_hours) || 0;
        const minutes = Number(value) || 0;

        if (minutes < 0 || minutes > 59) return 'Minutes must be between 0 and 59';
        if (hours === 0 && minutes === 0) return 'Enter hours and/or minutes';
        return null;
      },
    },
  });

  function getTotalChargeMinutes(values) {
    const hours = Number(values.charge_hours) || 0;
    const minutes = Number(values.charge_minutes) || 0;
    return hours * 60 + minutes;
  }

  async function handleSubmit(values) {
    setSubmitting(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('You must be logged in to add a record.');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('scooter_logs').insert({
      user_id: user.id,
      odo: Number(values.odo),
      battery_before: Number(values.battery_before),
      battery_after: Number(values.battery_after),
      charge_kwh: Number(values.charge_kwh),
      charge_minutes: getTotalChargeMinutes(values),
      notes: values.notes.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(getErrorMessage(insertError));
      return;
    }

    notifications.show({
      title: 'Record saved',
      message: 'Your charging log has been added successfully.',
      color: 'green',
      icon: <IconCheck size={18} />,
    });

    navigate('/');
  }

  return (
    <Stack gap={{ base: 'lg', sm: 'xl' }} maw={600} mx="auto" w="100%">
      <PageHeader
        title="Add Record"
        subtitle="Log a new charging session"
      />

      <Paper
        p={{ base: 'md', sm: 'xl' }}
        radius="md"
        bg="dark.8"
        style={{ border: '1px solid var(--mantine-color-dark-5)' }}
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
            <NumberInput
              label="Current ODO (km)"
              placeholder="e.g. 1250"
              min={0}
              decimalScale={1}
              required
              size="md"
              {...form.getInputProps('odo')}
            />
            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
              <NumberInput
                label="Battery before charge (%)"
                placeholder="e.g. 20"
                min={0}
                max={100}
                required
                size="md"
                {...form.getInputProps('battery_before')}
              />
              <NumberInput
                label="Battery after charge (%)"
                placeholder="e.g. 100"
                min={0}
                max={100}
                required
                size="md"
                {...form.getInputProps('battery_after')}
              />
            </SimpleGrid>
            <NumberInput
              label="Charged energy (kWh)"
              placeholder="e.g. 1.2"
              min={0}
              decimalScale={2}
              required
              size="md"
              {...form.getInputProps('charge_kwh')}
            />
            <Stack gap={4}>
              <Text size="sm" fw={500}>
                Charging time
              </Text>
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
                <NumberInput
                  label="Hours"
                  placeholder="1"
                  min={0}
                  decimalScale={0}
                  size="md"
                  {...form.getInputProps('charge_hours')}
                />
                <NumberInput
                  label="Minutes"
                  placeholder="10"
                  min={0}
                  max={59}
                  decimalScale={0}
                  size="md"
                  {...form.getInputProps('charge_minutes')}
                />
              </SimpleGrid>
              <Text size="xs" c="dimmed">
                e.g. 1h 10m, or leave hours empty and enter 50 for 50 minutes
              </Text>
            </Stack>
            <Textarea
              label="Notes"
              placeholder="Optional notes about this charge..."
              minRows={3}
              {...form.getInputProps('notes')}
            />
            <Stack gap="sm" mt="sm">
              <Button type="submit" color="green" loading={submitting} fullWidth size="md">
                Save Record
              </Button>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => navigate('/')}
                fullWidth
                size="md"
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
