import { Paper, Title, TextInput, PasswordInput, Button, Stack, Text } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Paper shadow="md" radius="lg" p="xl" maw={420} mx="auto" withBorder>
      <form onSubmit={handleLogin}>
        <Stack>
          <Title order={2} ta="center">
            Welcome Back
          </Title>

          <Text c="dimmed" ta="center" size="sm">
            Login to continue to your handcraft learning journey
          </Text>

          <TextInput label="Username" placeholder="Your username" required />
          <PasswordInput label="Password" placeholder="Enter your password" required />

          <Button type="submit" fullWidth radius="xl" mt="sm">
            Login
          </Button>

          <Text ta="center" size="sm">
            Don&apos;t have an account?{' '}
            <Text component={Link} to="/register" c="blue" inherit>
              Go register
            </Text>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}