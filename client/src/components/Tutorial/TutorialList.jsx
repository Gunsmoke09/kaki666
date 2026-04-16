import { SimpleGrid, Text } from '@mantine/core';
import TutorialItem from './TutorialItem';

const TutorialList = ({ tutorials, onRefresh }) => {
  if (tutorials.length === 0) return <Text>No tutorials available.</Text>;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {tutorials.map((tutorial) => (
        <TutorialItem key={tutorial._id} tutorial={tutorial} onRefresh={onRefresh} />
      ))}
    </SimpleGrid>
  );
};

export default TutorialList;
