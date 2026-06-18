import { Paper, Stack, Text, Group, SimpleGrid } from '@mantine/core';
import TableRowActions from './TableRowActions';

export default function DataMobileCard({ title, subtitle, fields, onEdit, onDelete }) {
  const hasActions = onEdit || onDelete;

  return (
    <Paper
      p="md"
      radius="md"
      bg="dark.7"
      style={{ border: '1px solid var(--mantine-color-dark-5)' }}
    >
      <Group justify="space-between" align="flex-start" mb="sm" wrap="nowrap">
        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
          <Text fw={600} c="white" size="sm" lineClamp={1}>
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
        {hasActions && <TableRowActions onEdit={onEdit} onDelete={onDelete} />}
      </Group>
      <SimpleGrid cols={2} spacing="sm">
        {fields.map((field) => (
          <Stack key={field.label} gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {field.label}
            </Text>
            <Text size="sm" c="gray.2">
              {field.value}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </Paper>
  );
}
