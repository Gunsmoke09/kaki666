import { useState, useEffect } from 'react';
import { AppShell, Container, Group, Anchor, Text, Space } from '@mantine/core';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const links = [
  { link: '/', label: 'Home' },
  { link: '/tasks', label: 'Tasks' },
  { link: '/categories', label: 'Categories' },
  { link: '/about', label: 'About' },
];

function Layout() {
  const [active, setActive] = useState(links[0].link);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in (based on a JWT or user info in localStorage)
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
  }, []);

  // Logout function to remove JWT and update state
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
    navigate('/');  // Redirect to Home after logout
  };

  // Dynamically create menu items based on authentication status
  const items = links.map((link) => (
    <Anchor
      key={link.label}
      component={Link}
      to={link.link}
      onClick={() => setActive(link.link)}
      style={{ marginRight: '15px' }}
      color={active === link.link ? 'blue' : 'gray'}
    >
      {link.label}
    </Anchor>
  ));

  return (
    <AppShell
      header={{ height: 50, padding: 'md' }}
      padding="md"
      navbarOffsetBreakpoint="sm"
    >
      {/* Header */}
      <AppShell.Header>
        <Container size="md">
          <Group position="apart">
            <Text size="xl" weight={500}>Task Manager</Text>
            <Group spacing="xs" align="center">
              {items}
              {/* Conditionally render login, register, or logout links */}
              {!isAuthenticated ? (
                <>
                  <Anchor component={Link} to="/login" color="blue">
                    Login
                  </Anchor>
                  <Anchor component={Link} to="/register" color="blue">
                    Register
                  </Anchor>
                </>
              ) : (
                <Anchor component="button" onClick={handleLogout}>
                  Logout
                </Anchor>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* Main Content (Where React Router Renders Pages) */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
