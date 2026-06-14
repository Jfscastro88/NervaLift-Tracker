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
  Container,
  Alert,
  Grid,
  Group,
  Box,
  Divider,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import {
  IconBolt,
  IconAlertCircle,
  IconCheck,
  IconBrandGithub,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { supabase } from "../lib/supabase";

const GITHUB_URL = "https://github.com/Jfscastro88";
const LINKEDIN_URL = "https://www.linkedin.com/in/jfscastro88/";

const FEATURES = [
  "Charging History",
  "Maintenance Tracking",
  "Accessories Inventory",
  "Analytics Dashboard",
];

const TECH_STACK = ["React", "Mantine UI", "Supabase", "Vercel"];

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
    <Box mih="100vh" bg="#0a0a0a" style={{ display: "flex", flexDirection: "column" }}>
      <Container size="lg" py={{ base: "lg", sm: "xl", md: 60 }} px={{ base: "md", sm: "lg" }} style={{ flex: 1 }}>
        <Grid gutter={{ base: "xl", md: 48 }} align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 1 }}>
            <Stack gap={{ base: "lg", sm: "xl" }}>
              <Stack gap="md">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={44} radius="md" variant="light" color="green">
                    <IconBolt size={24} />
                  </ThemeIcon>
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Title order={1} c="white" size="h2">
                      Nerva Lift - Tracker
                    </Title>
                    <Text c="dimmed" size="sm">
                      Personal scooter management platform.
                    </Text>
                  </Stack>
                </Group>

                <Text c="gray.4" size="md" lh={1.6}>
                  Track charging sessions, maintenance, accessories and scooter statistics from a
                  single dashboard.
                </Text>

                <Stack gap="xs" mt="xs">
                  {FEATURES.map((feature) => (
                    <Group key={feature} gap="xs">
                      <ThemeIcon size={20} radius="xl" color="green" variant="light">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm" c="gray.3">
                        {feature}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>

              <Divider color="dark.5" />

              <Stack gap="md">
                <Title order={4} c="white" size="h5">
                  About the Developer
                </Title>
                <Stack gap="xs">
                  <Text fw={600} c="white">
                    João Felipe Soares Castro
                  </Text>
                  <Text c="gray.4" size="sm" lh={1.6}>
                    Hobby programmer passionate about web development, automation and building
                    useful personal tools.
                  </Text>
                  <Text c="dimmed" size="sm" mt="xs">
                    This project was built using:
                  </Text>
                  <SimpleGrid cols={{ base: 2, xs: 4 }} spacing="xs">
                    {TECH_STACK.map((tech) => (
                      <Text
                        key={tech}
                        size="xs"
                        c="gray.4"
                        px="sm"
                        py={4}
                        ta="center"
                        style={{
                          borderRadius: "var(--mantine-radius-sm)",
                          border: "1px solid var(--mantine-color-dark-5)",
                          backgroundColor: "var(--mantine-color-dark-8)",
                        }}
                      >
                        {tech}
                      </Text>
                    ))}
                  </SimpleGrid>
                </Stack>

                <Stack gap="sm" mt="xs" hiddenFrom="xs">
                  <Button
                    component="a"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    color="gray"
                    leftSection={<IconBrandGithub size={18} />}
                    fullWidth
                    size="md"
                  >
                    GitHub
                  </Button>
                  <Button
                    component="a"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    color="blue"
                    leftSection={<IconBrandLinkedin size={18} />}
                    fullWidth
                    size="md"
                  >
                    LinkedIn
                  </Button>
                </Stack>
                <Group gap="sm" mt="xs" visibleFrom="xs">
                  <Button
                    component="a"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    color="gray"
                    leftSection={<IconBrandGithub size={18} />}
                  >
                    GitHub
                  </Button>
                  <Button
                    component="a"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    color="blue"
                    leftSection={<IconBrandLinkedin size={18} />}
                  >
                    LinkedIn
                  </Button>
                </Group>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 2 }}>
            <Paper
              p={{ base: "md", sm: "xl" }}
              radius="lg"
              bg="dark.8"
              w="100%"
              maw={{ base: "100%", md: 440 }}
              mx={{ base: 0, md: "auto" }}
              ml={{ md: "auto" }}
              style={{
                border: "1px solid var(--mantine-color-dark-5)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
              }}
            >
              <Stack gap="lg">
                <Stack gap={4}>
                  <Title order={2} c="white" size="h3">
                    Welcome Back
                  </Title>
                  <Text c="dimmed" size="sm">
                    Sign in to access your scooter dashboard.
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
                      size="md"
                      value={email}
                      onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                    <PasswordInput
                      label="Password"
                      placeholder="Your password"
                      required
                      size="md"
                      value={password}
                      onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                    <Button
                      type="submit"
                      loading={loading}
                      color="green"
                      fullWidth
                      mt="sm"
                      size="md"
                    >
                      Sign in
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      <Box
        py="md"
        px="md"
        style={{
          borderTop: "1px solid var(--mantine-color-dark-6)",
          backgroundColor: "var(--mantine-color-dark-9)",
        }}
      >
        <Container size="lg">
          <Stack gap={4} align="center">
            <Text size="xs" c="dimmed" ta="center">
              Nerva Lift Tracker · Version 1.0.0
            </Text>
            <Text size="xs" c="dark.2" ta="center">
              Built by João Castro · © 2026
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
