import { Modal, Text, Group, Button, Stack } from '@mantine/core';
import { IconTrash, IconX } from '@tabler/icons-react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title = 'Confirm delete',
  message,
  loading = false,
}) {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      fullScreen={isMobile}
      size={isMobile ? undefined : 'sm'}
      padding={isMobile ? 'md' : 'lg'}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {message}
      </Text>
      {isMobile ? (
        <Stack gap="sm" mt="xl">
          <Button
            color="red"
            onClick={onConfirm}
            loading={loading}
            fullWidth
            size="md"
            leftSection={<IconTrash size={16} />}
          >
            Delete
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={loading}
            fullWidth
            size="md"
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>
        </Stack>
      ) : (
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
      )}
    </Modal>
  );
}
