import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Modal,
  Stack,
  NumberInput,
  Textarea,
  Select,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useIsMobile } from '../hooks/useIsMobile';
import ModalFormActions from './ModalFormActions';

const ACCESSORY_CATEGORIES = [
  'Bauletto',
  'Staffa telefono',
  'Parabrezza',
  'Antifurto',
  'Altro',
];

export default function EditAccessoryModal({ opened, onClose, record, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const isMobile = useIsMobile();

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
      fullScreen={isMobile}
      size={isMobile ? undefined : 'md'}
      padding={isMobile ? 'md' : 'lg'}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Purchase Date"
            type="date"
            required
            size="md"
            {...form.getInputProps('purchase_date')}
          />
          <TextInput
            label="Name"
            placeholder="e.g. Top case 35L"
            required
            size="md"
            {...form.getInputProps('name')}
          />
          <Select
            label="Category"
            placeholder="Select category"
            data={ACCESSORY_CATEGORIES}
            required
            searchable
            size="md"
            {...form.getInputProps('category')}
          />
          <NumberInput
            label="Cost (€)"
            min={0}
            decimalScale={2}
            required
            size="md"
            {...form.getInputProps('cost')}
          />
          <Checkbox
            label="Installed"
            size="md"
            {...form.getInputProps('installed', { type: 'checkbox' })}
          />
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
