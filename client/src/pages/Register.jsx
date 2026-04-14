import { useState } from 'react';
import { TextInput, PasswordInput, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize the form using Mantine's useForm hook
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length === 0 ? 'Username is required' : null),
      password: (value) => (value.length < 3 ? 'Password must be at least 6 characters' : null)
    },
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate the form before sending the request
    const { username, password } = form.values;

    if (form.validate()) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Registration failed');
        }

        // Redirect to the login page after successful registration
        navigate('/login');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Register</h2>
      {error && <Alert color="red">{error}</Alert>}
      <form onSubmit={handleRegister}>
        <TextInput
          label="Username"
          {...form.getInputProps('username')}
          required
          error={form.errors.username}
        />
        <PasswordInput
          label="Password"
          {...form.getInputProps('password')}
          required
          error={form.errors.password}
        />
        <Button
          type="submit"
          fullWidth
          mt="sm"
          loading={loading}
          disabled={loading}
        >
          Register
        </Button>
      </form>
    </div>
  );
};

export default Register;
