import { SimpleGrid, Text } from '@mantine/core';
import TutorialItem from './TutorialItem';

const TutorialList = ({ tutorials, setTutorials }) => {
  if (tutorials.length === 0) return <Text>No tutorials available.</Text>;

  return (
    <SimpleGrid
      cols={3}
      spacing="lg"
      breakpoints={[
        { maxWidth: 'md', cols: 2 },
        { maxWidth: 'sm', cols: 1 },
      ]}
    >
      {tutorials.map((tutorial) => (
        <TutorialItem
          key={tutorial._id}
          tutorial={tutorial}
          setTutorials={setTutorials}
        />
      ))}
    </SimpleGrid>
  );
};

export default TutorialList;