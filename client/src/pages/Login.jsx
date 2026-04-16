import { useState } from 'react';
import { Paper, Title, TextInput, PasswordInput, Button, Stack, Text, Alert } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';
import { setAuthToken } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error('Login failed: token missing in response');
      }

      setAuthToken(data.token, true);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
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

          {error ? <Alert color="red">{error}</Alert> : null}

          <TextInput
            label="Username"
            placeholder="Your username"
            required
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />

          <Button type="submit" fullWidth radius="xl" mt="sm" loading={submitting}>
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
