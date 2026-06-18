import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Modal,
  Stack,
  NumberInput,
  Textarea,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/profile';
import { useIsMobile } from '../hooks/useIsMobile';
import ModalFormActions from './ModalFormActions';

export default function EditScooterLogModal({ opened, onClose, record, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm({
    initialValues: {
      odo: '',
      battery_before: '',
      battery_after: '',
      charge_kwh: '',
      charge_minutes: '',
      notes: '',
    },
    validate: {
      odo: (value) => {
        const num = Number(value);
        if (value === '' || value === null) return 'ODO is required';
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
        if (value === '' || value === null) return 'Charged energy is required';
        if (num < 0) return 'Must be 0 or greater';
        return null;
      },
      charge_minutes: (value) => {
        const num = Number(value);
        if (value === '' || value === null) return 'Charge minutes is required';
        if (num < 0) return 'Must be 0 or greater';
        return null;
      },
    },
  });

  useEffect(() => {
    if (record && opened) {
      form.setValues({
        odo: record.odo ?? '',
        battery_before: record.battery_before ?? '',
        battery_after: record.battery_after ?? '',
        charge_kwh: record.charge_kwh ?? '',
        charge_minutes: record.charge_minutes ?? '',
        notes: record.notes ?? '',
      });
      form.clearErrors();
    }
  }, [record, opened]);

  async function handleSubmit(values) {
    if (!record) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('scooter_logs')
      .update({
        odo: Number(values.odo),
        battery_before: Number(values.battery_before),
        battery_after: Number(values.battery_after),
        charge_kwh: Number(values.charge_kwh),
        charge_minutes: Number(values.charge_minutes),
        notes: values.notes.trim() || null,
      })
      .eq('id', record.id);

    setSubmitting(false);

    if (error) {
      console.error('Error updating scooter log:', error);
      notifications.show({
        title: 'Error',
        message: getErrorMessage(error),
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: 'Record updated',
      message: 'Your charging record has been updated successfully.',
      color: 'green',
      icon: <IconCheck size={18} />,
    });

    onClose();
    onSuccess?.();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Record"
      centered
      fullScreen={isMobile}
      size={isMobile ? undefined : 'md'}
      padding={isMobile ? 'md' : 'lg'}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <NumberInput
            label="ODO (km)"
            min={0}
            decimalScale={1}
            required
            size="md"
            {...form.getInputProps('odo')}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
            <NumberInput
              label="Battery Before (%)"
              min={0}
              max={100}
              required
              size="md"
              {...form.getInputProps('battery_before')}
            />
            <NumberInput
              label="Battery After (%)"
              min={0}
              max={100}
              required
              size="md"
              {...form.getInputProps('battery_after')}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
            <NumberInput
              label="Charge kWh"
              min={0}
              decimalScale={2}
              required
              size="md"
              {...form.getInputProps('charge_kwh')}
            />
            <NumberInput
              label="Charge Minutes"
              min={0}
              decimalScale={0}
              required
              size="md"
              {...form.getInputProps('charge_minutes')}
            />
          </SimpleGrid>
          <Textarea
            label="Notes"
            placeholder="Optional notes..."
            minRows={3}
            {...form.getInputProps('notes')}
          />
          <ModalFormActions
            onCancel={onClose}
            submitting={submitting}
          />
        </Stack>
      </form>
    </Modal>
  );
}
