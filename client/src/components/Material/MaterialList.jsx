import { Link } from 'react-router-dom';
import { Card, Button, Text, Group, SimpleGrid } from '@mantine/core';

const MaterialList = ({ materials, onEdit, onDelete, isLoggedIn }) => {
  if (!materials.length) {
    return <Text c="dimmed">No materials available.</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg" verticalSpacing="lg">
      {materials.map((material) => (
        <Card shadow="sm" padding="lg" radius="md" key={material._id} withBorder>
          <Text fw={500} size="lg">{material.name}</Text>
          <Text c="dimmed" size="sm">Purchase source: {material.purchaseSource || 'N/A'}</Text>

          <Group mt="md" wrap="wrap">
            <Button component={Link} to={`/materials/${material._id}`} variant="light">View Details</Button>

            {isLoggedIn ? (
              <>
                <Button variant="outline" onClick={() => onEdit(material)}>Edit</Button>
                <Button color="red" variant="outline" onClick={() => onDelete(material)}>Delete</Button>
              </>
            ) : null}
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default MaterialList;
