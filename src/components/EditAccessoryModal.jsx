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
  Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

const ACCESSORY_CATEGORIES = [
  'Bauletto',
  'Staffa telefono',
  'Parabrezza',
  'Antifurto',
  'Altro',
];

export default function EditAccessoryModal({ opened, onClose, record, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      purchase_date: '',
      name: '',
      category: '',
      cost: '',
      installed: true,
      notes: '',
    },
    validate: {
      purchase_date: (value) => (!value ? 'Purchase date is required' : null),
      name: (value) => (!value.trim() ? 'Name is required' : null),
      cost: (value) => {
        if (value === '' || value === null) return 'Cost is required';
        const num = Number(value);
        if (num < 0) return 'Cost must be 0 or greater';
        return null;
      },
    },
  });

  useEffect(() => {
    if (record && opened) {
      form.setValues({
        purchase_date: record.purchase_date ?? '',
        name: record.name ?? '',
        category: record.category ?? '',
        cost: record.cost ?? '',
        installed: record.installed ?? false,
        notes: record.notes ?? '',
      });
      form.clearErrors();
    }
  }, [record, opened]);

  async function handleSubmit(values) {
    if (!record) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('accessories')
      .update({
        purchase_date: values.purchase_date,
        name: values.name.trim(),
        category: values.category,
        cost: Number(values.cost),
        installed: values.installed,
        notes: values.notes.trim() || null,
      })
      .eq('id', record.id);

    setSubmitting(false);

    if (error) {
      console.error('Error updating accessory:', error);
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    notifications.show({
      title: 'Accessory updated',
      message: 'Your accessory has been updated successfully.',
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
      title="Edit Accessory"
      centered
      size="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Purchase Date"
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
