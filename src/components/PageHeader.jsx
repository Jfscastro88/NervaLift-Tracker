import { Stack, Title, Text, Group } from '@mantine/core';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Title order={2} c="white" size="h3">
          {title}
        </Title>
        {subtitle && (
          <Text c="dimmed" size="sm">
            {subtitle}
          </Text>
        )}
      </Stack>
      {action}
    </Group>
  );
}
