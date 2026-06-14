import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

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
      setError(insertError.message);
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
    <Stack gap="xl" maw={600}>
      <Stack gap={4}>
        <Title order={2} c="white">
          Add Record
        </Title>
        <Text c="dimmed" size="sm">
          Log a new charging session
        </Text>
      </Stack>

      <Paper
        p="xl"
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
              {...form.getInputProps('odo')}
            />
            <Group grow align="flex-start">
              <NumberInput
                label="Battery before charge (%)"
                placeholder="e.g. 20"
                min={0}
                max={100}
                required
                {...form.getInputProps('battery_before')}
              />
              <NumberInput
                label="Battery after charge (%)"
                placeholder="e.g. 100"
                min={0}
                max={100}
                required
                {...form.getInputProps('battery_after')}
              />
            </Group>
            <Group grow align="flex-start">
              <NumberInput
                label="Charged energy (kWh)"
                placeholder="e.g. 1.2"
                min={0}
                decimalScale={2}
                required
                {...form.getInputProps('charge_kwh')}
              />
            </Group>
            <Stack gap={4}>
              <Text size="sm" fw={500}>
                Charging time
              </Text>
              <Group grow align="flex-start">
                <NumberInput
                  label="Hours"
                  placeholder="1"
                  min={0}
                  decimalScale={0}
                  {...form.getInputProps('charge_hours')}
                />
                <NumberInput
                  label="Minutes"
                  placeholder="10"
                  min={0}
                  max={59}
                  decimalScale={0}
                  {...form.getInputProps('charge_minutes')}
                />
              </Group>
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
            <Group mt="sm">
              <Button type="submit" color="green" loading={submitting}>
                Save Record
              </Button>
              <Button variant="subtle" color="gray" onClick={() => navigate('/')}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
