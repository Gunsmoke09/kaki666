import { SimpleGrid, Text } from '@mantine/core';
import TutorialItem from './TutorialItem';

const TutorialList = ({ tutorials, onRefresh, isLoggedIn, emptyMessage = 'No tutorials available.' }) => {
  if (tutorials.length === 0) return <Text c="dimmed">{emptyMessage}</Text>;

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg" verticalSpacing="lg">
      {tutorials.map((tutorial) => (
        <TutorialItem key={tutorial._id} tutorial={tutorial} onRefresh={onRefresh} isLoggedIn={isLoggedIn} />
      ))}
    </SimpleGrid>
  );
};

export default TutorialList;
