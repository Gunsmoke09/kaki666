import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Text, Button, Group, Alert, Stack } from '@mantine/core';
import TutorialForm from './TutorialForm';
import { buildApiUrl } from '../../utils/api';
import { getAuthToken } from '../../utils/auth';
import { readApiError } from '../../utils/http';

const TutorialItem = ({ tutorial, onRefresh, isLoggedIn }) => {
  const canManageTutorial = isLoggedIn && Boolean(getAuthToken());
  const [modalOpen, setModalOpened] = useState(false);
  const [itemError, setItemError] = useState('');

  const updateTutorial = async (tutorialData) => {
    const token = getAuthToken();
    if (!token) {
      setItemError('Please log in to edit tutorials.');
      return;
    }

    const response = await fetch(buildApiUrl(`/tutorials/${tutorial._id}`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tutorialData),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Failed to update tutorial'));
    }

    setModalOpened(false);
    setItemError('');
    await onRefresh();
  };

  const deleteTutorial = async () => {
    const token = getAuthToken();
    if (!token) {
      setItemError('Please log in to delete tutorials.');
      return;
    }

    const response = await fetch(buildApiUrl(`/tutorials/${tutorial._id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setItemError(await readApiError(response, 'Failed to delete tutorial'));
      return;
    }

    setItemError('');
    await onRefresh();
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {itemError ? <Alert color="red" mb="sm">{itemError}</Alert> : null}

      <Text fw={600} size="lg">{tutorial.title}</Text>
      <Stack gap="xs" mt="xs">
        <Group align="flex-start" gap="xs" wrap="nowrap">
          <Text c="dimmed" fw={600} miw={88}>Difficulty:</Text>
          <Text c="dimmed" style={{ flex: 1 }}>{tutorial.difficulty}</Text>
        </Group>
        <Group align="flex-start" gap="xs" wrap="nowrap">
          <Text c="dimmed" fw={600} miw={88}>Time:</Text>
          <Text c="dimmed" style={{ flex: 1 }}>{tutorial.AverageTimeSpentMinutes} minutes</Text>
        </Group>
        <Group align="flex-start" gap="xs" wrap="nowrap">
          <Text c="dimmed" fw={600} miw={88}>Description:</Text>
          <Text c="dimmed" style={{ flex: 1 }} lineClamp={3}>{tutorial.description}</Text>
        </Group>
        <Group align="flex-start" gap="xs" wrap="nowrap">
          <Text c="dimmed" fw={600} miw={88}>Instructions:</Text>
          <Text c="dimmed" style={{ flex: 1 }} lineClamp={3}>{tutorial.instructions}</Text>
        </Group>
        <Group align="flex-start" gap="xs" wrap="nowrap">
          <Text c="dimmed" fw={600} miw={88}>Categories:</Text>
          <Text c="dimmed" style={{ flex: 1 }}>
            {tutorial.categories?.map((category) => category.name).join(', ') || 'None'}
          </Text>
        </Group>
      </Stack>

      <Group mt="md" wrap="wrap">
        <Button component={Link} to={`/tutorials/${tutorial._id}`} size="xs" variant="light">
          View Details
        </Button>

        {canManageTutorial ? (
          <>
            <Button size="xs" onClick={() => setModalOpened(true)}>Edit</Button>
            <Button size="xs" color="red" variant="outline" onClick={deleteTutorial}>Delete</Button>
          </>
        ) : null}
      </Group>

      {modalOpen ? (
        <TutorialForm action="Edit" tutorial={tutorial} opened={modalOpen} onSubmit={updateTutorial} onClose={() => setModalOpened(false)} />
      ) : null}
    </Card>
  );
};

export default TutorialItem;
