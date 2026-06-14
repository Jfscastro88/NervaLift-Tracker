import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Modal,
  Stack,
  NumberInput,
  Textarea,
  Group,
  Button,
  Select,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

const MAINTENANCE_TYPES = [
  'Revisione',
  'Cambio gomme',
  'Freni',
  'Controllo generale',
  'Altro',
];

export default function EditMaintenanceModal({ opened, onClose, record, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      date: '',
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
        if (num <= 0) return 'ODO must be greater than 0';
        return null;
      },
    },
  });

  useEffect(() => {
    if (record && opened) {
      form.setValues({
        date: record.date ?? '',
        odo: record.odo ?? '',
        type: record.type ?? '',
        cost: record.cost ?? '',
        notes: record.notes ?? '',
      });
      form.clearErrors();
    }
  }, [record, opened]);

  async function handleSubmit(values) {
    if (!record) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('maintenance')
      .update({
        date: values.date,
        odo: values.odo !== '' && values.odo !== null ? Number(values.odo) : null,
        type: values.type,
        cost: Number(values.cost),
        notes: values.notes.trim() || null,
      })
      .eq('id', record.id);

    setSubmitting(false);

    if (error) {
      console.error('Error updating maintenance record:', error);
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: 'Maintenance updated',
      message: 'Your maintenance record has been updated successfully.',
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
      title="Edit Maintenance"
      centered
      size="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Date"
            type="date"
            required
            {...form.getInputProps('date')}
          />
          <NumberInput
            label="ODO (km)"
            placeholder="Optional"
            min={0}
            decimalScale={0}
            {...form.getInputProps('odo')}
          />
          <Select
            label="Type"
            placeholder="Select maintenance type"
            data={MAINTENANCE_TYPES}
            required
            searchable
            {...form.getInputProps('type')}
          />
          <NumberInput
            label="Cost (€)"
            min={0}
            decimalScale={2}
            required
            {...form.getInputProps('cost')}
          />
          <Textarea
            label="Notes"
            placeholder="Optional notes..."
            minRows={3}
            {...form.getInputProps('notes')}
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              disabled={submitting}
              leftSection={<IconX size={16} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="green"
              loading={submitting}
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
