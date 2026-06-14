import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Center,
  Container,
  Alert,
} from "@mantine/core";
import { IconBolt, IconAlertCircle } from "@tabler/icons-react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate("/");
  }

  return (
    <Center mih="100vh" bg="black">
      <Container size="xs" w="100%" px="md">
        <Paper
          p="xl"
          radius="md"
          bg="dark.8"
          style={{ border: "1px solid var(--mantine-color-dark-5)" }}
        >
          <Stack gap="lg">
            <Stack gap="xs" align="center">
              <IconBolt size={40} color="var(--mantine-color-green-5)" />
              <Title order={2} c="white">
                NervaLift
              </Title>
              <Text c="dimmed" size="sm">
                Scooter FT53666
              </Text>
            </Stack>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                />
                <Button type="submit" loading={loading} color="green" fullWidth mt="sm">
                  Sign in
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Center>
  );
}
