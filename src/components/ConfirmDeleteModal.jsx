import { Modal, Text, Group, Button } from '@mantine/core';
import { IconTrash, IconX } from '@tabler/icons-react';

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title = 'Confirm delete',
  message,
  loading = false,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Text size="sm" c="dimmed">
        {message}
      </Text>
      <Group justify="flex-end" mt="lg">
        <Button
          variant="subtle"
          color="gray"
          onClick={onClose}
          disabled={loading}
          leftSection={<IconX size={16} />}
        >
          Cancel
        </Button>
        <Button
          color="red"
          onClick={onConfirm}
          loading={loading}
          leftSection={<IconTrash size={16} />}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
