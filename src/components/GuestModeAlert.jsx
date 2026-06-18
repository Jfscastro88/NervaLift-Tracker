import { Alert, Badge } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

export default function GuestModeAlert({ variant = 'alert' }) {
  if (variant === 'badge') {
    return (
      <Badge variant="light" color="blue" leftSection={<IconEye size={12} />}>
        Guest mode: read-only access
      </Badge>
    );
  }

  return (
    <Alert icon={<IconEye size={16} />} color="blue" variant="light">
      Guest mode: read-only access
    </Alert>
  );
}
