import { Group, Button, Stack } from '@mantine/core';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';

export default function ModalFormActions({
  onCancel,
  submitting,
  submitLabel = 'Save Changes',
}) {
  return (
    <>
      <Group justify="flex-end" visibleFrom="sm">
        <Button
          variant="subtle"
          color="gray"
          onClick={onCancel}
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
          {submitLabel}
        </Button>
      </Group>
      <Stack gap="sm" hiddenFrom="sm">
        <Button
          type="submit"
          color="green"
          loading={submitting}
          fullWidth
          size="md"
          leftSection={<IconDeviceFloppy size={16} />}
        >
          {submitLabel}
        </Button>
        <Button
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={submitting}
          fullWidth
          size="md"
          leftSection={<IconX size={16} />}
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
}
