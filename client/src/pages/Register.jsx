import { Paper, Title, TextInput, PasswordInput, Button, Stack, Text } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <Paper shadow="md" radius="lg" p="xl" maw={420} mx="auto" withBorder>
      <form onSubmit={handleRegister}>
        <Stack>
          <Title order={2} ta="center">
            Create Account
          </Title>

          <Text c="dimmed" ta="center" size="sm">
            Register to start your handcraft learning journey
          </Text>

          <TextInput label="Name" placeholder="Your name" required />
          <PasswordInput label="Password" placeholder="Create a password" required />

          <Button type="submit" fullWidth radius="xl" mt="sm">
            Register
          </Button>

          <Text ta="center" size="sm">
            Already have an account?{' '}
            <Text component={Link} to="/login" c="blue" inherit>
              Go login
            </Text>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}