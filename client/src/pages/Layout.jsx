import { useState, useEffect } from 'react';
import { AppShell, Container, Group, Anchor, Text } from '@mantine/core';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const links = [
  { link: '/', label: 'Home' },
  { link: '/tutorials', label: 'Tutorials' },
  { link: '/categories', label: 'Categories' },
  { link: '/materials', label: 'Materials' },
  { link: '/about', label: 'About' },
];

function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
    navigate('/');
  };

  const items = links.map((link) => (
    <Anchor
      key={link.label}
      component={Link}
      to={link.link}
      style={{ marginRight: '15px' }}
      color={location.pathname === link.link ? 'blue' : 'gray'}
      underline="never"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group justify="space-between" h="100%">
            <Text size="xl" fw={700} c="blue">
              Handcraft Tutorial
            </Text>

            <Group gap="xs">
              {items}

              {!isAuthenticated ? (
                <>
                  <Anchor component={Link} to="/login" color="blue" underline="never">
                    Login
                  </Anchor>
                  <Anchor component={Link} to="/register" color="blue" underline="never">
                    Register
                  </Anchor>
                </>
              ) : (
                <Anchor component="button" onClick={handleLogout} color="blue" underline="never">
                  Logout
                </Anchor>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;