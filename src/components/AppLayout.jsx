import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppShell, Group, Text, Button, Burger, NavLink, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconPlus,
  IconLogout,
  IconBolt,
  IconTool,
  IconShoppingCart,
  IconChartBar,
} from "@tabler/icons-react";
import { supabase } from "../lib/supabase";

export default function AppLayout({ children }) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const navItems = [
    { label: "Dashboard", to: "/", icon: IconDashboard },
    { label: "Add Record", to: "/add", icon: IconPlus },
    { label: "Maintenance", to: "/maintenance", icon: IconTool },
    { label: "Accessories", to: "/accessories", icon: IconShoppingCart },
    { label: "Analytics", to: "/analytics", icon: IconChartBar },
    { label: "Logout", action: handleLogout, icon: IconLogout },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      bg="black"
    >
      <AppShell.Header
        bg="dark.9"
        style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <IconBolt size={22} color="var(--mantine-color-green-5)" />
              <Text fw={700} size="lg" c="white">
                NervaLift - FT53666
              </Text>
            </Group>
          </Group>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
            visibleFrom="sm"
          >
            Logout
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        bg="dark.9"
        style={{ borderRight: "1px solid var(--mantine-color-dark-6)" }}
      >
        <Stack gap="xs" style={{ flex: 1 }}>
          {navItems.map((item) =>
            item.action ? (
              <NavLink
                key={item.label}
                label={item.label}
                leftSection={<item.icon size={18} />}
                onClick={() => {
                  item.action();
                  if (opened) toggle();
                }}
                variant="filled"
                color="dark"
                styles={{
                  root: {
                    borderRadius: "var(--mantine-radius-md)",
                  },
                }}
              />
            ) : (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={18} />}
                active={location.pathname === item.to}
                onClick={() => opened && toggle()}
                variant="filled"
                color="dark"
                styles={{
                  root: {
                    borderRadius: "var(--mantine-radius-md)",
                    "&[data-active]": {
                      backgroundColor: "var(--mantine-color-dark-6)",
                      color: "var(--mantine-color-green-4)",
                    },
                  },
                }}
              />
            ),
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="black">{children}</AppShell.Main>
    </AppShell>
  );
}
