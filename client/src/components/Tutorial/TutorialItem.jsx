import { useState } from 'react';
import { Card, Text, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import TutorialForm from './TutorialForm';
import { buildApiUrl } from '../../utils/api';
import { getAuthToken } from '../../utils/auth';

const TutorialItem = ({ tutorial, setTutorials }) => {
  const [modalOpen, setModalOpened] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    setModalOpened(false);
  };

  const handleEditClick = () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setModalOpened(true);
  };

  const updateTutorial = async (tutorialData) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return false;
    }

    try {
      const response = await fetch(buildApiUrl(`/tutorials/${tutorial._id}`), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorialData),
      });

      if (!response.ok) {
        throw new Error('Failed to update tutorial');
      }

      const updatedTutorial = await response.json();

      setTutorials((prevTutorials) =>
        prevTutorials.map((t) =>
          t._id === tutorial._id ? updatedTutorial : t,
        ),
      );

      setModalOpened(false);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <>
        <Text fw={500}>{tutorial.title}</Text>
        <Text c="dimmed">{tutorial.description}</Text>
        <Text c="dimmed">Difficulty: {tutorial.difficulty}</Text>
        <Text c="dimmed">
          Time: {tutorial.AverageTimeSpentMinutes} minutes
        </Text>
        <Text c="dimmed">Instructions: {tutorial.instructions}</Text>

        <Text c="dimmed">
          Categories:{' '}
          {tutorial.categories?.map((category) => category.name).join(', ') || 'None'}
        </Text>

        <Text c="dimmed">
          Materials:{' '}
          {tutorial.material?.map((item) => {
            const materialName =
              item.material?.name ||
              item.materialId?.name ||
              item.material ||
              item.materialId ||
              'Unknown material';

            return `${materialName} (${item.quantity} ${item.unit})`;
          }).join(', ') || 'None'}
        </Text>

        <Button mt="sm" size="xs" onClick={handleEditClick}>
          Edit
        </Button>

        {modalOpen ? (
          <TutorialForm
            action="Edit"
            tutorial={tutorial}
            opened={modalOpen}
            onSubmit={updateTutorial}
            onClose={handleCancel}
            setTutorials={setTutorials}
          />
        ) : null}
      </>
    </Card>
  );
};

export default TutorialItem;
