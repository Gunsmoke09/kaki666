import { Card, Button, Text, Group, SimpleGrid } from '@mantine/core';

const MaterialList = ({ materials, onEdit, onDelete }) => {
  if (!materials.length) {
    return <Text c="dimmed">No materials available.</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {materials.map((material) => (
        <Card shadow="sm" padding="lg" radius="md" key={material._id} withBorder>
          <Text fw={500} size="lg">{material.name}</Text>
          <Text c="dimmed" size="sm">Purchase source: {material.purchaseSource || 'N/A'}</Text>

          <Group justify="right" mt="md">
            <Button variant="outline" onClick={() => onEdit(material)}>Edit</Button>
            <Button color="red" variant="outline" onClick={() => onDelete(material)}>Delete</Button>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default MaterialList;
