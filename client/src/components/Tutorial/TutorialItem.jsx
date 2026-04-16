import { useState } from 'react';
import { Card, Text, Button, Group, Alert } from '@mantine/core';
import TutorialForm from './TutorialForm';
import { buildApiUrl } from '../../utils/api';
import { getAuthToken } from '../../utils/auth';
import { readApiError } from '../../utils/http';

const TutorialItem = ({ tutorial, onRefresh, isLoggedIn }) => {
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

      <Text fw={500}>{tutorial.title}</Text>
      <Text c="dimmed">{tutorial.description}</Text>
      <Text c="dimmed">Difficulty: {tutorial.difficulty}</Text>
      <Text c="dimmed">Time: {tutorial.AverageTimeSpentMinutes} minutes</Text>
      <Text c="dimmed">Instructions: {tutorial.instructions}</Text>
      <Text c="dimmed">Categories: {tutorial.categories?.map((category) => category.name).join(', ') || 'None'}</Text>
      <Text c="dimmed">
        Materials:{' '}
        {tutorial.material?.map((item) => {
          const details = [item.quantity, item.unit].filter(Boolean).join(' ');
          return `${item.material?.name || 'Unknown'}${details ? ` (${details})` : ''}`;
        }).join(', ') || 'None'}
      </Text>

      {isLoggedIn ? (
        <Group mt="sm">
          <Button size="xs" onClick={() => setModalOpened(true)}>Edit</Button>
          <Button size="xs" color="red" variant="outline" onClick={deleteTutorial}>Delete</Button>
        </Group>
      ) : null}

      {modalOpen ? (
        <TutorialForm action="Edit" tutorial={tutorial} opened={modalOpen} onSubmit={updateTutorial} onClose={() => setModalOpened(false)} />
      ) : null}
    </Card>
  );
};

export default TutorialItem;
