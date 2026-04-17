import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { buildApiUrl } from '../utils/api';
import { readApiError } from '../utils/http';

const TutorialDetail = () => {
  const { id } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutorial = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(buildApiUrl(`/tutorials/${id}`));
        if (!response.ok) {
          throw new Error(await readApiError(response, 'Failed to fetch tutorial'));
        }
        setTutorial(await response.json());
      } catch (err) {
        setError(err.message || 'Failed to fetch tutorial');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;
  if (!tutorial) return <Alert color="yellow">Tutorial not found.</Alert>;

  return (
    <Stack>
      <Button component={Link} to="/tutorials" variant="subtle" w="fit-content">← Back to Tutorials</Button>
      <Card withBorder shadow="sm" padding="lg" radius="md">
        <Stack>
          <Title order={2}>{tutorial.title}</Title>
          <Group wrap="wrap">
            <Badge variant="light">Difficulty: {tutorial.difficulty}</Badge>
            <Badge variant="light">Average time: {tutorial.AverageTimeSpentMinutes} minutes</Badge>
          </Group>

          <Text fw={600}>Description</Text>
          <Text>{tutorial.description}</Text>

          <Text fw={600}>Full Instructions</Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{tutorial.instructions}</Text>

          <Text fw={600}>Categories</Text>
          <Text>{tutorial.categories?.map((category) => category.name).join(', ') || 'None'}</Text>

          <Text fw={600}>Materials</Text>
          <Text>
            {tutorial.material?.map((item) => {
              const details = [item.quantity, item.unit].filter(Boolean).join(' ');
              return `${item.material?.name || 'Unknown'}${details ? ` (${details})` : ''}${item.note ? ` - ${item.note}` : ''}`;
            }).join(', ') || 'None'}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
};

export default TutorialDetail;
