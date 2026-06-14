import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

export default function TableRowActions({ onEdit, onDelete }) {
  return (
    <Group gap={4} wrap="nowrap">
      <Tooltip label="Edit">
        <ActionIcon variant="subtle" color="blue" onClick={onEdit} aria-label="Edit">
          <IconEdit size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete">
        <ActionIcon variant="subtle" color="red" onClick={onDelete} aria-label="Delete">
          <IconTrash size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
