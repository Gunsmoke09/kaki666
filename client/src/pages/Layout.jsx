import { useState, useEffect } from 'react';
import { AppShell, Burger, Container, Group, Anchor, Text, Drawer, Stack } from '@mantine/core';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthToken, getAuthToken } from '../utils/auth';

const links = [
  { link: '/', label: 'Home' },
  { link: '/tutorials', label: 'Tutorials' },
  { link: '/categories', label: 'Categories' },
  { link: '/materials', label: 'Materials' },
  { link: '/about', label: 'About' },
];

function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setDrawerOpened(false);
    navigate('/');
  };

  const navLink = (link) => (
    <Anchor
      key={link.label}
      component={Link}
      to={link.link}
      onClick={() => setDrawerOpened(false)}
      color={location.pathname === link.link ? 'blue' : 'gray'}
      underline="never"
    >
      {link.label}
    </Anchor>
  );

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group justify="space-between" h="100%" wrap="nowrap">
            <Text component={Link} to="/" size="xl" fw={700} c="blue" td="none">
              Handcraft Tutorial
            </Text>

            <Group gap="md" visibleFrom="sm">
              {links.map(navLink)}

              {!isAuthenticated ? (
                <>
                  <Anchor component={Link} to="/login" color="blue" underline="never">Login</Anchor>
                  <Anchor component={Link} to="/register" color="blue" underline="never">Register</Anchor>
                </>
              ) : (
                <Anchor component="button" onClick={handleLogout} color="blue" underline="never">Logout</Anchor>
              )}
            </Group>

            <Burger hiddenFrom="sm" opened={drawerOpened} onClick={() => setDrawerOpened((v) => !v)} aria-label="Toggle navigation" />
          </Group>
        </Container>
      </AppShell.Header>

      <Drawer opened={drawerOpened} onClose={() => setDrawerOpened(false)} title="Navigation" hiddenFrom="sm" size="xs">
        <Stack>
          {links.map(navLink)}
          {!isAuthenticated ? (
            <>
              <Anchor component={Link} to="/login" onClick={() => setDrawerOpened(false)} color="blue" underline="never">Login</Anchor>
              <Anchor component={Link} to="/register" onClick={() => setDrawerOpened(false)} color="blue" underline="never">Register</Anchor>
            </>
          ) : (
            <Anchor component="button" onClick={handleLogout} color="blue" underline="never">Logout</Anchor>
          )}
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
