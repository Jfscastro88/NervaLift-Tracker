import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

export default function TableRowActions({ onEdit, onDelete }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Tooltip label="Edit">
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={onEdit}
          aria-label="Edit"
          size="lg"
          radius="md"
        >
          <IconEdit size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete">
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={onDelete}
          aria-label="Delete"
          size="lg"
          radius="md"
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
