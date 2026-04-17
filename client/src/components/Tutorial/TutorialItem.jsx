import { useState } from 'react';
import { Link } from 'react-router-dom';
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

      <Text fw={600} size="lg">{tutorial.title}</Text>
      <Text c="dimmed" mt={4}>Difficulty: {tutorial.difficulty}</Text>
      <Text c="dimmed">Time: {tutorial.AverageTimeSpentMinutes} minutes</Text>
      <Text c="dimmed" lineClamp={3} mt="xs">Instructions: {tutorial.instructions}</Text>
      <Text c="dimmed" mt="xs">Categories: {tutorial.categories?.map((category) => category.name).join(', ') || 'None'}</Text>

      <Group mt="md" wrap="wrap">
        <Button component={Link} to={`/tutorials/${tutorial._id}`} size="xs" variant="light">
          View Details
        </Button>

        {isLoggedIn ? (
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
