import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppShell, Group, Text, Button, Burger, NavLink, Stack, Box, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconPlus,
  IconLogout,
  IconBolt,
  IconTool,
  IconShoppingCart,
  IconChartBar,
  IconX,
} from "@tabler/icons-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useIsMobile } from "../hooks/useIsMobile";
import GuestModeAlert from "./GuestModeAlert";

const navLinkStyles = {
  root: {
    borderRadius: "var(--mantine-radius-md)",
    minHeight: 44,
    padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
  },
};

export default function AppLayout({ children }) {
  const [opened, { toggle, close }] = useDisclosure();
  const [logoutOpened, { open: openLogoutModal, close: closeLogoutModal }] = useDisclosure();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isGuest } = useAuth();
  const isMobile = useIsMobile();

  async function handleLogoutConfirm() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    closeLogoutModal();
    navigate("/login");
  }

  function handleLogoutClick() {
    close();
    openLogoutModal();
  }

  function handleNavClick(callback) {
    callback?.();
    close();
  }

  const navItems = [
    { label: "Dashboard", to: "/", icon: IconDashboard },
    ...(!isGuest ? [{ label: "Add Record", to: "/add", icon: IconPlus }] : []),
    { label: "Maintenance", to: "/maintenance", icon: IconTool },
    { label: "Accessories", to: "/accessories", icon: IconShoppingCart },
    { label: "Analytics", to: "/analytics", icon: IconChartBar },
    { label: "Logout", action: handleLogoutClick, icon: IconLogout },
  ];

  return (
    <AppShell
      header={{ height: { base: 56, sm: 60 } }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding={{ base: "xs", sm: "md" }}
      bg="black"
    >
      <AppShell.Header
        bg="dark.9"
        style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
      >
        <Group h="100%" px={{ base: "sm", sm: "md" }} justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="md"
              aria-label="Toggle navigation"
            />
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <IconBolt size={22} color="var(--mantine-color-green-5)" />
              <Text fw={700} size="lg" c="white" visibleFrom="xs" truncate>
                NervaLift
              </Text>
              <Text fw={700} size="md" c="white" hiddenFrom="xs" truncate>
                NervaLift
              </Text>
            </Group>
          </Group>
          <Group gap="sm" wrap="nowrap">
            {isGuest && <GuestModeAlert variant="badge" />}
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconLogout size={16} />}
              onClick={openLogoutModal}
              visibleFrom="sm"
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p={{ base: "sm", sm: "md" }}
        bg="dark.9"
        style={{ borderRight: "1px solid var(--mantine-color-dark-6)" }}
      >
        <Stack gap="xs" style={{ flex: 1 }}>
          {navItems.map((item) =>
            item.action ? (
              <NavLink
                key={item.label}
                label={item.label}
                leftSection={<item.icon size={20} />}
                onClick={() => handleNavClick(item.action)}
                variant="filled"
                color="dark"
                styles={navLinkStyles}
              />
            ) : (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={20} />}
                active={location.pathname === item.to}
                onClick={() => close()}
                variant="filled"
                color="dark"
                styles={{
                  ...navLinkStyles,
                  root: {
                    ...navLinkStyles.root,
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

      <AppShell.Main bg="black">
        <Box maw="100%" style={{ overflowX: "hidden" }}>
          {children}
        </Box>
      </AppShell.Main>

      <Modal
        opened={logoutOpened}
        onClose={closeLogoutModal}
        title="Log out"
        centered
        fullScreen={isMobile}
        size={isMobile ? undefined : "sm"}
        padding={isMobile ? "md" : "lg"}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Text size="sm" c="dimmed" lh={1.6}>
          Are you sure you want to sign out?
        </Text>
        {isMobile ? (
          <Stack gap="sm" mt="xl">
            <Button
              color="red"
              onClick={handleLogoutConfirm}
              loading={loggingOut}
              fullWidth
              size="md"
              leftSection={<IconLogout size={16} />}
            >
              Log out
            </Button>
            <Button
              variant="subtle"
              color="gray"
              onClick={closeLogoutModal}
              disabled={loggingOut}
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
              onClick={closeLogoutModal}
              disabled={loggingOut}
              leftSection={<IconX size={16} />}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleLogoutConfirm}
              loading={loggingOut}
              leftSection={<IconLogout size={16} />}
            >
              Log out
            </Button>
          </Group>
        )}
      </Modal>
    </AppShell>
  );
}
