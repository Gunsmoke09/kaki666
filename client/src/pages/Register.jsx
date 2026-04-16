import { useState } from 'react';
import { Paper, Title, TextInput, PasswordInput, Button, Stack, Text, Alert } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';
import { readApiError } from '../utils/http';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Register failed'));
      }

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Register failed');
    } finally {
      setSubmitting(false);
    }
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
            placeholder="Create a password"
            required
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />

          <Button type="submit" fullWidth radius="xl" mt="sm" loading={submitting}>
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
